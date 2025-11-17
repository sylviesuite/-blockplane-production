using System;
using System.Collections.Generic;

namespace BlockPlane.RevitPlugin.Models
{
    /// <summary>
    /// Confidence level for material matching and data quality
    /// </summary>
    public enum ConfidenceLevel
    {
        /// <summary>
        /// No match found or data unavailable
        /// </summary>
        None = 0,
        
        /// <summary>
        /// Low confidence (&lt;70%) - Manual verification required
        /// </summary>
        Low = 1,
        
        /// <summary>
        /// Medium confidence (70-89%) - Review recommended
        /// </summary>
        Medium = 2,
        
        /// <summary>
        /// High confidence (90%+) - Likely accurate, but verify for critical applications
        /// </summary>
        High = 3
    }

    /// <summary>
    /// Method used to match Revit material to BlockPlane database
    /// </summary>
    public enum MatchMethod
    {
        /// <summary>
        /// No match found
        /// </summary>
        None,
        
        /// <summary>
        /// Exact name match
        /// </summary>
        ExactName,
        
        /// <summary>
        /// Fuzzy name match using Levenshtein distance
        /// </summary>
        FuzzyName,
        
        /// <summary>
        /// Matched by material category
        /// </summary>
        Category,
        
        /// <summary>
        /// Matched by Revit material class
        /// </summary>
        MaterialClass,
        
        /// <summary>
        /// Manual override by user
        /// </summary>
        ManualOverride
    }

    /// <summary>
    /// Source of EPD (Environmental Product Declaration) data
    /// </summary>
    public enum EpdDataSource
    {
        /// <summary>
        /// Unknown or unspecified source
        /// </summary>
        Unknown,
        
        /// <summary>
        /// Manufacturer-specific EPD
        /// </summary>
        ManufacturerEpd,
        
        /// <summary>
        /// Industry average EPD
        /// </summary>
        IndustryAverage,
        
        /// <summary>
        /// Regional database (Ökobaudat, ICE, etc.)
        /// </summary>
        RegionalDatabase,
        
        /// <summary>
        /// Generic estimate (use with caution)
        /// </summary>
        GenericEstimate
    }

    /// <summary>
    /// Comprehensive data quality information for a material match
    /// HONESTY FIRST: This class exposes all quality metrics and limitations
    /// </summary>
    public class DataQuality
    {
        /// <summary>
        /// Overall confidence level for this match
        /// </summary>
        public ConfidenceLevel Confidence { get; set; }
        
        /// <summary>
        /// Numeric confidence score (0-100)
        /// </summary>
        public double ConfidenceScore { get; set; }
        
        /// <summary>
        /// Method used to match material
        /// </summary>
        public MatchMethod MatchMethod { get; set; }
        
        /// <summary>
        /// Source of EPD data
        /// </summary>
        public EpdDataSource EpdSource { get; set; }
        
        /// <summary>
        /// Date when EPD was published
        /// </summary>
        public DateTime? EpdPublishedDate { get; set; }
        
        /// <summary>
        /// Date when data was retrieved from API
        /// </summary>
        public DateTime DataRetrievedAt { get; set; }
        
        /// <summary>
        /// Age of EPD data in years
        /// </summary>
        public double? EpdAgeYears
        {
            get
            {
                if (!EpdPublishedDate.HasValue) return null;
                return (DateTime.Now - EpdPublishedDate.Value).TotalDays / 365.25;
            }
        }
        
        /// <summary>
        /// Is EPD data stale? (>2 years old)
        /// </summary>
        public bool IsEpdStale => EpdAgeYears.HasValue && EpdAgeYears.Value > 2.0;
        
        /// <summary>
        /// Verification recommended?
        /// </summary>
        public bool VerificationRecommended { get; set; }
        
        /// <summary>
        /// Known limitations for this material/match
        /// </summary>
        public List<string> KnownLimitations { get; set; } = new List<string>();
        
        /// <summary>
        /// Assumptions made in calculations
        /// </summary>
        public List<string> Assumptions { get; set; } = new List<string>();
        
        /// <summary>
        /// Data sources and references
        /// </summary>
        public List<string> DataSources { get; set; } = new List<string>();
        
        /// <summary>
        /// Explanation of why this match was chosen
        /// </summary>
        public string? MatchReasoning { get; set; }
        
        /// <summary>
        /// Warning message for user (if any)
        /// </summary>
        public string? WarningMessage { get; set; }
        
        /// <summary>
        /// Get human-readable confidence description
        /// </summary>
        public string GetConfidenceDescription()
        {
            return Confidence switch
            {
                ConfidenceLevel.High => $"High confidence ({ConfidenceScore:F0}%) - Likely accurate, but verify for critical applications",
                ConfidenceLevel.Medium => $"Medium confidence ({ConfidenceScore:F0}%) - Review recommended before use",
                ConfidenceLevel.Low => $"Low confidence ({ConfidenceScore:F0}%) - Manual verification required",
                ConfidenceLevel.None => "No match found - Manual research needed",
                _ => "Unknown confidence level"
            };
        }
        
        /// <summary>
        /// Get human-readable match method description
        /// </summary>
        public string GetMatchMethodDescription()
        {
            return MatchMethod switch
            {
                MatchMethod.ExactName => "Exact name match in database",
                MatchMethod.FuzzyName => "Fuzzy name match using similarity algorithm",
                MatchMethod.Category => "Matched by material category",
                MatchMethod.MaterialClass => "Matched by Revit material class",
                MatchMethod.ManualOverride => "Manually selected by user",
                MatchMethod.None => "No match found",
                _ => "Unknown match method"
            };
        }
        
        /// <summary>
        /// Get human-readable EPD source description
        /// </summary>
        public string GetEpdSourceDescription()
        {
            return EpdSource switch
            {
                EpdDataSource.ManufacturerEpd => "Manufacturer-specific EPD (highest quality)",
                EpdDataSource.IndustryAverage => "Industry average EPD (typical values)",
                EpdDataSource.RegionalDatabase => "Regional database (Ökobaudat, ICE, etc.)",
                EpdDataSource.GenericEstimate => "Generic estimate (use with caution)",
                EpdDataSource.Unknown => "Unknown source",
                _ => "Unspecified source"
            };
        }
        
        /// <summary>
        /// Generate comprehensive quality report
        /// </summary>
        public string GenerateQualityReport()
        {
            var report = new System.Text.StringBuilder();
            
            report.AppendLine("DATA QUALITY REPORT");
            report.AppendLine("==================");
            report.AppendLine();
            
            report.AppendLine($"Confidence: {GetConfidenceDescription()}");
            report.AppendLine($"Match Method: {GetMatchMethodDescription()}");
            report.AppendLine($"EPD Source: {GetEpdSourceDescription()}");
            
            if (EpdPublishedDate.HasValue)
            {
                report.AppendLine($"EPD Date: {EpdPublishedDate.Value:yyyy-MM-dd} ({EpdAgeYears:F1} years old)");
                if (IsEpdStale)
                {
                    report.AppendLine("⚠️ WARNING: EPD data is >2 years old");
                }
            }
            
            report.AppendLine($"Data Retrieved: {DataRetrievedAt:yyyy-MM-dd HH:mm}");
            report.AppendLine($"Verification Recommended: {(VerificationRecommended ? "YES" : "No")}");
            
            if (KnownLimitations.Count > 0)
            {
                report.AppendLine();
                report.AppendLine("Known Limitations:");
                foreach (var limitation in KnownLimitations)
                {
                    report.AppendLine($"  • {limitation}");
                }
            }
            
            if (Assumptions.Count > 0)
            {
                report.AppendLine();
                report.AppendLine("Assumptions:");
                foreach (var assumption in Assumptions)
                {
                    report.AppendLine($"  • {assumption}");
                }
            }
            
            if (DataSources.Count > 0)
            {
                report.AppendLine();
                report.AppendLine("Data Sources:");
                foreach (var source in DataSources)
                {
                    report.AppendLine($"  • {source}");
                }
            }
            
            if (!string.IsNullOrEmpty(MatchReasoning))
            {
                report.AppendLine();
                report.AppendLine("Match Reasoning:");
                report.AppendLine($"  {MatchReasoning}");
            }
            
            if (!string.IsNullOrEmpty(WarningMessage))
            {
                report.AppendLine();
                report.AppendLine("⚠️ WARNING:");
                report.AppendLine($"  {WarningMessage}");
            }
            
            return report.ToString();
        }
    }

    /// <summary>
    /// Verification note recommending manual checks
    /// </summary>
    public class VerificationNote
    {
        /// <summary>
        /// Priority level (High/Medium/Low)
        /// </summary>
        public string Priority { get; set; } = "Medium";
        
        /// <summary>
        /// Material or item that needs verification
        /// </summary>
        public string ItemName { get; set; } = string.Empty;
        
        /// <summary>
        /// Reason why verification is needed
        /// </summary>
        public string Reason { get; set; } = string.Empty;
        
        /// <summary>
        /// Recommended action
        /// </summary>
        public string RecommendedAction { get; set; } = string.Empty;
        
        /// <summary>
        /// Potential impact if not verified
        /// </summary>
        public string? PotentialImpact { get; set; }
    }

    /// <summary>
    /// Summary of data quality across an entire analysis
    /// </summary>
    public class DataQualitySummary
    {
        /// <summary>
        /// Total materials analyzed
        /// </summary>
        public int TotalMaterials { get; set; }
        
        /// <summary>
        /// Materials with high confidence
        /// </summary>
        public int HighConfidenceCount { get; set; }
        
        /// <summary>
        /// Materials with medium confidence
        /// </summary>
        public int MediumConfidenceCount { get; set; }
        
        /// <summary>
        /// Materials with low confidence
        /// </summary>
        public int LowConfidenceCount { get; set; }
        
        /// <summary>
        /// Materials that couldn't be matched
        /// </summary>
        public int UnmatchedCount { get; set; }
        
        /// <summary>
        /// Materials using manufacturer EPDs
        /// </summary>
        public int ManufacturerEpdCount { get; set; }
        
        /// <summary>
        /// Materials using industry average EPDs
        /// </summary>
        public int IndustryAverageCount { get; set; }
        
        /// <summary>
        /// Materials with stale EPD data (>2 years)
        /// </summary>
        public int StaleEpdCount { get; set; }
        
        /// <summary>
        /// Materials requiring verification
        /// </summary>
        public int VerificationRequiredCount { get; set; }
        
        /// <summary>
        /// Overall confidence percentage (0-100)
        /// </summary>
        public double OverallConfidencePercent
        {
            get
            {
                if (TotalMaterials == 0) return 0;
                var weightedScore = (HighConfidenceCount * 100.0) + 
                                   (MediumConfidenceCount * 70.0) + 
                                   (LowConfidenceCount * 40.0);
                return weightedScore / TotalMaterials;
            }
        }
        
        /// <summary>
        /// Verification notes for user
        /// </summary>
        public List<VerificationNote> VerificationNotes { get; set; } = new List<VerificationNote>();
        
        /// <summary>
        /// Generate summary report
        /// </summary>
        public string GenerateSummaryReport()
        {
            var report = new System.Text.StringBuilder();
            
            report.AppendLine("DATA QUALITY SUMMARY");
            report.AppendLine("===================");
            report.AppendLine();
            
            report.AppendLine($"Total Materials Analyzed: {TotalMaterials}");
            report.AppendLine($"Overall Confidence: {OverallConfidencePercent:F1}%");
            report.AppendLine();
            
            report.AppendLine("Confidence Breakdown:");
            report.AppendLine($"  🟢 High confidence: {HighConfidenceCount} ({GetPercentage(HighConfidenceCount)}%)");
            report.AppendLine($"  🟡 Medium confidence: {MediumConfidenceCount} ({GetPercentage(MediumConfidenceCount)}%)");
            report.AppendLine($"  🔴 Low confidence: {LowConfidenceCount} ({GetPercentage(LowConfidenceCount)}%)");
            report.AppendLine($"  ⚫ Unmatched: {UnmatchedCount} ({GetPercentage(UnmatchedCount)}%)");
            report.AppendLine();
            
            report.AppendLine("Data Sources:");
            report.AppendLine($"  Manufacturer EPDs: {ManufacturerEpdCount} ({GetPercentage(ManufacturerEpdCount)}%)");
            report.AppendLine($"  Industry Averages: {IndustryAverageCount} ({GetPercentage(IndustryAverageCount)}%)");
            report.AppendLine();
            
            if (StaleEpdCount > 0)
            {
                report.AppendLine($"⚠️ Stale EPD Data: {StaleEpdCount} materials have EPD data >2 years old");
                report.AppendLine();
            }
            
            if (VerificationRequiredCount > 0)
            {
                report.AppendLine($"⚠️ Verification Required: {VerificationRequiredCount} materials need manual verification");
                report.AppendLine();
            }
            
            if (VerificationNotes.Count > 0)
            {
                report.AppendLine("VERIFICATION NOTES:");
                foreach (var note in VerificationNotes)
                {
                    report.AppendLine($"  [{note.Priority}] {note.ItemName}");
                    report.AppendLine($"    Reason: {note.Reason}");
                    report.AppendLine($"    Action: {note.RecommendedAction}");
                    report.AppendLine();
                }
            }
            
            return report.ToString();
        }
        
        private double GetPercentage(int count)
        {
            if (TotalMaterials == 0) return 0;
            return (count * 100.0) / TotalMaterials;
        }
    }
}
