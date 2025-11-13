import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, X, Filter } from 'lucide-react';

export interface FilterState {
  search: string;
  categories: string[];
  risRange: [number, number];
  lisRange: [number, number];
  carbonMax: number;
  costRange: [number, number];
  regenerativeOnly: boolean;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
}

const CATEGORIES = ['Timber', 'Steel', 'Concrete', 'Earth'];

export function FilterPanel({ filters, onFiltersChange, onReset }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories: newCategories });
  };

  const hasActiveFilters = 
    filters.search ||
    filters.categories.length > 0 ||
    filters.risRange[0] > 0 ||
    filters.risRange[1] < 100 ||
    filters.lisRange[0] > 0 ||
    filters.lisRange[1] < 100 ||
    filters.carbonMax < 1000 ||
    filters.costRange[0] > 0 ||
    filters.costRange[1] < 1000 ||
    filters.regenerativeOnly;

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                Active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-8 px-2"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
        <CardDescription>
          Filter materials by criteria
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search materials..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant={filters.categories.includes(category) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* RIS Range */}
          <div className="space-y-2">
            <Label>
              RIS Range: {filters.risRange[0]} - {filters.risRange[1]}
            </Label>
            <Slider
              min={0}
              max={100}
              step={5}
              value={filters.risRange}
              onValueChange={(value) => updateFilters({ risRange: value as [number, number] })}
              className="w-full"
            />
          </div>

          {/* LIS Range */}
          <div className="space-y-2">
            <Label>
              LIS Range: {filters.lisRange[0]} - {filters.lisRange[1]}
            </Label>
            <Slider
              min={0}
              max={100}
              step={5}
              value={filters.lisRange}
              onValueChange={(value) => updateFilters({ lisRange: value as [number, number] })}
              className="w-full"
            />
          </div>

          {/* Carbon Max */}
          <div className="space-y-2">
            <Label>
              Max Carbon: {filters.carbonMax === 1000 ? '1000+' : filters.carbonMax} kg CO₂e
            </Label>
            <Slider
              min={0}
              max={1000}
              step={50}
              value={[filters.carbonMax]}
              onValueChange={(value) => updateFilters({ carbonMax: value[0] })}
              className="w-full"
            />
          </div>

          {/* Cost Range */}
          <div className="space-y-2">
            <Label>
              Cost Range: ${filters.costRange[0]} - ${filters.costRange[1] === 1000 ? '1000+' : filters.costRange[1]}
            </Label>
            <Slider
              min={0}
              max={1000}
              step={50}
              value={filters.costRange}
              onValueChange={(value) => updateFilters({ costRange: value as [number, number] })}
              className="w-full"
            />
          </div>

          {/* Regenerative Only */}
          <div className="flex items-center justify-between">
            <Label htmlFor="regenerative-only" className="cursor-pointer">
              Regenerative Materials Only
            </Label>
            <Switch
              id="regenerative-only"
              checked={filters.regenerativeOnly}
              onCheckedChange={(checked) => updateFilters({ regenerativeOnly: checked })}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Apply filters to materials array
 */
export function applyFilters(materials: any[], filters: FilterState): any[] {
  return materials.filter((material) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        material.name.toLowerCase().includes(searchLower) ||
        material.category.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(material.category)) {
      return false;
    }

    // RIS range
    const ris = material.risScores?.ris || 0;
    if (ris < filters.risRange[0] || ris > filters.risRange[1]) {
      return false;
    }

    // LIS range
    const lis = material.risScores?.lis || 0;
    if (lis < filters.lisRange[0] || lis > filters.lisRange[1]) {
      return false;
    }

    // Carbon max
    if (material.totalCarbon > filters.carbonMax) {
      return false;
    }

    // Cost range
    const cost = material.pricing?.costPerUnit || 0;
    if (cost < filters.costRange[0] || (filters.costRange[1] < 1000 && cost > filters.costRange[1])) {
      return false;
    }

    // Regenerative only
    if (filters.regenerativeOnly) {
      const netImpact = ris - lis;
      if (netImpact <= 30) return false;
    }

    return true;
  });
}

/**
 * Default filter state
 */
export const DEFAULT_FILTERS: FilterState = {
  search: '',
  categories: [],
  risRange: [0, 100],
  lisRange: [0, 100],
  carbonMax: 1000,
  costRange: [0, 1000],
  regenerativeOnly: false,
};
