using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BlockPlane.RevitPlugin.Exceptions
{
    /// <summary>
    /// Base exception class for all BlockPlane plugin exceptions
    /// HONESTY FIRST: Includes transparent error messaging with context and guidance
    /// </summary>
    public class BlockPlaneException : Exception
    {
        public string UserMessage { get; set; }
        public string TechnicalDetails { get; set; }
        public ErrorSeverity Severity { get; set; }
        
        /// <summary>
        /// HONESTY: Explanation of why this error occurred (user-friendly)
        /// </summary>
        public string WhyThisHappened { get; set; }
        
        /// <summary>
        /// HONESTY: List of actionable steps the user can take
        /// </summary>
        public List<string> WhatYouCanDo { get; set; }
        
        /// <summary>
        /// HONESTY: Additional context data for debugging and user understanding
        /// </summary>
        public Dictionary<string, object> Context { get; set; }
        
        /// <summary>
        /// URL to documentation or help page
        /// </summary>
        public string HelpUrl { get; set; }
        
        /// <summary>
        /// Whether this error can be reported to support
        /// </summary>
        public bool CanReport { get; set; }

        public BlockPlaneException(string message, ErrorSeverity severity = ErrorSeverity.Error)
            : base(message)
        {
            UserMessage = message;
            Severity = severity;
            WhatYouCanDo = new List<string>();
            Context = new Dictionary<string, object>();
            CanReport = true;
        }

        public BlockPlaneException(string message, Exception innerException, ErrorSeverity severity = ErrorSeverity.Error)
            : base(message, innerException)
        {
            UserMessage = message;
            TechnicalDetails = innerException?.Message;
            Severity = severity;
            WhatYouCanDo = new List<string>();
            Context = new Dictionary<string, object>();
            CanReport = true;
        }

        public BlockPlaneException(string userMessage, string technicalDetails, ErrorSeverity severity = ErrorSeverity.Error)
            : base(userMessage)
        {
            UserMessage = userMessage;
            TechnicalDetails = technicalDetails;
            Severity = severity;
            WhatYouCanDo = new List<string>();
            Context = new Dictionary<string, object>();
            CanReport = true;
        }
        
        /// <summary>
        /// HONESTY FIRST: Enhanced constructor with full transparency
        /// </summary>
        public BlockPlaneException(
            string userMessage,
            string technicalDetails = null,
            ErrorSeverity severity = ErrorSeverity.Error,
            string whyThisHappened = null,
            List<string> whatYouCanDo = null,
            Dictionary<string, object> context = null,
            string helpUrl = null,
            bool canReport = true)
            : base(userMessage)
        {
            UserMessage = userMessage;
            TechnicalDetails = technicalDetails;
            Severity = severity;
            WhyThisHappened = whyThisHappened;
            WhatYouCanDo = whatYouCanDo ?? new List<string>();
            Context = context ?? new Dictionary<string, object>();
            HelpUrl = helpUrl;
            CanReport = canReport;
        }
        
        /// <summary>
        /// Generate detailed error report for logging or clipboard
        /// HONESTY FIRST: Complete transparency in error reporting
        /// </summary>
        public string ToDetailedReport()
        {
            var sb = new StringBuilder();
            sb.AppendLine("=== BlockPlane Error Report ===");
            sb.AppendLine($"Time: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
            sb.AppendLine($"Severity: {Severity}");
            sb.AppendLine($"Exception Type: {GetType().Name}");
            sb.AppendLine();
            
            sb.AppendLine("User Message:");
            sb.AppendLine(UserMessage);
            sb.AppendLine();
            
            if (!string.IsNullOrEmpty(WhyThisHappened))
            {
                sb.AppendLine("Why This Happened:");
                sb.AppendLine(WhyThisHappened);
                sb.AppendLine();
            }
            
            if (WhatYouCanDo != null && WhatYouCanDo.Any())
            {
                sb.AppendLine("What You Can Do:");
                for (int i = 0; i < WhatYouCanDo.Count; i++)
                {
                    sb.AppendLine($"{i + 1}. {WhatYouCanDo[i]}");
                }
                sb.AppendLine();
            }
            
            if (Context != null && Context.Any())
            {
                sb.AppendLine("Context:");
                foreach (var kvp in Context)
                {
                    sb.AppendLine($"  {kvp.Key}: {kvp.Value}");
                }
                sb.AppendLine();
            }
            
            if (!string.IsNullOrEmpty(TechnicalDetails))
            {
                sb.AppendLine("Technical Details:");
                sb.AppendLine(TechnicalDetails);
                sb.AppendLine();
            }
            
            if (!string.IsNullOrEmpty(HelpUrl))
            {
                sb.AppendLine($"Documentation: {HelpUrl}");
                sb.AppendLine();
            }
            
            sb.AppendLine("Stack Trace:");
            sb.AppendLine(StackTrace);
            
            sb.AppendLine();
            sb.AppendLine("Plugin Version: 1.0.0");
            sb.AppendLine("Revit Version: [Detected at runtime]");
            
            return sb.ToString();
        }
    }

    /// <summary>
    /// Exception thrown when API communication fails
    /// HONESTY FIRST: Transparent error with troubleshooting guidance
    /// </summary>
    public class ApiException : BlockPlaneException
    {
        public int? StatusCode { get; set; }
        public string Endpoint { get; set; }

        public ApiException(string message, int? statusCode = null, string endpoint = null)
            : base(message, ErrorSeverity.Error)
        {
            StatusCode = statusCode;
            Endpoint = endpoint;
            UserMessage = "Failed to communicate with BlockPlane server. Please check your internet connection and try again.";
            TechnicalDetails = $"API Error: {message} (Status: {statusCode}, Endpoint: {endpoint})";
        }

        public ApiException(string message, Exception innerException, int? statusCode = null, string endpoint = null)
            : base(message, innerException, ErrorSeverity.Error)
        {
            StatusCode = statusCode;
            Endpoint = endpoint;
            UserMessage = "Failed to communicate with BlockPlane server. Please check your internet connection and try again.";
            TechnicalDetails = $"API Error: {message} (Status: {statusCode}, Endpoint: {endpoint})";
        }
        
        /// <summary>
        /// HONESTY FIRST: Enhanced constructor with full transparency
        /// </summary>
        public ApiException(
            string endpoint,
            int? statusCode,
            string responseMessage,
            DateTime? lastSuccessfulConnection = null)
            : base(
                userMessage: "Couldn't connect to BlockPlane material database",
                technicalDetails: $"HTTP {statusCode}: {responseMessage}\nEndpoint: {endpoint}",
                severity: ErrorSeverity.Error,
                whyThisHappened:
                    "The connection to BlockPlane servers failed. Common causes:\n" +
                    "• Your internet connection may be down\n" +
                    "• BlockPlane servers may be temporarily unavailable\n" +
                    "• Your firewall may be blocking the connection\n" +
                    "• Your API key may be invalid or expired",
                whatYouCanDo: new List<string>
                {
                    "Check your internet connection",
                    "Try again in a few minutes",
                    "Use cached materials (if available)",
                    "Check firewall settings for blockplane.com",
                    "Verify API settings in Settings window",
                    "Contact support if problem persists: support@blockplane.com"
                },
                context: new Dictionary<string, object>
                {
                    { "Endpoint", endpoint },
                    { "Status Code", statusCode?.ToString() ?? "No response" },
                    { "Last Successful Connection", lastSuccessfulConnection?.ToString("yyyy-MM-dd HH:mm") ?? "Never" }
                },
                helpUrl: "https://docs.blockplane.com/troubleshooting/api-connection",
                canReport: true)
        {
            StatusCode = statusCode;
            Endpoint = endpoint;
        }
    }

    /// <summary>
    /// Exception thrown when network connectivity is unavailable
    /// </summary>
    public class NetworkException : BlockPlaneException
    {
        public NetworkException(string message)
            : base(message, ErrorSeverity.Warning)
        {
            UserMessage = "Network connection is unavailable. The plugin will operate in offline mode with cached data.";
            TechnicalDetails = message;
        }

        public NetworkException(string message, Exception innerException)
            : base(message, innerException, ErrorSeverity.Warning)
        {
            UserMessage = "Network connection is unavailable. The plugin will operate in offline mode with cached data.";
            TechnicalDetails = message;
        }
    }

    /// <summary>
    /// Exception thrown when material matching fails
    /// HONESTY FIRST: Transparent explanation of why matching failed
    /// </summary>
    public class MaterialMatchException : BlockPlaneException
    {
        public string MaterialName { get; set; }

        public MaterialMatchException(string materialName, string reason)
            : base($"Failed to match material: {materialName}", ErrorSeverity.Warning)
        {
            MaterialName = materialName;
            UserMessage = $"Could not find a matching sustainable material for '{materialName}'. You can search manually in the Material Browser.";
            TechnicalDetails = reason;
        }
        
        /// <summary>
        /// HONESTY FIRST: Enhanced constructor with match details
        /// </summary>
        public MaterialMatchException(
            string revitMaterialName,
            string category,
            int bestMatchScore,
            int threshold = 60)
            : base(
                userMessage: $"We couldn't find a confident match for '{revitMaterialName}'",
                technicalDetails: $"No materials in database matched category '{category}' with name similarity >{threshold}%. Best match score: {bestMatchScore}%",
                severity: ErrorSeverity.Warning,
                whyThisHappened:
                    "Your Revit material name doesn't closely match any materials in our database. This often happens with:\n" +
                    "• Custom or proprietary material names\n" +
                    "• Regional terminology variations\n" +
                    "• Manufacturer-specific product names",
                whatYouCanDo: new List<string>
                {
                    "Search manually in Material Browser using keywords",
                    "Check if there's a more generic name for this material",
                    "Request we add this material: support@blockplane.com",
                    "Use a similar material and flag for manual verification"
                },
                context: new Dictionary<string, object>
                {
                    { "Revit Material", revitMaterialName },
                    { "Category", category },
                    { "Best Match Score", $"{bestMatchScore}%" },
                    { "Threshold", $"{threshold}%" },
                    { "Database Size", "15,000 materials" }
                },
                helpUrl: "https://docs.blockplane.com/material-matching",
                canReport: true)
        {
            MaterialName = revitMaterialName;
        }
    }

    /// <summary>
    /// Exception thrown when data validation fails
    /// </summary>
    public class ValidationException : BlockPlaneException
    {
        public string FieldName { get; set; }
        public object InvalidValue { get; set; }

        public ValidationException(string fieldName, object invalidValue, string reason)
            : base($"Validation failed for {fieldName}", ErrorSeverity.Warning)
        {
            FieldName = fieldName;
            InvalidValue = invalidValue;
            UserMessage = $"Invalid value for {fieldName}: {reason}";
            TechnicalDetails = $"Field: {fieldName}, Value: {invalidValue}, Reason: {reason}";
        }
    }

    /// <summary>
    /// Exception thrown when cache operations fail
    /// </summary>
    public class CacheException : BlockPlaneException
    {
        public string Operation { get; set; }

        public CacheException(string operation, string message)
            : base(message, ErrorSeverity.Warning)
        {
            Operation = operation;
            UserMessage = "Failed to access local cache. Some features may be slower than usual.";
            TechnicalDetails = $"Cache operation '{operation}' failed: {message}";
        }

        public CacheException(string operation, string message, Exception innerException)
            : base(message, innerException, ErrorSeverity.Warning)
        {
            Operation = operation;
            UserMessage = "Failed to access local cache. Some features may be slower than usual.";
            TechnicalDetails = $"Cache operation '{operation}' failed: {message}";
        }
    }

    /// <summary>
    /// Exception thrown when Revit data extraction fails
    /// </summary>
    public class RevitDataException : BlockPlaneException
    {
        public int? ElementId { get; set; }
        public string ElementType { get; set; }

        public RevitDataException(string message, int? elementId = null, string elementType = null)
            : base(message, ErrorSeverity.Warning)
        {
            ElementId = elementId;
            ElementType = elementType;
            UserMessage = "Failed to extract data from some Revit elements. The analysis will continue with available data.";
            TechnicalDetails = $"Element ID: {elementId}, Type: {elementType}, Error: {message}";
        }
    }

    /// <summary>
    /// Exception thrown when material swap operation fails
    /// </summary>
    public class MaterialSwapException : BlockPlaneException
    {
        public string OriginalMaterial { get; set; }
        public string TargetMaterial { get; set; }

        public MaterialSwapException(string originalMaterial, string targetMaterial, string reason)
            : base($"Failed to swap material from '{originalMaterial}' to '{targetMaterial}'", ErrorSeverity.Error)
        {
            OriginalMaterial = originalMaterial;
            TargetMaterial = targetMaterial;
            UserMessage = $"Failed to swap material. The operation has been rolled back.";
            TechnicalDetails = $"Swap from '{originalMaterial}' to '{targetMaterial}' failed: {reason}";
        }

        public MaterialSwapException(string originalMaterial, string targetMaterial, string reason, Exception innerException)
            : base($"Failed to swap material from '{originalMaterial}' to '{targetMaterial}'", innerException, ErrorSeverity.Error)
        {
            OriginalMaterial = originalMaterial;
            TargetMaterial = targetMaterial;
            UserMessage = $"Failed to swap material. The operation has been rolled back.";
            TechnicalDetails = $"Swap from '{originalMaterial}' to '{targetMaterial}' failed: {reason}";
        }
    }

    /// <summary>
    /// Exception thrown when configuration is invalid or missing
    /// </summary>
    public class ConfigurationException : BlockPlaneException
    {
        public string ConfigKey { get; set; }

        public ConfigurationException(string configKey, string reason)
            : base($"Configuration error: {configKey}", ErrorSeverity.Error)
        {
            ConfigKey = configKey;
            UserMessage = "Plugin configuration is invalid. Please check your settings.";
            TechnicalDetails = $"Configuration key '{configKey}': {reason}";
        }
    }

    /// <summary>
    /// Exception thrown when file operations fail
    /// </summary>
    public class FileOperationException : BlockPlaneException
    {
        public string FilePath { get; set; }
        public string Operation { get; set; }

        public FileOperationException(string operation, string filePath, string reason)
            : base($"File operation failed: {operation}", ErrorSeverity.Error)
        {
            Operation = operation;
            FilePath = filePath;
            UserMessage = $"Failed to {operation.ToLower()} file. Please check file permissions and try again.";
            TechnicalDetails = $"Operation: {operation}, File: {filePath}, Reason: {reason}";
        }

        public FileOperationException(string operation, string filePath, string reason, Exception innerException)
            : base($"File operation failed: {operation}", innerException, ErrorSeverity.Error)
        {
            Operation = operation;
            FilePath = filePath;
            UserMessage = $"Failed to {operation.ToLower()} file. Please check file permissions and try again.";
            TechnicalDetails = $"Operation: {operation}, File: {filePath}, Reason: {reason}";
        }
    }

    /// <summary>
    /// Exception thrown when report generation fails
    /// </summary>
    public class ReportGenerationException : BlockPlaneException
    {
        public string ReportType { get; set; }

        public ReportGenerationException(string reportType, string reason)
            : base($"Failed to generate {reportType} report", ErrorSeverity.Error)
        {
            ReportType = reportType;
            UserMessage = $"Failed to generate {reportType} report. Please try again or contact support.";
            TechnicalDetails = reason;
        }

        public ReportGenerationException(string reportType, string reason, Exception innerException)
            : base($"Failed to generate {reportType} report", innerException, ErrorSeverity.Error)
        {
            ReportType = reportType;
            UserMessage = $"Failed to generate {reportType} report. Please try again or contact support.";
            TechnicalDetails = reason;
        }
    }

    /// <summary>
    /// Error severity levels
    /// </summary>
    public enum ErrorSeverity
    {
        /// <summary>
        /// Informational message, no action required
        /// </summary>
        Info,

        /// <summary>
        /// Warning, operation may continue with degraded functionality
        /// </summary>
        Warning,

        /// <summary>
        /// Error, operation failed but application can continue
        /// </summary>
        Error,

        /// <summary>
        /// Critical error, application may need to restart
        /// </summary>
        Critical
    }
}
