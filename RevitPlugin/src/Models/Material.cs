using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace BlockPlane.RevitPlugin.Models
{
    /// <summary>
    /// Represents a sustainable building material from BlockPlane database
    /// </summary>
    public class Material
    {
        [JsonProperty("id")]
        public int Id { get; set; }
        
        [JsonProperty("name")]
        public string Name { get; set; } = string.Empty;
        
        [JsonProperty("category")]
        public string Category { get; set; } = string.Empty;
        
        [JsonProperty("description")]
        public string? Description { get; set; }
        
        // Lifecycle carbon data (kg CO₂e per functional unit)
        [JsonProperty("carbonA1A3")]
        public double CarbonA1A3 { get; set; }  // Production
        
        [JsonProperty("carbonA4")]
        public double CarbonA4 { get; set; }    // Transport
        
        [JsonProperty("carbonA5")]
        public double CarbonA5 { get; set; }    // Construction
        
        [JsonProperty("carbonB")]
        public double CarbonB { get; set; }     // Use
        
        [JsonProperty("carbonC1C4")]
        public double CarbonC1C4 { get; set; }  // End of life
        
        // Sustainability scores
        [JsonProperty("risScore")]
        public int RisScore { get; set; }       // Regenerative Impact Score (0-100)
        
        [JsonProperty("lisScore")]
        public int LisScore { get; set; }       // Life Impact Score (0-100)
        
        // Cost data
        [JsonProperty("costPerUnit")]
        public double CostPerUnit { get; set; }
        
        [JsonProperty("functionalUnit")]
        public string FunctionalUnit { get; set; } = string.Empty;
        
        // EPD metadata
        [JsonProperty("epdSource")]
        public string? EpdSource { get; set; }
        
        [JsonProperty("epdDate")]
        public DateTime? EpdDate { get; set; }
        
        [JsonProperty("manufacturer")]
        public string? Manufacturer { get; set; }
        
        // HONESTY FIRST: Data quality and transparency fields
        
        /// <summary>
        /// Data quality information for this material
        /// Tracks confidence, sources, limitations, and verification needs
        /// </summary>
        [JsonIgnore]
        public DataQuality? Quality { get; set; }
        
        /// <summary>
        /// Regional variations and assumptions
        /// </summary>
        [JsonProperty("region")]
        public string? Region { get; set; }
        
        /// <summary>
        /// Certifications and compliance
        /// </summary>
        [JsonProperty("certifications")]
        public List<string>? Certifications { get; set; }
        
        /// <summary>
        /// Known limitations for this material data
        /// </summary>
        [JsonProperty("limitations")]
        public List<string>? Limitations { get; set; }
        
        /// <summary>
        /// Reference to source EPD document
        /// </summary>
        [JsonProperty("epdReference")]
        public string? EpdReference { get; set; }
        
        // Calculated properties
        
        /// <summary>
        /// Total lifecycle carbon (sum of all phases)
        /// </summary>
        [JsonIgnore]
        public double TotalCarbon => CarbonA1A3 + CarbonA4 + CarbonA5 + CarbonB + CarbonC1C4;
        
        /// <summary>
        /// Is this a regenerative material? (RIS >= 70)
        /// </summary>
        [JsonIgnore]
        public bool IsRegenerative => RisScore >= 70;
        
        /// <summary>
        /// Carbon intensity rating (Low/Medium/High)
        /// HONESTY NOTE: Thresholds are simplified. Actual intensity depends on functional unit and context.
        /// </summary>
        [JsonIgnore]
        public string CarbonIntensity
        {
            get
            {
                if (TotalCarbon < 50) return "Low";
                if (TotalCarbon < 150) return "Medium";
                return "High";
            }
        }
        
        /// <summary>
        /// Get data freshness indicator
        /// </summary>
        [JsonIgnore]
        public string DataFreshness
        {
            get
            {
                if (!EpdDate.HasValue) return "Unknown";
                var ageYears = (DateTime.Now - EpdDate.Value).TotalDays / 365.25;
                if (ageYears < 1) return "Fresh";
                if (ageYears < 2) return "Recent";
                if (ageYears < 3) return "Aging";
                return "Stale";
            }
        }
        
        /// <summary>
        /// Calculate carbon for a given quantity
        /// HONESTY NOTE: This is a simplified calculation. Actual carbon may vary based on:
        /// - Transport distance to site
        /// - Installation method
        /// - Regional energy grids
        /// - Waste factors
        /// Verify for critical applications.
        /// </summary>
        public double CalculateCarbon(double quantity)
        {
            return TotalCarbon * quantity;
        }
        
        /// <summary>
        /// Calculate cost for a given quantity
        /// </summary>
        public double CalculateCost(double quantity)
        {
            return CostPerUnit * quantity;
        }
        
        /// <summary>
        /// Compare carbon savings vs another material
        /// </summary>
        public double CompareCarbonSavings(Material other, double quantity)
        {
            return (other.TotalCarbon - this.TotalCarbon) * quantity;
        }
        
        /// <summary>
        /// Compare cost difference vs another material
        /// </summary>
        public double CompareCostDifference(Material other, double quantity)
        {
            return (this.CostPerUnit - other.CostPerUnit) * quantity;
        }
        
        /// <summary>
        /// Get honesty indicator for UI display
        /// </summary>
        public string GetHonestyIndicator()
        {
            var indicators = new List<string>();
            
            if (Quality != null)
            {
                if (Quality.Confidence == ConfidenceLevel.Low)
                    indicators.Add("⚠️ Low Confidence");
                if (Quality.IsEpdStale)
                    indicators.Add("⏰ Stale EPD");
                if (Quality.VerificationRecommended)
                    indicators.Add("✓ Verify");
            }
            
            if (DataFreshness == "Stale")
                indicators.Add("⏰ Old Data");
            
            return indicators.Count > 0 ? string.Join(" | ", indicators) : "✓ OK";
        }
        
        public override string ToString()
        {
            return $"{Name} ({Category}) - RIS: {RisScore}, Carbon: {TotalCarbon:F1} kg CO₂e/{FunctionalUnit}";
        }
    }
    
    /// <summary>
    /// Filter criteria for material search
    /// </summary>
    public class MaterialFilter
    {
        public string? SearchQuery { get; set; }
        public string? Category { get; set; }
        public int? MinRIS { get; set; }
        public int? MaxRIS { get; set; }
        public double? MaxCarbon { get; set; }
        public double? MaxCost { get; set; }
        public bool? RegenerativeOnly { get; set; }
        
        public int Limit { get; set; } = 50;
        public int Offset { get; set; } = 0;
    }
    
    /// <summary>
    /// Material comparison result
    /// HONESTY FIRST: Includes confidence and verification recommendations
    /// </summary>
    public class MaterialComparison
    {
        public Material CurrentMaterial { get; set; } = null!;
        public Material AlternativeMaterial { get; set; } = null!;
        public double Quantity { get; set; };
        public double CarbonSavings { get; set; };
        public double CostDifference { get; set; };
        public double CarbonSavingsPercent { get; set; };
        public double CostDifferencePercent { get; set; };
        
        /// <summary>
        /// Match confidence for the alternative material
        /// </summary>
        public ConfidenceLevel MatchConfidence { get; set; }
        
        /// <summary>
        /// Match score (0-100)
        /// </summary>
        public double MatchScore { get; set; }
        
        /// <summary>
        /// Verification recommended?
        /// </summary>
        public bool VerificationRecommended { get; set; }
        
        /// <summary>
        /// Warnings or limitations for this comparison
        /// </summary>
        public List<string> Warnings { get; set; } = new List<string>();
        
        public bool IsBetterForCarbon => CarbonSavings > 0;
        public bool IsCheaper => CostDifference < 0;
        
        /// <summary>
        /// Get honesty disclaimer for this comparison
        /// </summary>
        public string GetHonestyDisclaimer()
        {
            var disclaimer = new System.Text.StringBuilder();
            disclaimer.AppendLine("IMPORTANT: This is a comparison based on available data.");
            disclaimer.AppendLine();
            
            if (MatchConfidence != ConfidenceLevel.High)
            {
                disclaimer.AppendLine($"⚠️ Match confidence is {MatchConfidence}. Manual verification recommended.");
            }
            
            if (VerificationRecommended)
            {
                disclaimer.AppendLine("⚠️ Verification recommended before making swap decision.");
            }
            
            if (Warnings.Count > 0)
            {
                disclaimer.AppendLine();
                disclaimer.AppendLine("Warnings:");
                foreach (var warning in Warnings)
                {
                    disclaimer.AppendLine($"  • {warning}");
                }
            }
            
            disclaimer.AppendLine();
            disclaimer.AppendLine("Verify:");
            disclaimer.AppendLine("  • Material compatibility with your application");
            disclaimer.AppendLine("  • Regional availability and pricing");
            disclaimer.AppendLine("  • Building code compliance");
            disclaimer.AppendLine("  • Client requirements and specifications");
            
            return disclaimer.ToString();
        }
    }
}
