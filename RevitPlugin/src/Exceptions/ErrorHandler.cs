using System;
using System.Text;
using Autodesk.Revit.UI;
using Serilog;

namespace BlockPlane.RevitPlugin.Exceptions
{
    /// <summary>
    /// Centralized error handler for the BlockPlane plugin
    /// Provides consistent error handling, logging, and user notifications
    /// </summary>
    public static class ErrorHandler
    {
        private static ILogger _logger = Log.ForContext(typeof(ErrorHandler));

        /// <summary>
        /// Handle an exception and show appropriate user notification
        /// </summary>
        public static void Handle(Exception ex, string context = null)
        {
            if (ex == null) return;

            // Log the exception
            LogException(ex, context);

            // Show user notification
            ShowUserNotification(ex, context);
        }

        /// <summary>
        /// Handle an exception without showing user notification (silent)
        /// </summary>
        public static void HandleSilent(Exception ex, string context = null)
        {
            if (ex == null) return;

            // Only log the exception
            LogException(ex, context);
        }

        /// <summary>
        /// Handle an exception and return whether to continue operation
        /// </summary>
        public static bool HandleWithContinue(Exception ex, string context = null)
        {
            if (ex == null) return true;

            Handle(ex, context);

            // Allow continuation for warnings, block for errors
            if (ex is BlockPlaneException bpEx)
            {
                return bpEx.Severity <= ErrorSeverity.Warning;
            }

            return false;
        }

        /// <summary>
        /// Log exception with appropriate severity
        /// </summary>
        private static void LogException(Exception ex, string context)
        {
            string contextMessage = string.IsNullOrEmpty(context) ? "" : $"[{context}] ";

            if (ex is BlockPlaneException bpEx)
            {
                switch (bpEx.Severity)
                {
                    case ErrorSeverity.Info:
                        _logger.Information(ex, "{Context}Info: {Message}", contextMessage, ex.Message);
                        break;
                    case ErrorSeverity.Warning:
                        _logger.Warning(ex, "{Context}Warning: {Message}", contextMessage, ex.Message);
                        break;
                    case ErrorSeverity.Error:
                        _logger.Error(ex, "{Context}Error: {Message}", contextMessage, ex.Message);
                        break;
                    case ErrorSeverity.Critical:
                        _logger.Fatal(ex, "{Context}Critical: {Message}", contextMessage, ex.Message);
                        break;
                }
            }
            else
            {
                _logger.Error(ex, "{Context}Unhandled exception: {Message}", contextMessage, ex.Message);
            }
        }

        /// <summary>
        /// Show user notification based on exception type and severity
        /// HONESTY FIRST: Use enhanced dialog for BlockPlane exceptions
        /// </summary>
        private static void ShowUserNotification(Exception ex, string context)
        {
            if (ex is BlockPlaneException bpEx && 
                (!string.IsNullOrEmpty(bpEx.WhyThisHappened) || bpEx.WhatYouCanDo.Any()))
            {
                // Use enhanced dialog with honesty features
                ShowEnhancedErrorDialog(bpEx);
            }
            else if (ex is BlockPlaneException bpException)
            {
                // Use standard dialog for simple BlockPlane exceptions
                ShowStandardErrorDialog(bpException);
            }
            else
            {
                // Use simple dialog for generic exceptions
                ShowSimpleErrorDialog(ex, context);
            }
        }
        
        /// <summary>
        /// HONESTY FIRST: Show enhanced error dialog with "Why" and "What to do" sections
        /// </summary>
        private static void ShowEnhancedErrorDialog(BlockPlaneException ex)
        {
            var dialog = new TaskDialog(GetTitleForSeverity(ex.Severity))
            {
                MainIcon = GetIconForSeverity(ex.Severity),
                MainInstruction = ex.UserMessage,
                MainContent = BuildEnhancedErrorContent(ex),
                CommonButtons = TaskDialogCommonButtons.Ok
            };
            
            // Add expanded content with "Why" and technical details
            if (!string.IsNullOrEmpty(ex.WhyThisHappened) || 
                !string.IsNullOrEmpty(ex.TechnicalDetails) ||
                (ex.Context != null && ex.Context.Any()))
            {
                dialog.ExpandedContent = BuildExpandedContent(ex);
            }
            
            // Add footer with help link
            if (!string.IsNullOrEmpty(ex.HelpUrl))
            {
                dialog.FooterText = $"Need help? Visit: {ex.HelpUrl}";
            }
            
            dialog.Show();
            
            _logger.Information("Enhanced error dialog shown: {ExceptionType}", ex.GetType().Name);
        }
        
        /// <summary>
        /// Show standard error dialog for simple BlockPlane exceptions
        /// </summary>
        private static void ShowStandardErrorDialog(BlockPlaneException ex)
        {
            string title = "BlockPlane";
            string message;
            TaskDialogIcon icon;

            message = FormatBlockPlaneException(ex);
            icon = GetIconForSeverity(ex.Severity);
            title = GetTitleForSeverity(ex.Severity);

            var dialog = new TaskDialog(title)
            {
                MainIcon = icon,
                MainInstruction = GetMainInstruction(ex),
                MainContent = message,
                CommonButtons = TaskDialogCommonButtons.Ok
            };

            if (!string.IsNullOrEmpty(ex.TechnicalDetails))
            {
                dialog.ExpandedContent = $"Technical Details:\n{ex.TechnicalDetails}";
            }

            dialog.Show();
        }
        
        /// <summary>
        /// Show simple error dialog for generic exceptions
        /// </summary>
        private static void ShowSimpleErrorDialog(Exception ex, string context)
        {
            var message = FormatGenericException(ex, context);
            var dialog = new TaskDialog("BlockPlane - Error")
            {
                MainIcon = TaskDialogIcon.TaskDialogIconError,
                MainInstruction = "Error",
                MainContent = message,
                CommonButtons = TaskDialogCommonButtons.Ok
            };

            if (ex.InnerException != null)
            {
                dialog.ExpandedContent = $"Technical Details:\n{ex.InnerException.Message}\n\n{ex.InnerException.StackTrace}";
            }

            dialog.Show();
        }
        
        /// <summary>
        /// HONESTY FIRST: Build enhanced error content with "What you can do" section
        /// </summary>
        private static string BuildEnhancedErrorContent(BlockPlaneException ex)
        {
            var sb = new StringBuilder();
            
            if (ex.WhatYouCanDo != null && ex.WhatYouCanDo.Any())
            {
                sb.AppendLine("What you can do:");
                sb.AppendLine();
                
                for (int i = 0; i < ex.WhatYouCanDo.Count; i++)
                {
                    sb.AppendLine($"{i + 1}. {ex.WhatYouCanDo[i]}");
                }
            }
            
            return sb.ToString();
        }
        
        /// <summary>
        /// HONESTY FIRST: Build expanded content with "Why", context, and technical details
        /// </summary>
        private static string BuildExpandedContent(BlockPlaneException ex)
        {
            var sb = new StringBuilder();
            
            // Why this happened
            if (!string.IsNullOrEmpty(ex.WhyThisHappened))
            {
                sb.AppendLine("═══ Why This Happened ═══");
                sb.AppendLine(ex.WhyThisHappened);
                sb.AppendLine();
            }
            
            // Context information
            if (ex.Context != null && ex.Context.Any())
            {
                sb.AppendLine("═══ Context ═══");
                foreach (var kvp in ex.Context)
                {
                    sb.AppendLine($"  {kvp.Key}: {kvp.Value}");
                }
                sb.AppendLine();
            }
            
            // Technical details
            if (!string.IsNullOrEmpty(ex.TechnicalDetails))
            {
                sb.AppendLine("═══ Technical Details ═══");
                sb.AppendLine(ex.TechnicalDetails);
                
                if (!string.IsNullOrEmpty(ex.StackTrace))
                {
                    sb.AppendLine();
                    sb.AppendLine("Stack Trace:");
                    sb.AppendLine(ex.StackTrace);
                }
            }
            
            return sb.ToString();
        }

        /// <summary>
        /// Format BlockPlane exception for user display
        /// </summary>
        private static string FormatBlockPlaneException(BlockPlaneException ex)
        {
            var sb = new StringBuilder();

            // User-friendly message
            sb.AppendLine(ex.UserMessage);

            // Add specific guidance based on exception type
            if (ex is ApiException apiEx)
            {
                sb.AppendLine();
                sb.AppendLine("Troubleshooting steps:");
                sb.AppendLine("• Check your internet connection");
                sb.AppendLine("• Verify API settings in Settings window");
                sb.AppendLine("• Try again in a few moments");
            }
            else if (ex is NetworkException)
            {
                sb.AppendLine();
                sb.AppendLine("The plugin will continue using cached data.");
                sb.AppendLine("Some features may be unavailable until connection is restored.");
            }
            else if (ex is MaterialMatchException)
            {
                sb.AppendLine();
                sb.AppendLine("You can:");
                sb.AppendLine("• Open the Material Browser to search manually");
                sb.AppendLine("• Try a different search term");
                sb.AppendLine("• Contact support if the material should exist");
            }
            else if (ex is ValidationException)
            {
                sb.AppendLine();
                sb.AppendLine("Please correct the input and try again.");
            }
            else if (ex is MaterialSwapException)
            {
                sb.AppendLine();
                sb.AppendLine("No changes have been made to your project.");
                sb.AppendLine("Please try again or contact support if the issue persists.");
            }

            return sb.ToString();
        }

        /// <summary>
        /// Format generic exception for user display
        /// </summary>
        private static string FormatGenericException(Exception ex, string context)
        {
            var sb = new StringBuilder();

            sb.AppendLine("An unexpected error occurred.");
            
            if (!string.IsNullOrEmpty(context))
            {
                sb.AppendLine($"Context: {context}");
            }

            sb.AppendLine();
            sb.AppendLine("Please try again. If the problem persists, contact support with the technical details below.");

            return sb.ToString();
        }

        /// <summary>
        /// Get main instruction text based on exception
        /// </summary>
        private static string GetMainInstruction(Exception ex)
        {
            if (ex is BlockPlaneException bpEx)
            {
                switch (bpEx.Severity)
                {
                    case ErrorSeverity.Info:
                        return "Information";
                    case ErrorSeverity.Warning:
                        return "Warning";
                    case ErrorSeverity.Error:
                        return "Error";
                    case ErrorSeverity.Critical:
                        return "Critical Error";
                }
            }

            return "Error";
        }

        /// <summary>
        /// Get dialog icon for severity level
        /// </summary>
        private static TaskDialogIcon GetIconForSeverity(ErrorSeverity severity)
        {
            switch (severity)
            {
                case ErrorSeverity.Info:
                    return TaskDialogIcon.TaskDialogIconInformation;
                case ErrorSeverity.Warning:
                    return TaskDialogIcon.TaskDialogIconWarning;
                case ErrorSeverity.Error:
                case ErrorSeverity.Critical:
                    return TaskDialogIcon.TaskDialogIconError;
                default:
                    return TaskDialogIcon.TaskDialogIconNone;
            }
        }

        /// <summary>
        /// Get dialog title for severity level
        /// </summary>
        private static string GetTitleForSeverity(ErrorSeverity severity)
        {
            switch (severity)
            {
                case ErrorSeverity.Info:
                    return "BlockPlane - Information";
                case ErrorSeverity.Warning:
                    return "BlockPlane - Warning";
                case ErrorSeverity.Error:
                    return "BlockPlane - Error";
                case ErrorSeverity.Critical:
                    return "BlockPlane - Critical Error";
                default:
                    return "BlockPlane";
            }
        }

        /// <summary>
        /// Show a success notification
        /// </summary>
        public static void ShowSuccess(string message, string details = null)
        {
            var dialog = new TaskDialog("BlockPlane - Success")
            {
                MainIcon = TaskDialogIcon.TaskDialogIconInformation,
                MainInstruction = "Operation Completed Successfully",
                MainContent = message,
                CommonButtons = TaskDialogCommonButtons.Ok
            };

            if (!string.IsNullOrEmpty(details))
            {
                dialog.ExpandedContent = details;
            }

            dialog.Show();
        }

        /// <summary>
        /// Show a confirmation dialog
        /// </summary>
        public static bool ShowConfirmation(string message, string details = null, string yesButtonText = "Yes", string noButtonText = "No")
        {
            var dialog = new TaskDialog("BlockPlane - Confirmation")
            {
                MainIcon = TaskDialogIcon.TaskDialogIconWarning,
                MainInstruction = "Confirmation Required",
                MainContent = message,
                CommonButtons = TaskDialogCommonButtons.Yes | TaskDialogCommonButtons.No,
                DefaultButton = TaskDialogResult.No
            };

            if (!string.IsNullOrEmpty(details))
            {
                dialog.ExpandedContent = details;
            }

            var result = dialog.Show();
            return result == TaskDialogResult.Yes;
        }

        /// <summary>
        /// Show a warning notification
        /// </summary>
        public static void ShowWarning(string message, string details = null)
        {
            var dialog = new TaskDialog("BlockPlane - Warning")
            {
                MainIcon = TaskDialogIcon.TaskDialogIconWarning,
                MainInstruction = "Warning",
                MainContent = message,
                CommonButtons = TaskDialogCommonButtons.Ok
            };

            if (!string.IsNullOrEmpty(details))
            {
                dialog.ExpandedContent = details;
            }

            dialog.Show();
        }

        /// <summary>
        /// Show an information notification
        /// </summary>
        public static void ShowInfo(string message, string details = null)
        {
            var dialog = new TaskDialog("BlockPlane - Information")
            {
                MainIcon = TaskDialogIcon.TaskDialogIconInformation,
                MainInstruction = "Information",
                MainContent = message,
                CommonButtons = TaskDialogCommonButtons.Ok
            };

            if (!string.IsNullOrEmpty(details))
            {
                dialog.ExpandedContent = details;
            }

            dialog.Show();
        }

        /// <summary>
        /// Wrap an action with error handling
        /// </summary>
        public static void Try(Action action, string context = null)
        {
            try
            {
                action?.Invoke();
            }
            catch (Exception ex)
            {
                Handle(ex, context);
            }
        }

        /// <summary>
        /// Wrap a function with error handling
        /// </summary>
        public static T Try<T>(Func<T> func, string context = null, T defaultValue = default(T))
        {
            try
            {
                return func != null ? func() : defaultValue;
            }
            catch (Exception ex)
            {
                Handle(ex, context);
                return defaultValue;
            }
        }

        /// <summary>
        /// Wrap an action with silent error handling
        /// </summary>
        public static void TrySilent(Action action, string context = null)
        {
            try
            {
                action?.Invoke();
            }
            catch (Exception ex)
            {
                HandleSilent(ex, context);
            }
        }

        /// <summary>
        /// Wrap a function with silent error handling
        /// </summary>
        public static T TrySilent<T>(Func<T> func, string context = null, T defaultValue = default(T))
        {
            try
            {
                return func != null ? func() : defaultValue;
            }
            catch (Exception ex)
            {
                HandleSilent(ex, context);
                return defaultValue;
            }
        }
    }
}
