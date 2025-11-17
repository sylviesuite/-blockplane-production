# BlockPlane for Revit - User Guide

**Version 1.0.0**  
**Last Updated: 2024**

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [Features](#features)
5. [Material Browser](#material-browser)
6. [Carbon Calculator](#carbon-calculator)
7. [Material Swap](#material-swap)
8. [Reports and Export](#reports-and-export)
9. [Settings](#settings)
10. [Troubleshooting](#troubleshooting)
11. [FAQ](#faq)
12. [Support](#support)

---

## Introduction

### What is BlockPlane?

BlockPlane for Revit is a powerful plugin that brings sustainable materials data and carbon footprint analysis directly into your Revit workflow. With access to a comprehensive database of sustainable building materials, you can:

- **Browse** thousands of sustainable materials with detailed environmental data
- **Analyze** your project's carbon footprint across all lifecycle stages
- **Optimize** material selections to reduce embodied carbon
- **Compare** alternative materials side-by-side
- **Generate** professional reports for stakeholders

### Key Benefits

- ✅ **Reduce Carbon Footprint**: Make informed decisions to minimize embodied carbon
- ✅ **Access Sustainable Materials**: Browse a curated database of eco-friendly materials
- ✅ **Save Time**: Integrated directly into Revit workflow
- ✅ **Generate Reports**: Professional PDF and CSV exports
- ✅ **Meet Standards**: EN 15978 compliant lifecycle assessments

### ⚠️ Important: When NOT to Use This Plugin

**This plugin is a guidance tool, not a replacement for professional judgment.** Before relying on results for critical decisions, please understand these limitations:

**❌ Do NOT use as the sole basis for:**
- Regulatory carbon reporting (verify independently)
- LEED/BREEAM certification submissions (requires verification)
- Legal or contractual carbon claims
- Whole-building net zero claims (this only covers embodied carbon)
- Replacing professional carbon consultants

**✅ DO use for:**
- Early-stage material exploration and comparison
- Identifying high-carbon materials in your design
- Guiding sustainable material selection
- Preliminary carbon assessments
- Educational purposes

**Always verify high-impact materials and critical decisions.** See [LIMITATIONS.md](../LIMITATIONS.md) and [VERIFICATION_GUIDE.md](../VERIFICATION_GUIDE.md) for details.

### 🔍 Data Quality & Honesty

**We believe in radical transparency:**

- **Material matching is probabilistic** - We show confidence scores (High/Medium/Low) for every match
- **EPD data may be outdated** - We show publication dates and flag stale data
- **Assumptions are documented** - Transport distances, service life, etc. are clearly stated
- **Limitations are disclosed** - Every report includes a "Data Quality" section

**Our commitment:** We will NEVER hide uncertainties or overstate capabilities. If you see a low confidence score or data quality warning, take it seriously and verify independently.

### System Requirements

- **Revit**: 2024 or 2025
- **Operating System**: Windows 10 or later (64-bit)
- **RAM**: 8 GB minimum, 16 GB recommended
- **Internet**: Required for material database access (offline mode available with cached data)
- **Disk Space**: 200 MB for installation

### Prerequisites & Knowledge

**To use this plugin effectively, you should:**
- Understand basic embodied carbon concepts (A1-A5, B, C1-C4 lifecycle stages)
- Know how to assign materials in Revit
- Have a BIM model at LOD 300+ for accurate quantity extraction
- Be familiar with EPDs (Environmental Product Declarations)

**If you're new to embodied carbon:**
- Read our [Methodology Guide](../METHODOLOGY.md) first
- Consider taking a carbon literacy course
- Consult with a sustainability professional for critical projects

---

## Installation

### Step 1: Download the Installer

Download the latest `BlockPlane.Installer.msi` from:
- Official website: https://blockplane.com/downloads
- Or from your organization's software portal

### Step 2: Run the Installer

1. **Double-click** the MSI file
2. Click **Next** on the welcome screen
3. **Accept** the license agreement
4. Choose **installation directory** (default recommended)
5. Click **Install**
6. Wait for installation to complete
7. Click **Finish**

### Step 3: Launch Revit

1. Open Autodesk Revit 2024 or 2025
2. Look for the **BlockPlane** tab in the ribbon
3. If you don't see it, go to **Add-Ins → External Tools**

### Verification

To verify installation:
1. Open Revit
2. Click the **BlockPlane** tab
3. You should see buttons for Browser, Calculator, Swap, and Settings

---

## Getting Started

### First Launch

When you first launch BlockPlane:

1. **Open a Revit project** (or create a new one)
2. Click the **BlockPlane** tab in the ribbon
3. Click **Settings** to configure your preferences
4. Set your **default region** for pricing
5. Configure **cache settings** if needed
6. Click **Test Connection** to verify API access

### Quick Start Workflow

1. **Browse Materials**
   - Click **Material Browser**
   - Search for materials by name or category
   - Filter by RIS score, carbon footprint, or regenerative status

2. **Analyze Project**
   - Click **Carbon Calculator**
   - Wait for analysis to complete
   - Review carbon footprint breakdown

3. **Optimize Materials**
   - Select elements in your model
   - Click **Material Swap**
   - Choose a lower-carbon alternative
   - Confirm the swap

4. **Generate Report**
   - After analysis, click **Export PDF**
   - Choose save location
   - Share with stakeholders

---

## Features

### Material Browser

**Access**: BlockPlane tab → Material Browser

The Material Browser provides access to thousands of sustainable materials with detailed environmental data.

#### Search and Filter

**Search by Name**
- Enter material name or keywords
- Results update in real-time
- Use specific terms for better results

**Filter by Category**
- Timber
- Steel
- Concrete
- Earth
- Insulation
- Composites
- Masonry

**Filter by RIS (Regenerative Impact Score)**
- Minimum RIS: 0-100
- Higher scores indicate better sustainability
- Regenerative materials: RIS ≥ 70

**Filter by Carbon Footprint**
- Maximum carbon: kg CO₂e per unit
- Filter by lifecycle stage (A1-A5, B, C1-C4)

**Filter by Regenerative Status**
- Show only regenerative materials
- Materials that restore ecosystems

#### Material Details

Click any material to view:
- **Basic Information**: Name, category, manufacturer
- **Sustainability Scores**: RIS, LIS (Local Impact Score)
- **Carbon Footprint**: Complete lifecycle breakdown
- **Pricing**: Regional pricing data
- **Certifications**: FSC, LEED, Cradle to Cradle, etc.
- **Description**: Detailed material information

#### Using Materials

From the Material Browser, you can:
- **View Details**: Click material name
- **Find Alternatives**: Right-click → Find Alternatives
- **Copy ID**: For API integration
- **Export Data**: Save material data to CSV

---

### Carbon Calculator

**Access**: BlockPlane tab → Carbon Calculator

The Carbon Calculator analyzes your entire project and calculates the embodied carbon footprint.

#### Running an Analysis

1. **Open your Revit project**
2. Click **Carbon Calculator**
3. Wait for analysis (may take 1-5 minutes for large projects)
4. Review results in the analysis window

#### Analysis Results

**Summary**
- **Total Carbon**: Total embodied carbon (kg CO₂e)
- **Material Count**: Number of different materials
- **Element Count**: Number of building elements analyzed
- **Total Cost**: Estimated material cost

**Lifecycle Breakdown**
- **A1-A3**: Product stage (raw materials, transport, manufacturing)
- **A4**: Transport to site
- **A5**: Installation
- **B**: Use phase (maintenance, repair, replacement)
- **C1-C4**: End of life (deconstruction, transport, processing, disposal)

**Top Contributors**
- List of materials contributing most to carbon footprint
- Percentage of total carbon
- Recommendations for alternatives

**Optimization Potential**
- **Potential Savings**: How much carbon could be saved
- **Savings Percentage**: Percentage reduction possible
- **Recommended Swaps**: Number of material swap opportunities

#### Material Matching

The calculator automatically matches Revit materials to the BlockPlane database:

- **High Confidence**: Exact or very close match
- **Medium Confidence**: Good match with some uncertainty
- **Low Confidence**: Approximate match
- **Unmatched**: No suitable match found

You can manually review and adjust matches if needed.

---

### Material Swap

**Access**: BlockPlane tab → Material Swap

The Material Swap tool helps you replace materials in your project with lower-carbon alternatives.

#### Swapping a Material

**Method 1: Select Elements First**
1. Select elements in your Revit model
2. Click **Material Swap**
3. Plugin extracts material from selection
4. Review alternatives
5. Choose replacement
6. Confirm swap

**Method 2: Pick Elements**
1. Click **Material Swap**
2. Click **Pick Elements**
3. Select elements in the model
4. Review alternatives
5. Choose replacement
6. Confirm swap

#### Choosing an Alternative

The alternatives window shows:
- **Current Material**: What you're replacing
- **Alternative Materials**: Sorted by match score
- **Match Score**: How similar to current material (0-100)
- **Carbon Comparison**: Carbon savings
- **Cost Comparison**: Cost difference
- **Key Properties**: RIS, category, certifications

**Match Score Factors**:
- Category match (40%)
- RIS similarity (30%)
- Carbon footprint similarity (20%)
- Physical properties (10%)

#### Confirming the Swap

Before swapping, review:
- **Elements Affected**: Number of elements that will change
- **Carbon Impact**: How much carbon will be saved/added
- **Cost Impact**: How much cost will change
- **Reversibility**: Swaps can be undone with Ctrl+Z

Click **Confirm Swap** to apply changes.

#### Swap History

All swaps are logged:
- Date and time
- Original material
- New material
- Carbon savings
- Cost impact

Access history: Settings → View Swap History

---

## Reports and Export

### PDF Reports

**Generate a PDF Report**:
1. Run Carbon Calculator
2. Click **Export PDF**
3. Choose save location
4. Wait for generation (10-30 seconds)

**Report Contents**:
- **Cover Page**: Project name, key metrics, date
- **Executive Summary**: Overview and key findings
- **Lifecycle Breakdown**: Carbon by stage
- **Top Contributors**: Highest-carbon materials
- **Material Details**: Complete material list
- **Optimization Recommendations**: Suggested improvements

**Use Cases**:
- Client presentations
- Sustainability reports
- LEED documentation
- Internal reviews

### CSV Exports

**Export Types**:

**1. Project Analysis**
- Complete analysis summary
- Lifecycle breakdown
- Top contributors
- Optimization potential

**2. Material Usage**
- Material-by-material breakdown
- Quantities and units
- Carbon and cost per material
- Match confidence levels

**3. Element Details**
- Element-level data
- Material assignments
- Quantities per element
- Useful for detailed analysis

**4. Material Comparison**
- Side-by-side comparison
- Current vs. alternatives
- Carbon and cost differences
- For decision-making

**Exporting CSV**:
1. Run analysis or open comparison
2. Click **Export CSV**
3. Choose export type
4. Select save location
5. Open in Excel or other tools

---

## Settings

**Access**: BlockPlane tab → Settings

### API Configuration

**API URL**
- Default: https://api.blockplane.com
- Change only if using a private instance
- Click **Test Connection** to verify

**Timeout**
- Default: 30 seconds
- Increase for slow connections
- Decrease for faster failure detection

### Cache Settings

**Enable Cache**
- Stores material data locally
- Reduces API calls
- Improves performance

**Cache Duration**
- How long to keep cached data
- Default: 24 hours
- Range: 1 hour to 7 days

**Clear Cache**
- Removes all cached data
- Forces fresh data from API
- Use if data seems outdated

### Default Preferences

**Default Region**
- Used for pricing calculations
- Options: North America, Europe, Asia, etc.
- Can be overridden per-analysis

**Auto-Calculate on Open**
- Automatically run analysis when opening projects
- Useful for monitoring carbon over time
- Disable for large projects

**Show Confirmations**
- Confirm before material swaps
- Confirm before large exports
- Recommended: Keep enabled

### Advanced

**Log Level**
- Information: Normal logging
- Debug: Detailed logging for troubleshooting
- Warning: Only warnings and errors

**Log Location**
- View current log files
- Useful for troubleshooting
- Share with support if needed

---

## Troubleshooting

### Plugin Not Loading

**Symptoms**: BlockPlane tab doesn't appear in Revit

**Solutions**:
1. Check Revit version (2024 or 2025 required)
2. Verify installation: Control Panel → Programs
3. Check add-in manifest:
   - Location: `C:\ProgramData\Autodesk\Revit\Addins\{Version}\BlockPlane.addin`
   - Verify DLL path is correct
4. Restart Revit
5. Check Revit's Add-In Manager for errors

### Connection Errors

**Symptoms**: "Failed to connect to BlockPlane server"

**Solutions**:
1. Check internet connection
2. Test connection in Settings
3. Verify firewall isn't blocking
4. Check proxy settings
5. Try increasing timeout in Settings
6. Contact IT if behind corporate firewall

### Material Matching Issues

**Symptoms**: Many materials show as "Unmatched"

**Solutions**:
1. Use more specific material names in Revit
2. Manually search in Material Browser
3. Check material category assignments
4. Review material class in Revit properties
5. Contact support to add materials to database

### Slow Performance

**Symptoms**: Analysis takes very long

**Solutions**:
1. Enable cache in Settings
2. Close other applications
3. Analyze smaller portions of project
4. Check internet speed
5. Increase cache duration
6. Run during off-peak hours

### Swap Failures

**Symptoms**: Material swap fails or rolls back

**Solutions**:
1. Check elements aren't locked
2. Verify you have edit permissions
3. Close other transactions in Revit
4. Try swapping fewer elements at once
5. Check Revit warnings/errors
6. Restart Revit if persistent

---

## FAQ

**Q: Is an internet connection required?**  
A: Yes, for accessing the material database. However, cached data can be used offline for limited functionality.

**Q: How accurate are the carbon calculations?**  
A: Carbon data is sourced from Environmental Product Declarations (EPDs) and follows EN 15978 standards. Accuracy depends on material matching quality.

**Q: Can I add my own materials?**  
A: Not directly in the plugin. Contact BlockPlane to add materials to the database.

**Q: Does it work with Revit LT?**  
A: No, Revit LT doesn't support plugins. Full Revit 2024 or 2025 is required.

**Q: How much does it cost?**  
A: Contact BlockPlane for pricing: https://blockplane.com/pricing

**Q: Can I use it on multiple computers?**  
A: Yes, with appropriate licensing. Check your license agreement.

**Q: Does it support metric and imperial units?**  
A: Yes, both unit systems are supported. The plugin uses Revit's project units.

**Q: Can I export data to other tools?**  
A: Yes, via CSV exports which can be imported into Excel, Power BI, etc.

**Q: Is my project data sent to BlockPlane?**  
A: Only material names and quantities for matching. No geometry or other project data is transmitted.

**Q: How often is the material database updated?**  
A: The database is continuously updated. Your plugin accesses the latest data via the API.

---

## Support

### Getting Help

**Documentation**
- User Guide (this document)
- Video tutorials: https://blockplane.com/tutorials
- Knowledge base: https://help.blockplane.com

**Contact Support**
- Email: support@blockplane.com
- Phone: +1 (555) 123-4567
- Hours: Monday-Friday, 9 AM - 5 PM EST

**Before Contacting Support**
1. Check this guide and FAQ
2. Review troubleshooting section
3. Check log files for errors
4. Note your Revit version and plugin version
5. Prepare screenshots if applicable

### Providing Feedback

We value your feedback!
- Feature requests: feedback@blockplane.com
- Bug reports: bugs@blockplane.com
- General feedback: Use in-app feedback form

### Community

- Forum: https://community.blockplane.com
- LinkedIn: BlockPlane Official
- Twitter: @BlockPlane

---

## Appendix

### Glossary

**Embodied Carbon**: Total greenhouse gas emissions associated with materials throughout their lifecycle

**RIS (Regenerative Impact Score)**: 0-100 score indicating material's environmental impact and regenerative potential

**LIS (Local Impact Score)**: 0-100 score indicating local environmental and social impact

**EPD (Environmental Product Declaration)**: Standardized document reporting environmental impact

**LCA (Lifecycle Assessment)**: Method for assessing environmental impacts across a product's lifecycle

**EN 15978**: European standard for assessing environmental performance of buildings

### Keyboard Shortcuts

- **Ctrl+B**: Open Material Browser
- **Ctrl+K**: Open Carbon Calculator
- **Ctrl+M**: Open Material Swap
- **Ctrl+,**: Open Settings
- **F1**: Open Help

### Version History

**Version 1.0.0** (2024)
- Initial release
- Material Browser
- Carbon Calculator
- Material Swap
- PDF/CSV Reports
- Revit 2024 & 2025 support

---

**© 2024 BlockPlane. All rights reserved.**
