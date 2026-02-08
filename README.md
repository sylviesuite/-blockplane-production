# BlockPlane for Revit

**Sustainable Materials Database & Carbon Footprint Analysis Plugin**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/blockplane/revit-plugin)
[![Revit](https://img.shields.io/badge/Revit-2024%20%7C%202025-orange.svg)](https://www.autodesk.com/products/revit)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)

---

## 🌱 Overview

BlockPlane for Revit brings sustainable materials data and carbon footprint analysis directly into your Revit workflow. Make informed decisions to reduce embodied carbon and build more sustainably.

---

## BlackTent v1 Definition

BlackTent is a local-first safety environment for diagnosing development problems without exposing secrets or destabilizing working systems. It helps developers understand what is actually running, what is misconfigured, and where assumptions no longer match reality. BlackTent focuses on structure, state, and coherence rather than code rewriting or automated fixes.

BlackTent does not scan entire repositories, read secret values, or push changes. Its job is to reduce panic, prevent damage, and restore clarity so developers can make informed, confident decisions.

---

## When NOT to Use BlackTent

BlackTent is not the right tool when you are looking for automatic fixes, refactors, or code generation. It will not repair broken logic, optimize performance, rewrite configuration files, or replace debugging skill.

BlackTent is also not designed for production monitoring, cloud security scanning, or continuous background analysis. If your goal is speed through automation rather than safety through understanding, BlackTent will feel intentionally restrained.

Its value is in preventing irreversible mistakes, not in acting on your behalf.

---

## BlackTent Guarantees

BlackTent operates under strict, explicit guarantees designed to protect developers and their systems.

* **No secret exposure**

  BlackTent never reads, logs, or transmits secret values. Environment variables are treated as opaque: only presence, naming, and structure are evaluated.

* **No repository scanning**

  BlackTent does not crawl, index, or analyze entire codebases. It works only with explicitly provided context and runtime signals.

* **No automatic changes**

  BlackTent will not modify files, rewrite configuration, install dependencies, or apply fixes. All decisions remain human-controlled.

* **No background behavior**

  BlackTent runs only when invoked. It performs no continuous monitoring, telemetry, or hidden analysis.

* **Local-first by design**

  All diagnostics occur locally unless the developer explicitly chooses otherwise.

These guarantees are not optional features. They are architectural constraints.

---

## `blacktent doctor`

The `blacktent doctor` command runs a focused, read-only diagnostic on the current project. It is designed to give a calm summary of what BlackTent can see without changing any files, secrets, or configuration.

Expected behavior:

* Runs locally only

* Does not modify files or environment

* Does not read or print secret values

* Performs a small set of coherence checks (environment, dev server, basic tooling assumptions)

* Prints a short summary instead of a large log dump

Example output:

```text

BlackTent Doctor — Summary

Mode: local-only

Scope: current project


Checks run:

  ✓ Environment configuration

  ✓ Dev server / ports

  ✓ Tooling and runtime assumptions


Findings:

  - Environment: OK

  - Dev server: not running

  - Config & aliases: mismatches detected


Next steps:

  1. Start the dev server and confirm the expected port.

  2. Review alias configuration for unresolved paths.


BlackTent does not modify files or secrets. It only reports what it sees.

```

## 🛡️ Responsible transparency
BlockPlane highlights data confidence and assumptions so every recommendation can be evaluated alongside professional judgment. The platform surfaces methodology and limitations up front rather than obscuring them.

## ⚖️ Calibration, not claims
The tool is calibrated for early-stage comparison, not final specification. Carbon and cost figures are illustrative guidance, and users are encouraged to validate results with project-specific engineering, procurement, and code reviews.

### Key Features

- 🔍 **Material Browser** - Search and browse thousands of sustainable materials
- 📊 **Carbon Calculator** - Analyze project carbon footprint across all lifecycle stages
- 🔄 **Material Swap** - Replace materials with lower-carbon alternatives
- 📄 **Reports** - Generate professional PDF and CSV reports
- ⚡ **Real-time Analysis** - Instant feedback on carbon impact
- 🌍 **EN 15978 Compliant** - Standardized lifecycle assessment

---

## 🚀 Quick Start

### Installation

1. Download `BlockPlane.Installer.msi`
2. Run installer and follow prompts
3. Launch Revit 2024 or 2025
4. Look for **BlockPlane** tab in ribbon

### First Analysis

```
1. Open a Revit project
2. Click "Carbon Calculator" in BlockPlane tab
3. Wait for analysis to complete
4. Review carbon footprint breakdown
5. Explore optimization opportunities
```

**📖 [Read the Quick Start Guide](Documentation/QUICK_START.md)**

---

## 📚 Documentation

- **[User Guide](Documentation/UserGuide/USER_GUIDE.md)** - Complete end-user documentation
- **[Developer Guide](Documentation/DeveloperGuide/DEVELOPER_GUIDE.md)** - Technical documentation for developers
- **[Quick Start](Documentation/QUICK_START.md)** - Get started in 5 minutes
- **[Installer Guide](Installer/README.md)** - Building and deploying the installer
- **[Test Guide](RevitPlugin.Tests/README.md)** - Running and writing tests

---

## 🏗️ Project Structure

```
blockplane-clean/
├── RevitPlugin/                 # Main plugin source code
│   ├── src/
│   │   ├── Core/               # Core application logic
│   │   ├── Commands/           # Revit commands
│   │   ├── Services/           # Business logic services
│   │   ├── BIM/                # BIM data extraction
│   │   ├── UI/                 # WPF user interface
│   │   ├── Reports/            # Report generation
│   │   ├── Models/             # Data models
│   │   ├── Exceptions/         # Error handling
│   │   └── Validation/         # Input validation
│   └── BlockPlane.RevitPlugin.csproj
├── RevitPlugin.Tests/          # Unit and integration tests
│   ├── Services/
│   ├── BIM/
│   ├── Reports/
│   ├── Validation/
│   └── Mocks/
├── Installer/                  # MSI installer project
│   ├── Product.wxs
│   ├── Scripts/
│   └── Templates/
├── Documentation/              # Comprehensive documentation
│   ├── UserGuide/
│   ├── DeveloperGuide/
│   └── Images/
└── README.md                   # This file
```

---

## 🛠️ Technology Stack

- **.NET Framework 4.8** - Core framework
- **C# 7.3** - Programming language
- **WPF** - User interface
- **Revit API 2024/2025** - Revit integration
- **RestSharp** - HTTP client
- **SQLite** - Local caching
- **Serilog** - Logging
- **iTextSharp** - PDF generation
- **NUnit** - Testing framework

---

## 🎯 Features in Detail

### Material Browser

Browse and search thousands of sustainable materials with:
- Real-time search
- Category filtering (Timber, Steel, Concrete, Earth, etc.)
- RIS (Regenerative Impact Score) filtering
- Carbon footprint filtering
- Detailed material information
- Certifications and compliance data

### Carbon Calculator

Comprehensive project analysis with:
- Total embodied carbon calculation
- EN 15978 lifecycle breakdown (A1-A5, B, C1-C4)
- Top carbon contributors identification
- Optimization potential analysis
- Material matching with confidence levels
- Element-level quantity extraction

### Material Swap

Interactive material replacement with:
- Element selection (pick or use current selection)
- Alternative material recommendations
- Match scoring algorithm (0-100)
- Carbon and cost impact comparison
- Confirmation dialog with preview
- Transaction-based swap with rollback
- Swap history logging

### Reports & Export

Professional reporting with:
- **PDF Reports**: Multi-page reports with cover page, executive summary, lifecycle breakdown, top contributors, and recommendations
- **CSV Exports**: Project analysis, material usage, element details, material comparisons
- Customizable templates
- Stakeholder-ready formatting

---

## 📊 Architecture

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

### Key Components

- **Application.cs** - Main entry point, service initialization, ribbon UI
- **MaterialService** - Material data access and caching
- **ProjectService** - Revit project analysis and material extraction
- **SwapService** - Material replacement logic
- **ElementQuantityExtractor** - Quantity extraction from Revit elements
- **MaterialMapper** - Intelligent material matching with fuzzy search
- **ProjectAnalyzer** - Complete project analysis orchestration
- **CSVExporter** - CSV report generation
- **PDFReportGenerator** - Professional PDF reports

---

## 🧪 Testing

### Running Tests

```bash
# Visual Studio
Test → Run All Tests

# Command line
dotnet test RevitPlugin.Tests.csproj

# With coverage
dotnet test /p:CollectCoverage=true
```

### Test Coverage

- **Service Layer**: 90%+ coverage
- **Validation Logic**: 95%+ coverage
- **BIM Extraction**: 80%+ coverage
- **Overall**: 85%+ coverage

**📖 [Read the Test Guide](RevitPlugin.Tests/README.md)**

---

## 🔨 Building

### Prerequisites

- Visual Studio 2019 or later
- .NET Framework 4.8 SDK
- Revit 2024 or 2025 (for testing)
- WiX Toolset v3.11 (for installer)

### Build Plugin

```bash
# Visual Studio
Build → Build Solution

# Command line
msbuild BlockPlane.RevitPlugin.sln /p:Configuration=Release
```

### Build Installer

```powershell
cd Installer\Scripts
.\Build-Installer.ps1 -Configuration Release
```

**📖 [Read the Installer Guide](Installer/README.md)**

---

## 📦 Installation

### System Requirements

- **Revit**: 2024 or 2025
- **OS**: Windows 10 or later (64-bit)
- **RAM**: 8 GB minimum, 16 GB recommended
- **Internet**: Required for material database access
- **Disk Space**: 200 MB

### Installation Steps

1. Download `BlockPlane.Installer.msi`
2. Double-click to run
3. Follow installation wizard
4. Launch Revit
5. Look for BlockPlane tab in ribbon

**📖 [Read the User Guide](Documentation/UserGuide/USER_GUIDE.md)**

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Update documentation
6. Submit pull request

**📖 [Read the Developer Guide](Documentation/DeveloperGuide/DEVELOPER_GUIDE.md)**

---

## 📝 License

This project is proprietary software. See [LICENSE](LICENSE) for details.

---

## 🆘 Support

### Getting Help

- **Documentation**: Check the guides above
- **Email**: support@blockplane.com
- **Website**: https://blockplane.com/support
- **Issues**: GitHub Issues for bug reports

### Reporting Issues

When reporting issues, please include:
- Revit version
- Plugin version
- Steps to reproduce
- Error messages
- Log files (if applicable)

---

## 🗺️ Roadmap

### Version 1.1 (Planned)
- [ ] Revit 2026 support
- [ ] Additional material categories
- [ ] Enhanced reporting templates
- [ ] Batch material swap
- [ ] Project comparison tool

### Version 1.2 (Planned)
- [ ] Real-time collaboration
- [ ] Custom material database
- [ ] Advanced filtering options
- [ ] API for third-party integration
- [ ] Mobile companion app

---

## 📊 Statistics

- **~9,500 lines** of production C# code
- **45+ files** across multiple projects
- **11 phases** of development completed
- **85%+ test coverage**
- **4 major components** (UI, Services, BIM, Reports)
- **Supports 2 Revit versions** (2024, 2025)

---

## 🙏 Acknowledgments

- Autodesk for the Revit API
- BlockPlane team for the materials database
- Open source community for libraries and tools

---

## 📧 Contact

- **Website**: https://blockplane.com
- **Email**: info@blockplane.com
- **Support**: support@blockplane.com
- **Sales**: sales@blockplane.com

---

**© 2024 BlockPlane. All rights reserved.**

**Building a sustainable future, one material at a time. 🌱**
