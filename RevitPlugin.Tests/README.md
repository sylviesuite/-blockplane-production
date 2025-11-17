# BlockPlane Revit Plugin - Test Suite

This directory contains comprehensive unit and integration tests for the BlockPlane Revit Plugin.

## Test Structure

```
RevitPlugin.Tests/
├── Services/           # Service layer tests
│   ├── MaterialServiceTests.cs
│   ├── CacheServiceTests.cs
│   └── ProjectServiceTests.cs
├── BIM/               # BIM extraction tests
│   ├── ElementQuantityExtractorTests.cs
│   ├── MaterialMapperTests.cs
│   └── ProjectAnalyzerTests.cs
├── Reports/           # Report generation tests
│   ├── CSVExporterTests.cs
│   └── PDFReportGeneratorTests.cs
├── Validation/        # Validation tests
│   ├── InputValidatorTests.cs
│   └── RetryPolicyTests.cs
├── Mocks/             # Mock data and helpers
│   ├── MockDataFactory.cs
│   └── MockApiClient.cs
└── Utilities/         # Test utilities
    └── TestHelpers.cs
```

## Running Tests

### Visual Studio
1. Open the solution in Visual Studio
2. Go to Test → Test Explorer
3. Click "Run All" to execute all tests

### Command Line
```bash
# Run all tests
dotnet test RevitPlugin.Tests.csproj

# Run specific test class
dotnet test --filter "FullyQualifiedName~MaterialServiceTests"

# Run with detailed output
dotnet test --logger "console;verbosity=detailed"
```

### NUnit Console
```bash
nunit3-console RevitPlugin.Tests.dll
```

## Test Categories

Tests are organized into the following categories:

### Unit Tests
- **Service Tests**: Test individual service methods in isolation
- **Validation Tests**: Test input validation logic
- **Utility Tests**: Test helper functions and utilities

### Integration Tests
- **API Integration**: Test actual API communication (requires network)
- **Cache Integration**: Test cache persistence and retrieval
- **File Operations**: Test file read/write operations

### Performance Tests
- **Load Tests**: Test performance with large datasets
- **Stress Tests**: Test behavior under extreme conditions

## Test Frameworks

- **NUnit 3.13.3**: Primary testing framework
- **Moq 4.18.4**: Mocking framework for dependencies
- **FluentAssertions 6.11.0**: Fluent assertion library for readable tests
- **Microsoft.NET.Test.Sdk 17.6.0**: Test SDK for .NET

## Writing Tests

### Test Naming Convention
```csharp
[Test]
public void MethodName_Scenario_ExpectedBehavior()
{
    // Arrange
    // Act
    // Assert
}
```

### Example Test
```csharp
[Test]
public async Task SearchMaterials_WithValidQuery_ReturnsResults()
{
    // Arrange
    var mockClient = new Mock<BlockPlaneAPIClient>();
    var expectedResult = MockDataFactory.CreateMockSearchResult();
    mockClient.Setup(x => x.SearchMaterialsAsync(It.IsAny<string>(), null))
              .ReturnsAsync(expectedResult);
    
    var service = new MaterialService(mockClient.Object, null);

    // Act
    var result = await service.SearchAsync("timber");

    // Assert
    result.Should().NotBeNull();
    result.Materials.Should().HaveCount(20);
}
```

## Mock Data

Use `MockDataFactory` to create test data:

```csharp
// Create a single mock material
var material = MockDataFactory.CreateMockMaterial(
    id: "mat-001",
    name: "Test Timber",
    category: "Timber",
    ris: 75.0
);

// Create a list of materials
var materials = MockDataFactory.CreateMockMaterialList(count: 10);

// Create a search result
var searchResult = MockDataFactory.CreateMockSearchResult(
    totalResults: 100,
    page: 1,
    pageSize: 20
);

// Create project analysis
var analysis = MockDataFactory.CreateMockProjectAnalysis();
```

## Test Coverage Goals

- **Service Layer**: 90%+ coverage
- **Validation Logic**: 95%+ coverage
- **BIM Extraction**: 80%+ coverage
- **Report Generation**: 75%+ coverage
- **Overall**: 85%+ coverage

## Continuous Integration

Tests are automatically run on:
- Every commit to main branch
- Every pull request
- Nightly builds

## Troubleshooting

### Tests Not Discovered
- Ensure NUnit3TestAdapter is installed
- Rebuild the solution
- Clean and rebuild Test Explorer cache

### Mock Setup Issues
- Verify mock setup matches actual method signature
- Check that async methods return Task/Task<T>
- Ensure It.IsAny<T>() matches parameter type

### Assertion Failures
- Use FluentAssertions for better error messages
- Check actual vs expected values in test output
- Verify mock was called with expected parameters

## Best Practices

1. **Arrange-Act-Assert**: Follow AAA pattern consistently
2. **One Assertion Per Test**: Focus each test on a single behavior
3. **Descriptive Names**: Test names should clearly describe the scenario
4. **Independent Tests**: Tests should not depend on each other
5. **Fast Tests**: Keep unit tests fast (<100ms each)
6. **Mock External Dependencies**: Don't call real APIs or databases in unit tests
7. **Clean Up**: Dispose resources properly in [TearDown]
8. **Readable Assertions**: Use FluentAssertions for clarity

## Code Coverage

Generate code coverage reports:

```bash
# Install coverage tool
dotnet tool install --global dotnet-coverage

# Run tests with coverage
dotnet coverage collect "dotnet test" --output coverage.xml

# Generate HTML report
reportgenerator -reports:coverage.xml -targetdir:coverage-report
```

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass before committing
3. Maintain or improve code coverage
4. Add integration tests for API changes
5. Update this README if adding new test categories

## Support

For test-related questions:
- Check existing tests for examples
- Review NUnit documentation: https://nunit.org/
- Review Moq documentation: https://github.com/moq/moq4
- Contact the development team
