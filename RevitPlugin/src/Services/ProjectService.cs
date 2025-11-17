using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Autodesk.Revit.DB;
using BlockPlane.RevitPlugin.Models;
using Serilog;

namespace BlockPlane.RevitPlugin.Services
{
    /// <summary>
    /// Service for analyzing Revit projects and extracting material data
    /// </summary>
    public class ProjectService
    {
        private readonly MaterialService _materialService;
        private readonly CacheService _cacheService;
        private readonly ILogger _logger;
        
        public ProjectService(MaterialService materialService, CacheService cacheService)
        {
            _materialService = materialService ?? throw new ArgumentNullException(nameof(materialService));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _logger = Log.ForContext<ProjectService>();
        }
        
        /// <summary>
        /// Analyze current Revit project and extract material usage
        /// </summary>
        public async Task<ProjectAnalysis> AnalyzeProjectAsync(Document document)
        {
            if (document == null)
            {
                throw new ArgumentNullException(nameof(document));
            }
            
            try
            {
                _logger.Information("Analyzing project: {ProjectName}", document.Title);
                
                var analysis = new ProjectAnalysis
                {
                    ProjectName = document.Title,
                    ProjectId = document.ProjectInformation?.UniqueId ?? Guid.NewGuid().ToString(),
                    AnalysisDate = DateTime.Now
                };
                
                // Get all materials in the project
                var collector = new FilteredElementCollector(document)
                    .OfClass(typeof(Autodesk.Revit.DB.Material));
                
                var revitMaterials = collector.Cast<Autodesk.Revit.DB.Material>().ToList();
                
                _logger.Debug("Found {Count} materials in project", revitMaterials.Count);
                
                // Analyze each material
                foreach (var revitMaterial in revitMaterials)
                {
                    try
                    {
                        var materialUsage = await AnalyzeMaterialUsageAsync(document, revitMaterial);
                        
                        if (materialUsage.ElementCount > 0)
                        {
                            analysis.Materials.Add(materialUsage);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.Warning(ex, "Failed to analyze material: {MaterialName}", revitMaterial.Name);
                    }
                }
                
                // Calculate totals
                analysis.TotalCarbon = analysis.Materials.Sum(m => m.EstimatedCarbon);
                analysis.TotalCost = analysis.Materials.Sum(m => m.EstimatedCost);
                analysis.TotalElements = analysis.Materials.Sum(m => m.ElementCount);
                
                _logger.Information("Project analysis complete: {MaterialCount} materials, {ElementCount} elements, {Carbon:F1} kg CO₂",
                    analysis.Materials.Count, analysis.TotalElements, analysis.TotalCarbon);
                
                return analysis;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to analyze project");
                throw;
            }
        }
        
        /// <summary>
        /// Analyze usage of a specific material
        /// </summary>
        private async Task<MaterialUsage> AnalyzeMaterialUsageAsync(Document document, Autodesk.Revit.DB.Material revitMaterial)
        {
            var usage = new MaterialUsage
            {
                RevitMaterialId = revitMaterial.UniqueId,
                RevitMaterialName = revitMaterial.Name,
                Category = GuessCategory(revitMaterial.Name)
            };
            
            // Find all elements using this material
            var collector = new FilteredElementCollector(document)
                .WhereElementIsNotElementType();
            
            double totalVolume = 0;
            double totalArea = 0;
            int elementCount = 0;
            
            foreach (Element element in collector)
            {
                try
                {
                    // Check if element uses this material
                    var materialIds = element.GetMaterialIds(false);
                    
                    if (materialIds.Contains(revitMaterial.Id))
                    {
                        elementCount++;
                        
                        // Try to get volume
                        var volumeParam = element.get_Parameter(BuiltInParameter.HOST_VOLUME_COMPUTED);
                        if (volumeParam != null && volumeParam.HasValue)
                        {
                            // Convert from cubic feet to cubic meters
                            double volumeCubicFeet = volumeParam.AsDouble();
                            double volumeCubicMeters = volumeCubicFeet * 0.0283168;
                            totalVolume += volumeCubicMeters;
                        }
                        
                        // Try to get area
                        var areaParam = element.get_Parameter(BuiltInParameter.HOST_AREA_COMPUTED);
                        if (areaParam != null && areaParam.HasValue)
                        {
                            // Convert from square feet to square meters
                            double areaSquareFeet = areaParam.AsDouble();
                            double areaSquareMeters = areaSquareFeet * 0.092903;
                            totalArea += areaSquareMeters;
                        }
                    }
                }
                catch
                {
                    // Skip elements that don't support material queries
                    continue;
                }
            }
            
            usage.ElementCount = elementCount;
            usage.Volume = totalVolume;
            usage.Area = totalArea;
            
            // Try to match to BlockPlane material
            if (!string.IsNullOrEmpty(revitMaterial.Name))
            {
                var matches = await _materialService.SearchMaterialsAsync(revitMaterial.Name, 3);
                
                if (matches.Any())
                {
                    usage.BlockPlaneMaterial = matches.First();
                    usage.BlockPlaneMaterialId = matches.First().Id;
                    
                    // Estimate carbon and cost based on volume or area
                    if (totalVolume > 0 && usage.BlockPlaneMaterial.FunctionalUnit.Contains("m³"))
                    {
                        usage.EstimatedCarbon = usage.BlockPlaneMaterial.CalculateCarbon(totalVolume);
                        usage.EstimatedCost = usage.BlockPlaneMaterial.CalculateCost(totalVolume);
                        usage.Quantity = totalVolume;
                        usage.Unit = "m³";
                    }
                    else if (totalArea > 0 && usage.BlockPlaneMaterial.FunctionalUnit.Contains("m²"))
                    {
                        usage.EstimatedCarbon = usage.BlockPlaneMaterial.CalculateCarbon(totalArea);
                        usage.EstimatedCost = usage.BlockPlaneMaterial.CalculateCost(totalArea);
                        usage.Quantity = totalArea;
                        usage.Unit = "m²";
                    }
                    
                    _logger.Debug("Matched {RevitMaterial} → {BlockPlaneMaterial} ({Quantity:F2} {Unit})",
                        revitMaterial.Name, usage.BlockPlaneMaterial.Name, usage.Quantity, usage.Unit);
                }
            }
            
            // Save to cache
            await _cacheService.SaveProjectMaterialAsync(
                usage.RevitMaterialId,
                usage.RevitMaterialName,
                usage.BlockPlaneMaterialId,
                usage.Quantity,
                usage.Unit
            );
            
            return usage;
        }
        
        /// <summary>
        /// Generate optimization recommendations for a project
        /// </summary>
        public async Task<List<OptimizationRecommendation>> GetOptimizationRecommendationsAsync(ProjectAnalysis analysis)
        {
            var recommendations = new List<OptimizationRecommendation>();
            
            try
            {
                foreach (var materialUsage in analysis.Materials.Where(m => m.BlockPlaneMaterial != null))
                {
                    var alternatives = await _materialService.FindAlternativesAsync(materialUsage.BlockPlaneMaterial!, 3);
                    
                    foreach (var alternative in alternatives)
                    {
                        var comparison = _materialService.CompareMaterials(
                            materialUsage.BlockPlaneMaterial!,
                            alternative,
                            materialUsage.Quantity
                        );
                        
                        // Only recommend if there's a carbon benefit
                        if (comparison.CarbonSavings > 0)
                        {
                            recommendations.Add(new OptimizationRecommendation
                            {
                                MaterialUsage = materialUsage,
                                RecommendedMaterial = alternative,
                                CarbonSavings = comparison.CarbonSavings,
                                CostDifference = comparison.CostDifference,
                                Priority = CalculatePriority(comparison)
                            });
                        }
                    }
                }
                
                // Sort by priority (highest carbon savings first)
                recommendations = recommendations
                    .OrderByDescending(r => r.Priority)
                    .ToList();
                
                _logger.Information("Generated {Count} optimization recommendations", recommendations.Count);
                
                return recommendations;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to generate recommendations");
                return recommendations;
            }
        }
        
        /// <summary>
        /// Calculate priority score for a recommendation
        /// </summary>
        private double CalculatePriority(MaterialComparison comparison)
        {
            double priority = 0;
            
            // Carbon savings (most important)
            priority += comparison.CarbonSavings * 10;
            
            // Cost savings (bonus if it's cheaper)
            if (comparison.CostDifference < 0)
            {
                priority += Math.Abs(comparison.CostDifference) * 2;
            }
            
            // Penalize cost increases
            if (comparison.CostDifference > 0)
            {
                priority -= comparison.CostDifference * 0.5;
            }
            
            return priority;
        }
        
        /// <summary>
        /// Guess material category from Revit material name
        /// </summary>
        private string GuessCategory(string materialName)
        {
            string lower = materialName.ToLowerInvariant();
            
            if (lower.Contains("wood") || lower.Contains("timber") || lower.Contains("lumber"))
                return "Timber";
            
            if (lower.Contains("steel") || lower.Contains("metal") || lower.Contains("iron"))
                return "Steel";
            
            if (lower.Contains("concrete") || lower.Contains("cement"))
                return "Concrete";
            
            if (lower.Contains("earth") || lower.Contains("clay") || lower.Contains("adobe"))
                return "Earth";
            
            if (lower.Contains("insulation") || lower.Contains("wool") || lower.Contains("fiber"))
                return "Insulation";
            
            if (lower.Contains("composite") || lower.Contains("fiber") || lower.Contains("plastic"))
                return "Composites";
            
            if (lower.Contains("brick") || lower.Contains("masonry") || lower.Contains("stone"))
                return "Masonry";
            
            return "Unknown";
        }
        
        /// <summary>
        /// Export project analysis to CSV
        /// </summary>
        public string ExportToCSV(ProjectAnalysis analysis)
        {
            var csv = new System.Text.StringBuilder();
            
            csv.AppendLine("Material,Category,Elements,Quantity,Unit,Carbon (kg CO₂),Cost,BlockPlane Match");
            
            foreach (var material in analysis.Materials)
            {
                csv.AppendLine($"\"{material.RevitMaterialName}\"," +
                    $"\"{material.Category}\"," +
                    $"{material.ElementCount}," +
                    $"{material.Quantity:F2}," +
                    $"\"{material.Unit}\"," +
                    $"{material.EstimatedCarbon:F2}," +
                    $"{material.EstimatedCost:F2}," +
                    $"\"{material.BlockPlaneMaterial?.Name ?? "Not matched"}\"");
            }
            
            csv.AppendLine();
            csv.AppendLine($"TOTAL,,,,,{analysis.TotalCarbon:F2},{analysis.TotalCost:F2},");
            
            return csv.ToString();
        }
    }
}
