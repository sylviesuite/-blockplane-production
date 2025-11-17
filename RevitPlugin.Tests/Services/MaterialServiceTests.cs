using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BlockPlane.RevitPlugin.Models;
using BlockPlane.RevitPlugin.Services;
using BlockPlane.RevitPlugin.Tests.Mocks;
using FluentAssertions;
using Moq;
using NUnit.Framework;

namespace BlockPlane.RevitPlugin.Tests.Services
{
    [TestFixture]
    public class MaterialServiceTests
    {
        private Mock<BlockPlaneAPIClient> _mockApiClient;
        private Mock<CacheService> _mockCacheService;
        private MaterialService _materialService;

        [SetUp]
        public void SetUp()
        {
            _mockApiClient = new Mock<BlockPlaneAPIClient>();
            _mockCacheService = new Mock<CacheService>();
            _materialService = new MaterialService(_mockApiClient.Object, _mockCacheService.Object);
        }

        [Test]
        public async Task SearchMaterials_WithValidQuery_ReturnsResults()
        {
            // Arrange
            var expectedResult = MockDataFactory.CreateMockSearchResult(totalResults: 50, page: 1, pageSize: 20);
            _mockApiClient
                .Setup(x => x.SearchMaterialsAsync(It.IsAny<string>(), It.IsAny<Dictionary<string, string>>()))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _materialService.SearchAsync("timber", page: 1, pageSize: 20);

            // Assert
            result.Should().NotBeNull();
            result.Materials.Should().HaveCount(20);
            result.TotalResults.Should().Be(50);
            result.Page.Should().Be(1);
        }

        [Test]
        public async Task SearchMaterials_WithEmptyQuery_ThrowsArgumentException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(async () =>
            {
                await _materialService.SearchAsync(string.Empty);
            });
        }

        [Test]
        public async Task GetMaterialById_WithValidId_ReturnsMaterial()
        {
            // Arrange
            var expectedMaterial = MockDataFactory.CreateMockMaterial(id: "mat-001", name: "Test Timber");
            _mockApiClient
                .Setup(x => x.GetMaterialByIdAsync("mat-001"))
                .ReturnsAsync(expectedMaterial);

            // Act
            var result = await _materialService.GetByIdAsync("mat-001");

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be("mat-001");
            result.Name.Should().Be("Test Timber");
        }

        [Test]
        public async Task GetMaterialById_WithCache_ReturnsFromCache()
        {
            // Arrange
            var cachedMaterial = MockDataFactory.CreateMockMaterial(id: "mat-001");
            _mockCacheService
                .Setup(x => x.Get<Material>("material_mat-001"))
                .Returns(cachedMaterial);

            // Act
            var result = await _materialService.GetByIdAsync("mat-001");

            // Assert
            result.Should().NotBeNull();
            result.Should().Be(cachedMaterial);
            _mockApiClient.Verify(x => x.GetMaterialByIdAsync(It.IsAny<string>()), Times.Never);
        }

        [Test]
        public async Task GetAlternatives_WithValidMaterialId_ReturnsAlternatives()
        {
            // Arrange
            var alternatives = MockDataFactory.CreateMockMaterialList(count: 5);
            _mockApiClient
                .Setup(x => x.GetAlternativesAsync("mat-001", It.IsAny<int>()))
                .ReturnsAsync(alternatives);

            // Act
            var result = await _materialService.GetAlternativesAsync("mat-001", limit: 5);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(5);
        }

        [Test]
        public async Task FilterByCategory_WithValidCategory_ReturnsFilteredResults()
        {
            // Arrange
            var searchResult = MockDataFactory.CreateMockSearchResult();
            _mockApiClient
                .Setup(x => x.SearchMaterialsAsync(It.IsAny<string>(), It.Is<Dictionary<string, string>>(
                    d => d.ContainsKey("category") && d["category"] == "Timber")))
                .ReturnsAsync(searchResult);

            // Act
            var result = await _materialService.SearchAsync("", filters: new Dictionary<string, string>
            {
                { "category", "Timber" }
            });

            // Assert
            result.Should().NotBeNull();
            _mockApiClient.Verify(x => x.SearchMaterialsAsync(
                It.IsAny<string>(),
                It.Is<Dictionary<string, string>>(d => d["category"] == "Timber")),
                Times.Once);
        }

        [Test]
        public async Task FilterByRIS_WithMinValue_ReturnsFilteredResults()
        {
            // Arrange
            var searchResult = MockDataFactory.CreateMockSearchResult();
            _mockApiClient
                .Setup(x => x.SearchMaterialsAsync(It.IsAny<string>(), It.Is<Dictionary<string, string>>(
                    d => d.ContainsKey("min_ris") && d["min_ris"] == "70")))
                .ReturnsAsync(searchResult);

            // Act
            var result = await _materialService.SearchAsync("", filters: new Dictionary<string, string>
            {
                { "min_ris", "70" }
            });

            // Assert
            result.Should().NotBeNull();
            _mockApiClient.Verify(x => x.SearchMaterialsAsync(
                It.IsAny<string>(),
                It.Is<Dictionary<string, string>>(d => d["min_ris"] == "70")),
                Times.Once);
        }

        [Test]
        public void CalculateCarbon_WithValidQuantity_ReturnsCorrectValue()
        {
            // Arrange
            var material = MockDataFactory.CreateMockMaterial();
            double quantity = 100.0; // 100 m³

            // Act
            var carbon = material.CalculateCarbon(quantity);

            // Assert
            carbon.Should().BeGreaterThan(0);
            // Total carbon = (A1+A2+A3+A4+A5+B+C1+C2+C3+C4) * quantity
            // = (10+2+5+3+1+0.5+0.2+0.3+0.1+0.4) * 100 = 2250
            carbon.Should().BeApproximately(2250.0, 0.1);
        }

        [Test]
        public void CalculateCost_WithValidQuantity_ReturnsCorrectValue()
        {
            // Arrange
            var material = MockDataFactory.CreateMockMaterial();
            double quantity = 100.0; // 100 m³

            // Act
            var cost = material.CalculateCost(quantity, region: "North America");

            // Assert
            cost.Should().BeGreaterThan(0);
            // Cost = 150 * 100 = 15000
            cost.Should().Be(15000.0);
        }

        [Test]
        public void CalculateCost_WithInvalidRegion_UsesDefaultPrice()
        {
            // Arrange
            var material = MockDataFactory.CreateMockMaterial();
            double quantity = 100.0;

            // Act
            var cost = material.CalculateCost(quantity, region: "Invalid Region");

            // Assert
            cost.Should().BeGreaterThan(0);
            // Should use first available price (North America = 150)
            cost.Should().Be(15000.0);
        }

        [Test]
        public async Task CacheMaterial_AfterFetch_StoresInCache()
        {
            // Arrange
            var material = MockDataFactory.CreateMockMaterial(id: "mat-001");
            _mockApiClient
                .Setup(x => x.GetMaterialByIdAsync("mat-001"))
                .ReturnsAsync(material);

            // Act
            await _materialService.GetByIdAsync("mat-001");

            // Assert
            _mockCacheService.Verify(x => x.Set(
                "material_mat-001",
                material,
                It.IsAny<TimeSpan>()),
                Times.Once);
        }

        [Test]
        public async Task SearchWithPagination_ReturnsCorrectPage()
        {
            // Arrange
            var page2Result = MockDataFactory.CreateMockSearchResult(totalResults: 100, page: 2, pageSize: 20);
            _mockApiClient
                .Setup(x => x.SearchMaterialsAsync(It.IsAny<string>(), It.IsAny<Dictionary<string, string>>()))
                .ReturnsAsync(page2Result);

            // Act
            var result = await _materialService.SearchAsync("timber", page: 2, pageSize: 20);

            // Assert
            result.Should().NotBeNull();
            result.Page.Should().Be(2);
            result.TotalPages.Should().Be(5); // 100 / 20 = 5
        }

        [Test]
        public async Task GetAlternatives_SortsByMatchScore_ReturnsOrderedList()
        {
            // Arrange
            var alternatives = new List<Material>
            {
                MockDataFactory.CreateMockMaterial(id: "mat-001", ris: 60.0),
                MockDataFactory.CreateMockMaterial(id: "mat-002", ris: 80.0),
                MockDataFactory.CreateMockMaterial(id: "mat-003", ris: 70.0)
            };
            _mockApiClient
                .Setup(x => x.GetAlternativesAsync("original-mat", It.IsAny<int>()))
                .ReturnsAsync(alternatives);

            // Act
            var result = await _materialService.GetAlternativesAsync("original-mat");

            // Assert
            result.Should().NotBeNull();
            // Should be sorted by RIS descending
            result[0].RIS.Should().BeGreaterThanOrEqualTo(result[1].RIS);
            result[1].RIS.Should().BeGreaterThanOrEqualTo(result[2].RIS);
        }
    }
}
