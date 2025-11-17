# BlockPlane Revit Plugin - Installer

This directory contains the MSI installer package for the BlockPlane Revit Plugin.

## Prerequisites

### Required Software
1. **Visual Studio 2019 or later** with MSBuild
2. **WiX Toolset v3.11 or later**
   - Download from: https://wixtoolset.org/releases/
   - Install the WiX Toolset build tools

### Supported Revit Versions
- Autodesk Revit 2024
- Autodesk Revit 2025

## Building the Installer

### Using PowerShell Script (Recommended)
```powershell
# Navigate to Scripts directory
cd Installer\Scripts

# Build installer (Release configuration)
.\Build-Installer.ps1

# Build with clean
.\Build-Installer.ps1 -Clean

# Build Debug configuration
.\Build-Installer.ps1 -Configuration Debug
```

### Using Visual Studio
1. Open the solution in Visual Studio
2. Set configuration to "Release"
3. Right-click on `BlockPlane.Installer` project
4. Select "Build"

### Using Command Line
```cmd
# Build plugin first
msbuild ..\RevitPlugin\BlockPlane.RevitPlugin.csproj /p:Configuration=Release

# Build installer
msbuild BlockPlane.Installer.wixproj /p:Configuration=Release /p:Platform=x64
```

## Installer Structure

```
Installer/
├── Product.wxs                    # Main WiX installer definition
├── BlockPlane.Installer.wixproj   # WiX project file
├── Scripts/
│   └── Build-Installer.ps1        # Build automation script
├── Resources/
│   ├── License.rtf                # License agreement
│   └── BlockPlane.ico             # Application icon
└── Templates/
    └── BlockPlane.addin           # Revit add-in manifest
```

## Installation Process

### What Gets Installed

1. **Plugin Files** (C:\Program Files\BlockPlane\Revit Plugin\)
   - BlockPlane.RevitPlugin.dll (main plugin)
   - Dependencies (RestSharp, Newtonsoft.Json, SQLite, Serilog, iTextSharp)
   - Configuration files

2. **Add-in Manifests**
   - C:\ProgramData\Autodesk\Revit\Addins\2024\BlockPlane.addin
   - C:\ProgramData\Autodesk\Revit\Addins\2025\BlockPlane.addin

3. **Registry Entries**
   - HKLM\Software\BlockPlane\Revit Plugin
   - Installation path, version, and date

4. **Start Menu Shortcuts**
   - Uninstall shortcut

### Installation Steps

1. **Run the MSI installer**
   ```
   BlockPlane.Installer.msi
   ```

2. **Follow the installation wizard**
   - Accept license agreement
   - Choose installation directory (default: C:\Program Files\BlockPlane\Revit Plugin)
   - Click Install

3. **Launch Revit**
   - The BlockPlane ribbon tab will appear automatically
   - If not visible, check Add-Ins → External Tools

## Uninstallation

### Method 1: Control Panel
1. Open "Programs and Features"
2. Find "BlockPlane for Revit"
3. Click "Uninstall"

### Method 2: Start Menu
1. Open Start Menu
2. Navigate to "BlockPlane for Revit"
3. Click "Uninstall BlockPlane for Revit"

### Method 3: Command Line
```cmd
msiexec /x {ProductCode} /qn
```

## Upgrading

The installer supports automatic upgrades:
- Installing a newer version will automatically remove the old version
- User settings and cache are preserved
- No manual uninstall required

## Customization

### Changing Version Number
Edit `Product.wxs`:
```xml
<?define ProductVersion="1.0.0.0" ?>
```

### Adding Files
Add to `ProductComponents` or `DependencyComponents` in `Product.wxs`:
```xml
<Component Id="NewFile" Guid="UNIQUE-GUID-HERE">
  <File Id="NewFile.dll" 
        Source="path\to\file.dll" 
        KeyPath="yes" />
</Component>
```

### Supporting Additional Revit Versions
Add new component in `AddinManifest` group:
```xml
<Component Id="AddinManifest2026" Directory="Addins2026" Guid="UNIQUE-GUID">
  <File Id="BlockPlane2026.addin" 
        Source="Templates\BlockPlane.addin" 
        KeyPath="yes" />
</Component>
```

## Troubleshooting

### Build Errors

**Error: WiX Toolset not found**
- Solution: Install WiX Toolset v3.11 from https://wixtoolset.org/

**Error: Plugin DLL not found**
- Solution: Build the plugin project first in Release configuration

**Error: GUID conflicts**
- Solution: Generate new GUIDs for components (use `[Guid]::NewGuid()` in PowerShell)

### Installation Errors

**Error: Another version is already installed**
- Solution: Uninstall the existing version first, or update the UpgradeCode

**Error: Insufficient permissions**
- Solution: Run installer as Administrator

**Error: Revit doesn't load the plugin**
- Solution: Check that the .addin file points to the correct DLL path

## Testing

### Test Installation
1. Build installer in Debug configuration
2. Install on a test machine
3. Launch Revit and verify plugin loads
4. Test all features
5. Uninstall and verify clean removal

### Test Upgrade
1. Install version 1.0.0
2. Build version 1.0.1 with new version number
3. Install version 1.0.1
4. Verify automatic upgrade
5. Check that settings are preserved

## Distribution

### Internal Testing
- Distribute MSI file directly
- Include installation instructions

### Public Release
1. Sign the MSI with a code signing certificate
2. Create release notes
3. Upload to distribution platform
4. Provide download link and documentation

## Code Signing (Optional)

To sign the MSI installer:
```cmd
signtool sign /f certificate.pfx /p password /t http://timestamp.server.com BlockPlane.Installer.msi
```

## Continuous Integration

### Azure DevOps Pipeline
```yaml
- task: MSBuild@1
  inputs:
    solution: 'Installer/BlockPlane.Installer.wixproj'
    configuration: 'Release'
    platform: 'x64'
```

### GitHub Actions
```yaml
- name: Build Installer
  run: |
    msbuild Installer/BlockPlane.Installer.wixproj /p:Configuration=Release /p:Platform=x64
```

## Support

For installer-related issues:
- Check WiX documentation: https://wixtoolset.org/documentation/
- Review build logs in `Installer/obj/Release/`
- Contact development team

## License

The installer is part of the BlockPlane Revit Plugin and is subject to the same license terms.
