/**
 * Material Browser - Public Material Database Explorer
 * 
 * Comprehensive material browsing interface with:
 * - Real-time search
 * - Advanced filters (category, RIS, carbon, regenerative)
 * - Sorting options
 * - Pagination
 * - Confidence badges
 * - Material cards with key metrics
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Leaf,
  TrendingDown,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Info,
  Bookmark,
  PlusCircle
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { SubmitMaterialModal } from "@/components/SubmitMaterialModal";
import { SaveProjectModal } from "@/components/SaveProjectModal";
import { useAuth } from "@/contexts/AuthContext";
import { ScoreConfidenceBadge } from "@/components/ScoreConfidenceBadge";

type ConfidenceLevel = "High" | "Medium" | "Low" | "None";

export default function MaterialBrowser() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Load from saved project if ?load=<id> is present
  const [loadProjectId] = useState(() => new URLSearchParams(window.location.search).get('load'));

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRIS, setMinRIS] = useState<number | undefined>();
  const [maxCarbonSqFt, setMaxCarbonSqFt] = useState<number | undefined>();
  const [regenerativeOnly, setRegenerativeOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "carbon" | "cost" | "ris" | "lis">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Restore state from a saved project
  const { data: loadedProject } = trpc.projects.get.useQuery(
    { id: loadProjectId! },
    { enabled: !!loadProjectId && !!user }
  );
  useEffect(() => {
    if (!loadedProject) return;
    const f = (loadedProject as any).project_data?.filters;
    if (!f) return;
    if (f.searchQuery !== undefined) setSearchQuery(f.searchQuery);
    if (f.selectedCategories) setSelectedCategories(f.selectedCategories);
    if (f.minRIS !== undefined) setMinRIS(f.minRIS);
    if (f.maxCarbonSqFt !== undefined) setMaxCarbonSqFt(f.maxCarbonSqFt);
    if (f.regenerativeOnly !== undefined) setRegenerativeOnly(f.regenerativeOnly);
    if (f.sortBy) setSortBy(f.sortBy);
    if (f.sortOrder) setSortOrder(f.sortOrder);
  }, [loadedProject]);

  // Fetch materials with current filters
  const { data: searchResults, isLoading } = trpc.materialAPI.search.useQuery({
    query: searchQuery || undefined,
    categories: selectedCategories.length > 0 ? (selectedCategories as any) : undefined,
    minRIS,
    maxCarbon: maxCarbonSqFt ? maxCarbonSqFt * 10.764 : undefined,
    regenerativeOnly: regenerativeOnly || undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    pageSize,
  });

  // Fetch categories for filter
  const { data: categories } = trpc.materialAPI.getCategories.useQuery();

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, minRIS, maxCarbonSqFt, regenerativeOnly, sortBy, sortOrder]);

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setMinRIS(undefined);
    setMaxCarbonSqFt(undefined);
    setRegenerativeOnly(false);
    setCurrentPage(1);
  };

  // Get confidence badge color
  const getConfidenceBadgeVariant = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case "High": return "default";
      case "Medium": return "secondary";
      case "Low": return "outline";
      case "None": return "destructive";
    }
  };

  // Get confidence icon
  const getConfidenceIcon = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case "High": return <CheckCircle className="w-3 h-3" />;
      case "Medium": return <Info className="w-3 h-3" />;
      case "Low": return <AlertCircle className="w-3 h-3" />;
      case "None": return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      {/* Page header */}
      <div style={{ backgroundColor: '#1a2e1f' }}>
        <div className="container py-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">Material Database</h1>
            <p className="text-lg" style={{ color: 'rgba(245,242,236,0.8)' }}>
              Explore {searchResults?.totalItems || 0} sustainable building materials with transparent carbon data
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(245,242,236,0.45)' }}>
              Imperial units · Northern Michigan region
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => user ? setShowSaveModal(true) : navigate("/login")}
              className="flex items-center gap-2"
              style={{ backgroundColor: 'transparent', color: '#f5f2ec', borderColor: 'rgba(245,242,236,0.35)' }}
            >
              <Bookmark className="w-4 h-4" />
              Save View
            </Button>
            <Button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-2"
              style={{ backgroundColor: '#c17f24', color: '#fff', border: 'none' }}
            >
              <PlusCircle className="w-4 h-4" />
              Submit a Material
            </Button>
          </div>
        </div>
      </div>
      <SubmitMaterialModal open={showSubmitModal} onClose={() => setShowSubmitModal(false)} />
      <SaveProjectModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        projectData={{
          type: "material_browser",
          filters: { searchQuery, selectedCategories, minRIS, maxCarbonSqFt, regenerativeOnly, sortBy, sortOrder },
        }}
      />

      <div className="container py-5">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
                <CardDescription>
                  Refine your material search
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search materials..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Categories</label>
                  <div className="space-y-2">
                    {categories?.map(cat => (
                      <Button
                        key={cat.name}
                        variant={selectedCategories.includes(cat.name) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCategory(cat.name)}
                        className="w-full justify-between"
                      >
                        {cat.name}
                        <Badge variant="secondary" className="ml-2">
                          {cat.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* RIS Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Minimum RIS Score
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g., 50"
                    value={minRIS || ""}
                    onChange={(e) => setMinRIS(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Regenerative Impact Score (0-100)
                  </p>
                </div>

                {/* Carbon Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Maximum Carbon (kg CO₂e/sq ft)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g., 20"
                    value={maxCarbonSqFt || ""}
                    onChange={(e) => setMaxCarbonSqFt(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>

                {/* Regenerative Only */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="regenerative"
                    checked={regenerativeOnly}
                    onChange={(e) => setRegenerativeOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="regenerative" className="text-sm font-medium flex items-center gap-1">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    Regenerative Only
                  </label>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Materials Grid */}
          <div className="lg:col-span-3 space-y-6 bg-[#eae7e0] rounded-3xl p-4 border border-border shadow-inner">
            {/* Sort and Results Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing {searchResults?.items.length || 0} of {searchResults?.totalItems || 0} materials
                {searchResults && searchResults.totalPages > 1 && (
                  <span> (Page {currentPage} of {searchResults.totalPages})</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="carbon">Carbon</SelectItem>
                    <SelectItem value="cost">Cost</SelectItem>
                    <SelectItem value="ris">RIS Score</SelectItem>
                    <SelectItem value="lis">LIS Score</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p className="mt-4 text-gray-600">Loading materials...</p>
              </div>
            )}

            {/* Materials Grid */}
            {!isLoading && searchResults && (
              <>
                {searchResults.items.length === 0 ? (
                  <Card className="p-12 text-center">
                    <p className="text-gray-600 mb-4">No materials found matching your filters.</p>
                    <Button onClick={clearFilters}>Clear Filters</Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {searchResults.items.map((material: any) => (
                      <Link key={material.id} href={`/materials/${material.id}`}>
                        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                          <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                              <Badge variant="outline">{material.category}</Badge>
                              <Badge
                                variant={getConfidenceBadgeVariant(material.confidenceLevel)}
                                className="flex items-center gap-1"
                              >
                                {getConfidenceIcon(material.confidenceLevel)}
                                {material.confidenceLevel}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg">{material.name}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {material.description || "No description available"}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center gap-2">
                                <TrendingDown className="w-4 h-4 text-emerald-600" />
                                <div>
                                  <p className="text-xs text-gray-500">Carbon</p>
                                  <p className="text-sm font-semibold">
                                    {(parseFloat(material.totalCarbon) / 10.764).toFixed(2)} kg CO₂e/sq ft
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-blue-600" />
                                <div>
                                  <p className="text-xs text-gray-500">Cost</p>
                                  <p className="text-sm font-semibold">
                                    ${parseFloat(material.costPerUnit).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* LIS/RIS Scores */}
                            <div className="flex gap-2">
                              <div className="flex-1 bg-blue-50 rounded p-2">
                                <p className="text-xs text-gray-600">LIS</p>
                                <p className="text-lg font-bold text-blue-700">
                                  {material.lisScore}
                                </p>
                              </div>
                              <div className="flex-1 bg-emerald-50 rounded p-2">
                                <p className="text-xs text-gray-600">RIS</p>
                                {material.risScore !== null ? (
                                  <p className="text-lg font-bold text-emerald-700">{material.risScore}</p>
                                ) : (
                                  <p className="text-xs font-medium text-amber-600 mt-1">Pending</p>
                                )}
                              </div>
                            </div>

                            {/* Regenerative Badge */}
                            {material.isRegenerative === 1 && (
                              <Badge variant="default" className="w-full justify-center bg-emerald-600">
                                <Leaf className="w-3 h-3 mr-1" />
                                Regenerative Material
                              </Badge>
                            )}

                            {/* Score Confidence */}
                            <ScoreConfidenceBadge confidence={(material as any).scoreConfidence} />

                            {/* Frontier Badge */}
                            {(material.risScore >= 80 || (material as any).sourceUrl) && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                                Frontier
                              </span>
                            )}

                            {/* Functional Unit */}
                            <p className="text-xs text-gray-500 text-center">
                              Per {material.functionalUnit}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {searchResults.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: searchResults.totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first, last, current, and adjacent pages
                          return page === 1 || 
                                 page === searchResults.totalPages || 
                                 Math.abs(page - currentPage) <= 1;
                        })
                        .map((page, idx, arr) => (
                          <div key={page} className="flex items-center">
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <Button
                              variant={page === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          </div>
                        ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(searchResults.totalPages, prev + 1))}
                      disabled={currentPage === searchResults.totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
