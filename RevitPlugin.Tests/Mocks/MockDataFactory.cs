using System;
using System.Collections.Generic;
using BlockPlane.RevitPlugin.Models;

namespace BlockPlane.RevitPlugin.Tests.Mocks
{
    /// <summary>
    /// Factory for creating mock data for testing
    /// </summary>
    public static class MockDataFactory
    {
        /// <summary>
        /// Create a mock material with default values
        /// </summary>
        public static Material CreateMockMaterial(
            string id = "mat-001",
            string name = "Test Material",
            string category = "Timber",
            double ris = 75.0,
            double lis = 60.0)
        {
            return new Material
            {
                Id = id,
                Name = name,
                Category = category,
                RIS = ris,
                LIS = lis,
                Description = $"Test material: {name}",
                Manufacturer = "Test Manufacturer",
                CarbonFootprint = CreateMockCarbonFootprint(),
                Pricing = CreateMockPricing(),
                Certifications = new List<string> { "FSC", "LEED" },
                IsRegenerative = ris >= 70
            };
        }

        /// <summary>
        /// Create a mock carbon footprint
        /// </summary>
        public static CarbonFootprint CreateMockCarbonFootprint(
            double a1 = 10.0,
            double a2 = 2.0,
            double a3 = 5.0,
            double a4 = 3.0,
            double a5 = 1.0,
            double b = 0.5,
            double c1 = 0.2,
            double c2 = 0.3,
            double c3 = 0.1,
            double c4 = 0.4)
        {
            return new CarbonFootprint
            {
                A1 = a1,
                A2 = a2,
                A3 = a3,
                A4 = a4,
                A5 = a5,
                B = b,
                C1 = c1,
                C2 = c2,
                C3 = c3,
                C4 = c4,
                Unit = "kg CO₂e/m³"
            };
        }

        /// <summary>
        /// Create mock pricing data
        /// </summary>
        public static Dictionary<string, double> CreateMockPricing()
        {
            return new Dictionary<string, double>
            {
                { "North America", 150.0 },
                { "Europe", 180.0 },
                { "Asia", 120.0 }
            };
        }

        /// <summary>
        /// Create a list of mock materials
        /// </summary>
        public static List<Material> CreateMockMaterialList(int count = 10)
        {
            var materials = new List<Material>();
            var categories = new[] { "Timber", "Steel", "Concrete", "Earth", "Insulation" };
            
            for (int i = 0; i < count; i++)
            {
                materials.Add(CreateMockMaterial(
                    id: $"mat-{i:D3}",
                    name: $"Test Material {i}",
                    category: categories[i % categories.Length],
                    ris: 50 + (i * 5),
                    lis: 40 + (i * 4)
                ));
            }

            return materials;
        }

        /// <summary>
        /// Create a mock search result
        /// </summary>
        public static MaterialSearchResult CreateMockSearchResult(int totalResults = 100, int page = 1, int pageSize = 20)
        {
            return new MaterialSearchResult
            {
                Materials = CreateMockMaterialList(Math.Min(pageSize, totalResults)),
                TotalResults = totalResults,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalResults / (double)pageSize)
            };
        }

        /// <summary>
        /// Create mock project analysis
        /// </summary>
        public static Commands.ProjectAnalysis CreateMockProjectAnalysis()
        {
            return new Commands.ProjectAnalysis
            {
                ProjectName = "Test Project",
                ProjectId = "test-project-001",
                AnalysisDate = DateTime.Now,
                MaterialCount = 25,
                TotalElements = 500,
                TotalCarbon = 50000.0,
                TotalCost = 100000.0,
                ProductionCarbon = 30000.0,
                TransportCarbon = 5000.0,
                InstallationCarbon = 3000.0,
                UsePhaseCarbon = 10000.0,
                EndOfLifeCarbon = 2000.0,
                PotentialSavings = 10000.0,
                SavingsPercentage = 20.0,
                RecommendedSwaps = 5,
                HighConfidenceMatches = 15,
                MediumConfidenceMatches = 7,
                LowConfidenceMatches = 2,
                UnmatchedMaterials = 1,
                TopContributors = CreateMockCarbonContributors()
            };
        }

        /// <summary>
        /// Create mock carbon contributors
        /// </summary>
        public static List<Commands.CarbonContributor> CreateMockCarbonContributors()
        {
            return new List<Commands.CarbonContributor>
            {
                new Commands.CarbonContributor { MaterialName = "Concrete", Carbon = 20000.0, Percentage = 40.0 },
                new Commands.CarbonContributor { MaterialName = "Steel", Carbon = 15000.0, Percentage = 30.0 },
                new Commands.CarbonContributor { MaterialName = "Glass", Carbon = 8000.0, Percentage = 16.0 },
                new Commands.CarbonContributor { MaterialName = "Insulation", Carbon = 5000.0, Percentage = 10.0 },
                new Commands.CarbonContributor { MaterialName = "Timber", Carbon = 2000.0, Percentage = 4.0 }
            };
        }

        /// <summary>
        /// Create mock material usage detail
        /// </summary>
        public static BIM.MaterialUsageDetail CreateMockMaterialUsage(
            string materialName = "Test Material",
            double quantity = 100.0,
            string unit = "m³")
        {
            return new BIM.MaterialUsageDetail
            {
                RevitMaterialId = "revit-mat-001",
                RevitMaterialName = materialName,
                BlockPlaneMaterial = CreateMockMaterial(name: materialName),
                MatchConfidence = BIM.MatchConfidence.High,
                Elements = new List<BIM.ElementQuantity>(),
                ElementCount = 10,
                TotalVolume = unit == "m³" ? quantity : 0,
                TotalArea = unit == "m²" ? quantity : 0,
                TotalLength = unit == "m" ? quantity : 0,
                Quantity = quantity,
                Unit = unit,
                EstimatedCarbon = quantity * 22.5,
                EstimatedCost = quantity * 150.0
            };
        }

        /// <summary>
        /// Create mock element quantity
        /// </summary>
        public static BIM.ElementQuantity CreateMockElementQuantity(
            int elementId = 12345,
            string elementName = "Test Element",
            double volume = 10.0)
        {
            return new BIM.ElementQuantity
            {
                ElementId = elementId,
                ElementName = elementName,
                ElementType = "Wall",
                Category = "Walls",
                Volume = volume,
                Area = volume * 2,
                Length = volume * 0.5,
                PrimaryUnit = "m³"
            };
        }

        /// <summary>
        /// Create mock API response
        /// </summary>
        public static string CreateMockApiResponse(Material material)
        {
            return Newtonsoft.Json.JsonConvert.SerializeObject(material);
        }

        /// <summary>
        /// Create mock API response for search
        /// </summary>
        public static string CreateMockSearchResponse(MaterialSearchResult result)
        {
            return Newtonsoft.Json.JsonConvert.SerializeObject(result);
        }

        /// <summary>
        /// Create mock cache entry
        /// </summary>
        public static Services.CacheEntry<Material> CreateMockCacheEntry(Material material, int expirationMinutes = 60)
        {
            return new Services.CacheEntry<Material>
            {
                Key = $"material_{material.Id}",
                Value = material,
                ExpiresAt = DateTime.Now.AddMinutes(expirationMinutes)
            };
        }
    }
}
