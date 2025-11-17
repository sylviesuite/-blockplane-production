using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BlockPlane.RevitPlugin.Models;
using Serilog;

namespace BlockPlane.RevitPlugin.Services
{
    /// <summary>
    /// Service for managing BlockPlane materials
    /// Provides caching, search, and recommendation logic
    /// </summary>
    public class MaterialService
    {
        private readonly BlockPlaneAPIClient _apiClient;
        private readonly CacheService _cacheService;
        private readonly ILogger _logger;
        
        // In-memory cache for frequently accessed data
        private List<Material>? _allMaterialsCache;
        private DateTime? _cacheTimestamp;
        private readonly TimeSpan _cacheExpiration = TimeSpan.FromHours(24);
        
        public MaterialService(BlockPlaneAPIClient apiClient, CacheService cacheService)
        {
            _apiClient = apiClient ?? throw new ArgumentNullException(nameof(apiClient));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _logger = Log.ForContext<MaterialService>();
        }
        
        /// <summary>
        /// Get all materials with optional filtering
        /// Uses cache if available and not expired
        /// </summary>
        public async Task<List<Material>> GetMaterialsAsync(MaterialFilter? filter = null, bool forceRefresh = false)
        {
            try
            {
                // Check if cache is valid
                bool cacheValid = _allMaterialsCache != null && 
                                  _cacheTimestamp.HasValue && 
                                  DateTime.Now - _cacheTimestamp.Value < _cacheExpiration;
                
                if (!cacheValid || forceRefresh)
                {
                    _logger.Information("Refreshing materials cache from API");
                    
                    // Try API first
                    try
                    {
                        _allMaterialsCache = await _apiClient.GetMaterialsAsync(new MaterialFilter { Limit = 1000 });
                        _cacheTimestamp = DateTime.Now;
                        
                        // Save to persistent cache
                        await _cacheService.SaveMaterialsAsync(_allMaterialsCache);
                        
                        _logger.Information("Cached {Count} materials from API", _allMaterialsCache.Count);
                    }
                    catch (APIException ex)
                    {
                        _logger.Warning(ex, "Failed to fetch from API, falling back to local cache");
                        
                        // Fall back to persistent cache
                        _allMaterialsCache = await _cacheService.GetMaterialsAsync();
                        
                        if (_allMaterialsCache == null || _allMaterialsCache.Count == 0)
                        {
                            _logger.Error("No materials available in cache");
                            throw new InvalidOperationException("Unable to load materials. Please check your internet connection.");
                        }
                        
                        _cacheTimestamp = DateTime.Now;
                    }
                }
                
                // Apply filters
                var materials = _allMaterialsCache ?? new List<Material>();
                
                if (filter != null)
                {
                    materials = ApplyFilters(materials, filter);
                }
                
                return materials;
            }
            catch (Exception ex) when (!(ex is InvalidOperationException))
            {
                _logger.Error(ex, "Error getting materials");
                throw;
            }
        }
        
        /// <summary>
        /// Search materials by query string
        /// </summary>
        public async Task<List<Material>> SearchMaterialsAsync(string query, int limit = 20)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query))
                {
                    return new List<Material>();
                }
                
                _logger.Debug("Searching materials: {Query}", query);
                
                // Try API search first
                try
                {
                    var results = await _apiClient.SearchMaterialsAsync(query, limit);
                    return results;
                }
                catch (APIException ex)
                {
                    _logger.Warning(ex, "API search failed, falling back to local search");
                    
                    // Fall back to local cache search
                    var allMaterials = await GetMaterialsAsync();
                    var searchTerms = query.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                    
                    var results = allMaterials
                        .Where(m => searchTerms.Any(term => 
                            m.Name.ToLowerInvariant().Contains(term) ||
                            m.Category.ToLowerInvariant().Contains(term) ||
                            (m.Description?.ToLowerInvariant().Contains(term) ?? false)
                        ))
                        .Take(limit)
                        .ToList();
                    
                    return results;
                }
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error searching materials: {Query}", query);
                return new List<Material>();
            }
        }
        
        /// <summary>
        /// Get a single material by ID
        /// </summary>
        public async Task<Material?> GetMaterialByIdAsync(int id)
        {
            try
            {
                // Check cache first
                if (_allMaterialsCache != null)
                {
                    var cached = _allMaterialsCache.FirstOrDefault(m => m.Id == id);
                    if (cached != null)
                    {
                        return cached;
                    }
                }
                
                // Try API
                try
                {
                    return await _apiClient.GetMaterialByIdAsync(id);
                }
                catch (APIException ex)
                {
                    _logger.Warning(ex, "Failed to get material {MaterialId} from API", id);
                    
                    // Fall back to persistent cache
                    return await _cacheService.GetMaterialByIdAsync(id);
                }
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error getting material {MaterialId}", id);
                return null;
            }
        }
        
        /// <summary>
        /// Find sustainable alternatives for a given material
        /// </summary>
        public async Task<List<Material>> FindAlternativesAsync(Material currentMaterial, int maxResults = 5)
        {
            try
            {
                _logger.Debug("Finding alternatives for {MaterialName}", currentMaterial.Name);
                
                var allMaterials = await GetMaterialsAsync();
                
                // Filter to same category
                var sameCategoryMaterials = allMaterials
                    .Where(m => m.Id != currentMaterial.Id && m.Category == currentMaterial.Category)
                    .ToList();
                
                // Score alternatives based on multiple criteria
                var scoredAlternatives = sameCategoryMaterials
                    .Select(m => new
                    {
                        Material = m,
                        Score = CalculateAlternativeScore(currentMaterial, m)
                    })
                    .OrderByDescending(x => x.Score)
                    .Take(maxResults)
                    .Select(x => x.Material)
                    .ToList();
                
                _logger.Information("Found {Count} alternatives for {MaterialName}", 
                    scoredAlternatives.Count, currentMaterial.Name);
                
                return scoredAlternatives;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error finding alternatives for {MaterialName}", currentMaterial.Name);
                return new List<Material>();
            }
        }
        
        /// <summary>
        /// Calculate how good an alternative is (higher = better)
        /// </summary>
        private double CalculateAlternativeScore(Material current, Material alternative)
        {
            double score = 0;
            
            // Carbon reduction (most important)
            double carbonReduction = current.TotalCarbon - alternative.TotalCarbon;
            if (carbonReduction > 0)
            {
                score += carbonReduction * 10; // Weight carbon heavily
            }
            
            // RIS score (higher is better)
            score += alternative.RisScore * 2;
            
            // Cost (prefer similar or lower cost)
            double costDifference = current.CostPerUnit - alternative.CostPerUnit;
            if (costDifference >= 0)
            {
                score += costDifference * 5; // Reward cost savings
            }
            else
            {
                score += costDifference * 2; // Penalize cost increases less
            }
            
            // LIS score (lower is better for lifecycle impact)
            score += (100 - alternative.LisScore);
            
            return score;
        }
        
        /// <summary>
        /// Compare two materials
        /// </summary>
        public MaterialComparison CompareMaterials(Material current, Material alternative, double quantity)
        {
            double carbonSavings = current.CalculateCarbon(quantity) - alternative.CalculateCarbon(quantity);
            double costDifference = alternative.CalculateCost(quantity) - current.CalculateCost(quantity);
            
            return new MaterialComparison
            {
                CurrentMaterial = current,
                AlternativeMaterial = alternative,
                Quantity = quantity,
                CarbonSavings = carbonSavings,
                CostDifference = costDifference,
                CarbonSavingsPercent = current.TotalCarbon > 0 ? (carbonSavings / current.CalculateCarbon(quantity)) * 100 : 0,
                CostDifferencePercent = current.CostPerUnit > 0 ? (costDifference / current.CalculateCost(quantity)) * 100 : 0
            };
        }
        
        /// <summary>
        /// Get available categories
        /// </summary>
        public async Task<List<string>> GetCategoriesAsync()
        {
            try
            {
                return await _apiClient.GetCategoriesAsync();
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error getting categories");
                return new List<string> { "Timber", "Steel", "Concrete", "Earth", "Insulation", "Composites", "Masonry" };
            }
        }
        
        /// <summary>
        /// Apply filters to material list
        /// </summary>
        private List<Material> ApplyFilters(List<Material> materials, MaterialFilter filter)
        {
            var filtered = materials.AsEnumerable();
            
            if (!string.IsNullOrEmpty(filter.SearchQuery))
            {
                var searchTerms = filter.SearchQuery.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                filtered = filtered.Where(m => searchTerms.Any(term =>
                    m.Name.ToLowerInvariant().Contains(term) ||
                    m.Category.ToLowerInvariant().Contains(term) ||
                    (m.Description?.ToLowerInvariant().Contains(term) ?? false)
                ));
            }
            
            if (!string.IsNullOrEmpty(filter.Category))
            {
                filtered = filtered.Where(m => m.Category.Equals(filter.Category, StringComparison.OrdinalIgnoreCase));
            }
            
            if (filter.MinRIS.HasValue)
            {
                filtered = filtered.Where(m => m.RisScore >= filter.MinRIS.Value);
            }
            
            if (filter.MaxRIS.HasValue)
            {
                filtered = filtered.Where(m => m.RisScore <= filter.MaxRIS.Value);
            }
            
            if (filter.MaxCarbon.HasValue)
            {
                filtered = filtered.Where(m => m.TotalCarbon <= filter.MaxCarbon.Value);
            }
            
            if (filter.MaxCost.HasValue)
            {
                filtered = filtered.Where(m => m.CostPerUnit <= filter.MaxCost.Value);
            }
            
            if (filter.RegenerativeOnly == true)
            {
                filtered = filtered.Where(m => m.IsRegenerative);
            }
            
            var result = filtered.Skip(filter.Offset).Take(filter.Limit).ToList();
            
            _logger.Debug("Applied filters: {Count} materials match", result.Count);
            
            return result;
        }
        
        /// <summary>
        /// Clear in-memory cache
        /// </summary>
        public void ClearCache()
        {
            _allMaterialsCache = null;
            _cacheTimestamp = null;
            _logger.Information("Material cache cleared");
        }
    }
}
