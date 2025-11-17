using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using BlockPlane.RevitPlugin.Models;
using Serilog;

namespace BlockPlane.RevitPlugin.Services
{
    /// <summary>
    /// Service for swapping materials in Revit projects
    /// Handles element updates, transactions, and rollback
    /// </summary>
    public class SwapService
    {
        private readonly CacheService _cacheService;
        private readonly ILogger _logger;
        
        public SwapService(CacheService cacheService)
        {
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _logger = Log.ForContext<SwapService>();
        }
        
        /// <summary>
        /// Swap material for all elements using a specific material
        /// </summary>
        public async Task<SwapResult> SwapMaterialAsync(
            Document document,
            Autodesk.Revit.DB.Material fromMaterial,
            Autodesk.Revit.DB.Material toMaterial,
            MaterialComparison comparison)
        {
            if (document == null) throw new ArgumentNullException(nameof(document));
            if (fromMaterial == null) throw new ArgumentNullException(nameof(fromMaterial));
            if (toMaterial == null) throw new ArgumentNullException(nameof(toMaterial));
            
            var result = new SwapResult
            {
                FromMaterialName = fromMaterial.Name,
                ToMaterialName = toMaterial.Name,
                StartTime = DateTime.Now
            };
            
            try
            {
                _logger.Information("Starting material swap: {From} → {To}", fromMaterial.Name, toMaterial.Name);
                
                // Find all elements using the source material
                var elementsToUpdate = FindElementsWithMaterial(document, fromMaterial);
                
                result.TotalElements = elementsToUpdate.Count;
                _logger.Debug("Found {Count} elements to update", result.TotalElements);
                
                if (result.TotalElements == 0)
                {
                    result.Success = true;
                    result.Message = "No elements found using this material.";
                    return result;
                }
                
                // Perform the swap in a transaction
                using (Transaction trans = new Transaction(document, $"Swap Material: {fromMaterial.Name} → {toMaterial.Name}"))
                {
                    trans.Start();
                    
                    try
                    {
                        foreach (var element in elementsToUpdate)
                        {
                            try
                            {
                                bool swapped = SwapElementMaterial(element, fromMaterial.Id, toMaterial.Id);
                                
                                if (swapped)
                                {
                                    result.UpdatedElements++;
                                }
                                else
                                {
                                    result.FailedElements++;
                                    result.Errors.Add($"Element {element.Id}: Could not update material");
                                }
                            }
                            catch (Exception ex)
                            {
                                result.FailedElements++;
                                result.Errors.Add($"Element {element.Id}: {ex.Message}");
                                _logger.Warning(ex, "Failed to swap material for element {ElementId}", element.Id);
                            }
                        }
                        
                        trans.Commit();
                        result.Success = true;
                        result.Message = $"Successfully updated {result.UpdatedElements} of {result.TotalElements} elements.";
                        
                        _logger.Information("Material swap complete: {Updated}/{Total} elements updated",
                            result.UpdatedElements, result.TotalElements);
                    }
                    catch (Exception ex)
                    {
                        trans.RollBack();
                        throw;
                    }
                }
                
                // Log to history
                if (comparison != null && result.UpdatedElements > 0)
                {
                    string projectId = document.ProjectInformation?.UniqueId ?? document.Title;
                    string userName = document.Application.Username;
                    
                    await _cacheService.LogSwapAsync(
                        projectId,
                        comparison.CurrentMaterial.Id,
                        comparison.AlternativeMaterial.Id,
                        result.UpdatedElements,
                        comparison.CarbonSavings,
                        userName
                    );
                    
                    result.CarbonSavings = comparison.CarbonSavings;
                    result.CostDifference = comparison.CostDifference;
                }
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = $"Swap failed: {ex.Message}";
                result.Errors.Add(ex.ToString());
                _logger.Error(ex, "Material swap failed");
            }
            finally
            {
                result.EndTime = DateTime.Now;
                result.Duration = result.EndTime - result.StartTime;
            }
            
            return result;
        }
        
        /// <summary>
        /// Find all elements using a specific material
        /// </summary>
        private List<Element> FindElementsWithMaterial(Document document, Autodesk.Revit.DB.Material material)
        {
            var elements = new List<Element>();
            
            var collector = new FilteredElementCollector(document)
                .WhereElementIsNotElementType();
            
            foreach (Element element in collector)
            {
                try
                {
                    var materialIds = element.GetMaterialIds(false);
                    
                    if (materialIds.Contains(material.Id))
                    {
                        elements.Add(element);
                    }
                }
                catch
                {
                    // Skip elements that don't support material queries
                    continue;
                }
            }
            
            return elements;
        }
        
        /// <summary>
        /// Swap material for a single element
        /// </summary>
        private bool SwapElementMaterial(Element element, ElementId fromMaterialId, ElementId toMaterialId)
        {
            try
            {
                // Try different methods depending on element type
                
                // Method 1: Direct material parameter
                var materialParam = element.get_Parameter(BuiltInParameter.MATERIAL_ID_PARAM);
                if (materialParam != null && !materialParam.IsReadOnly)
                {
                    if (materialParam.AsElementId() == fromMaterialId)
                    {
                        materialParam.Set(toMaterialId);
                        return true;
                    }
                }
                
                // Method 2: Structural material parameter
                var structMaterialParam = element.get_Parameter(BuiltInParameter.STRUCTURAL_MATERIAL_PARAM);
                if (structMaterialParam != null && !structMaterialParam.IsReadOnly)
                {
                    if (structMaterialParam.AsElementId() == fromMaterialId)
                    {
                        structMaterialParam.Set(toMaterialId);
                        return true;
                    }
                }
                
                // Method 3: For walls, floors, roofs - update type material
                if (element is Wall || element is Floor || element is RoofBase)
                {
                    var typeId = element.GetTypeId();
                    if (typeId != ElementId.InvalidElementId)
                    {
                        var elementType = element.Document.GetElement(typeId) as ElementType;
                        if (elementType != null)
                        {
                            var typeMaterialParam = elementType.get_Parameter(BuiltInParameter.MATERIAL_ID_PARAM);
                            if (typeMaterialParam != null && !typeMaterialParam.IsReadOnly)
                            {
                                if (typeMaterialParam.AsElementId() == fromMaterialId)
                                {
                                    typeMaterialParam.Set(toMaterialId);
                                    return true;
                                }
                            }
                        }
                    }
                }
                
                // Method 4: For family instances, try instance material parameter
                if (element is FamilyInstance)
                {
                    foreach (Parameter param in element.Parameters)
                    {
                        if (param.Definition.Name.Contains("Material") && 
                            param.StorageType == StorageType.ElementId &&
                            !param.IsReadOnly)
                        {
                            if (param.AsElementId() == fromMaterialId)
                            {
                                param.Set(toMaterialId);
                                return true;
                            }
                        }
                    }
                }
                
                return false;
            }
            catch (Exception ex)
            {
                _logger.Debug(ex, "Could not swap material for element {ElementId}", element.Id);
                return false;
            }
        }
        
        /// <summary>
        /// Create or get a Revit material matching a BlockPlane material
        /// </summary>
        public Autodesk.Revit.DB.Material GetOrCreateRevitMaterial(
            Document document,
            BlockPlane.RevitPlugin.Models.Material blockplaneMaterial)
        {
            if (document == null) throw new ArgumentNullException(nameof(document));
            if (blockplaneMaterial == null) throw new ArgumentNullException(nameof(blockplaneMaterial));
            
            // Try to find existing material by name
            var collector = new FilteredElementCollector(document)
                .OfClass(typeof(Autodesk.Revit.DB.Material));
            
            foreach (Autodesk.Revit.DB.Material mat in collector)
            {
                if (mat.Name.Equals(blockplaneMaterial.Name, StringComparison.OrdinalIgnoreCase))
                {
                    return mat;
                }
            }
            
            // Create new material
            using (Transaction trans = new Transaction(document, $"Create Material: {blockplaneMaterial.Name}"))
            {
                trans.Start();
                
                try
                {
                    ElementId newMaterialId = Autodesk.Revit.DB.Material.Create(document, blockplaneMaterial.Name);
                    var newMaterial = document.GetElement(newMaterialId) as Autodesk.Revit.DB.Material;
                    
                    if (newMaterial != null)
                    {
                        // Set material properties
                        newMaterial.Color = GetColorForCategory(blockplaneMaterial.Category);
                        newMaterial.Transparency = 0;
                        newMaterial.Shininess = 32;
                        
                        // Add description with carbon data
                        var descParam = newMaterial.get_Parameter(BuiltInParameter.ALL_MODEL_DESCRIPTION);
                        if (descParam != null && !descParam.IsReadOnly)
                        {
                            descParam.Set($"BlockPlane Material | Carbon: {blockplaneMaterial.TotalCarbon:F1} kg CO₂/{blockplaneMaterial.FunctionalUnit} | RIS: {blockplaneMaterial.RisScore}");
                        }
                        
                        _logger.Information("Created new Revit material: {MaterialName}", blockplaneMaterial.Name);
                    }
                    
                    trans.Commit();
                    return newMaterial;
                }
                catch (Exception ex)
                {
                    trans.RollBack();
                    _logger.Error(ex, "Failed to create Revit material: {MaterialName}", blockplaneMaterial.Name);
                    throw;
                }
            }
        }
        
        /// <summary>
        /// Get a representative color for a material category
        /// </summary>
        private Autodesk.Revit.DB.Color GetColorForCategory(string category)
        {
            return category.ToLowerInvariant() switch
            {
                "timber" => new Autodesk.Revit.DB.Color(139, 90, 43),      // Brown
                "steel" => new Autodesk.Revit.DB.Color(128, 128, 128),     // Gray
                "concrete" => new Autodesk.Revit.DB.Color(192, 192, 192),  // Light gray
                "earth" => new Autodesk.Revit.DB.Color(160, 82, 45),       // Sienna
                "insulation" => new Autodesk.Revit.DB.Color(255, 255, 153), // Light yellow
                "composites" => new Autodesk.Revit.DB.Color(100, 149, 237), // Cornflower blue
                "masonry" => new Autodesk.Revit.DB.Color(178, 34, 34),     // Firebrick
                _ => new Autodesk.Revit.DB.Color(200, 200, 200)            // Default gray
            };
        }
        
        /// <summary>
        /// Preview what would be affected by a swap (without committing)
        /// </summary>
        public SwapPreview PreviewSwap(Document document, Autodesk.Revit.DB.Material fromMaterial)
        {
            var preview = new SwapPreview
            {
                MaterialName = fromMaterial.Name
            };
            
            try
            {
                var elements = FindElementsWithMaterial(document, fromMaterial);
                preview.AffectedElementCount = elements.Count;
                
                // Group by category
                var categoryCounts = elements
                    .GroupBy(e => e.Category?.Name ?? "Unknown")
                    .ToDictionary(g => g.Key, g => g.Count());
                
                preview.AffectedCategories = categoryCounts;
                
                _logger.Debug("Swap preview for {Material}: {Count} elements in {Categories} categories",
                    fromMaterial.Name, preview.AffectedElementCount, categoryCounts.Count);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to generate swap preview");
            }
            
            return preview;
        }
    }
    
    /// <summary>
    /// Result of a material swap operation
    /// </summary>
    public class SwapResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string FromMaterialName { get; set; } = string.Empty;
        public string ToMaterialName { get; set; } = string.Empty;
        public int TotalElements { get; set; }
        public int UpdatedElements { get; set; }
        public int FailedElements { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public double CarbonSavings { get; set; }
        public double CostDifference { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public TimeSpan Duration { get; set; }
    }
    
    /// <summary>
    /// Preview of what would be affected by a swap
    /// </summary>
    public class SwapPreview
    {
        public string MaterialName { get; set; } = string.Empty;
        public int AffectedElementCount { get; set; }
        public Dictionary<string, int> AffectedCategories { get; set; } = new Dictionary<string, int>();
    }
}
