using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using BlockPlane.RevitPlugin.BIM;
using BlockPlane.RevitPlugin.Commands;
using Serilog;

namespace BlockPlane.RevitPlugin.Reports
{
    /// <summary>
    /// Exports project analysis data to CSV format
    /// Provides multiple export formats for different use cases
    /// </summary>
    public class CSVExporter
    {
        private readonly ILogger _logger;

        public CSVExporter()
        {
            _logger = Log.ForContext<CSVExporter>();
        }

        /// <summary>
        /// Export project analysis to CSV file
        /// </summary>
        public string ExportProjectAnalysis(ProjectAnalysis analysis, string filePath)
        {
            if (analysis == null)
            {
                throw new ArgumentNullException(nameof(analysis));
            }

            try
            {
                var csv = GenerateProjectAnalysisCSV(analysis);
                File.WriteAllText(filePath, csv, Encoding.UTF8);
                
                _logger.Information("Exported project analysis to: {FilePath}", filePath);
                return filePath;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to export project analysis to CSV");
                throw;
            }
        }

        /// <summary>
        /// Export material usage details to CSV file
        /// </summary>
        public string ExportMaterialUsage(List<MaterialUsageDetail> usages, string filePath)
        {
            if (usages == null)
            {
                throw new ArgumentNullException(nameof(usages));
            }

            try
            {
                var csv = GenerateMaterialUsageCSV(usages);
                File.WriteAllText(filePath, csv, Encoding.UTF8);
                
                _logger.Information("Exported material usage to: {FilePath}", filePath);
                return filePath;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to export material usage to CSV");
                throw;
            }
        }

        /// <summary>
        /// Export carbon contributors to CSV file
        /// </summary>
        public string ExportCarbonContributors(List<CarbonContributor> contributors, string filePath)
        {
            if (contributors == null)
            {
                throw new ArgumentNullException(nameof(contributors));
            }

            try
            {
                var csv = GenerateCarbonContributorsCSV(contributors);
                File.WriteAllText(filePath, csv, Encoding.UTF8);
                
                _logger.Information("Exported carbon contributors to: {FilePath}", filePath);
                return filePath;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to export carbon contributors to CSV");
                throw;
            }
        }

        /// <summary>
        /// Generate CSV content for project analysis
        /// </summary>
        private string GenerateProjectAnalysisCSV(ProjectAnalysis analysis)
        {
            var sb = new StringBuilder();

            // Header section
            sb.AppendLine("BlockPlane Carbon Footprint Analysis");
            sb.AppendLine($"Project Name,{EscapeCSV(analysis.ProjectName)}");
            sb.AppendLine($"Analysis Date,{analysis.AnalysisDate:yyyy-MM-dd HH:mm:ss}");
            sb.AppendLine();

            // Summary section
            sb.AppendLine("SUMMARY");
            sb.AppendLine("Metric,Value,Unit");
            sb.AppendLine($"Total Materials,{analysis.MaterialCount},materials");
            sb.AppendLine($"Total Elements,{analysis.TotalElements},elements");
            sb.AppendLine($"Total Carbon,{analysis.TotalCarbon:F2},kg CO₂e");
            sb.AppendLine($"Total Cost,{analysis.TotalCost:F2},USD");
            sb.AppendLine();

            // Lifecycle breakdown section
            sb.AppendLine("LIFECYCLE BREAKDOWN");
            sb.AppendLine("Stage,Carbon (kg CO₂e),Percentage");
            double totalLifecycle = analysis.ProductionCarbon + analysis.TransportCarbon + 
                                   analysis.InstallationCarbon + analysis.UsePhaseCarbon + 
                                   analysis.EndOfLifeCarbon;
            
            if (totalLifecycle > 0)
            {
                sb.AppendLine($"Production (A1-A3),{analysis.ProductionCarbon:F2},{(analysis.ProductionCarbon / totalLifecycle * 100):F1}%");
                sb.AppendLine($"Transport (A4),{analysis.TransportCarbon:F2},{(analysis.TransportCarbon / totalLifecycle * 100):F1}%");
                sb.AppendLine($"Installation (A5),{analysis.InstallationCarbon:F2},{(analysis.InstallationCarbon / totalLifecycle * 100):F1}%");
                sb.AppendLine($"Use Phase (B),{analysis.UsePhaseCarbon:F2},{(analysis.UsePhaseCarbon / totalLifecycle * 100):F1}%");
                sb.AppendLine($"End of Life (C1-C4),{analysis.EndOfLifeCarbon:F2},{(analysis.EndOfLifeCarbon / totalLifecycle * 100):F1}%");
            }
            sb.AppendLine();

            // Top contributors section
            if (analysis.TopContributors != null && analysis.TopContributors.Any())
            {
                sb.AppendLine("TOP CARBON CONTRIBUTORS");
                sb.AppendLine("Rank,Material,Carbon (kg CO₂e),Percentage");
                
                int rank = 1;
                foreach (var contributor in analysis.TopContributors)
                {
                    sb.AppendLine($"{rank},{EscapeCSV(contributor.MaterialName)},{contributor.Carbon:F2},{contributor.Percentage:F1}%");
                    rank++;
                }
                sb.AppendLine();
            }

            // Optimization potential section
            if (analysis.PotentialSavings > 0)
            {
                sb.AppendLine("OPTIMIZATION POTENTIAL");
                sb.AppendLine("Metric,Value");
                sb.AppendLine($"Potential Savings,{analysis.PotentialSavings:F2} kg CO₂e");
                sb.AppendLine($"Savings Percentage,{analysis.SavingsPercentage:F1}%");
                sb.AppendLine($"Recommended Swaps,{analysis.RecommendedSwaps}");
                sb.AppendLine();
            }

            // Matching statistics section
            sb.AppendLine("MATERIAL MATCHING STATISTICS");
            sb.AppendLine("Confidence Level,Count");
            sb.AppendLine($"High Confidence,{analysis.HighConfidenceMatches}");
            sb.AppendLine($"Medium Confidence,{analysis.MediumConfidenceMatches}");
            sb.AppendLine($"Low Confidence,{analysis.LowConfidenceMatches}");
            sb.AppendLine($"Unmatched,{analysis.UnmatchedMaterials}");

            return sb.ToString();
        }

        /// <summary>
        /// Generate CSV content for material usage details
        /// HONESTY FIRST: Includes confidence, EPD data, and verification columns
        /// </summary>
        private string GenerateMaterialUsageCSV(List<MaterialUsageDetail> usages)
        {
            var sb = new StringBuilder();

            // Header with HONESTY columns
            sb.AppendLine("Revit Material,BlockPlane Material,Match Confidence,Confidence %,Elements,Quantity,Unit,Carbon (kg CO₂e),Cost (USD),Category,EPD Source,EPD Date,Data Age (years),Verification Needed");

            // Data rows
            foreach (var usage in usages.OrderByDescending(u => u.EstimatedCarbon))
            {
                // Calculate confidence percentage
                double confidencePercent = usage.MatchConfidence switch
                {
                    MatchConfidence.High => 90,
                    MatchConfidence.Medium => 70,
                    MatchConfidence.Low => 40,
                    _ => 0
                };
                
                // Calculate EPD age
                string epdDate = usage.BlockPlaneMaterial?.EpdDate?.ToString("yyyy-MM-dd") ?? "Unknown";
                string dataAge = "";
                if (usage.BlockPlaneMaterial?.EpdDate != null)
                {
                    var ageYears = (DateTime.Now - usage.BlockPlaneMaterial.EpdDate.Value).TotalDays / 365.25;
                    dataAge = $"{ageYears:F1}";
                }
                
                // Verification needed?
                string verificationNeeded = (usage.MatchConfidence == MatchConfidence.Low || 
                                            usage.MatchConfidence == MatchConfidence.None ||
                                            (usage.BlockPlaneMaterial?.EpdDate != null && 
                                             (DateTime.Now - usage.BlockPlaneMaterial.EpdDate.Value).TotalDays / 365.25 > 2)) 
                    ? "YES" : "No";
                
                sb.AppendLine($"{EscapeCSV(usage.RevitMaterialName)}," +
                             $"{EscapeCSV(usage.BlockPlaneMaterial?.Name ?? "Not matched")}," +
                             $"{usage.MatchConfidence}," +
                             $"{confidencePercent}," +
                             $"{usage.ElementCount}," +
                             $"{usage.Quantity:F2}," +
                             $"{usage.Unit}," +
                             $"{usage.EstimatedCarbon:F2}," +
                             $"{usage.EstimatedCost:F2}," +
                             $"{EscapeCSV(usage.BlockPlaneMaterial?.Category ?? "Unknown")}," +
                             $"{EscapeCSV(usage.BlockPlaneMaterial?.EpdSource ?? "Unknown")}," +
                             $"{epdDate}," +
                             $"{dataAge}," +
                             $"{verificationNeeded}");
            }

            // Totals row
            sb.AppendLine();
            sb.AppendLine($"TOTAL,,," +
                         $"," +
                         $"{usages.Sum(u => u.ElementCount)}," +
                         $",,,," +
                         $"{usages.Sum(u => u.EstimatedCarbon):F2}," +
                         $"{usages.Sum(u => u.EstimatedCost):F2},,,,");
            
            // HONESTY: Add data quality summary section
            sb.AppendLine();
            sb.AppendLine();
            sb.AppendLine("DATA QUALITY SUMMARY");
            sb.AppendLine("Metric,Value");
            
            int highConf = usages.Count(u => u.MatchConfidence == MatchConfidence.High);
            int medConf = usages.Count(u => u.MatchConfidence == MatchConfidence.Medium);
            int lowConf = usages.Count(u => u.MatchConfidence == MatchConfidence.Low);
            int unmatched = usages.Count(u => u.MatchConfidence == MatchConfidence.None);
            int total = usages.Count;
            
            double overallConfidence = total > 0 
                ? ((highConf * 100.0) + (medConf * 70.0) + (lowConf * 40.0)) / total 
                : 0;
            
            sb.AppendLine($"Overall Confidence,{overallConfidence:F1}%");
            sb.AppendLine($"High Confidence Materials,{highConf} ({(highConf * 100.0 / total):F1}%)");
            sb.AppendLine($"Medium Confidence Materials,{medConf} ({(medConf * 100.0 / total):F1}%)");
            sb.AppendLine($"Low Confidence Materials,{lowConf} ({(lowConf * 100.0 / total):F1}%)");
            sb.AppendLine($"Unmatched Materials,{unmatched} ({(unmatched * 100.0 / total):F1}%)");
            
            int needsVerification = usages.Count(u => 
                u.MatchConfidence == MatchConfidence.Low || 
                u.MatchConfidence == MatchConfidence.Medium ||
                u.MatchConfidence == MatchConfidence.None);
            sb.AppendLine($"Materials Needing Verification,{needsVerification}");
            
            int staleEpd = usages.Count(u => 
                u.BlockPlaneMaterial?.EpdDate != null && 
                (DateTime.Now - u.BlockPlaneMaterial.EpdDate.Value).TotalDays / 365.25 > 2);
            sb.AppendLine($"Materials with Stale EPD (>2yr),{staleEpd}");
            
            sb.AppendLine();
            sb.AppendLine("IMPORTANT: Materials marked 'Verification Needed = YES' should be manually verified before use in reports or submissions.");

            return sb.ToString();
        }

        /// <summary>
        /// Generate CSV content for carbon contributors
        /// </summary>
        private string GenerateCarbonContributorsCSV(List<CarbonContributor> contributors)
        {
            var sb = new StringBuilder();

            // Header
            sb.AppendLine("Rank,Material,Carbon (kg CO₂e),Percentage");

            // Data rows
            int rank = 1;
            foreach (var contributor in contributors)
            {
                sb.AppendLine($"{rank}," +
                             $"{EscapeCSV(contributor.MaterialName)}," +
                             $"{contributor.Carbon:F2}," +
                             $"{contributor.Percentage:F1}%");
                rank++;
            }

            return sb.ToString();
        }

        /// <summary>
        /// Export element-level details to CSV
        /// </summary>
        public string ExportElementDetails(List<MaterialUsageDetail> usages, string filePath)
        {
            try
            {
                var sb = new StringBuilder();

                // Header
                sb.AppendLine("Material,Element ID,Element Name,Element Type,Category,Volume (m³),Area (m²),Length (m),Primary Unit");

                // Data rows - flatten all elements
                foreach (var usage in usages)
                {
                    foreach (var element in usage.Elements)
                    {
                        sb.AppendLine($"{EscapeCSV(usage.RevitMaterialName)}," +
                                     $"{element.ElementId}," +
                                     $"{EscapeCSV(element.ElementName)}," +
                                     $"{EscapeCSV(element.ElementType)}," +
                                     $"{EscapeCSV(element.Category)}," +
                                     $"{element.Volume:F3}," +
                                     $"{element.Area:F3}," +
                                     $"{element.Length:F3}," +
                                     $"{element.PrimaryUnit}");
                    }
                }

                File.WriteAllText(filePath, sb.ToString(), Encoding.UTF8);
                _logger.Information("Exported element details to: {FilePath}", filePath);
                return filePath;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to export element details to CSV");
                throw;
            }
        }

        /// <summary>
        /// Export comparison data for material alternatives
        /// </summary>
        public string ExportMaterialComparison(
            Models.Material currentMaterial,
            List<Models.Material> alternatives,
            double quantity,
            string filePath)
        {
            try
            {
                var sb = new StringBuilder();

                // Header
                sb.AppendLine("Material,Category,RIS,Carbon (kg CO₂e),Cost (USD),Carbon Savings,Cost Difference");

                // Current material row
                double currentCarbon = currentMaterial.CalculateCarbon(quantity);
                double currentCost = currentMaterial.CalculateCost(quantity);
                
                sb.AppendLine($"{EscapeCSV(currentMaterial.Name + " (Current)")}," +
                             $"{EscapeCSV(currentMaterial.Category)}," +
                             $"{currentMaterial.RIS}," +
                             $"{currentCarbon:F2}," +
                             $"{currentCost:F2}," +
                             $"0.00," +
                             $"0.00");

                // Alternative materials rows
                foreach (var alternative in alternatives)
                {
                    double altCarbon = alternative.CalculateCarbon(quantity);
                    double altCost = alternative.CalculateCost(quantity);
                    double carbonSavings = currentCarbon - altCarbon;
                    double costDiff = altCost - currentCost;

                    sb.AppendLine($"{EscapeCSV(alternative.Name)}," +
                                 $"{EscapeCSV(alternative.Category)}," +
                                 $"{alternative.RIS}," +
                                 $"{altCarbon:F2}," +
                                 $"{altCost:F2}," +
                                 $"{carbonSavings:F2}," +
                                 $"{costDiff:F2}");
                }

                File.WriteAllText(filePath, sb.ToString(), Encoding.UTF8);
                _logger.Information("Exported material comparison to: {FilePath}", filePath);
                return filePath;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to export material comparison to CSV");
                throw;
            }
        }

        /// <summary>
        /// Escape CSV values that contain special characters
        /// </summary>
        private string EscapeCSV(string value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return string.Empty;
            }

            // If value contains comma, quote, or newline, wrap in quotes and escape quotes
            if (value.Contains(",") || value.Contains("\"") || value.Contains("\n") || value.Contains("\r"))
            {
                return "\"" + value.Replace("\"", "\"\"") + "\"";
            }

            return value;
        }
    }
}
