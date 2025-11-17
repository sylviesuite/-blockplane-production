# BlockPlane for Revit - Developer Guide

**Version 1.0.0**  
**Last Updated: 2024**

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [API Integration](#api-integration)
6. [Extending the Plugin](#extending-the-plugin)
7. [Testing](#testing)
8. [Building and Deployment](#building-and-deployment)
9. [Best Practices](#best-practices)
10. [Contributing](#contributing)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Revit UI Layer                       │
│  (Ribbon, Commands, WPF Windows, ViewModels)            │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Service Layer                          │
│  (MaterialService, ProjectService, SwapService)         │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Data Layer                             │
│  (API Client, Cache Service, BIM Extraction)            │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              External Dependencies                       │
│  (BlockPlane API, Revit API, SQLite)                    │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **.NET Framework**: 4.8
- **Language**: C# 7.3
- **UI Framework**: WPF (Windows Presentation Foundation)
- **Revit API**: 2024 / 2025
- **HTTP Client**: RestSharp 110.2.0
- **JSON**: Newtonsoft.Json 13.0.3
- **Database**: SQLite 1.0.118
- **Logging**: Serilog 3.1.1
- **PDF Generation**: iTextSharp 5.5.13.3
- **Testing**: NUnit 3.13.3, Moq 4.18.4

### Design Patterns

- **MVVM**: For WPF UI components
- **Service Layer**: Business logic separation
- **Repository Pattern**: Data access abstraction
- **Singleton**: Application instance
- **Factory**: Mock data creation
- **Strategy**: Retry policies
- **Observer**: Event-driven updates

---

## Development Setup

### Prerequisites

1. **Visual Studio 2019 or later**
   - Workloads: .NET desktop development
   - Extensions: ReSharper (optional)

2. **Autodesk Revit 2024 or 2025**
   - Required for testing
   - Install SDK for API references

3. **WiX Toolset v3.11**
   - For building installer
   - Download: https://wixtoolset.org/

4. **Git**
   - Version control
   - GitHub Desktop (optional)

### Clone Repository

```bash
git clone https://github.com/blockplane/revit-plugin.git
cd revit-plugin
```

### Open Solution

1. Open `BlockPlane.RevitPlugin.sln` in Visual Studio
2. Restore NuGet packages (automatic)
3. Set build configuration to Debug
4. Build solution (Ctrl+Shift+B)

### Configure Debugging

1. Right-click `BlockPlane.RevitPlugin` project
2. Select **Properties**
3. Go to **Debug** tab
4. Set **Start external program**: `C:\Program Files\Autodesk\Revit 2024\Revit.exe`
5. Set **Command line arguments**: (optional project file path)
6. Save

### Run and Debug

1. Press **F5** to start debugging
2. Revit will launch with plugin loaded
3. Set breakpoints in code
4. Test features in Revit

---

## Project Structure

```
BlockPlane.RevitPlugin/
├── src/
│   ├── Core/                    # Core application logic
│   │   ├── Application.cs       # Main application class
│   │   └── Constants.cs         # Global constants
│   ├── Commands/                # Revit IExternalCommand implementations
│   │   ├── BrowserCommand.cs
│   │   ├── CalculatorCommand.cs
│   │   ├── SwapCommand.cs
│   │   └── SettingsCommand.cs
│   ├── Services/                # Business logic services
│   │   ├── BlockPlaneAPIClient.cs
│   │   ├── MaterialService.cs
│   │   ├── CacheService.cs
│   │   ├── ProjectService.cs
│   │   └── SwapService.cs
│   ├── BIM/                     # BIM data extraction
│   │   ├── ElementQuantityExtractor.cs
│   │   ├── MaterialMapper.cs
│   │   └── ProjectAnalyzer.cs
│   ├── UI/                      # WPF user interface
│   │   ├── Views/               # XAML windows
│   │   └── ViewModels/          # MVVM view models
│   ├── Reports/                 # Report generation
│   │   ├── CSVExporter.cs
│   │   └── PDFReportGenerator.cs
│   ├── Models/                  # Data models
│   │   ├── Material.cs
│   │   ├── CarbonFootprint.cs
│   │   └── MaterialSearchResult.cs
│   ├── Exceptions/              # Custom exceptions
│   │   ├── BlockPlaneExceptions.cs
│   │   └── ErrorHandler.cs
│   └── Validation/              # Input validation
│       ├── InputValidator.cs
│       └── RetryPolicy.cs
├── Properties/
│   ├── AssemblyInfo.cs
│   └── Settings.settings
└── BlockPlane.RevitPlugin.csproj

RevitPlugin.Tests/
├── Services/                    # Service tests
├── BIM/                         # BIM extraction tests
├── Reports/                     # Report tests
├── Validation/                  # Validation tests
├── Mocks/                       # Mock data
└── RevitPlugin.Tests.csproj

Installer/
├── Product.wxs                  # WiX installer definition
├── BlockPlane.Installer.wixproj
├── Scripts/
│   └── Build-Installer.ps1
└── Templates/
    └── BlockPlane.addin

Documentation/
├── UserGuide/
│   └── USER_GUIDE.md
├── DeveloperGuide/
│   └── DEVELOPER_GUIDE.md
└── Images/
```

---

## Core Components

### Application Class

**Location**: `src/Core/Application.cs`

**Purpose**: Main entry point for the Revit plugin

**Key Responsibilities**:
- Initialize services
- Create ribbon UI
- Handle application lifecycle
- Provide singleton access

**Example**:
```csharp
public class Application : IExternalApplication
{
    public static Application Instance { get; private set; }
    
    public Result OnStartup(UIControlledApplication application)
    {
        Instance = this;
        InitializeLogging();
        InitializeServices();
        CreateRibbonPanel(application);
        return Result.Succeeded;
    }
}
```

### Service Layer

#### MaterialService

**Location**: `src/Services/MaterialService.cs`

**Purpose**: Material data access and management

**Key Methods**:
```csharp
Task<MaterialSearchResult> SearchAsync(string query, int page = 1, int pageSize = 20)
Task<Material> GetByIdAsync(string materialId)
Task<List<Material>> GetAlternativesAsync(string materialId, int limit = 10)
```

#### ProjectService

**Location**: `src/Services/ProjectService.cs`

**Purpose**: Revit project analysis

**Key Methods**:
```csharp
Task<ProjectAnalysis> AnalyzeProjectAsync(Document document)
List<MaterialUsage> ExtractMaterialsAsync(Document document)
double CalculateTotalCarbon(List<MaterialUsage> usages)
```

#### CacheService

**Location**: `src/Services/CacheService.cs`

**Purpose**: Local data caching with SQLite

**Key Methods**:
```csharp
void Set<T>(string key, T value, TimeSpan expiration)
T Get<T>(string key)
void Clear()
bool IsExpired(string key)
```

### BIM Extraction

#### ElementQuantityExtractor

**Location**: `src/BIM/ElementQuantityExtractor.cs`

**Purpose**: Extract quantities from Revit elements

**Key Methods**:
```csharp
ElementQuantity ExtractQuantity(Element element)
double GetVolume(Element element)
double GetArea(Element element)
string DeterminePrimaryUnit(ElementQuantity quantity)
```

#### MaterialMapper

**Location**: `src/BIM/MaterialMapper.cs`

**Purpose**: Map Revit materials to BlockPlane database

**Key Methods**:
```csharp
Task<MaterialMapping> MapMaterialAsync(Autodesk.Revit.DB.Material revitMaterial)
Task<Material> FindExactMatchAsync(string materialName)
Task<Material> FindFuzzyMatchAsync(string materialName)
int CalculateLevenshteinDistance(string a, string b)
```

### UI Components

#### MaterialBrowserWindow

**Location**: `src/UI/Views/MaterialBrowserWindow.xaml`

**Purpose**: Browse and search materials

**Features**:
- Real-time search
- Category filtering
- RIS/carbon filtering
- Material details view

#### MaterialBrowserViewModel

**Location**: `src/UI/ViewModels/MaterialBrowserViewModel.cs`

**Purpose**: MVVM view model for Material Browser

**Key Properties**:
```csharp
ObservableCollection<Material> Materials { get; set; }
string SearchQuery { get; set; }
string SelectedCategory { get; set; }
double MinRIS { get; set; }
```

---

## API Integration

### BlockPlane API Client

**Location**: `src/Services/BlockPlaneAPIClient.cs`

**Base URL**: `https://api.blockplane.com/v1`

### Authentication

Currently uses API key authentication:
```csharp
var client = new RestClient("https://api.blockplane.com/v1");
var request = new RestRequest("/materials");
request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
```

### Endpoints

#### Search Materials
```http
GET /materials/search?q={query}&page={page}&limit={limit}
```

**Response**:
```json
{
  "materials": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

#### Get Material by ID
```http
GET /materials/{id}
```

**Response**:
```json
{
  "id": "mat-001",
  "name": "Cross-Laminated Timber",
  "category": "Timber",
  "ris": 85.0,
  "carbonFootprint": {...},
  ...
}
```

#### Get Alternatives
```http
GET /materials/{id}/alternatives?limit={limit}
```

**Response**:
```json
[
  {...},
  {...}
]
```

### Error Handling

```csharp
try
{
    var result = await _apiClient.SearchMaterialsAsync(query);
}
catch (ApiException ex)
{
    // Handle API errors
    ErrorHandler.Handle(ex, "Material Search");
}
catch (NetworkException ex)
{
    // Handle network errors
    // Fall back to cache
}
```

### Retry Logic

```csharp
var retryPolicy = RetryPolicy.ForApiOperations();
var result = await retryPolicy.ExecuteAsync(async () =>
{
    return await _apiClient.GetMaterialByIdAsync(materialId);
}, "GetMaterial");
```

---

## Extending the Plugin

### Adding a New Command

1. **Create Command Class**

```csharp
using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;

namespace BlockPlane.RevitPlugin.Commands
{
    [Transaction(TransactionMode.Manual)]
    [Regeneration(RegenerationOption.Manual)]
    public class MyNewCommand : IExternalCommand
    {
        public Result Execute(
            ExternalCommandData commandData,
            ref string message,
            ElementSet elements)
        {
            try
            {
                // Your command logic here
                return Result.Succeeded;
            }
            catch (Exception ex)
            {
                ErrorHandler.Handle(ex, "MyNewCommand");
                return Result.Failed;
            }
        }
    }
}
```

2. **Add to Ribbon**

In `Application.cs`:
```csharp
private void CreateRibbonPanel(UIControlledApplication app)
{
    // ... existing code ...
    
    var myButton = panel.AddItem(new PushButtonData(
        "MyNewCommand",
        "My Feature",
        Assembly.GetExecutingAssembly().Location,
        "BlockPlane.RevitPlugin.Commands.MyNewCommand"
    )) as PushButton;
    
    myButton.ToolTip = "Description of my feature";
}
```

### Adding a New Service Method

```csharp
public class MaterialService
{
    // Existing methods...
    
    public async Task<List<Material>> GetMaterialsByManufacturerAsync(string manufacturer)
    {
        var filters = new Dictionary<string, string>
        {
            { "manufacturer", manufacturer }
        };
        
        var result = await _apiClient.SearchMaterialsAsync("", filters);
        return result.Materials;
    }
}
```

### Adding a New UI Window

1. **Create XAML**

`src/UI/Views/MyNewWindow.xaml`:
```xml
<Window x:Class="BlockPlane.RevitPlugin.UI.Views.MyNewWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        Title="My New Feature" Height="450" Width="800">
    <Grid>
        <!-- Your UI here -->
    </Grid>
</Window>
```

2. **Create Code-Behind**

`src/UI/Views/MyNewWindow.xaml.cs`:
```csharp
public partial class MyNewWindow : Window
{
    public MyNewWindow()
    {
        InitializeComponent();
    }
}
```

3. **Show Window**

```csharp
var window = new MyNewWindow();
window.ShowDialog();
```

---

## Testing

### Running Tests

```bash
# Visual Studio Test Explorer
Test → Run All Tests

# Command line
dotnet test RevitPlugin.Tests.csproj

# With coverage
dotnet test /p:CollectCoverage=true
```

### Writing Unit Tests

```csharp
[TestFixture]
public class MyServiceTests
{
    private Mock<IDependency> _mockDependency;
    private MyService _service;
    
    [SetUp]
    public void SetUp()
    {
        _mockDependency = new Mock<IDependency>();
        _service = new MyService(_mockDependency.Object);
    }
    
    [Test]
    public async Task MyMethod_WithValidInput_ReturnsExpectedResult()
    {
        // Arrange
        var input = "test";
        var expected = "result";
        _mockDependency.Setup(x => x.Process(input))
                      .Returns(expected);
        
        // Act
        var result = await _service.MyMethod(input);
        
        // Assert
        result.Should().Be(expected);
    }
}
```

### Integration Testing

For testing with actual Revit API:
1. Create test project in Revit
2. Run plugin in debug mode
3. Manually verify functionality
4. Check logs for errors

---

## Building and Deployment

### Building Release Version

```bash
# Visual Studio
1. Set configuration to Release
2. Build → Build Solution

# Command line
msbuild BlockPlane.RevitPlugin.sln /p:Configuration=Release
```

### Building Installer

```powershell
cd Installer\Scripts
.\Build-Installer.ps1 -Configuration Release
```

### Deployment Checklist

- [ ] Update version number in AssemblyInfo.cs
- [ ] Update version in Product.wxs
- [ ] Run all tests
- [ ] Build Release configuration
- [ ] Build installer
- [ ] Test installation on clean machine
- [ ] Test in Revit 2024 and 2025
- [ ] Generate release notes
- [ ] Tag release in Git
- [ ] Upload to distribution platform

---

## Best Practices

### Code Style

- Follow Microsoft C# coding conventions
- Use meaningful variable names
- Add XML documentation comments
- Keep methods focused and small
- Use async/await for I/O operations

### Error Handling

```csharp
// Always use ErrorHandler for user-facing errors
try
{
    // Operation
}
catch (Exception ex)
{
    ErrorHandler.Handle(ex, "Operation Context");
    return Result.Failed;
}

// Use TrySilent for non-critical operations
ErrorHandler.TrySilent(() =>
{
    // Non-critical operation
}, "Context");
```

### Logging

```csharp
using Serilog;

private static readonly ILogger _logger = Log.ForContext<MyClass>();

_logger.Information("Operation started: {Operation}", operationName);
_logger.Warning("Potential issue: {Issue}", issue);
_logger.Error(ex, "Operation failed: {Operation}", operationName);
```

### Performance

- Cache frequently accessed data
- Use async/await for I/O
- Minimize Revit API calls
- Batch operations when possible
- Profile before optimizing

### Security

- Never log sensitive data
- Validate all user inputs
- Use parameterized queries
- Handle exceptions gracefully
- Follow least privilege principle

---

## Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Update documentation
6. Submit pull request

### Pull Request Guidelines

- Clear description of changes
- Link to related issues
- All tests passing
- Code follows style guidelines
- Documentation updated
- No merge conflicts

### Code Review Process

1. Automated checks run
2. Maintainer reviews code
3. Feedback addressed
4. Approved and merged

---

## Resources

### Documentation
- [Revit API Documentation](https://www.revitapidocs.com/)
- [WPF Documentation](https://docs.microsoft.com/en-us/dotnet/desktop/wpf/)
- [RestSharp Documentation](https://restsharp.dev/)

### Tools
- [ReSharper](https://www.jetbrains.com/resharper/) - Code quality
- [NuGet](https://www.nuget.org/) - Package management
- [WiX Toolset](https://wixtoolset.org/) - Installer creation

### Community
- GitHub Issues: Bug reports and feature requests
- Stack Overflow: Technical questions
- Revit API Forum: Revit-specific questions

---

**© 2024 BlockPlane. All rights reserved.**
