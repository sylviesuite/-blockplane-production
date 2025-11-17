using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using BlockPlane.RevitPlugin.BIM;
using BlockPlane.RevitPlugin.Commands;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Serilog;

namespace BlockPlane.RevitPlugin.Reports
{
    /// <summary>
    /// Generates professional PDF reports for carbon footprint analysis
    /// Uses iTextSharp for PDF generation with charts and tables
    /// </summary>
    public class PDFReportGenerator
    {
        private readonly ILogger _logger;
        
        // Color scheme
        private readonly BaseColor PrimaryColor = new BaseColor(34, 139, 34); // Forest Green
        private readonly BaseColor SecondaryColor = new BaseColor(70, 130, 180); // Steel Blue
        private readonly BaseColor AccentColor = new BaseColor(255, 140, 0); // Dark Orange
        private readonly BaseColor TextColor = BaseColor.DARK_GRAY;
        private readonly BaseColor LightGray = new BaseColor(240, 240, 240);

        public PDFReportGenerator()
        {
            _logger = Log.ForContext<PDFReportGenerator>();
        }

        /// <summary>
        /// Generate comprehensive PDF report for project analysis
        /// </summary>
        public string GenerateProjectReport(ProjectAnalysis analysis, List<MaterialUsageDetail> usages, string filePath)
        {
            if (analysis == null)
            {
                throw new ArgumentNullException(nameof(analysis));
            }

            try
            {
                _logger.Information("Generating PDF report: {FilePath}", filePath);

                using (var document = new Document(PageSize.A4, 50, 50, 50, 50))
                {
                    using (var writer = PdfWriter.GetInstance(document, new FileStream(filePath, FileMode.Create)))
                    {
                        document.Open();

                        // Add content sections
                        AddCoverPage(document, analysis);
                        document.NewPage();
                        
                        AddExecutiveSummary(document, analysis);
                        document.NewPage();
                        
                        AddLifecycleBreakdown(document, analysis);
                        document.NewPage();
                        
                        AddTopContributors(document, analysis);
                        document.NewPage();
                        
                        AddMaterialDetails(document, usages);
                        document.NewPage();
                        
                        // HONESTY FIRST: Mandatory data quality section
                        AddDataQualitySection(document, analysis);
                        document.NewPage();
                        
                        AddOptimizationRecommendations(document, analysis);
                        document.NewPage();
                        
                        // HONESTY FIRST: Methodology and limitations
                        AddMethodologyAndLimitations(document);

                        document.Close();
                    }
                }

                _logger.Information("PDF report generated successfully: {FilePath}", filePath);
                return filePath;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to generate PDF report");
                throw;
            }
        }

        /// <summary>
        /// Add cover page
        /// </summary>
        private void AddCoverPage(Document document, ProjectAnalysis analysis)
        {
            // Title
            var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 28, PrimaryColor);
            var title = new Paragraph("Carbon Footprint Analysis", titleFont)
            {
                Alignment = Element.ALIGN_CENTER,
                SpacingAfter = 20
            };
            document.Add(title);

            // Project name
            var projectFont = FontFactory.GetFont(FontFactory.HELVETICA, 20, TextColor);
            var projectName = new Paragraph(analysis.ProjectName, projectFont)
            {
                Alignment = Element.ALIGN_CENTER,
                SpacingAfter = 40
            };
            document.Add(projectName);

            // Add spacing
            document.Add(new Paragraph(" ") { SpacingAfter = 100 });

            // Key metrics box
            var metricsTable = new PdfPTable(2)
            {
                WidthPercentage = 80,
                HorizontalAlignment = Element.ALIGN_CENTER,
                SpacingAfter = 40
            };
            metricsTable.SetWidths(new float[] { 1f, 1f });

            AddMetricCell(metricsTable, "Total Carbon", $"{analysis.TotalCarbon:F2} kg CO₂e");
            AddMetricCell(metricsTable, "Total Materials", $"{analysis.MaterialCount}");
            AddMetricCell(metricsTable, "Total Elements", $"{analysis.TotalElements}");
            AddMetricCell(metricsTable, "Potential Savings", $"{analysis.PotentialSavings:F2} kg CO₂e ({analysis.SavingsPercentage:F1}%)");

            document.Add(metricsTable);

            // Date
            var dateFont = FontFactory.GetFont(FontFactory.HELVETICA, 12, BaseColor.GRAY);
            var date = new Paragraph($"Generated: {analysis.AnalysisDate:MMMM dd, yyyy}", dateFont)
            {
                Alignment = Element.ALIGN_CENTER,
                SpacingAfter = 20
            };
            document.Add(date);

            // Footer
            var footerFont = FontFactory.GetFont(FontFactory.HELVETICA_OBLIQUE, 10, BaseColor.GRAY);
            var footer = new Paragraph("Powered by BlockPlane", footerFont)
            {
                Alignment = Element.ALIGN_CENTER
            };
            document.Add(footer);
        }

        /// <summary>
        /// Add executive summary section
        /// </summary>
        private void AddExecutiveSummary(Document document, ProjectAnalysis analysis)
        {
            AddSectionHeader(document, "Executive Summary");

            var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 11, TextColor);

            // Summary paragraph
            var summary = new Paragraph(
                $"This report presents a comprehensive carbon footprint analysis of the project '{analysis.ProjectName}'. " +
                $"The analysis examined {analysis.MaterialCount} different materials across {analysis.TotalElements} building elements. " +
                $"The total embodied carbon for this project is estimated at {analysis.TotalCarbon:F2} kg CO₂e.",
                normalFont
            );
            summary.SpacingAfter = 20;
            document.Add(summary);

            // Key findings
            AddSubsectionHeader(document, "Key Findings");

            var findings = new List
            {
                new ListItem($"Total embodied carbon: {analysis.TotalCarbon:F2} kg CO₂e", normalFont),
                new ListItem($"Production phase (A1-A3) accounts for {(analysis.ProductionCarbon / analysis.TotalCarbon * 100):F1}% of total carbon", normalFont),
                new ListItem($"Top 3 materials contribute {analysis.TopContributors?.Take(3).Sum(c => c.Percentage):F1}% of total carbon", normalFont),
                new ListItem($"Potential carbon reduction: {analysis.PotentialSavings:F2} kg CO₂e ({analysis.SavingsPercentage:F1}%)", normalFont),
                new ListItem($"{analysis.RecommendedSwaps} material swap opportunities identified", normalFont)
            };
            findings.SpacingAfter = 20;
            document.Add(findings);

            // Material matching quality
            AddSubsectionHeader(document, "Material Matching Quality");

            var matchingTable = new PdfPTable(2) { WidthPercentage = 80, SpacingAfter = 20 };
            matchingTable.SetWidths(new float[] { 2f, 1f });

            AddTableHeader(matchingTable, "Confidence Level", "Count");
            AddTableRow(matchingTable, "High Confidence", analysis.HighConfidenceMatches.ToString());
            AddTableRow(matchingTable, "Medium Confidence", analysis.MediumConfidenceMatches.ToString());
            AddTableRow(matchingTable, "Low Confidence", analysis.LowConfidenceMatches.ToString());
            AddTableRow(matchingTable, "Unmatched", analysis.UnmatchedMaterials.ToString());

            document.Add(matchingTable);
        }

        /// <summary>
        /// Add lifecycle breakdown section
        /// </summary>
        private void AddLifecycleBreakdown(Document document, ProjectAnalysis analysis)
        {
            AddSectionHeader(document, "Lifecycle Carbon Breakdown");

            var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 11, TextColor);
            var intro = new Paragraph(
                "The following table shows the carbon emissions breakdown across different lifecycle stages " +
                "according to EN 15978 standards.",
                normalFont
            );
            intro.SpacingAfter = 20;
            document.Add(intro);

            // Lifecycle table
            var table = new PdfPTable(3) { WidthPercentage = 100, SpacingAfter = 20 };
            table.SetWidths(new float[] { 3f, 2f, 1.5f });

            AddTableHeader(table, "Lifecycle Stage", "Carbon (kg CO₂e)", "Percentage");

            double total = analysis.ProductionCarbon + analysis.TransportCarbon + 
                          analysis.InstallationCarbon + analysis.UsePhaseCarbon + 
                          analysis.EndOfLifeCarbon;

            if (total > 0)
            {
                AddTableRow(table, "A1-A3: Product Stage (Production)", 
                           $"{analysis.ProductionCarbon:F2}", 
                           $"{(analysis.ProductionCarbon / total * 100):F1}%");
                
                AddTableRow(table, "A4: Transport to Site", 
                           $"{analysis.TransportCarbon:F2}", 
                           $"{(analysis.TransportCarbon / total * 100):F1}%");
                
                AddTableRow(table, "A5: Installation", 
                           $"{analysis.InstallationCarbon:F2}", 
                           $"{(analysis.InstallationCarbon / total * 100):F1}%");
                
                AddTableRow(table, "B: Use Phase", 
                           $"{analysis.UsePhaseCarbon:F2}", 
                           $"{(analysis.UsePhaseCarbon / total * 100):F1}%");
                
                AddTableRow(table, "C1-C4: End of Life", 
                           $"{analysis.EndOfLifeCarbon:F2}", 
                           $"{(analysis.EndOfLifeCarbon / total * 100):F1}%");

                // Total row
                var totalCell1 = new PdfPCell(new Phrase("TOTAL", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10)));
                var totalCell2 = new PdfPCell(new Phrase($"{total:F2}", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10)));
                var totalCell3 = new PdfPCell(new Phrase("100%", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10)));
                
                totalCell1.BackgroundColor = LightGray;
                totalCell2.BackgroundColor = LightGray;
                totalCell3.BackgroundColor = LightGray;
                
                table.AddCell(totalCell1);
                table.AddCell(totalCell2);
                table.AddCell(totalCell3);
            }

            document.Add(table);
        }

        /// <summary>
        /// Add top contributors section
        /// </summary>
        private void AddTopContributors(Document document, ProjectAnalysis analysis)
        {
            AddSectionHeader(document, "Top Carbon Contributors");

            if (analysis.TopContributors == null || !analysis.TopContributors.Any())
            {
                document.Add(new Paragraph("No carbon contributors data available."));
                return;
            }

            var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 11, TextColor);
            var intro = new Paragraph(
                "The following materials are the largest contributors to the project's carbon footprint. " +
                "Focusing optimization efforts on these materials will yield the greatest carbon reductions.",
                normalFont
            );
            intro.SpacingAfter = 20;
            document.Add(intro);

            // Contributors table
            var table = new PdfPTable(4) { WidthPercentage = 100, SpacingAfter = 20 };
            table.SetWidths(new float[] { 0.5f, 3f, 2f, 1.5f });

            AddTableHeader(table, "#", "Material", "Carbon (kg CO₂e)", "% of Total");

            int rank = 1;
            foreach (var contributor in analysis.TopContributors.Take(10))
            {
                AddTableRow(table, 
                           rank.ToString(), 
                           contributor.MaterialName, 
                           $"{contributor.Carbon:F2}", 
                           $"{contributor.Percentage:F1}%");
                rank++;
            }

            document.Add(table);
        }

        /// <summary>
        /// Add material details section
        /// </summary>
        private void AddMaterialDetails(Document document, List<MaterialUsageDetail> usages)
        {
            AddSectionHeader(document, "Material Details");

            if (usages == null || !usages.Any())
            {
                document.Add(new Paragraph("No material usage data available."));
                return;
            }

            // Materials table
            var table = new PdfPTable(5) { WidthPercentage = 100, SpacingAfter = 20 };
            table.SetWidths(new float[] { 3f, 1f, 1.5f, 1.5f, 1.5f });

            AddTableHeader(table, "Material", "Elements", "Quantity", "Carbon (kg CO₂e)", "Cost (USD)");

            foreach (var usage in usages.OrderByDescending(u => u.EstimatedCarbon).Take(20))
            {
                AddTableRow(table,
                           usage.RevitMaterialName,
                           usage.ElementCount.ToString(),
                           $"{usage.Quantity:F2} {usage.Unit}",
                           $"{usage.EstimatedCarbon:F2}",
                           $"{usage.EstimatedCost:F2}");
            }

            document.Add(table);
        }

        /// <summary>
        /// Add optimization recommendations section
        /// </summary>
        private void AddOptimizationRecommendations(Document document, ProjectAnalysis analysis)
        {
            AddSectionHeader(document, "Optimization Recommendations");

            var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 11, TextColor);

            if (analysis.PotentialSavings > 0)
            {
                var intro = new Paragraph(
                    $"Based on the analysis, {analysis.RecommendedSwaps} material swap opportunities have been identified " +
                    $"that could reduce the project's carbon footprint by {analysis.PotentialSavings:F2} kg CO₂e " +
                    $"({analysis.SavingsPercentage:F1}% reduction).",
                    normalFont
                );
                intro.SpacingAfter = 20;
                document.Add(intro);

                AddSubsectionHeader(document, "Recommended Actions");

                var actions = new List
                {
                    new ListItem("Review the top carbon contributors and explore lower-carbon alternatives", normalFont),
                    new ListItem("Use the Material Browser to search for sustainable alternatives", normalFont),
                    new ListItem("Consider materials with high RIS (Regenerative Impact Score) ratings", normalFont),
                    new ListItem("Evaluate the cost-benefit trade-offs for each material swap", normalFont),
                    new ListItem("Prioritize swaps that offer both carbon and cost savings", normalFont)
                };
                actions.SpacingAfter = 20;
                document.Add(actions);
            }
            else
            {
                var noOptimizations = new Paragraph(
                    "No optimization opportunities were identified based on the current material selections.",
                    normalFont
                );
                noOptimizations.SpacingAfter = 20;
                document.Add(noOptimizations);
            }

            // Methodology note
            AddSubsectionHeader(document, "Methodology");
            var methodology = new Paragraph(
                "This analysis uses lifecycle assessment (LCA) data from the BlockPlane sustainable materials database. " +
                "Carbon calculations follow EN 15978 standards for assessing the environmental performance of buildings. " +
                "Material matching is performed using intelligent algorithms with confidence scoring.",
                FontFactory.GetFont(FontFactory.HELVETICA, 9, BaseColor.GRAY)
            );
            methodology.SpacingAfter = 10;
            document.Add(methodology);
        }

        #region Helper Methods

        private void AddSectionHeader(Document document, string text)
        {
            var font = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 16, PrimaryColor);
            var header = new Paragraph(text, font)
            {
                SpacingBefore = 10,
                SpacingAfter = 15
            };
            document.Add(header);
        }

        private void AddSubsectionHeader(Document document, string text)
        {
            var font = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12, SecondaryColor);
            var header = new Paragraph(text, font)
            {
                SpacingBefore = 10,
                SpacingAfter = 10
            };
            document.Add(header);
        }

        private void AddMetricCell(PdfPTable table, string label, string value)
        {
            var cell = new PdfPCell();
            cell.Border = Rectangle.BOX;
            cell.Padding = 10;
            cell.BackgroundColor = LightGray;

            var labelFont = FontFactory.GetFont(FontFactory.HELVETICA, 10, BaseColor.GRAY);
            var valueFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 14, PrimaryColor);

            var content = new Paragraph();
            content.Add(new Chunk(label + "\n", labelFont));
            content.Add(new Chunk(value, valueFont));

            cell.AddElement(content);
            table.AddCell(cell);
        }

        private void AddTableHeader(PdfPTable table, params string[] headers)
        {
            var font = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);
            
            foreach (var header in headers)
            {
                var cell = new PdfPCell(new Phrase(header, font))
                {
                    BackgroundColor = PrimaryColor,
                    Padding = 5,
                    HorizontalAlignment = Element.ALIGN_LEFT
                };
                table.AddCell(cell);
            }
        }

        private void AddTableRow(PdfPTable table, params string[] values)
        {
            var font = FontFactory.GetFont(FontFactory.HELVETICA, 9, TextColor);
            
            foreach (var value in values)
            {
                var cell = new PdfPCell(new Phrase(value, font))
                {
                    Padding = 5,
                    HorizontalAlignment = Element.ALIGN_LEFT
                };
                table.AddCell(cell);
            }
        }
        
        /// <summary>
        /// HONESTY FIRST: Add mandatory data quality and confidence section
        /// </summary>
        private void AddDataQualitySection(Document document, ProjectAnalysis analysis)
        {
            AddSectionHeader(document, "Data Quality & Confidence");
            
            // Overall confidence
            AddParagraph(document, $"Overall Data Confidence: {analysis.OverallConfidencePercent:F1}%");
            AddParagraph(document, "");
            
            // Confidence breakdown table
            var table = new PdfPTable(3) { WidthPercentage = 100, SpacingAfter = 15 };
            table.SetWidths(new float[] { 40, 30, 30 });
            
            AddTableHeader(table, "Confidence Level", "Count", "Percentage");
            
            int total = analysis.MaterialCount;
            AddTableRow(table, 
                "🟢 High Confidence", 
                analysis.HighConfidenceMatches.ToString(),
                $"{(analysis.HighConfidenceMatches * 100.0 / total):F1}%");
            AddTableRow(table, 
                "🟡 Medium Confidence", 
                analysis.MediumConfidenceMatches.ToString(),
                $"{(analysis.MediumConfidenceMatches * 100.0 / total):F1}%");
            AddTableRow(table, 
                "🔴 Low Confidence", 
                analysis.LowConfidenceMatches.ToString(),
                $"{(analysis.LowConfidenceMatches * 100.0 / total):F1}%");
            AddTableRow(table, 
                "⚫ Unmatched", 
                analysis.UnmatchedMaterials.ToString(),
                $"{(analysis.UnmatchedMaterials * 100.0 / total):F1}%");
            
            document.Add(table);
            
            // Data quality summary
            if (analysis.DataQualitySummary != null)
            {
                AddSubHeader(document, "Data Sources");
                AddParagraph(document, $"Manufacturer-specific EPDs: {analysis.DataQualitySummary.ManufacturerEpdCount}");
                AddParagraph(document, $"Industry average EPDs: {analysis.DataQualitySummary.IndustryAverageCount}");
                
                if (analysis.DataQualitySummary.StaleEpdCount > 0)
                {
                    AddParagraph(document, "");
                    var warningFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11, AccentColor);
                    document.Add(new Paragraph($"⚠️ Warning: {analysis.DataQualitySummary.StaleEpdCount} materials have EPD data >2 years old", warningFont));
                }
                
                // Verification notes
                if (analysis.DataQualitySummary.VerificationNotes.Count > 0)
                {
                    AddSubHeader(document, "Verification Recommended");
                    AddParagraph(document, "The following materials require manual verification:");
                    AddParagraph(document, "");
                    
                    foreach (var note in analysis.DataQualitySummary.VerificationNotes)
                    {
                        var noteFont = FontFactory.GetFont(FontFactory.HELVETICA, 10, TextColor);
                        var priorityColor = note.Priority == "High" ? BaseColor.RED : 
                                          note.Priority == "Medium" ? AccentColor : TextColor;
                        var priorityFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, priorityColor);
                        
                        var para = new Paragraph();
                        para.Add(new Chunk($"[{note.Priority}] ", priorityFont));
                        para.Add(new Chunk($"{note.ItemName}\n", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, TextColor)));
                        para.Add(new Chunk($"  Reason: {note.Reason}\n", noteFont));
                        para.Add(new Chunk($"  Action: {note.RecommendedAction}\n", noteFont));
                        if (!string.IsNullOrEmpty(note.PotentialImpact))
                        {
                            para.Add(new Chunk($"  Impact: {note.PotentialImpact}\n", noteFont));
                        }
                        para.SpacingAfter = 10;
                        document.Add(para);
                    }
                }
            }
            
            // Important disclaimer
            AddParagraph(document, "");
            var disclaimerFont = FontFactory.GetFont(FontFactory.HELVETICA_OBLIQUE, 10, TextColor);
            var disclaimer = new Paragraph(
                "Important: This analysis is based on available EPD data and automated material matching. " +
                "All high-impact materials and low-confidence matches should be manually verified before " +
                "use in regulatory submissions or client presentations.",
                disclaimerFont
            );
            disclaimer.SpacingBefore = 15;
            disclaimer.SpacingAfter = 10;
            var disclaimerCell = new PdfPCell(disclaimer)
            {
                BackgroundColor = LightGray,
                Padding = 10,
                Border = Rectangle.NO_BORDER
            };
            var disclaimerTable = new PdfPTable(1) { WidthPercentage = 100 };
            disclaimerTable.AddCell(disclaimerCell);
            document.Add(disclaimerTable);
        }
        
        /// <summary>
        /// HONESTY FIRST: Add methodology and limitations section
        /// </summary>
        private void AddMethodologyAndLimitations(Document document)
        {
            AddSectionHeader(document, "Methodology & Limitations");
            
            AddSubHeader(document, "Calculation Methodology");
            AddParagraph(document, "This analysis follows the EN 15978 standard for lifecycle carbon assessment:");
            AddParagraph(document, "");
            
            var methodList = new List<string>
            {
                "Material extraction and quantities calculated from Revit BIM geometry",
                "Carbon data sourced from Environmental Product Declarations (EPDs)",
                "Lifecycle stages: A1-A5 (Product & Construction), B (Use), C1-C4 (End of Life)",
                "Material matching uses multi-strategy algorithm (exact name, fuzzy match, category, material class)",
                "Confidence scores based on name similarity, category match, and data quality"
            };
            
            foreach (var item in methodList)
            {
                var bullet = new Paragraph($"  • {item}", FontFactory.GetFont(FontFactory.HELVETICA, 10, TextColor));
                bullet.SpacingAfter = 5;
                document.Add(bullet);
            }
            
            AddParagraph(document, "");
            AddSubHeader(document, "Known Limitations");
            AddParagraph(document, "Users should be aware of the following limitations:");
            AddParagraph(document, "");
            
            var limitations = new List<string>
            {
                "Material matching is probabilistic, not guaranteed accurate",
                "EPD data may be outdated (check publication dates)",
                "Transport distances use default assumptions (500km typical)",
                "Regional variations in carbon intensity not fully captured",
                "Operational carbon (building use phase) not included",
                "Installation waste factors use industry averages",
                "Some materials may not have EPD data available",
                "Industry average EPDs used when manufacturer-specific data unavailable"
            };
            
            foreach (var item in limitations)
            {
                var bullet = new Paragraph($"  • {item}", FontFactory.GetFont(FontFactory.HELVETICA, 10, TextColor));
                bullet.SpacingAfter = 5;
                document.Add(bullet);
            }
            
            AddParagraph(document, "");
            AddSubHeader(document, "Recommended Verification Steps");
            AddParagraph(document, "For regulatory submissions or critical decisions:");
            AddParagraph(document, "");
            
            var verificationSteps = new List<string>
            {
                "Verify all low-confidence material matches manually",
                "Check EPD publication dates and update if >2 years old",
                "Confirm manufacturer-specific EPDs for high-impact materials",
                "Validate transport distances for your specific project location",
                "Review regional carbon intensity factors",
                "Consult with LCA specialist for LEED/BREEAM submissions",
                "Cross-reference with other carbon calculation tools"
            };
            
            foreach (var item in verificationSteps)
            {
                var bullet = new Paragraph($"  • {item}", FontFactory.GetFont(FontFactory.HELVETICA, 10, TextColor));
                bullet.SpacingAfter = 5;
                document.Add(bullet);
            }
            
            // Final disclaimer
            AddParagraph(document, "");
            var finalDisclaimerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11, AccentColor);
            var finalDisclaimer = new Paragraph(
                "This tool provides guidance for embodied carbon assessment. Professional judgment and verification " +
                "are required for all critical applications. BlockPlane is not liable for decisions made based solely " +
                "on this analysis without independent verification.",
                finalDisclaimerFont
            );
            finalDisclaimer.SpacingBefore = 15;
            finalDisclaimer.SpacingAfter = 10;
            var finalDisclaimerCell = new PdfPCell(finalDisclaimer)
            {
                BackgroundColor = new BaseColor(255, 245, 230),
                Padding = 15,
                Border = Rectangle.BOX,
                BorderColor = AccentColor,
                BorderWidth = 2
            };
            var finalDisclaimerTable = new PdfPTable(1) { WidthPercentage = 100 };
            finalDisclaimerTable.AddCell(finalDisclaimerCell);
            document.Add(finalDisclaimerTable);
            
            // Contact information
            AddParagraph(document, "");
            AddParagraph(document, "");
            var contactFont = FontFactory.GetFont(FontFactory.HELVETICA, 9, BaseColor.GRAY);
            var contact = new Paragraph(
                $"Report generated by BlockPlane Revit Plugin v1.0.0 on {DateTime.Now:yyyy-MM-dd HH:mm}\n" +
                "For questions or to report data issues: support@blockplane.com",
                contactFont
            );
            contact.Alignment = Element.ALIGN_CENTER;
            document.Add(contact);
        }

        #endregion
    }
}
