using System;
using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using BlockPlane.RevitPlugin.Services;
using BlockPlane.RevitPlugin.UI.Views;

namespace BlockPlane.RevitPlugin.Commands
{
    /// <summary>
    /// Browser Command - Opens the BlockPlane Material Browser window
    /// Allows users to search, filter, and browse sustainable materials
    /// </summary>
    [Transaction(TransactionMode.Manual)]
    [Regeneration(RegenerationOption.Manual)]
    public class BrowserCommand : IExternalCommand
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

                // Get services
                var materialService = app.MaterialService;
                if (materialService == null)
                {
                    message = "Material service not available";
                    return Result.Failed;
                }

                // Open Material Browser window
                var browserWindow = new MaterialBrowserWindow(materialService);
                browserWindow.ShowDialog();

                return Result.Succeeded;
            }
            catch (Exception ex)
            {
                message = $"Error opening Material Browser: {ex.Message}";
                TaskDialog.Show("Error", message);
                return Result.Failed;
            }
        }
    }
}
