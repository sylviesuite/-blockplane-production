using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Autodesk.Revit.DB;
using BlockPlane.RevitPlugin.Models;
using BlockPlane.RevitPlugin.Services;
using Serilog;

namespace BlockPlane.RevitPlugin.BIM
{
    /// <summary>
    /// Maps Revit materials to BlockPlane sustainable materials database
    /// Uses intelligent matching based on name, category, and properties
    /// </summary>
    public class MaterialMapper
    {
        private readonly MaterialService _materialService;
        private readonly ILogger _logger;
        
        // Cache for material mappings to avoid repeated API calls
        private readonly Dictionary<string, Models.Material> _mappingCache;

        public MaterialMapper(MaterialService materialService)
        {
            _materialService = materialService ?? throw new ArgumentNullException(nameof(materialService));
            _logger = Log.ForContext<MaterialMapper>();
            _mappingCache = new Dictionary<string, Models.Material>();
        }

        /// <summary>
        /// Map a Revit material to a BlockPlane material
        /// </summary>
        public async Task<MaterialMapping> MapMaterialAsync(Autodesk.Revit.DB.Material revitMaterial)
        {
            if (revitMaterial == null)
            {
                throw new ArgumentNullException(nameof(revitMaterial));
            }

            var mapping = new MaterialMapping
            {
                RevitMaterialId = revitMaterial.UniqueId,
                RevitMaterialName = revitMaterial.Name,
                RevitMaterialClass = revitMaterial.MaterialClass,
                RevitMaterialCategory = revitMaterial.MaterialCategory
            };

            try
            {
                // Check cache first
                if (_mappingCache.TryGetValue(revitMaterial.UniqueId, out var cachedMaterial))
                {
                    mapping.BlockPlaneMaterial = cachedMaterial;
                    mapping.MatchConfidence = MatchConfidence.High;
                    mapping.MatchMethod = "Cache";
                    return mapping;
                }

                // Try to find match in BlockPlane database
                var blockPlaneMaterial = await FindBestMatchAsync(revitMaterial);

                if (blockPlaneMaterial != null)
                {
                    mapping.BlockPlaneMaterial = blockPlaneMaterial;
                    
                    // Calculate match quality metrics
                    mapping.MatchScore = CalculateMatchScore(revitMaterial, blockPlaneMaterial);
                    mapping.MatchConfidence = CalculateMatchConfidence(revitMaterial, blockPlaneMaterial);
                    
                    // HONESTY: Generate match reasoning
                    mapping.MatchReasoning = GenerateMatchReasoning(revitMaterial, blockPlaneMaterial, mapping.MatchScore);
                    
                    // HONESTY: Determine if verification needed
                    mapping.VerificationRecommended = mapping.MatchConfidence != MatchConfidence.High;
                    
                    // HONESTY: Add warnings for low confidence or stale data
                    if (mapping.MatchConfidence == MatchConfidence.Low)
                    {
                        mapping.Warnings.Add("Low confidence match - manual verification strongly recommended");
                    }
                    if (mapping.MatchConfidence == MatchConfidence.Medium)
                    {
                        mapping.Warnings.Add("Medium confidence match - review recommended before use");
                    }
                    if (blockPlaneMaterial.EpdDate.HasValue)
                    {
                        var ageYears = (DateTime.Now - blockPlaneMaterial.EpdDate.Value).TotalDays / 365.25;
                        if (ageYears > 2)
                        {
                            mapping.Warnings.Add($"EPD data is {ageYears:F1} years old - verify current data available");
                        }
                    }
                    
                    // Cache the mapping
                    _mappingCache[revitMaterial.UniqueId] = blockPlaneMaterial;

                    _logger.Information("Mapped {RevitMaterial} → {BlockPlaneMaterial} (confidence: {Confidence}, score: {Score})",
                        revitMaterial.Name, blockPlaneMaterial.Name, mapping.MatchConfidence, mapping.MatchScore);
                }
                else
                {
                    mapping.MatchConfidence = MatchConfidence.None;
                    mapping.MatchScore = 0;
                    mapping.MatchReasoning = "No suitable match found in database. Manual research required.";
                    mapping.VerificationRecommended = true;
                    mapping.Warnings.Add("No match found - this material is excluded from carbon calculations");
                    _logger.Warning("No match found for Revit material: {MaterialName}", revitMaterial.Name);
                }
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to map material: {MaterialName}", revitMaterial.Name);
                mapping.MatchConfidence = MatchConfidence.None;
            }

            return mapping;
        }

        /// <summary>
        /// Find the best matching BlockPlane material for a Revit material
        /// </summary>
        private async Task<Models.Material> FindBestMatchAsync(Autodesk.Revit.DB.Material revitMaterial)
        {
            // Strategy 1: Exact name match
            var exactMatch = await SearchByExactName(revitMaterial.Name);
            if (exactMatch != null)
            {
                return exactMatch;
            }

            // Strategy 2: Fuzzy name search
            var fuzzyMatches = await SearchByFuzzyName(revitMaterial.Name);
            if (fuzzyMatches.Any())
            {
                // Return the best match based on category and properties
                return SelectBestMatch(revitMaterial, fuzzyMatches);
            }

            // Strategy 3: Category-based search
            var categoryMatches = await SearchByCategory(revitMaterial);
            if (categoryMatches.Any())
            {
                return SelectBestMatch(revitMaterial, categoryMatches);
            }

            // Strategy 4: Material class-based search
            var classMatches = await SearchByMaterialClass(revitMaterial.MaterialClass);
            if (classMatches.Any())
            {
                return SelectBestMatch(revitMaterial, classMatches);
            }

            return null;
        }

        /// <summary>
        /// Search for exact name match
        /// </summary>
        private async Task<Models.Material> SearchByExactName(string materialName)
        {
            try
            {
                var results = await _materialService.SearchMaterialsAsync(materialName, limit: 5);
                
                return results?.FirstOrDefault(m => 
                    m.Name.Equals(materialName, StringComparison.OrdinalIgnoreCase));
            }
            catch (Exception ex)
            {
                _logger.Warning(ex, "Exact name search failed for: {MaterialName}", materialName);
                return null;
            }
        }

        /// <summary>
        /// Search for fuzzy name matches
        /// </summary>
        private async Task<List<Models.Material>> SearchByFuzzyName(string materialName)
        {
            try
            {
                // Extract keywords from material name
                var keywords = ExtractKeywords(materialName);
                
                var allMatches = new List<Models.Material>();
                
                foreach (var keyword in keywords)
                {
                    var results = await _materialService.SearchMaterialsAsync(keyword, limit: 10);
                    if (results != null)
                    {
                        allMatches.AddRange(results);
                    }
                }

                // Remove duplicates
                return allMatches.GroupBy(m => m.Id).Select(g => g.First()).ToList();
            }
            catch (Exception ex)
            {
                _logger.Warning(ex, "Fuzzy name search failed for: {MaterialName}", materialName);
                return new List<Models.Material>();
            }
        }

        /// <summary>
        /// Search by material category
        /// </summary>
        private async Task<List<Models.Material>> SearchByCategory(Autodesk.Revit.DB.Material revitMaterial)
        {
            try
            {
                string category = GuessBlockPlaneCategory(revitMaterial);
                
                if (string.IsNullOrEmpty(category) || category == "Unknown")
                {
                    return new List<Models.Material>();
                }

                // Get all materials in the category
                var allMaterials = await _materialService.GetAllMaterialsAsync();
                
                return allMaterials?
                    .Where(m => m.Category?.Equals(category, StringComparison.OrdinalIgnoreCase) == true)
                    .ToList() ?? new List<Models.Material>();
            }
            catch (Exception ex)
            {
                _logger.Warning(ex, "Category search failed");
                return new List<Models.Material>();
            }
        }

        /// <summary>
        /// Search by Revit material class
        /// </summary>
        private async Task<List<Models.Material>> SearchByMaterialClass(string materialClass)
        {
            if (string.IsNullOrEmpty(materialClass))
            {
                return new List<Models.Material>();
            }

            try
            {
                // Map Revit material class to search terms
                string searchTerm = materialClass.ToLowerInvariant() switch
                {
                    "concrete" => "concrete",
                    "metal" => "steel",
                    "wood" => "timber",
                    "plastic" => "composite",
                    "masonry" => "masonry",
                    _ => materialClass
                };

                var results = await _materialService.SearchMaterialsAsync(searchTerm, limit: 20);
                return results?.ToList() ?? new List<Models.Material>();
            }
            catch (Exception ex)
            {
                _logger.Warning(ex, "Material class search failed for: {MaterialClass}", materialClass);
                return new List<Models.Material>();
            }
        }

        /// <summary>
        /// Select the best match from a list of candidates
        /// </summary>
        private Models.Material SelectBestMatch(Autodesk.Revit.DB.Material revitMaterial, List<Models.Material> candidates)
        {
            if (!candidates.Any())
            {
                return null;
            }

            // Score each candidate
            var scored = candidates.Select(candidate => new
            {
                Material = candidate,
                Score = CalculateMatchScore(revitMaterial, candidate)
            }).OrderByDescending(x => x.Score).ToList();

            _logger.Debug("Best match for {RevitMaterial}: {BlockPlaneMaterial} (score: {Score})",
                revitMaterial.Name, scored.First().Material.Name, scored.First().Score);

            return scored.First().Material;
        }

        /// <summary>
        /// Calculate match score between Revit and BlockPlane materials
        /// </summary>
        private double CalculateMatchScore(Autodesk.Revit.DB.Material revitMaterial, Models.Material blockPlaneMaterial)
        {
            double score = 0;

            // Name similarity (max 50 points)
            score += CalculateNameSimilarity(revitMaterial.Name, blockPlaneMaterial.Name) * 50;

            // Category match (30 points)
            string revitCategory = GuessBlockPlaneCategory(revitMaterial);
            if (revitCategory.Equals(blockPlaneMaterial.Category, StringComparison.OrdinalIgnoreCase))
            {
                score += 30;
            }

            // Material class match (20 points)
            if (!string.IsNullOrEmpty(revitMaterial.MaterialClass))
            {
                if (blockPlaneMaterial.Name.ToLowerInvariant().Contains(revitMaterial.MaterialClass.ToLowerInvariant()))
                {
                    score += 20;
                }
            }

            return score;
        }

        /// <summary>
        /// Calculate name similarity using Levenshtein distance
        /// </summary>
        private double CalculateNameSimilarity(string name1, string name2)
        {
            if (string.IsNullOrEmpty(name1) || string.IsNullOrEmpty(name2))
            {
                return 0;
            }

            name1 = name1.ToLowerInvariant();
            name2 = name2.ToLowerInvariant();

            int distance = LevenshteinDistance(name1, name2);
            int maxLength = Math.Max(name1.Length, name2.Length);

            return 1.0 - ((double)distance / maxLength);
        }

        /// <summary>
        /// Calculate Levenshtein distance between two strings
        /// </summary>
        private int LevenshteinDistance(string s1, string s2)
        {
            int[,] d = new int[s1.Length + 1, s2.Length + 1];

            for (int i = 0; i <= s1.Length; i++)
                d[i, 0] = i;

            for (int j = 0; j <= s2.Length; j++)
                d[0, j] = j;

            for (int j = 1; j <= s2.Length; j++)
            {
                for (int i = 1; i <= s1.Length; i++)
                {
                    int cost = (s1[i - 1] == s2[j - 1]) ? 0 : 1;
                    d[i, j] = Math.Min(Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1), d[i - 1, j - 1] + cost);
                }
            }

            return d[s1.Length, s2.Length];
        }

        /// <summary>
        /// Calculate match confidence level
        /// </summary>
        private MatchConfidence CalculateMatchConfidence(Autodesk.Revit.DB.Material revitMaterial, Models.Material blockPlaneMaterial)
        {
            double score = CalculateMatchScore(revitMaterial, blockPlaneMaterial);

            if (score >= 80)
                return MatchConfidence.High;
            else if (score >= 50)
                return MatchConfidence.Medium;
            else if (score >= 20)
                return MatchConfidence.Low;
            else
                return MatchConfidence.None;
        }

        /// <summary>
        /// Extract keywords from material name
        /// </summary>
        private List<string> ExtractKeywords(string materialName)
        {
            if (string.IsNullOrWhiteSpace(materialName))
            {
                return new List<string>();
            }

            // Split by common separators and filter out short words
            var keywords = materialName
                .Split(new[] { ' ', '-', '_', ',', '/', '\\' }, StringSplitOptions.RemoveEmptyEntries)
                .Where(w => w.Length > 2)
                .Select(w => w.Trim())
                .Distinct()
                .ToList();

            return keywords;
        }

        /// <summary>
        /// Guess BlockPlane category from Revit material
        /// </summary>
        private string GuessBlockPlaneCategory(Autodesk.Revit.DB.Material revitMaterial)
        {
            string name = revitMaterial.Name.ToLowerInvariant();
            string materialClass = revitMaterial.MaterialClass?.ToLowerInvariant() ?? "";

            if (name.Contains("wood") || name.Contains("timber") || name.Contains("lumber") || materialClass.Contains("wood"))
                return "Timber";

            if (name.Contains("steel") || name.Contains("metal") || name.Contains("iron") || name.Contains("aluminum") || materialClass.Contains("metal"))
                return "Steel";

            if (name.Contains("concrete") || name.Contains("cement") || materialClass.Contains("concrete"))
                return "Concrete";

            if (name.Contains("earth") || name.Contains("clay") || name.Contains("adobe") || name.Contains("rammed earth"))
                return "Earth";

            if (name.Contains("insulation") || name.Contains("wool") || name.Contains("fiber") || name.Contains("foam"))
                return "Insulation";

            if (name.Contains("composite") || name.Contains("fiber") || name.Contains("plastic") || name.Contains("frp") || materialClass.Contains("plastic"))
                return "Composites";

            if (name.Contains("brick") || name.Contains("masonry") || name.Contains("stone") || name.Contains("block") || materialClass.Contains("masonry"))
                return "Masonry";

            return "Unknown";
        }

        /// <summary>
        /// Generate human-readable explanation of why this match was chosen
        /// HONESTY FIRST: Transparent reasoning for match decisions
        /// </summary>
        private string GenerateMatchReasoning(Autodesk.Revit.DB.Material revitMaterial, Models.Material blockPlaneMaterial, double matchScore)
        {
            var reasoning = new System.Text.StringBuilder();
            
            // Name similarity
            double nameSimilarity = CalculateNameSimilarity(revitMaterial.Name, blockPlaneMaterial.Name);
            reasoning.AppendLine($"Name similarity: {nameSimilarity * 100:F0}%");
            reasoning.AppendLine($"  Revit: '{revitMaterial.Name}'");
            reasoning.AppendLine($"  BlockPlane: '{blockPlaneMaterial.Name}'");
            
            // Category match
            string revitCategory = GuessBlockPlaneCategory(revitMaterial);
            bool categoryMatch = revitCategory.Equals(blockPlaneMaterial.Category, StringComparison.OrdinalIgnoreCase);
            reasoning.AppendLine($"Category: {(categoryMatch ? "Match" : "Different")}");
            reasoning.AppendLine($"  Revit: {revitCategory}");
            reasoning.AppendLine($"  BlockPlane: {blockPlaneMaterial.Category}");
            
            // Material class
            if (!string.IsNullOrEmpty(revitMaterial.MaterialClass))
            {
                reasoning.AppendLine($"Revit Material Class: {revitMaterial.MaterialClass}");
            }
            
            // Overall score
            reasoning.AppendLine($"Overall Match Score: {matchScore:F0}/100");
            
            // Recommendation
            if (matchScore >= 80)
            {
                reasoning.AppendLine("Recommendation: High confidence - likely accurate match");
            }
            else if (matchScore >= 50)
            {
                reasoning.AppendLine("Recommendation: Medium confidence - review recommended");
            }
            else
            {
                reasoning.AppendLine("Recommendation: Low confidence - manual verification required");
            }
            
            return reasoning.ToString();
        }
        
        /// <summary>
        /// Clear the mapping cache
        /// </summary>
        public void ClearCache()
        {
            _mappingCache.Clear();
            _logger.Information("Material mapping cache cleared");
        }
    }

    /// <summary>
    /// Represents a mapping between Revit and BlockPlane materials
    /// HONESTY FIRST: Includes detailed quality tracking and transparency
    /// </summary>
    public class MaterialMapping
    {
        public string RevitMaterialId { get; set; }
        public string RevitMaterialName { get; set; }
        public string RevitMaterialClass { get; set; }
        public string RevitMaterialCategory { get; set; }
        
        public Models.Material BlockPlaneMaterial { get; set; }
        public MatchConfidence MatchConfidence { get; set; }
        public string MatchMethod { get; set; }
        
        // HONESTY ADDITIONS
        /// <summary>
        /// Numeric match score (0-100)
        /// </summary>
        public double MatchScore { get; set; }
        
        /// <summary>
        /// Explanation of why this match was chosen
        /// </summary>
        public string MatchReasoning { get; set; }
        
        /// <summary>
        /// Verification recommended?
        /// </summary>
        public bool VerificationRecommended { get; set; }
        
        /// <summary>
        /// Warnings or limitations for this match
        /// </summary>
        public List<string> Warnings { get; set; } = new List<string>();
        
        /// <summary>
        /// Get human-readable confidence description
        /// </summary>
        public string GetConfidenceDescription()
        {
            return MatchConfidence switch
            {
                MatchConfidence.High => $"High confidence ({MatchScore:F0}%) - Likely accurate, verify for critical applications",
                MatchConfidence.Medium => $"Medium confidence ({MatchScore:F0}%) - Review recommended",
                MatchConfidence.Low => $"Low confidence ({MatchScore:F0}%) - Manual verification required",
                MatchConfidence.None => "No match found - Manual research needed",
                _ => "Unknown"
            };
        }
    }

    /// <summary>
    /// Confidence level for material matching
    /// </summary>
    public enum MatchConfidence
    {
        None = 0,
        Low = 1,
        Medium = 2,
        High = 3
    }
}
