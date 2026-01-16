/**
 * API Documentation for Revit Plugin Integration
 * 
 * Comprehensive guide for integrating the BlockPlane Material Database API
 * with the Revit plugin, including:
 * - Authentication requirements
 * - Endpoint documentation
 * - Request/response formats
 * - Code examples in C#
 * - Error handling
 * - Rate limiting
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, Book, Zap, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { Header } from "@/components/Header";

export default function APIDocumentation() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <div className="container mx-auto px-4 py-16 max-w-5xl space-y-8">
        <section className="space-y-3 pb-6 border-b border-slate-800">
          <h1 className="text-4xl md:text-5xl font-bold text-white">BlockPlane Material API</h1>
          <p className="text-lg text-slate-300">
            RESTful API for Revit Plugin Integration - Version 1.0
          </p>
        </section>

        <Alert className="mb-6 bg-slate-900/80 border border-slate-800 text-slate-100">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <AlertDescription>
            <strong className="text-white">Base URL:</strong>{" "}
            <span className="font-mono text-xs text-slate-200 bg-slate-900/70 border border-slate-800 rounded px-2 py-1 inline-flex items-center">
              https://api.blockplane.com/trpc
            </span>
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="retrieve">Retrieve</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="examples">C# Examples</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              <Card className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-lg shadow-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="w-5 h-5" />
                    API Overview
                  </CardTitle>
                  <CardDescription>
                    Introduction to the BlockPlane Material Database API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-slate-200">
                  <div>
                    <h3 className="font-semibold mb-2 text-white">Key Features</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-200">
                      <li>Advanced material search with filters (category, RIS, carbon, regenerative)</li>
                      <li>Comprehensive material data including lifecycle carbon breakdown</li>
                      <li>Confidence levels and data quality metadata for transparency</li>
                      <li>Material recommendations based on carbon, cost, and RIS scores</li>
                      <li>Pagination support for large result sets</li>
                      <li>EPD source attribution for professional verification</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 text-white">Authentication</h3>
                    <p className="text-sm text-slate-200 mb-2">
                      Currently, the API is publicly accessible. Future versions will require API keys.
                    </p>
                  <Alert className="bg-slate-900/70 border border-slate-800 text-slate-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Coming Soon:</strong> API key authentication for production use
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Rate Limiting</h3>
                    <p className="text-sm text-gray-700">
                      Current limits: 100 requests per minute per IP address
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Response Format</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      All responses are in JSON format with the following structure:
                    </p>
                    <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-200 overflow-auto">
{`{
  "result": {
    "data": { /* response data */ }
  }
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle>Material Search Endpoint</CardTitle>
                <CardDescription>
                  Search and filter materials with advanced criteria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Badge variant="default" className="mb-2">POST</Badge>
                  <code className="bg-slate-800/80 text-slate-100 rounded-md px-3 py-1 text-sm font-mono">
                    /materialAPI.search
                  </code>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Request Parameters</h3>
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left p-2">Parameter</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Required</th>
                          <th className="text-left p-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="p-2"><code>query</code></td>
                          <td className="p-2">string</td>
                          <td className="p-2">No</td>
                          <td className="p-2">Search text (name, description)</td>
                        </tr>
                        <tr>
                          <td className="p-2"><code>categories</code></td>
                          <td className="p-2">string[]</td>
                          <td className="p-2">No</td>
                          <td className="p-2">Filter by categories (Timber, Steel, Concrete, Earth, Insulation, Composites, Masonry)</td>
                        </tr>
                        <tr>
                          <td className="p-2"><code>minRIS</code></td>
                          <td className="p-2">number</td>
                          <td className="p-2">No</td>
                          <td className="p-2">Minimum RIS score (0-100)</td>
                        </tr>
                        <tr>
                          <td className="p-2"><code>maxRIS</code></td>
                          <td className="p-2">number</td>
                          <td className="p-2">No</td>
                          <td className="p-2">Maximum RIS score (0-100)</td>
                        </tr>
                        <tr>
                          <td className="p-2"><code>maxCarbon</code></td>
                          <td className="p-2">number</td>
                          <td className="p-2">No</td>
                          <td className="p-2">Maximum total carbon (kg CO₂e)</td>
                        </tr>
                        <tr>
                          <td className="p-2"><code>regenerativeOnly</code></td>
                          <td className="p-2">boolean</td>
                          <td className="p-2">No</td>
                          <td className="p-2">Show only regenerative materials</td>
                        </tr>
                        <tr>
                          <td className="p-2"><code>sortBy</code></td>
                          <td className="p-2">string</td>
                          <td className="p-2">No</td>
                          <td className="p-2">Sort field: name, carbon, cost, ris, lis (default: name)</td>
                        </tr>
                        <tr>
                          <td className="p-2"><code>sortOrder</code></td>
                          <td className="p-2">string</td>
                          <td className="p-2">No</td>
                          <td className="p-2">asc or desc (default: asc)</td>
                        </tr>
                        <tr>
                          <td className="p-2"><code>page</code></td>
                          <td className="p-2">number</td>
                          <td className="p-2">No</td>
                          <td className="p-2">Page number (default: 1)</td>
                        </tr>
                        <tr>
                          <td className="p-2"><code>pageSize</code></td>
                          <td className="p-2">number</td>
                          <td className="p-2">No</td>
                          <td className="p-2">Items per page (default: 20, max: 100)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Example Request</h3>
                  <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-200 overflow-auto">
{`POST /materialAPI.search
Content-Type: application/json

{
  "query": "timber",
  "categories": ["Timber"],
  "minRIS": 70,
  "maxCarbon": 100,
  "sortBy": "carbon",
  "sortOrder": "asc",
  "page": 1,
  "pageSize": 20
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Example Response</h3>
                  <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-200 overflow-auto">
{`{
  "result": {
    "data": {
      "items": [
        {
          "id": 1,
          "name": "Cross-Laminated Timber (CLT)",
          "category": "Timber",
          "totalCarbon": "93.20",
          "functionalUnit": "m³",
          "confidenceLevel": "High",
          "risScore": 75,
          "lisScore": 25,
          "costPerUnit": "850.00",
          "isRegenerative": 1,
          "description": "Engineered wood panels...",
          "lifecycle": [...],
          "epdMetadata": [...]
        }
      ],
      "totalItems": 85,
      "totalPages": 5,
      "currentPage": 1,
      "pageSize": 20
    }
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Retrieve Tab */}
          <TabsContent value="retrieve">
            <Card>
              <CardHeader>
                <CardTitle>Get Material by ID</CardTitle>
                <CardDescription>
                  Retrieve detailed information for a specific material
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Badge variant="default" className="mb-2">POST</Badge>
                  <code className="bg-slate-800/80 text-slate-100 rounded-md px-3 py-1 text-sm font-mono">
                    /materialAPI.getById
                  </code>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Request Parameters</h3>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-2">Parameter</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Required</th>
                        <th className="text-left p-2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2"><code>id</code></td>
                        <td className="p-2">number</td>
                        <td className="p-2">Yes</td>
                        <td className="p-2">Material ID</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Example Request</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-auto">
{`POST /materialAPI.getById
Content-Type: application/json

{
  "id": 1
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Response Fields</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Returns complete material data including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li><code>lifecycleBreakdown</code> - Carbon values by phase (a1a3, a4, a5, b, c1c4)</li>
                    <li><code>epdMetadata</code> - Array of EPD sources with URLs, dates, manufacturers</li>
                    <li><code>confidenceLevel</code> - High, Medium, Low, or None</li>
                    <li><code>dataQuality</code> - JSON object with quality metadata</li>
                    <li><code>lastVerified</code> - Timestamp of last verification</li>
                    <li><code>verificationNotes</code> - Notes about data verification</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Get Material Recommendations</CardTitle>
                <CardDescription>
                  Find alternative materials with better environmental performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Badge variant="default" className="mb-2">POST</Badge>
                  <code className="bg-slate-800/80 text-slate-100 rounded-md px-3 py-1 text-sm font-mono">
                    /materialAPI.getRecommendations
                  </code>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Request Parameters</h3>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-2">Parameter</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Required</th>
                        <th className="text-left p-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-2"><code>materialId</code></td>
                        <td className="p-2">number</td>
                        <td className="p-2">Yes</td>
                        <td className="p-2">Reference material ID</td>
                      </tr>
                      <tr>
                        <td className="p-2"><code>maxResults</code></td>
                        <td className="p-2">number</td>
                        <td className="p-2">No</td>
                        <td className="p-2">Max recommendations (default: 5, max: 10)</td>
                      </tr>
                      <tr>
                        <td className="p-2"><code>prioritizeCarbon</code></td>
                        <td className="p-2">boolean</td>
                        <td className="p-2">No</td>
                        <td className="p-2">Prioritize carbon reduction (default: true)</td>
                      </tr>
                      <tr>
                        <td className="p-2"><code>prioritizeCost</code></td>
                        <td className="p-2">boolean</td>
                        <td className="p-2">No</td>
                        <td className="p-2">Prioritize cost savings (default: false)</td>
                      </tr>
                      <tr>
                        <td className="p-2"><code>prioritizeRIS</code></td>
                        <td className="p-2">boolean</td>
                        <td className="p-2">No</td>
                        <td className="p-2">Prioritize RIS improvement (default: true)</td>
                      </tr>
                      <tr>
                        <td className="p-2"><code>sameCategory</code></td>
                        <td className="p-2">boolean</td>
                        <td className="p-2">No</td>
                        <td className="p-2">Only same category (default: true)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Example Response</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-auto">
{`{
  "result": {
    "data": [
      {
        "material": { /* full material object */ },
        "score": 85.3,
        "carbonSavings": 12.5,
        "costDelta": -25.00,
        "risDelta": 10,
        "lisDelta": -5,
        "reasons": [
          "Reduces carbon by 12.50 kg CO₂e (13.4%)",
          "Improves RIS score by 10 points",
          "Saves $25.00 per m³",
          "Regenerative material"
        ],
        "confidence": "High"
      }
    ]
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* C# Examples Tab */}
          <TabsContent value="examples">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  C# Integration Examples
                </CardTitle>
                <CardDescription>
                  Code examples for Revit plugin integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">1. Setup HTTP Client</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-auto">
{`using System.Net.Http;
using System.Text;
using Newtonsoft.Json;

public class BlockPlaneApiClient
{
    private readonly HttpClient _httpClient;
    private const string BaseUrl = "https://api.blockplane.com/trpc";

    public BlockPlaneApiClient()
    {
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
    }
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">2. Search Materials</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-auto">
{`public async Task<MaterialSearchResponse> SearchMaterials(
    string query = null,
    string[] categories = null,
    int? minRIS = null,
    decimal? maxCarbon = null)
{
    var request = new
    {
        query = query,
        categories = categories,
        minRIS = minRIS,
        maxCarbon = maxCarbon,
        sortBy = "carbon",
        sortOrder = "asc",
        page = 1,
        pageSize = 20
    };

    var json = JsonConvert.SerializeObject(request);
    var content = new StringContent(json, Encoding.UTF8, "application/json");

    var response = await _httpClient.PostAsync(
        $"{BaseUrl}/materialAPI.search",
        content
    );

    response.EnsureSuccessStatusCode();
    var responseJson = await response.Content.ReadAsStringAsync();
    return JsonConvert.DeserializeObject<MaterialSearchResponse>(responseJson);
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">3. Get Material by ID</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-auto">
{`public async Task<Material> GetMaterialById(int id)
{
    var request = new { id = id };
    var json = JsonConvert.SerializeObject(request);
    var content = new StringContent(json, Encoding.UTF8, "application/json");

    var response = await _httpClient.PostAsync(
        $"{BaseUrl}/materialAPI.getById",
        content
    );

    response.EnsureSuccessStatusCode();
    var responseJson = await response.Content.ReadAsStringAsync();
    var result = JsonConvert.DeserializeObject<ApiResponse<Material>>(responseJson);
    return result.Result.Data;
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">4. Get Recommendations</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-auto">
{`public async Task<List<Recommendation>> GetRecommendations(
    int materialId,
    int maxResults = 5)
{
    var request = new
    {
        materialId = materialId,
        maxResults = maxResults,
        prioritizeCarbon = true,
        prioritizeRIS = true,
        sameCategory = true
    };

    var json = JsonConvert.SerializeObject(request);
    var content = new StringContent(json, Encoding.UTF8, "application/json");

    var response = await _httpClient.PostAsync(
        $"{BaseUrl}/materialAPI.getRecommendations",
        content
    );

    response.EnsureSuccessStatusCode();
    var responseJson = await response.Content.ReadAsStringAsync();
    var result = JsonConvert.DeserializeObject<ApiResponse<List<Recommendation>>>(responseJson);
    return result.Result.Data;
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">5. Data Models</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-auto">
{`public class Material
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Category { get; set; }
    public decimal TotalCarbon { get; set; }
    public string FunctionalUnit { get; set; }
    public string ConfidenceLevel { get; set; }
    public int RisScore { get; set; }
    public int LisScore { get; set; }
    public decimal CostPerUnit { get; set; }
    public int IsRegenerative { get; set; }
    public string Description { get; set; }
    public LifecycleBreakdown LifecycleBreakdown { get; set; }
    public List<EpdMetadata> EpdMetadata { get; set; }
}

public class LifecycleBreakdown
{
    public decimal A1a3 { get; set; }
    public decimal A4 { get; set; }
    public decimal A5 { get; set; }
    public decimal B { get; set; }
    public decimal C1c4 { get; set; }
}

public class Recommendation
{
    public Material Material { get; set; }
    public decimal Score { get; set; }
    public decimal CarbonSavings { get; set; }
    public decimal CostDelta { get; set; }
    public int RisDelta { get; set; }
    public List<string> Reasons { get; set; }
    public string Confidence { get; set; }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
