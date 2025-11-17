# BlockPlane Revit Plugin - Technical Architecture

## Executive Summary

The BlockPlane Revit Plugin is an enterprise-grade add-in that integrates sustainable material specification directly into Autodesk Revit. It provides architects with instant access to 85+ sustainable materials, carbon impact calculations, and one-click material substitutions—all without leaving their BIM workflow.

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        REVIT APPLICATION                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           BlockPlane Revit Plugin (C# .NET)           │  │
│  │                                                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │  UI Layer    │  │ Business     │  │  Data Layer │ │  │
│  │  │  (WPF)       │◄─┤  Logic       │◄─┤  (Cache)    │ │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │  │
│  │         │                  │                  │        │  │
│  │         └──────────────────┼──────────────────┘        │  │
│  │                            │                           │  │
│  │                   ┌────────▼────────┐                  │  │
│  │                   │  API Client     │                  │  │
│  │                   │  (RestSharp)    │                  │  │
│  │                   └────────┬────────┘                  │  │
│  └────────────────────────────┼──────────────────────────┘  │
└────────────────────────────────┼──────────────────────────────┘
                                 │ HTTPS
                                 ▼
                    ┌────────────────────────┐
                    │  BlockPlane REST API   │
                    │  (Public API Router)   │
                    └────────────────────────┘
```

---

## Component Architecture

### 1. UI Layer (WPF)

**Purpose:** Provide intuitive, non-intrusive interface within Revit

**Components:**
- **MaterialBrowserPanel** - Dockable panel for material search/browse
- **MaterialDetailsDialog** - Modal showing full material information
- **ComparisonDialog** - Side-by-side material comparison (up to 5)
- **CarbonReportPanel** - Project-level carbon dashboard
- **SettingsDialog** - Plugin configuration and API key management

**Design Principles:**
- Match Revit's native UI style (dark theme, Autodesk fonts)
- Keyboard shortcuts for power users
- Responsive layout (works on 1920x1080 and 4K displays)
- Accessibility compliant (screen reader support)

---

### 2. Business Logic Layer

**Purpose:** Orchestrate plugin functionality and enforce business rules

**Services:**

#### MaterialService
- Search and filter materials
- Map Revit materials to BlockPlane database
- Calculate carbon footprint
- Generate material recommendations

#### ProjectService
- Extract BIM data from Revit model
- Calculate material quantities
- Generate Bill of Materials (BOM)
- Track material assignments

#### SwapService
- Validate material compatibility
- Apply material swaps to elements
- Maintain swap history
- Support undo/redo operations

#### ReportService
- Generate carbon reports (PDF)
- Export BOMs (CSV, Excel)
- Create specification documents
- Generate case studies

---

### 3. Data Layer

**Purpose:** Manage local data storage and synchronization

**Components:**

#### LocalCache (SQLite)
```sql
-- Materials table
CREATE TABLE materials (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    carbon_a1_a3 REAL,
    carbon_a4 REAL,
    carbon_a5 REAL,
    carbon_b REAL,
    carbon_c1_c4 REAL,
    ris_score INTEGER,
    lis_score INTEGER,
    cost_per_unit REAL,
    functional_unit TEXT,
    last_synced TIMESTAMP
);

-- Project materials (user's current project)
CREATE TABLE project_materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    revit_material_id TEXT NOT NULL,
    revit_material_name TEXT NOT NULL,
    blockplane_material_id INTEGER,
    quantity REAL,
    unit TEXT,
    last_updated TIMESTAMP
);

-- Swap history (audit trail)
CREATE TABLE swap_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT,
    timestamp TIMESTAMP,
    from_material_id INTEGER,
    to_material_id INTEGER,
    element_count INTEGER,
    carbon_savings REAL,
    user_name TEXT
);
```

**Sync Strategy:**
- Full sync on plugin startup (if online)
- Incremental sync every 24 hours
- Manual refresh button in UI
- Queue operations when offline, sync when online

---

### 4. API Client Layer

**Purpose:** Reliable communication with BlockPlane REST API

**Implementation:**

```csharp
public class BlockPlaneAPIClient
{
    private readonly RestClient _client;
    private readonly string _apiKey;
    private readonly ILogger _logger;
    
    // Retry policy: 3 attempts with exponential backoff
    private readonly RetryPolicy _retryPolicy;
    
    public async Task<List<Material>> GetMaterials(MaterialFilter filter)
    {
        try
        {
            var request = new RestRequest("/api/trpc/publicAPI.getMaterials");
            request.AddQueryParameter("category", filter.Category);
            request.AddQueryParameter("minRIS", filter.MinRIS);
            request.AddQueryParameter("maxCarbon", filter.MaxCarbon);
            
            var response = await _retryPolicy.ExecuteAsync(() => 
                _client.ExecuteAsync<MaterialsResponse>(request)
            );
            
            if (response.IsSuccessful)
            {
                _logger.Info($"Retrieved {response.Data.Materials.Count} materials");
                return response.Data.Materials;
            }
            else
            {
                _logger.Error($"API error: {response.StatusCode}");
                throw new APIException(response.ErrorMessage);
            }
        }
        catch (Exception ex)
        {
            _logger.Error("Failed to get materials", ex);
            throw;
        }
    }
}
```

**Error Handling:**
- Network timeouts → Show cached data + "Offline" indicator
- 401 Unauthorized → Prompt for API key
- 429 Rate Limit → Queue request, retry after delay
- 500 Server Error → Log error, show user-friendly message

---

## Data Flow Diagrams

### Material Search Flow

```
User enters search query
         │
         ▼
UI validates input
         │
         ▼
Check local cache first
         │
    ┌────┴────┐
    │ Found?  │
    └────┬────┘
         │
    Yes  │  No
    ┌────┴────┐
    │         │
    ▼         ▼
Return    Query API
cached    with retry
data          │
    │         ▼
    │    Cache results
    │         │
    └────┬────┘
         ▼
Display in UI
```

### Material Swap Flow

```
User selects material to swap
         │
         ▼
Show BlockPlane alternatives
         │
         ▼
User selects replacement
         │
         ▼
Calculate carbon savings
         │
         ▼
Show confirmation dialog
         │
    ┌────┴────┐
    │ Confirm?│
    └────┬────┘
         │ Yes
         ▼
Start Revit transaction
         │
         ▼
Get all elements with material
         │
         ▼
Apply new material assignment
         │
         ▼
Update element parameters
         │
         ▼
Commit transaction
         │
         ▼
Log swap to history
         │
         ▼
Show success message
```

---

## Security Architecture

### API Key Management

**Storage:** Windows Credential Manager (secure, encrypted)
**Access:** Only plugin process can read
**Rotation:** Support for key updates without reinstall

### Data Privacy

**Local Data:** Encrypted SQLite database
**Network:** HTTPS only, TLS 1.2+
**Logging:** No sensitive data in logs (PII, API keys)

### Code Signing

**Certificate:** Autodesk-approved code signing cert
**Verification:** Digital signature on all DLLs
**Trust:** Users see verified publisher name

---

## Performance Requirements

### Response Times

| Operation | Target | Maximum |
|-----------|--------|---------|
| Material search | < 1s | 2s |
| Material swap | < 3s | 5s |
| Carbon calculation | < 2s | 4s |
| Report generation | < 5s | 10s |
| Plugin startup | < 3s | 5s |

### Scalability

- Support projects with 10,000+ elements
- Handle 1,000+ material assignments
- Cache up to 100 MB of material data
- Process BOMs with 500+ line items

---

## Error Handling Strategy

### Error Categories

1. **User Errors** (validation failures)
   - Show inline validation messages
   - Highlight invalid fields
   - Provide correction hints

2. **Network Errors** (API unavailable)
   - Fall back to cached data
   - Show "Offline Mode" indicator
   - Queue operations for later sync

3. **Revit API Errors** (BIM operations fail)
   - Roll back transactions
   - Show detailed error message
   - Offer "Report Issue" button

4. **Critical Errors** (unexpected crashes)
   - Log full stack trace
   - Send crash report (with user consent)
   - Attempt graceful shutdown
   - Preserve user data

### Logging Levels

- **DEBUG:** Detailed execution flow (dev only)
- **INFO:** Normal operations (search, swap, sync)
- **WARN:** Recoverable errors (network timeout, cache miss)
- **ERROR:** Failures requiring user action
- **FATAL:** Unrecoverable crashes

---

## Deployment Architecture

### Installation Process

1. User downloads `BlockPlaneRevitPlugin.msi`
2. Installer detects Revit versions (2021-2024)
3. Copies files to `%AppData%\Autodesk\Revit\Addins\{version}\BlockPlane\`
4. Creates `.addin` manifest in Addins folder
5. Registers uninstaller in Windows
6. Launches quick start guide

### File Structure

```
%AppData%\Autodesk\Revit\Addins\2024\
├── BlockPlane.addin                    # Manifest file
└── BlockPlane\
    ├── BlockPlane.dll                  # Main plugin assembly
    ├── BlockPlane.API.dll              # API client
    ├── BlockPlane.UI.dll               # WPF UI components
    ├── RestSharp.dll                   # HTTP client
    ├── Newtonsoft.Json.dll             # JSON parser
    ├── System.Data.SQLite.dll          # Local cache
    ├── cache.db                        # SQLite database
    ├── logs\                           # Log files
    │   └── blockplane-2024-01-15.log
    └── resources\                      # Images, icons
        ├── logo.png
        └── icons\
```

### Auto-Update Mechanism

1. Plugin checks for updates on startup
2. If new version available, show notification
3. User clicks "Update Now"
4. Download MSI in background
5. Prompt to close Revit and install
6. Silent install (preserves settings)
7. Relaunch Revit with new version

---

## Testing Strategy

### Unit Tests (90%+ coverage)

- MaterialService logic
- API client retry logic
- Carbon calculation accuracy
- Data transformation functions

### Integration Tests

- API communication (mock server)
- SQLite cache operations
- Revit API interactions (IExternalCommand)

### End-to-End Tests

- Full material search → swap → report workflow
- Offline mode functionality
- Multi-project scenarios

### User Acceptance Testing

- 3 architecture firms
- 5 real projects each
- Feedback surveys
- Performance monitoring

---

## Success Metrics

### Technical Metrics

- **Crash Rate:** < 0.1% of sessions
- **API Success Rate:** > 99.5%
- **Cache Hit Rate:** > 80%
- **Average Response Time:** < 2 seconds

### User Metrics

- **Time to First Swap:** < 5 minutes (from install)
- **Swaps per Project:** > 10
- **User Retention:** > 70% (30 days)
- **NPS Score:** > 50

---

## Future Enhancements (Post-MVP)

1. **Real-time Collaboration** - Share material selections across team
2. **AI Recommendations** - Proactive suggestions based on project type
3. **Parametric Materials** - Adjust properties, recalculate carbon
4. **Revit Families** - Embed BlockPlane data in custom families
5. **Cloud Sync** - Sync projects across devices
6. **Mobile Companion** - View carbon reports on phone/tablet

---

## Conclusion

This architecture provides a solid foundation for a production-grade Revit plugin that is:

- **Reliable:** Comprehensive error handling and offline support
- **Performant:** Fast response times and efficient caching
- **Secure:** Encrypted data and code signing
- **Maintainable:** Clean separation of concerns and extensive logging
- **Scalable:** Handles large projects and future enhancements

**Next Step:** Phase 2 - Set up C# project structure and dependencies.
