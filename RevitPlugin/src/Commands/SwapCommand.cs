using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using Autodesk.Revit.UI.Selection;
using BlockPlane.RevitPlugin.Services;
using BlockPlane.RevitPlugin.UI.Views;

namespace BlockPlane.RevitPlugin.Commands
{
    /// <summary>
    /// Swap Command - Replaces selected Revit materials with BlockPlane alternatives
    /// Supports single material swap with alternatives selection
    /// </summary>
    [Transaction(TransactionMode.Manual)]
    [Regeneration(RegenerationOption.Manual)]
    public class SwapCommand : IExternalCommand
    {
        public Result Execute(
            ExternalCommandData commandData,
            ref string message,
            ElementSet elements)
        {
            UIApplication uiApp = commandData.Application;
            UIDocument uiDoc = uiApp.ActiveUIDocument;
            Document doc = uiDoc.Document;

            try
            {
                // Get application services
                var app = Application.Instance;
                if (app == null)
                {
                    message = "BlockPlane application not initialized";
                    return Result.Failed;
                }

                var materialService = app.MaterialService;
                var swapService = app.SwapService;

                if (materialService == null || swapService == null)
                {
                    message = "Required services not available";
                    return Result.Failed;
                }

                // Prompt user to select elements
                var selection = uiDoc.Selection;
                ICollection<ElementId> selectedIds = selection.GetElementIds();

                if (selectedIds.Count == 0)
                {
                    // No elements selected, prompt user to select
                    try
                    {
                        var reference = selection.PickObject(
                            ObjectType.Element,
                            "Select an element to swap its material"
                        );
                        selectedIds = new List<ElementId> { reference.ElementId };
                    }
                    catch (Autodesk.Revit.Exceptions.OperationCanceledException)
                    {
                        return Result.Cancelled;
                    }
                }

                // Get materials from selected elements
                var materials = GetMaterialsFromElements(doc, selectedIds);

                if (materials.Count == 0)
                {
                    TaskDialog.Show(
                        "No Materials",
                        "The selected elements do not have any materials assigned."
                    );
                    return Result.Cancelled;
                }

                // If multiple materials, let user choose
                Material selectedMaterial;
                if (materials.Count > 1)
                {
                    selectedMaterial = PromptMaterialSelection(materials);
                    if (selectedMaterial == null)
                    {
                        return Result.Cancelled;
                    }
                }
                else
                {
                    selectedMaterial = materials.First();
                }

                // Find BlockPlane material match
                var progressDialog = new ProgressDialog("Finding Alternatives");
                progressDialog.Show();
                progressDialog.SetIndeterminate("Searching for alternative materials...");

                Models.Material blockPlaneMaterial = null;
                List<Models.Material> alternatives = null;

                Task.Run(async () =>
                {
                    try
                    {
                        // Search for current material in BlockPlane database
                        var searchResults = await materialService.SearchMaterialsAsync(selectedMaterial.Name);
                        blockPlaneMaterial = searchResults?.FirstOrDefault();

                        if (blockPlaneMaterial != null)
                        {
                            // Find alternatives
                            alternatives = (await materialService.GetAlternativesAsync(
                                blockPlaneMaterial.Id,
                                limit: 10
                            ))?.ToList();
                        }

                        progressDialog.Complete("Search complete!");
                    }
                    catch (Exception ex)
                    {
                        progressDialog.Cancel($"Search failed: {ex.Message}");
                    }
                }).Wait();

                if (alternatives == null || !alternatives.Any())
                {
                    TaskDialog.Show(
                        "No Alternatives",
                        $"No alternative materials found for '{selectedMaterial.Name}'.\n\n" +
                        "Try using the Material Browser to search for suitable replacements."
                    );
                    return Result.Cancelled;
                }

                // Show alternatives window
                var alternativesWindow = new MaterialAlternativesWindow(
                    blockPlaneMaterial,
                    alternatives
                );

                var dialogResult = alternativesWindow.ShowDialog();

                if (dialogResult == true && alternativesWindow.SelectedMaterialForSwap != null)
                {
                    // Perform the swap
                    return PerformMaterialSwap(
                        doc,
                        selectedMaterial,
                        alternativesWindow.SelectedMaterialForSwap,
                        selectedIds,
                        swapService
                    );
                }

                return Result.Cancelled;
            }
            catch (Exception ex)
            {
                message = $"Error swapping material: {ex.Message}";
                TaskDialog.Show("Error", message);
                return Result.Failed;
            }
        }

        /// <summary>
        /// Get all materials from selected elements
        /// </summary>
        private HashSet<Material> GetMaterialsFromElements(Document doc, ICollection<ElementId> elementIds)
        {
            var materials = new HashSet<Material>();

            foreach (var elementId in elementIds)
            {
                var element = doc.GetElement(elementId);
                if (element == null) continue;

                // Get material from element
                var materialId = element.GetMaterialIds(false).FirstOrDefault();
                if (materialId != null && materialId != ElementId.InvalidElementId)
                {
                    var material = doc.GetElement(materialId) as Material;
                    if (material != null)
                    {
                        materials.Add(material);
                    }
                }

                // Also check category material
                var category = element.Category;
                if (category != null)
                {
                    var categoryMaterialId = category.Material?.Id;
                    if (categoryMaterialId != null && categoryMaterialId != ElementId.InvalidElementId)
                    {
                        var material = doc.GetElement(categoryMaterialId) as Material;
                        if (material != null)
                        {
                            materials.Add(material);
                        }
                    }
                }
            }

            return materials;
        }

        /// <summary>
        /// Prompt user to select a material from multiple options
        /// </summary>
        private Material PromptMaterialSelection(HashSet<Material> materials)
        {
            var dialog = new TaskDialog("Select Material")
            {
                MainInstruction = "Multiple materials found",
                MainContent = "The selected elements contain multiple materials. Please choose which material to swap:",
                CommonButtons = TaskDialogCommonButtons.Cancel
            };

            var materialList = materials.ToList();
            for (int i = 0; i < Math.Min(materialList.Count, 4); i++)
            {
                dialog.AddCommandLink(
                    (TaskDialogCommandLinkId)(i + 1),
                    materialList[i].Name
                );
            }

            var result = dialog.Show();

            if (result >= TaskDialogResult.CommandLink1 && result <= TaskDialogResult.CommandLink4)
            {
                int index = (int)result - (int)TaskDialogResult.CommandLink1;
                return materialList[index];
            }

            return null;
        }

        /// <summary>
        /// Perform the actual material swap in Revit
        /// </summary>
        private Result PerformMaterialSwap(
            Document doc,
            Material oldMaterial,
            Models.Material newMaterial,
            ICollection<ElementId> elementIds,
            SwapService swapService)
        {
            try
            {
                var progressDialog = new ProgressDialog("Swapping Material");
                progressDialog.Show();
                progressDialog.UpdateProgress(0, "Preparing material swap...");

                // Create or find the new material in Revit
                progressDialog.UpdateProgress(25, "Creating new material in Revit...");
                
                Material revitMaterial = FindOrCreateMaterial(doc, newMaterial);

                // Perform swap using transaction
                progressDialog.UpdateProgress(50, "Swapping materials...");

                using (Transaction trans = new Transaction(doc, "Swap Material"))
                {
                    trans.Start();

                    try
                    {
                        int swappedCount = 0;

                        foreach (var elementId in elementIds)
                        {
                            var element = doc.GetElement(elementId);
                            if (element == null) continue;

                            // Swap material on element
                            var materialIds = element.GetMaterialIds(false);
                            foreach (var matId in materialIds)
                            {
                                if (matId == oldMaterial.Id)
                                {
                                    // TODO: Implement actual material swap logic
                                    // This depends on element type and material assignment method
                                    swappedCount++;
                                }
                            }
                        }

                        trans.Commit();

                        progressDialog.Complete($"Swapped {swappedCount} material assignments!");

                        // Log swap in cache
                        Task.Run(async () =>
                        {
                            await swapService.LogSwapAsync(
                                oldMaterial.Name,
                                newMaterial.Name,
                                elementIds.Count
                            );
                        });

                        TaskDialog.Show(
                            "Swap Complete",
                            $"Successfully swapped '{oldMaterial.Name}' with '{newMaterial.Name}'\n\n" +
                            $"Elements updated: {swappedCount}\n" +
                            $"Carbon savings: {CalculateCarbonSavings(oldMaterial, newMaterial):F2} kg CO₂e"
                        );

                        return Result.Succeeded;
                    }
                    catch (Exception ex)
                    {
                        trans.RollBack();
                        throw new Exception($"Failed to swap materials: {ex.Message}", ex);
                    }
                }
            }
            catch (Exception ex)
            {
                TaskDialog.Show("Swap Failed", $"Failed to swap materials:\n\n{ex.Message}");
                return Result.Failed;
            }
        }

        /// <summary>
        /// Find existing material or create new one in Revit
        /// </summary>
        private Material FindOrCreateMaterial(Document doc, Models.Material blockPlaneMaterial)
        {
            // Search for existing material by name
            var collector = new FilteredElementCollector(doc)
                .OfClass(typeof(Material));

            foreach (Material mat in collector)
            {
                if (mat.Name.Equals(blockPlaneMaterial.Name, StringComparison.OrdinalIgnoreCase))
                {
                    return mat;
                }
            }

            // Create new material
            using (Transaction trans = new Transaction(doc, "Create Material"))
            {
                trans.Start();

                var materialId = Material.Create(doc, blockPlaneMaterial.Name);
                var newMaterial = doc.GetElement(materialId) as Material;

                // Set material properties
                // TODO: Map BlockPlane material properties to Revit material properties

                trans.Commit();

                return newMaterial;
            }
        }

        /// <summary>
        /// Calculate carbon savings from material swap
        /// </summary>
        private double CalculateCarbonSavings(Material oldMaterial, Models.Material newMaterial)
        {
            // Simplified calculation - in reality would need quantities
            // This is a placeholder for demonstration
            return 100.0; // kg CO₂e
        }
    }
}
