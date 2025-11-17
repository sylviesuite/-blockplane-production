using System;
using System.Collections.Generic;
using System.Linq;
using Autodesk.Revit.DB;
using Serilog;

namespace BlockPlane.RevitPlugin.BIM
{
    /// <summary>
    /// Extracts quantities from Revit elements for carbon and cost calculations
    /// Handles different element types (walls, floors, roofs, structural, MEP, etc.)
    /// </summary>
    public class ElementQuantityExtractor
    {
        private readonly ILogger _logger;

        public ElementQuantityExtractor()
        {
            _logger = Log.ForContext<ElementQuantityExtractor>();
        }

        /// <summary>
        /// Extract quantity data from an element
        /// </summary>
        public ElementQuantity ExtractQuantity(Element element)
        {
            if (element == null)
            {
                throw new ArgumentNullException(nameof(element));
            }

            var quantity = new ElementQuantity
            {
                ElementId = element.Id.IntegerValue,
                ElementName = element.Name,
                ElementType = element.GetType().Name,
                Category = element.Category?.Name ?? "Unknown"
            };

            try
            {
                // Try different extraction methods based on element type
                if (element is Wall wall)
                {
                    ExtractWallQuantity(wall, quantity);
                }
                else if (element is Floor floor)
                {
                    ExtractFloorQuantity(floor, quantity);
                }
                else if (element is RoofBase roof)
                {
                    ExtractRoofQuantity(roof, quantity);
                }
                else if (element is FamilyInstance familyInstance)
                {
                    ExtractFamilyInstanceQuantity(familyInstance, quantity);
                }
                else
                {
                    // Generic extraction for other element types
                    ExtractGenericQuantity(element, quantity);
                }

                _logger.Debug("Extracted quantity from {ElementType} {ElementName}: {Volume}m³, {Area}m², {Length}m",
                    quantity.ElementType, quantity.ElementName, quantity.Volume, quantity.Area, quantity.Length);
            }
            catch (Exception ex)
            {
                _logger.Warning(ex, "Failed to extract quantity from element {ElementId}", element.Id);
            }

            return quantity;
        }

        /// <summary>
        /// Extract quantities from a wall element
        /// </summary>
        private void ExtractWallQuantity(Wall wall, ElementQuantity quantity)
        {
            // Volume
            var volumeParam = wall.get_Parameter(BuiltInParameter.HOST_VOLUME_COMPUTED);
            if (volumeParam != null && volumeParam.HasValue)
            {
                quantity.Volume = ConvertCubicFeetToMeters(volumeParam.AsDouble());
            }

            // Area
            var areaParam = wall.get_Parameter(BuiltInParameter.HOST_AREA_COMPUTED);
            if (areaParam != null && areaParam.HasValue)
            {
                quantity.Area = ConvertSquareFeetToMeters(areaParam.AsDouble());
            }

            // Length
            var lengthParam = wall.get_Parameter(BuiltInParameter.CURVE_ELEM_LENGTH);
            if (lengthParam != null && lengthParam.HasValue)
            {
                quantity.Length = ConvertFeetToMeters(lengthParam.AsDouble());
            }

            // Width (thickness)
            if (wall.WallType != null)
            {
                quantity.Width = ConvertFeetToMeters(wall.WallType.Width);
            }

            // Height
            var heightParam = wall.get_Parameter(BuiltInParameter.WALL_USER_HEIGHT_PARAM);
            if (heightParam != null && heightParam.HasValue)
            {
                quantity.Height = ConvertFeetToMeters(heightParam.AsDouble());
            }

            quantity.PrimaryUnit = "m²"; // Walls typically measured by area
        }

        /// <summary>
        /// Extract quantities from a floor element
        /// </summary>
        private void ExtractFloorQuantity(Floor floor, ElementQuantity quantity)
        {
            // Volume
            var volumeParam = floor.get_Parameter(BuiltInParameter.HOST_VOLUME_COMPUTED);
            if (volumeParam != null && volumeParam.HasValue)
            {
                quantity.Volume = ConvertCubicFeetToMeters(volumeParam.AsDouble());
            }

            // Area
            var areaParam = floor.get_Parameter(BuiltInParameter.HOST_AREA_COMPUTED);
            if (areaParam != null && areaParam.HasValue)
            {
                quantity.Area = ConvertSquareFeetToMeters(areaParam.AsDouble());
            }

            // Perimeter
            var perimeterParam = floor.get_Parameter(BuiltInParameter.HOST_PERIMETER_COMPUTED);
            if (perimeterParam != null && perimeterParam.HasValue)
            {
                quantity.Perimeter = ConvertFeetToMeters(perimeterParam.AsDouble());
            }

            // Thickness
            if (floor.FloorType != null)
            {
                var thicknessParam = floor.FloorType.get_Parameter(BuiltInParameter.FLOOR_ATTR_THICKNESS_PARAM);
                if (thicknessParam != null && thicknessParam.HasValue)
                {
                    quantity.Height = ConvertFeetToMeters(thicknessParam.AsDouble());
                }
            }

            quantity.PrimaryUnit = "m²"; // Floors typically measured by area
        }

        /// <summary>
        /// Extract quantities from a roof element
        /// </summary>
        private void ExtractRoofQuantity(RoofBase roof, ElementQuantity quantity)
        {
            // Volume
            var volumeParam = roof.get_Parameter(BuiltInParameter.HOST_VOLUME_COMPUTED);
            if (volumeParam != null && volumeParam.HasValue)
            {
                quantity.Volume = ConvertCubicFeetToMeters(volumeParam.AsDouble());
            }

            // Area
            var areaParam = roof.get_Parameter(BuiltInParameter.HOST_AREA_COMPUTED);
            if (areaParam != null && areaParam.HasValue)
            {
                quantity.Area = ConvertSquareFeetToMeters(areaParam.AsDouble());
            }

            quantity.PrimaryUnit = "m²"; // Roofs typically measured by area
        }

        /// <summary>
        /// Extract quantities from a family instance (columns, beams, furniture, etc.)
        /// </summary>
        private void ExtractFamilyInstanceQuantity(FamilyInstance familyInstance, ElementQuantity quantity)
        {
            // Volume
            var volumeParam = familyInstance.get_Parameter(BuiltInParameter.HOST_VOLUME_COMPUTED);
            if (volumeParam != null && volumeParam.HasValue)
            {
                quantity.Volume = ConvertCubicFeetToMeters(volumeParam.AsDouble());
            }

            // Area
            var areaParam = familyInstance.get_Parameter(BuiltInParameter.HOST_AREA_COMPUTED);
            if (areaParam != null && areaParam.HasValue)
            {
                quantity.Area = ConvertSquareFeetToMeters(areaParam.AsDouble());
            }

            // Length (for structural framing)
            var lengthParam = familyInstance.get_Parameter(BuiltInParameter.INSTANCE_LENGTH_PARAM);
            if (lengthParam != null && lengthParam.HasValue)
            {
                quantity.Length = ConvertFeetToMeters(lengthParam.AsDouble());
            }

            // Count (for countable items like doors, windows, furniture)
            quantity.Count = 1;

            // Determine primary unit based on category
            if (familyInstance.Category != null)
            {
                string categoryName = familyInstance.Category.Name.ToLowerInvariant();
                
                if (categoryName.Contains("structural framing") || categoryName.Contains("beam") || categoryName.Contains("column"))
                {
                    quantity.PrimaryUnit = "m"; // Linear elements
                }
                else if (categoryName.Contains("door") || categoryName.Contains("window") || categoryName.Contains("furniture"))
                {
                    quantity.PrimaryUnit = "ea"; // Each (countable)
                }
                else if (quantity.Volume > 0)
                {
                    quantity.PrimaryUnit = "m³";
                }
                else if (quantity.Area > 0)
                {
                    quantity.PrimaryUnit = "m²";
                }
                else
                {
                    quantity.PrimaryUnit = "ea";
                }
            }
        }

        /// <summary>
        /// Generic quantity extraction for other element types
        /// </summary>
        private void ExtractGenericQuantity(Element element, ElementQuantity quantity)
        {
            // Try to get volume
            var volumeParam = element.get_Parameter(BuiltInParameter.HOST_VOLUME_COMPUTED);
            if (volumeParam != null && volumeParam.HasValue)
            {
                quantity.Volume = ConvertCubicFeetToMeters(volumeParam.AsDouble());
            }

            // Try to get area
            var areaParam = element.get_Parameter(BuiltInParameter.HOST_AREA_COMPUTED);
            if (areaParam != null && areaParam.HasValue)
            {
                quantity.Area = ConvertSquareFeetToMeters(areaParam.AsDouble());
            }

            // Try to get length
            var lengthParam = element.get_Parameter(BuiltInParameter.CURVE_ELEM_LENGTH);
            if (lengthParam != null && lengthParam.HasValue)
            {
                quantity.Length = ConvertFeetToMeters(lengthParam.AsDouble());
            }

            // Determine primary unit
            if (quantity.Volume > 0)
            {
                quantity.PrimaryUnit = "m³";
            }
            else if (quantity.Area > 0)
            {
                quantity.PrimaryUnit = "m²";
            }
            else if (quantity.Length > 0)
            {
                quantity.PrimaryUnit = "m";
            }
            else
            {
                quantity.PrimaryUnit = "ea";
                quantity.Count = 1;
            }
        }

        /// <summary>
        /// Get the primary quantity value based on the primary unit
        /// </summary>
        public double GetPrimaryQuantityValue(ElementQuantity quantity)
        {
            switch (quantity.PrimaryUnit)
            {
                case "m³":
                    return quantity.Volume;
                case "m²":
                    return quantity.Area;
                case "m":
                    return quantity.Length;
                case "ea":
                    return quantity.Count;
                default:
                    return 0;
            }
        }

        #region Unit Conversions

        /// <summary>
        /// Convert cubic feet to cubic meters
        /// </summary>
        private double ConvertCubicFeetToMeters(double cubicFeet)
        {
            return cubicFeet * 0.0283168;
        }

        /// <summary>
        /// Convert square feet to square meters
        /// </summary>
        private double ConvertSquareFeetToMeters(double squareFeet)
        {
            return squareFeet * 0.092903;
        }

        /// <summary>
        /// Convert feet to meters
        /// </summary>
        private double ConvertFeetToMeters(double feet)
        {
            return feet * 0.3048;
        }

        #endregion
    }

    /// <summary>
    /// Represents extracted quantity data from a Revit element
    /// </summary>
    public class ElementQuantity
    {
        public int ElementId { get; set; }
        public string ElementName { get; set; }
        public string ElementType { get; set; }
        public string Category { get; set; }
        
        public double Volume { get; set; } // m³
        public double Area { get; set; } // m²
        public double Length { get; set; } // m
        public double Width { get; set; } // m
        public double Height { get; set; } // m
        public double Perimeter { get; set; } // m
        public int Count { get; set; } = 0;
        
        public string PrimaryUnit { get; set; } // "m³", "m²", "m", "ea"
    }
}
