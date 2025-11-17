using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using BlockPlane.RevitPlugin.Services;
using BlockPlane.RevitPlugin.UI.Views;

namespace BlockPlane.RevitPlugin.Commands
{
    /// <summary>
    /// Calculator Command - Analyzes project carbon footprint
    /// Extracts materials from Revit model and calculates total carbon emissions
    /// </summary>
    [Transaction(TransactionMode.ReadOnly)]
    [Regeneration(RegenerationOption.Manual)]
    public class CalculatorCommand : IExternalCommand
    {
        public Result Execute(
            ExternalCommandData commandData,
            ref string message,
            ElementSet elements)
        {
            UIApplication uiApp = commandData.Application;
            UIDocument uiDoc = uiApp.ActiveUIDocument;
            Document doc = uiDoc.Document;

            try
            {
                // Get application services
                var app = Application.Instance;
                if (app == null)
                {
                    message = "BlockPlane application not initialized";
                    return Result.Failed;
                }

                var projectService = app.ProjectService;
                if (projectService == null)
                {
                    message = "Project service not available";
                    return Result.Failed;
                }

                // Show progress dialog
                var progressDialog = new ProgressDialog("Analyzing Project");
                progressDialog.Show();
                progressDialog.SetIndeterminate("Extracting materials from Revit model...");

                // Perform analysis asynchronously
                Task.Run(async () =>
                {
                    try
                    {
                        progressDialog.UpdateStatus("Analyzing project materials...");
                        
                        var analysis = await projectService.AnalyzeProjectAsync(doc);

                        progressDialog.Complete("Analysis complete!");

                        // Show results on UI thread
                        System.Windows.Application.Current.Dispatcher.Invoke(() =>
                        {
                            ShowAnalysisResults(analysis);
                        });
                    }
                    catch (Exception ex)
                    {
                        progressDialog.Cancel($"Analysis failed: {ex.Message}");
                        
                        System.Windows.Application.Current.Dispatcher.Invoke(() =>
                        {
                            TaskDialog.Show(
                                "Analysis Error",
                                $"Failed to analyze project:\n\n{ex.Message}"
                            );
                        });
                    }
                });

                return Result.Succeeded;
            }
            catch (Exception ex)
            {
                message = $"Error analyzing project: {ex.Message}";
                TaskDialog.Show("Error", message);
                return Result.Failed;
            }
        }

        /// <summary>
        /// Display analysis results to user
        /// </summary>
        private void ShowAnalysisResults(ProjectAnalysis analysis)
        {
            if (analysis == null)
            {
                TaskDialog.Show("Analysis Results", "No analysis data available.");
                return;
            }

            var sb = new StringBuilder();
            sb.AppendLine("PROJECT CARBON FOOTPRINT ANALYSIS");
            sb.AppendLine("═══════════════════════════════════");
            sb.AppendLine();
            
            // Summary
            sb.AppendLine($"Project: {analysis.ProjectName}");
            sb.AppendLine($"Materials Found: {analysis.MaterialCount}");
            sb.AppendLine($"Total Carbon: {analysis.TotalCarbon:F2} kg CO₂e");
            sb.AppendLine();

            // Breakdown by lifecycle stage
            sb.AppendLine("LIFECYCLE BREAKDOWN:");
            sb.AppendLine($"  Production (A1-A3): {analysis.ProductionCarbon:F2} kg CO₂e");
            sb.AppendLine($"  Transport (A4): {analysis.TransportCarbon:F2} kg CO₂e");
            sb.AppendLine($"  Installation (A5): {analysis.InstallationCarbon:F2} kg CO₂e");
            sb.AppendLine($"  Use Phase (B): {analysis.UsePhaseCarbon:F2} kg CO₂e");
            sb.AppendLine($"  End of Life (C1-C4): {analysis.EndOfLifeCarbon:F2} kg CO₂e");
            sb.AppendLine();

            // Top contributors
            if (analysis.TopContributors != null && analysis.TopContributors.Any())
            {
                sb.AppendLine("TOP CARBON CONTRIBUTORS:");
                foreach (var contributor in analysis.TopContributors.Take(5))
                {
                    sb.AppendLine($"  • {contributor.MaterialName}: {contributor.Carbon:F2} kg CO₂e");
                }
                sb.AppendLine();
            }

            // Recommendations
            if (analysis.PotentialSavings > 0)
            {
                sb.AppendLine("OPTIMIZATION POTENTIAL:");
                sb.AppendLine($"  Potential Savings: {analysis.PotentialSavings:F2} kg CO₂e ({analysis.SavingsPercentage:F1}%)");
                sb.AppendLine($"  Recommended Swaps: {analysis.RecommendedSwaps}");
            }

            // Show dialog
            var dialog = new TaskDialog("Carbon Footprint Analysis")
            {
                MainInstruction = $"Total Carbon: {analysis.TotalCarbon:F2} kg CO₂e",
                MainContent = sb.ToString(),
                CommonButtons = TaskDialogCommonButtons.Close
            };

            if (analysis.PotentialSavings > 0)
            {
                dialog.AddCommandLink(
                    TaskDialogCommandLinkId.CommandLink1,
                    "View Recommendations",
                    "See detailed material swap recommendations to reduce carbon footprint"
                );
            }

            var result = dialog.Show();

            if (result == TaskDialogResult.CommandLink1)
            {
                // TODO: Open recommendations window
                TaskDialog.Show(
                    "Recommendations",
                    "Material swap recommendations will be available in the next update."
                );
            }
        }
    }

    /// <summary>
    /// Project analysis result model
    /// </summary>
    /// <summary>
    /// Project analysis results
    /// HONESTY FIRST: Includes comprehensive data quality tracking
    /// </summary>
    public class ProjectAnalysis
    {
        public string ProjectName { get; set; }
        public string ProjectId { get; set; }
        public DateTime AnalysisDate { get; set; }
        
        public int MaterialCount { get; set; }
        public int TotalElements { get; set; }
        
        public double TotalCarbon { get; set; }
        public double ProductionCarbon { get; set; }
        public double TransportCarbon { get; set; }
        public double InstallationCarbon { get; set; }
        public double UsePhaseCarbon { get; set; }
        public double EndOfLifeCarbon { get; set; }
        
        public double TotalCost { get; set; }
        public double PotentialSavings { get; set; }
        public double SavingsPercentage { get; set; }
        public int RecommendedSwaps { get; set; }
        
        public System.Collections.Generic.List<CarbonContributor> TopContributors { get; set; }
        
        // HONESTY FIRST: Data quality tracking
        public int HighConfidenceMatches { get; set; }
        public int MediumConfidenceMatches { get; set; }
        public int LowConfidenceMatches { get; set; }
        public int UnmatchedMaterials { get; set; }
        
        /// <summary>
        /// Comprehensive data quality summary with verification recommendations
        /// </summary>
        public BlockPlane.RevitPlugin.Models.DataQualitySummary DataQualitySummary { get; set; }
        
        /// <summary>
        /// Get overall confidence percentage (0-100)
        /// </summary>
        public double OverallConfidencePercent
        {
            get
            {
                if (MaterialCount == 0) return 0;
                var weightedScore = (HighConfidenceMatches * 100.0) + 
                                   (MediumConfidenceMatches * 70.0) + 
                                   (LowConfidenceMatches * 40.0);
                return weightedScore / MaterialCount;
            }
        }
    }

    /// <summary>
    /// Carbon contributor model
    /// </summary>
    public class CarbonContributor
    {
        public string MaterialName { get; set; }
        public double Carbon { get; set; }
        public double Percentage { get; set; }
    }
}
