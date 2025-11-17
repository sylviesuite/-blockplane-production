using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Autodesk.Revit.DB;
using BlockPlane.RevitPlugin.Commands;
using BlockPlane.RevitPlugin.Services;
using Serilog;

namespace BlockPlane.RevitPlugin.BIM
{
    /// <summary>
    /// Orchestrates comprehensive project analysis
    /// Extracts materials, calculates quantities, and generates carbon footprint analysis
    /// </summary>
    public class ProjectAnalyzer
    {
        private readonly MaterialService _materialService;
        private readonly ElementQuantityExtractor _quantityExtractor;
        private readonly MaterialMapper _materialMapper;
        private readonly ILogger _logger;

        public ProjectAnalyzer(MaterialService materialService)
        {
            _materialService = materialService ?? throw new ArgumentNullException(nameof(materialService));
            _quantityExtractor = new ElementQuantityExtractor();
            _materialMapper = new MaterialMapper(materialService);
            _logger = Log.ForContext<ProjectAnalyzer>();
        }

        /// <summary>
        /// Perform comprehensive project analysis
        /// </summary>
        public async Task<ProjectAnalysis> AnalyzeAsync(Document document, IProgress<AnalysisProgress> progress = null)
        {
            if (document == null)
            {
                throw new ArgumentNullException(nameof(document));
            }

            _logger.Information("Starting project analysis: {ProjectName}", document.Title);

            var analysis = new ProjectAnalysis
            {
                ProjectName = document.Title,
                ProjectId = document.ProjectInformation?.UniqueId ?? Guid.NewGuid().ToString(),
                AnalysisDate = DateTime.Now
            };

            try
            {
                // Step 1: Collect all materials in the project
                progress?.Report(new AnalysisProgress { Stage = "Collecting materials", Percentage = 10 });
                var revitMaterials = CollectMaterials(document);
                _logger.Information("Found {Count} materials in project", revitMaterials.Count);

                // Step 2: Map Revit materials to BlockPlane database
                progress?.Report(new AnalysisProgress { Stage = "Mapping materials to database", Percentage = 30 });
                var materialMappings = await MapMaterialsAsync(revitMaterials);

                // Step 3: Extract quantities for each material
                progress?.Report(new AnalysisProgress { Stage = "Extracting quantities", Percentage = 50 });
                var materialUsages = await ExtractMaterialUsagesAsync(document, materialMappings, progress);

                // Step 4: Calculate carbon footprint
                progress?.Report(new AnalysisProgress { Stage = "Calculating carbon footprint", Percentage = 70 });
                CalculateCarbonFootprint(materialUsages, analysis);

                // Step 5: Identify optimization opportunities
                progress?.Report(new AnalysisProgress { Stage = "Finding optimization opportunities", Percentage = 85 });
                await IdentifyOptimizationsAsync(materialUsages, analysis);

                // Step 6: Generate summary
                progress?.Report(new AnalysisProgress { Stage = "Generating summary", Percentage = 95 });
                GenerateSummary(materialUsages, analysis);

                progress?.Report(new AnalysisProgress { Stage = "Complete", Percentage = 100 });
                _logger.Information("Project analysis complete: {MaterialCount} materials, {TotalCarbon:F2} kg CO₂e",
                    materialUsages.Count, analysis.TotalCarbon);

                return analysis;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Project analysis failed");
                throw;
            }
        }

        /// <summary>
        /// Collect all materials used in the project
        /// </summary>
        private List<Autodesk.Revit.DB.Material> CollectMaterials(Document document)
        {
            var collector = new FilteredElementCollector(document)
                .OfClass(typeof(Autodesk.Revit.DB.Material));

            return collector.Cast<Autodesk.Revit.DB.Material>().ToList();
        }

        /// <summary>
        /// Map Revit materials to BlockPlane materials
        /// </summary>
        private async Task<Dictionary<string, MaterialMapping>> MapMaterialsAsync(List<Autodesk.Revit.DB.Material> revitMaterials)
        {
            var mappings = new Dictionary<string, MaterialMapping>();

            foreach (var revitMaterial in revitMaterials)
            {
                try
                {
                    var mapping = await _materialMapper.MapMaterialAsync(revitMaterial);
                    mappings[revitMaterial.UniqueId] = mapping;
                }
                catch (Exception ex)
                {
                    _logger.Warning(ex, "Failed to map material: {MaterialName}", revitMaterial.Name);
                }
            }

            _logger.Information("Mapped {MappedCount}/{TotalCount} materials",
                mappings.Count(m => m.Value.BlockPlaneMaterial != null), mappings.Count);

            return mappings;
        }

        /// <summary>
        /// Extract material usages with quantities
        /// </summary>
        private async Task<List<MaterialUsageDetail>> ExtractMaterialUsagesAsync(
            Document document,
            Dictionary<string, MaterialMapping> materialMappings,
            IProgress<AnalysisProgress> progress)
        {
            var usages = new Dictionary<string, MaterialUsageDetail>();

            // Get all elements in the project
            var collector = new FilteredElementCollector(document)
                .WhereElementIsNotElementType();

            var elements = collector.ToList();
            int processedCount = 0;

            foreach (Element element in elements)
            {
                try
                {
                    // Get materials used by this element
                    var materialIds = element.GetMaterialIds(false);

                    foreach (var materialId in materialIds)
                    {
                        var revitMaterial = document.GetElement(materialId) as Autodesk.Revit.DB.Material;
                        if (revitMaterial == null) continue;

                        // Get or create usage entry
                        if (!usages.TryGetValue(revitMaterial.UniqueId, out var usage))
                        {
                            usage = new MaterialUsageDetail
                            {
                                RevitMaterialId = revitMaterial.UniqueId,
                                RevitMaterialName = revitMaterial.Name,
                                Elements = new List<ElementQuantity>()
                            };

                            // Add BlockPlane material mapping if available
                            if (materialMappings.TryGetValue(revitMaterial.UniqueId, out var mapping))
                            {
                                usage.BlockPlaneMaterial = mapping.BlockPlaneMaterial;
                                usage.MatchConfidence = mapping.MatchConfidence;
                            }

                            usages[revitMaterial.UniqueId] = usage;
                        }

                        // Extract quantity from element
                        var quantity = _quantityExtractor.ExtractQuantity(element);
                        usage.Elements.Add(quantity);
                    }

                    // Report progress
                    processedCount++;
                    if (processedCount % 100 == 0)
                    {
                        int percentage = 50 + (int)((processedCount / (double)elements.Count) * 20);
                        progress?.Report(new AnalysisProgress
                        {
                            Stage = $"Extracting quantities ({processedCount}/{elements.Count})",
                            Percentage = percentage
                        });
                    }
                }
                catch (Exception ex)
                {
                    _logger.Debug(ex, "Failed to process element {ElementId}", element.Id);
                    // Continue with other elements
                }
            }

            // Calculate totals for each material
            foreach (var usage in usages.Values)
            {
                usage.TotalVolume = usage.Elements.Sum(e => e.Volume);
                usage.TotalArea = usage.Elements.Sum(e => e.Area);
                usage.TotalLength = usage.Elements.Sum(e => e.Length);
                usage.ElementCount = usage.Elements.Count;

                // Determine primary quantity
                if (usage.TotalVolume > 0)
                {
                    usage.Quantity = usage.TotalVolume;
                    usage.Unit = "m³";
                }
                else if (usage.TotalArea > 0)
                {
                    usage.Quantity = usage.TotalArea;
                    usage.Unit = "m²";
                }
                else if (usage.TotalLength > 0)
                {
                    usage.Quantity = usage.TotalLength;
                    usage.Unit = "m";
                }
                else
                {
                    usage.Quantity = usage.ElementCount;
                    usage.Unit = "ea";
                }
            }

            return usages.Values.ToList();
        }

        /// <summary>
        /// Calculate carbon footprint for all materials
        /// </summary>
        private void CalculateCarbonFootprint(List<MaterialUsageDetail> usages, ProjectAnalysis analysis)
        {
            double totalCarbon = 0;
            double productionCarbon = 0;
            double transportCarbon = 0;
            double installationCarbon = 0;
            double usePhaseCarbon = 0;
            double endOfLifeCarbon = 0;

            foreach (var usage in usages)
            {
                if (usage.BlockPlaneMaterial != null && usage.Quantity > 0)
                {
                    // Calculate total carbon
                    usage.EstimatedCarbon = usage.BlockPlaneMaterial.CalculateCarbon(usage.Quantity);
                    totalCarbon += usage.EstimatedCarbon;

                    // Breakdown by lifecycle stage (simplified estimation)
                    // In reality, these would come from detailed LCA data
                    var breakdown = usage.BlockPlaneMaterial.CarbonFootprint;
                    if (breakdown != null)
                    {
                        productionCarbon += (breakdown.A1 + breakdown.A2 + breakdown.A3) * usage.Quantity;
                        transportCarbon += breakdown.A4 * usage.Quantity;
                        installationCarbon += breakdown.A5 * usage.Quantity;
                        usePhaseCarbon += breakdown.B * usage.Quantity;
                        endOfLifeCarbon += (breakdown.C1 + breakdown.C2 + breakdown.C3 + breakdown.C4) * usage.Quantity;
                    }

                    // Calculate cost
                    usage.EstimatedCost = usage.BlockPlaneMaterial.CalculateCost(usage.Quantity);
                }
            }

            analysis.TotalCarbon = totalCarbon;
            analysis.ProductionCarbon = productionCarbon;
            analysis.TransportCarbon = transportCarbon;
            analysis.InstallationCarbon = installationCarbon;
            analysis.UsePhaseCarbon = usePhaseCarbon;
            analysis.EndOfLifeCarbon = endOfLifeCarbon;
        }

        /// <summary>
        /// Identify optimization opportunities
        /// </summary>
        private async Task<List<CarbonContributor>> IdentifyOptimizationsAsync(List<MaterialUsageDetail> usages, ProjectAnalysis analysis)
        {
            // Identify top carbon contributors
            var contributors = usages
                .Where(u => u.EstimatedCarbon > 0)
                .OrderByDescending(u => u.EstimatedCarbon)
                .Take(10)
                .Select(u => new CarbonContributor
                {
                    MaterialName = u.RevitMaterialName,
                    Carbon = u.EstimatedCarbon,
                    Percentage = 0 // Will calculate after
                })
                .ToList();

            // Calculate percentages
            foreach (var contributor in contributors)
            {
                contributor.Percentage = (contributor.Carbon / analysis.TotalCarbon) * 100;
            }

            analysis.TopContributors = contributors;

            // Find potential savings
            double potentialSavings = 0;
            int recommendedSwaps = 0;

            foreach (var usage in usages.Where(u => u.BlockPlaneMaterial != null && u.EstimatedCarbon > 0))
            {
                try
                {
                    // Find better alternatives
                    var alternatives = await _materialService.GetAlternativesAsync(usage.BlockPlaneMaterial.Id, limit: 3);
                    
                    if (alternatives != null && alternatives.Any())
                    {
                        var bestAlternative = alternatives.First();
                        double alternativeCarbon = bestAlternative.CalculateCarbon(usage.Quantity);
                        
                        if (alternativeCarbon < usage.EstimatedCarbon)
                        {
                            potentialSavings += (usage.EstimatedCarbon - alternativeCarbon);
                            recommendedSwaps++;
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.Debug(ex, "Failed to find alternatives for material: {MaterialName}", usage.RevitMaterialName);
                }
            }

            analysis.PotentialSavings = potentialSavings;
            analysis.RecommendedSwaps = recommendedSwaps;
            analysis.SavingsPercentage = analysis.TotalCarbon > 0 ? (potentialSavings / analysis.TotalCarbon) * 100 : 0;

            return contributors;
        }

        /// <summary>
        /// Generate analysis summary
        /// HONESTY FIRST: Includes comprehensive data quality summary
        /// </summary>
        private void GenerateSummary(List<MaterialUsageDetail> usages, ProjectAnalysis analysis)
        {
            analysis.MaterialCount = usages.Count;
            analysis.TotalElements = usages.Sum(u => u.ElementCount);
            analysis.TotalCost = usages.Sum(u => u.EstimatedCost);

            // Count materials by confidence level
            analysis.HighConfidenceMatches = usages.Count(u => u.MatchConfidence == MatchConfidence.High);
            analysis.MediumConfidenceMatches = usages.Count(u => u.MatchConfidence == MatchConfidence.Medium);
            analysis.LowConfidenceMatches = usages.Count(u => u.MatchConfidence == MatchConfidence.Low);
            analysis.UnmatchedMaterials = usages.Count(u => u.MatchConfidence == MatchConfidence.None);
            
            // HONESTY: Generate data quality summary
            analysis.DataQualitySummary = GenerateDataQualitySummary(usages);
        }
        
        /// <summary>
        /// Generate comprehensive data quality summary
        /// HONESTY FIRST: Transparent reporting of data quality and limitations
        /// </summary>
        private Models.DataQualitySummary GenerateDataQualitySummary(List<MaterialUsageDetail> usages)
        {
            var summary = new Models.DataQualitySummary
            {
                TotalMaterials = usages.Count,
                HighConfidenceCount = usages.Count(u => u.MatchConfidence == MatchConfidence.High),
                MediumConfidenceCount = usages.Count(u => u.MatchConfidence == MatchConfidence.Medium),
                LowConfidenceCount = usages.Count(u => u.MatchConfidence == MatchConfidence.Low),
                UnmatchedCount = usages.Count(u => u.MatchConfidence == MatchConfidence.None)
            };
            
            // Count EPD sources
            foreach (var usage in usages.Where(u => u.BlockPlaneMaterial != null))
            {
                if (!string.IsNullOrEmpty(usage.BlockPlaneMaterial.EpdSource))
                {
                    if (usage.BlockPlaneMaterial.EpdSource.Contains("Manufacturer", StringComparison.OrdinalIgnoreCase))
                        summary.ManufacturerEpdCount++;
                    else
                        summary.IndustryAverageCount++;
                }
                
                // Check for stale EPD data
                if (usage.BlockPlaneMaterial.EpdDate.HasValue)
                {
                    var ageYears = (DateTime.Now - usage.BlockPlaneMaterial.EpdDate.Value).TotalDays / 365.25;
                    if (ageYears > 2)
                        summary.StaleEpdCount++;
                }
            }
            
            // Count materials requiring verification
            summary.VerificationRequiredCount = usages.Count(u => 
                u.MatchConfidence == MatchConfidence.Low || 
                u.MatchConfidence == MatchConfidence.Medium ||
                u.MatchConfidence == MatchConfidence.None);
            
            // Generate verification notes for high-impact low-confidence materials
            var highImpactLowConfidence = usages
                .Where(u => u.EstimatedCarbon > 0 && 
                           (u.MatchConfidence == MatchConfidence.Low || u.MatchConfidence == MatchConfidence.None))
                .OrderByDescending(u => u.EstimatedCarbon)
                .Take(5);
            
            foreach (var usage in highImpactLowConfidence)
            {
                summary.VerificationNotes.Add(new Models.VerificationNote
                {
                    Priority = "High",
                    ItemName = usage.RevitMaterialName,
                    Reason = usage.MatchConfidence == MatchConfidence.None 
                        ? "No match found in database" 
                        : $"Low confidence match ({usage.MatchConfidence})",
                    RecommendedAction = "Manually verify material properties and carbon data before using in reports",
                    PotentialImpact = $"This material contributes {usage.EstimatedCarbon:F0} kg CO₂e ({(usage.EstimatedCarbon / usages.Sum(u => u.EstimatedCarbon) * 100):F1}% of total)"
                });
            }
            
            // Add notes for stale EPD data
            var staleEpdMaterials = usages
                .Where(u => u.BlockPlaneMaterial?.EpdDate != null && 
                           (DateTime.Now - u.BlockPlaneMaterial.EpdDate.Value).TotalDays / 365.25 > 2)
                .OrderByDescending(u => u.EstimatedCarbon)
                .Take(3);
            
            foreach (var usage in staleEpdMaterials)
            {
                var ageYears = (DateTime.Now - usage.BlockPlaneMaterial.EpdDate.Value).TotalDays / 365.25;
                summary.VerificationNotes.Add(new Models.VerificationNote
                {
                    Priority = "Medium",
                    ItemName = usage.RevitMaterialName,
                    Reason = $"EPD data is {ageYears:F1} years old (published {usage.BlockPlaneMaterial.EpdDate.Value:yyyy-MM-dd})",
                    RecommendedAction = "Check for updated EPD data from manufacturer or regional database",
                    PotentialImpact = "Older EPD data may not reflect current manufacturing processes or energy grids"
                });
            }
            
            _logger.Information("Data quality summary: {HighConf}H/{MedConf}M/{LowConf}L/{Unmatched}U, Overall: {Overall:F1}%",
                summary.HighConfidenceCount, summary.MediumConfidenceCount, 
                summary.LowConfidenceCount, summary.UnmatchedCount,
                summary.OverallConfidencePercent);
            
            return summary;
        }
    }

    /// <summary>
    /// Detailed material usage information
    /// </summary>
    public class MaterialUsageDetail
    {
        public string RevitMaterialId { get; set; }
        public string RevitMaterialName { get; set; }
        public Models.Material BlockPlaneMaterial { get; set; }
        public MatchConfidence MatchConfidence { get; set; }
        
        public List<ElementQuantity> Elements { get; set; }
        public int ElementCount { get; set; }
        
        public double TotalVolume { get; set; }
        public double TotalArea { get; set; }
        public double TotalLength { get; set; }
        
        public double Quantity { get; set; }
        public string Unit { get; set; }
        
        public double EstimatedCarbon { get; set; }
        public double EstimatedCost { get; set; }
    }

    /// <summary>
    /// Progress information for analysis
    /// </summary>
    public class AnalysisProgress
    {
        public string Stage { get; set; }
        public int Percentage { get; set; }
    }
}
