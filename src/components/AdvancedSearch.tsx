import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, X, Save, Clock } from "lucide-react";
import { FilterOptions } from "@/types/student";
interface AdvancedSearchProps {
  onFiltersChange: (filters: FilterOptions) => void;
  filters: FilterOptions;
}
const savedSearches = [{
  name: "High Performers",
  filters: {
    search: "",
    experience: "experienced" as const
  }
}, {
  name: "CS Background",
  filters: {
    ugDegree: "Computer Science"
  }
}, {
  name: "Mumbai Region",
  filters: {
    state: "Maharashtra"
  }
}];
export function AdvancedSearch({
  onFiltersChange,
  filters
}: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => value && value !== 'all' && value !== '').length;
  }, [filters]);
  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    setIsExpanded(false);
  };
  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {};
    setTempFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };
  const handleSavedSearch = (savedFilter: FilterOptions) => {
    setTempFilters(savedFilter);
    onFiltersChange(savedFilter);
    setIsExpanded(false);
  };
  return <Card className="dashboard-card mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Advanced Search & Filters
            {activeFiltersCount > 0 && <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>}
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            <Filter className="h-4 w-4 mr-2" />
            {isExpanded ? 'Hide' : 'Show'} Filters
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Global Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students by name, email, company, skills..." value={tempFilters.search || ''} onChange={e => setTempFilters({
          ...tempFilters,
          search: e.target.value
        })} className="pl-10" />
        </div>

        {/* Saved Searches */}
        <div className="flex flex-wrap gap-2">
          
          {savedSearches.map((saved, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleSavedSearch(saved.filters)}
              className="flex items-center gap-2"
            >
              <Clock className="h-3 w-3" />
              {saved.name}
            </Button>
          ))}
        </div>

        {/* Expanded Filters */}
        {isExpanded && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium mb-2 block">Specialization</label>
              <Select value={tempFilters.specialization || "all"} onValueChange={value => setTempFilters({
            ...tempFilters,
            specialization: value === "all" ? undefined : value
          })}>
                <SelectTrigger>
                  <SelectValue placeholder="All specializations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All specializations</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Commerce">Commerce</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Gender</label>
              <Select value={tempFilters.gender || "all"} onValueChange={value => setTempFilters({
            ...tempFilters,
            gender: value === "all" ? undefined : value
          })}>
                <SelectTrigger>
                  <SelectValue placeholder="All genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All genders</SelectItem>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Experience</label>
              <Select value={tempFilters.experience || "all"} onValueChange={value => setTempFilters({
            ...tempFilters,
            experience: value === "all" ? undefined : value as any
          })}>
                <SelectTrigger>
                  <SelectValue placeholder="All experience levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All experience levels</SelectItem>
                  <SelectItem value="fresher">Freshers (0 years)</SelectItem>
                  <SelectItem value="experienced">Experienced (1+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">State</label>
              <Select value={tempFilters.state || "all"} onValueChange={value => setTempFilters({
            ...tempFilters,
            state: value === "all" ? undefined : value
          })}>
                <SelectTrigger>
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="Karnataka">Karnataka</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                  <SelectItem value="Gujarat">Gujarat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-full flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button onClick={handleApplyFilters}>
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {Object.entries(filters).map(([key, value]) => {
          if (!value || value === 'all' || value === '') return null;
          return <Badge key={key} variant="secondary" className="flex items-center gap-1">
                  {key}: {value}
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => {
              const newFilters = {
                ...filters
              };
              delete newFilters[key as keyof FilterOptions];
              onFiltersChange(newFilters);
            }} />
                </Badge>;
        })}
          </div>}
      </CardContent>
    </Card>;
}