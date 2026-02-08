import { useState } from "react";
import { Search, Filter, X, Sparkles, Brain, MapPin, AlertTriangle, Users, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SearchFilters } from "@/types/healthcare";
import { cn } from "@/lib/utils";

// VF Agent example queries organized by category
const VF_AGENT_CATEGORIES = [
  {
    id: "basic",
    label: "Basic",
    icon: Building2,
    queries: [
      "How many hospitals have cardiology?",
      "What services does Korle Bu Teaching Hospital offer?",
      "Which region has the most teaching hospitals?",
    ],
  },
  {
    id: "geospatial",
    label: "Geospatial",
    icon: MapPin,
    queries: [
      "Where are the largest geographic cold spots where cardiac care is absent?",
      "What areas have known disease prevalence but no facilities treating it?",
      "What is the service gap between urban and rural areas for emergency care?",
    ],
  },
  {
    id: "anomaly",
    label: "Anomaly",
    icon: AlertTriangle,
    queries: [
      "Which facilities claim surgical capabilities but lack basic equipment?",
      "Which facilities have unrealistic procedure claims relative to their size?",
      "Where do we see things that shouldn't move together?",
    ],
  },
  {
    id: "workforce",
    label: "Workforce",
    icon: Users,
    queries: [
      "Which regions have specialists but unclear information about where they practice?",
      "How many facilities have evidence of visiting specialists vs permanent staff?",
      "Where do signals indicate services are tied to individuals rather than institutions?",
    ],
  },
  {
    id: "resources",
    label: "Resources",
    icon: Brain,
    queries: [
      "In each region, which procedures depend on very few facilities?",
      "Where is there oversupply concentration vs scarcity of high-complexity procedures?",
      "What is the problem type by region: lack of equipment, training, or practitioners?",
    ],
  },
];

interface SearchPanelProps {
  filters: SearchFilters;
  suggestions: string[];
  filterOptions: {
    regions: string[];
    specialties: string[];
    equipment: string[];
    procedures: string[];
  };
  resultCount: number;
  onUpdateFilters: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
  onAISearch?: (query: string) => void;
}

export function SearchPanel({
  filters,
  suggestions,
  filterOptions,
  resultCount,
  onUpdateFilters,
  onClearFilters,
  onAISearch,
}: SearchPanelProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategory, setActiveCategory] = useState("basic");

  const hasActiveFilters =
    filters.query ||
    filters.region ||
    filters.specialty ||
    filters.equipment ||
    filters.procedure;

  const handleSuggestionClick = (suggestion: string) => {
    onUpdateFilters({ query: suggestion });
    setShowSuggestions(false);
  };

  const handleExampleClick = (query: string) => {
    onUpdateFilters({ query });
    if (onAISearch) {
      onAISearch(query);
    }
  };

  return (
    <Card className="p-4">
      {/* Search input with AI button */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.query}
            onChange={(e) => onUpdateFilters({ query: e.target.value })}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Ask VF Agent about healthcare facilities, gaps, or anomalies..."
            className="pl-10 pr-4"
          />

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="p-2">
                <p className="text-xs text-muted-foreground font-medium px-2 mb-1">
                  Suggested queries
                </p>
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md flex items-center gap-2"
                  >
                    <Sparkles className="h-3 w-3 text-primary" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {onAISearch && (
          <Button
            onClick={() => onAISearch(filters.query)}
            disabled={!filters.query}
            className="bg-gradient-hero"
          >
            <Brain className="h-4 w-4 mr-2" />
            VF Agent
          </Button>
        )}
      </div>

      {/* VF Agent Categories */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground font-medium mb-2">
          VF Agent Query Categories (59 questions across 11 categories)
        </p>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
            {VF_AGENT_CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-3 py-1.5 h-auto"
              >
                <cat.icon className="h-3 w-3 mr-1.5" />
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {VF_AGENT_CATEGORIES.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="mt-2">
              <div className="flex flex-wrap gap-2">
                {cat.queries.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleClick(query)}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors text-left"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        <Select
          value={filters.region || "all"}
          onValueChange={(v) => onUpdateFilters({ region: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {filterOptions.regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.specialty || "all"}
          onValueChange={(v) => onUpdateFilters({ specialty: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue placeholder="Specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {filterOptions.specialties.slice(0, 20).map((specialty) => (
              <SelectItem key={specialty} value={specialty}>
                {specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.equipment || "all"}
          onValueChange={(v) => onUpdateFilters({ equipment: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue placeholder="Equipment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Equipment</SelectItem>
            {filterOptions.equipment.slice(0, 20).map((eq) => (
              <SelectItem key={eq} value={eq}>
                {eq}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 text-xs text-muted-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Found <span className="font-medium text-foreground">{resultCount}</span> facilities
        </span>
        {hasActiveFilters && (
          <Badge variant="secondary" className="text-xs">
            Filtered
          </Badge>
        )}
      </div>
    </Card>
  );
}
