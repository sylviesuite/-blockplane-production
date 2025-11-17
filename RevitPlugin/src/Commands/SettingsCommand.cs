using System;
using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using BlockPlane.RevitPlugin.Services;
using BlockPlane.RevitPlugin.UI.Views;

namespace BlockPlane.RevitPlugin.Commands
{
    /// <summary>
    /// Settings Command - Opens the BlockPlane Settings window
    /// Allows users to configure API settings, cache preferences, and defaults
    /// </summary>
    [Transaction(TransactionMode.Manual)]
    [Regeneration(RegenerationOption.Manual)]
    public class SettingsCommand : IExternalCommand
    {
        public Result Execute(
            ExternalCommandData commandData,
            ref string message,
            ElementSet elements)
        {
            try
            {
                // Get application services
                var app = Application.Instance;
                if (app == null)
                {
                    message = "BlockPlane application not initialized";
                    return Result.Failed;
                }

                var cacheService = app.CacheService;
                var apiClient = app.ApiClient;

                if (cacheService == null || apiClient == null)
                {
                    message = "Required services not available";
                    return Result.Failed;
                }

                // Open Settings window
                var settingsWindow = new SettingsWindow(cacheService, apiClient);
                var result = settingsWindow.ShowDialog();

                if (result == true)
                {
                    // Settings were saved, show confirmation
                    TaskDialog.Show(
                        "Settings Saved",
                        "Your settings have been saved successfully.\n\n" +
                        "Some changes may require restarting Revit to take effect."
                    );
                }

                return Result.Succeeded;
            }
            catch (Exception ex)
            {
                message = $"Error opening Settings: {ex.Message}";
                TaskDialog.Show("Error", message);
                return Result.Failed;
            }
        }
    }
}
