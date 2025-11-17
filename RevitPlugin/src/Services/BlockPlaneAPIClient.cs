using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BlockPlane.RevitPlugin.Models;
using Newtonsoft.Json;
using Polly;
using Polly.Retry;
using RestSharp;
using Serilog;

namespace BlockPlane.RevitPlugin.Services
{
    /// <summary>
    /// Client for BlockPlane REST API with retry logic and error handling
    /// </summary>
    public class BlockPlaneAPIClient
    {
        private readonly RestClient _client;
        private readonly ILogger _logger;
        private readonly AsyncRetryPolicy<RestResponse> _retryPolicy;
        
        private const string DEFAULT_BASE_URL = "https://blockplane.manus.space";
        private const int MAX_RETRIES = 3;
        private const int TIMEOUT_SECONDS = 30;
        
        public BlockPlaneAPIClient(string? apiKey = null, string? baseUrl = null)
        {
            _logger = Log.ForContext<BlockPlaneAPIClient>();
            
            var options = new RestClientOptions(baseUrl ?? DEFAULT_BASE_URL)
            {
                MaxTimeout = TimeSpan.FromSeconds(TIMEOUT_SECONDS),
                ThrowOnAnyError = false
            };
            
            _client = new RestClient(options);
            
            // Add API key header if provided
            if (!string.IsNullOrEmpty(apiKey))
            {
                _client.AddDefaultHeader("Authorization", $"Bearer {apiKey}");
            }
            
            // Configure retry policy with exponential backoff
            _retryPolicy = Policy
                .HandleResult<RestResponse>(r => !r.IsSuccessful && IsRetryable(r))
                .WaitAndRetryAsync(
                    MAX_RETRIES,
                    retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                    onRetry: (outcome, timespan, retryCount, context) =>
                    {
                        _logger.Warning(
                            "API request failed (attempt {RetryCount}/{MaxRetries}). " +
                            "Status: {StatusCode}. Retrying in {Delay}s...",
                            retryCount, MAX_RETRIES, outcome.Result.StatusCode, timespan.TotalSeconds
                        );
                    }
                );
        }
        
        /// <summary>
        /// Get materials with optional filtering
        /// </summary>
        public async Task<List<Material>> GetMaterialsAsync(MaterialFilter? filter = null)
        {
            try
            {
                var request = new RestRequest("/api/trpc/publicAPI.getMaterials");
                
                if (filter != null)
                {
                    if (!string.IsNullOrEmpty(filter.Category))
                        request.AddQueryParameter("category", filter.Category);
                    if (filter.MinRIS.HasValue)
                        request.AddQueryParameter("minRIS", filter.MinRIS.Value);
                    if (filter.MaxRIS.HasValue)
                        request.AddQueryParameter("maxRIS", filter.MaxRIS.Value);
                    if (filter.MaxCarbon.HasValue)
                        request.AddQueryParameter("maxCarbon", filter.MaxCarbon.Value);
                    if (filter.MaxCost.HasValue)
                        request.AddQueryParameter("maxCost", filter.MaxCost.Value);
                    if (filter.RegenerativeOnly.HasValue)
                        request.AddQueryParameter("regenerativeOnly", filter.RegenerativeOnly.Value);
                    
                    request.AddQueryParameter("limit", filter.Limit);
                    request.AddQueryParameter("offset", filter.Offset);
                }
                
                _logger.Debug("Fetching materials with filter: {@Filter}", filter);
                
                var response = await _retryPolicy.ExecuteAsync(() => 
                    _client.ExecuteAsync(request)
                );
                
                if (response.IsSuccessful && !string.IsNullOrEmpty(response.Content))
                {
                    var apiResponse = JsonConvert.DeserializeObject<APIResponse<List<Material>>>(response.Content);
                    
                    if (apiResponse?.Result?.Data != null)
                    {
                        _logger.Information("Retrieved {Count} materials", apiResponse.Result.Data.Count);
                        return apiResponse.Result.Data;
                    }
                }
                
                _logger.Error("Failed to get materials. Status: {StatusCode}, Error: {Error}", 
                    response.StatusCode, response.ErrorMessage);
                
                throw new APIException($"Failed to get materials: {response.StatusCode}");
            }
            catch (Exception ex) when (!(ex is APIException))
            {
                _logger.Error(ex, "Unexpected error getting materials");
                throw new APIException("Failed to connect to BlockPlane API", ex);
            }
        }
        
        /// <summary>
        /// Get a single material by ID
        /// </summary>
        public async Task<Material?> GetMaterialByIdAsync(int id)
        {
            try
            {
                var request = new RestRequest($"/api/trpc/publicAPI.getMaterialById");
                request.AddQueryParameter("id", id);
                
                _logger.Debug("Fetching material {MaterialId}", id);
                
                var response = await _retryPolicy.ExecuteAsync(() => 
                    _client.ExecuteAsync(request)
                );
                
                if (response.IsSuccessful && !string.IsNullOrEmpty(response.Content))
                {
                    var apiResponse = JsonConvert.DeserializeObject<APIResponse<Material>>(response.Content);
                    
                    if (apiResponse?.Result?.Data != null)
                    {
                        _logger.Information("Retrieved material: {MaterialName}", apiResponse.Result.Data.Name);
                        return apiResponse.Result.Data;
                    }
                }
                
                _logger.Warning("Material {MaterialId} not found", id);
                return null;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error getting material {MaterialId}", id);
                throw new APIException($"Failed to get material {id}", ex);
            }
        }
        
        /// <summary>
        /// Search materials by query string
        /// </summary>
        public async Task<List<Material>> SearchMaterialsAsync(string query, int limit = 20)
        {
            try
            {
                var request = new RestRequest("/api/trpc/publicAPI.searchMaterials");
                request.AddQueryParameter("query", query);
                request.AddQueryParameter("limit", limit);
                
                _logger.Debug("Searching materials: {Query}", query);
                
                var response = await _retryPolicy.ExecuteAsync(() => 
                    _client.ExecuteAsync(request)
                );
                
                if (response.IsSuccessful && !string.IsNullOrEmpty(response.Content))
                {
                    var apiResponse = JsonConvert.DeserializeObject<APIResponse<List<Material>>>(response.Content);
                    
                    if (apiResponse?.Result?.Data != null)
                    {
                        _logger.Information("Found {Count} materials matching '{Query}'", 
                            apiResponse.Result.Data.Count, query);
                        return apiResponse.Result.Data;
                    }
                }
                
                _logger.Warning("Search failed for query: {Query}", query);
                return new List<Material>();
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error searching materials: {Query}", query);
                throw new APIException($"Failed to search materials: {query}", ex);
            }
        }
        
        /// <summary>
        /// Compare multiple materials
        /// </summary>
        public async Task<List<Material>> CompareMaterialsAsync(int[] materialIds)
        {
            try
            {
                if (materialIds.Length < 2 || materialIds.Length > 5)
                {
                    throw new ArgumentException("Must compare between 2 and 5 materials");
                }
                
                var request = new RestRequest("/api/trpc/publicAPI.compareMaterials");
                request.AddQueryParameter("ids", string.Join(",", materialIds));
                
                _logger.Debug("Comparing materials: {MaterialIds}", materialIds);
                
                var response = await _retryPolicy.ExecuteAsync(() => 
                    _client.ExecuteAsync(request)
                );
                
                if (response.IsSuccessful && !string.IsNullOrEmpty(response.Content))
                {
                    var apiResponse = JsonConvert.DeserializeObject<APIResponse<List<Material>>>(response.Content);
                    
                    if (apiResponse?.Result?.Data != null)
                    {
                        _logger.Information("Retrieved {Count} materials for comparison", 
                            apiResponse.Result.Data.Count);
                        return apiResponse.Result.Data;
                    }
                }
                
                _logger.Error("Failed to compare materials");
                throw new APIException("Failed to compare materials");
            }
            catch (Exception ex) when (!(ex is APIException) && !(ex is ArgumentException))
            {
                _logger.Error(ex, "Error comparing materials");
                throw new APIException("Failed to compare materials", ex);
            }
        }
        
        /// <summary>
        /// Get available material categories
        /// </summary>
        public async Task<List<string>> GetCategoriesAsync()
        {
            try
            {
                var request = new RestRequest("/api/trpc/publicAPI.getCategories");
                
                var response = await _retryPolicy.ExecuteAsync(() => 
                    _client.ExecuteAsync(request)
                );
                
                if (response.IsSuccessful && !string.IsNullOrEmpty(response.Content))
                {
                    var apiResponse = JsonConvert.DeserializeObject<APIResponse<List<string>>>(response.Content);
                    
                    if (apiResponse?.Result?.Data != null)
                    {
                        _logger.Information("Retrieved {Count} categories", apiResponse.Result.Data.Count);
                        return apiResponse.Result.Data;
                    }
                }
                
                // Return default categories if API fails
                _logger.Warning("Failed to get categories from API, using defaults");
                return new List<string> { "Timber", "Steel", "Concrete", "Earth", "Insulation", "Composites", "Masonry" };
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error getting categories");
                return new List<string> { "Timber", "Steel", "Concrete", "Earth", "Insulation", "Composites", "Masonry" };
            }
        }
        
        /// <summary>
        /// Check if HTTP status code is retryable
        /// </summary>
        private bool IsRetryable(RestResponse response)
        {
            // Retry on network errors or server errors (5xx)
            if (response.ResponseStatus != ResponseStatus.Completed)
                return true;
            
            var statusCode = (int)response.StatusCode;
            return statusCode >= 500 && statusCode < 600;
        }
    }
    
    /// <summary>
    /// API response wrapper matching tRPC format
    /// </summary>
    internal class APIResponse<T>
    {
        [JsonProperty("result")]
        public APIResult<T>? Result { get; set; }
    }
    
    internal class APIResult<T>
    {
        [JsonProperty("data")]
        public T? Data { get; set; }
    }
    
    /// <summary>
    /// Custom exception for API errors
    /// </summary>
    public class APIException : Exception
    {
        public APIException(string message) : base(message) { }
        public APIException(string message, Exception innerException) : base(message, innerException) { }
    }
}
