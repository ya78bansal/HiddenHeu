import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FilterSidebar() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  
  const [selectedCity, setSelectedCity] = useState<string | null>(searchParams.get("city"));
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("category"));
  
  // Fetch cities data
  const { data: citiesData, isLoading: isLoadingCities } = useQuery({
    queryKey: ["/api/cities"],
  });

  // Fetch categories data
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Get the search string for dependency tracking
  const search = useSearch();
  
  // Update selected filters when URL changes
  useEffect(() => {
    const params = new URLSearchParams(search);
    setSelectedCity(params.get("city"));
    setSelectedCategory(params.get("category"));
  }, [search]);

  const handleCityChange = (cityId: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (selectedCity === cityId) {
      params.delete("city");
      setSelectedCity(null);
    } else {
      params.set("city", cityId);
      setSelectedCity(cityId);
    }
    
    setLocation(`/explore?${params.toString()}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (selectedCategory === categoryId) {
      params.delete("category");
      setSelectedCategory(null);
    } else {
      params.set("category", categoryId);
      setSelectedCategory(categoryId);
    }
    
    setLocation(`/explore?${params.toString()}`);
  };

  const clearFilters = () => {
    setLocation("/explore");
    setSelectedCity(null);
    setSelectedCategory(null);
  };

  // Category icon and color mapping
  const getCategoryIcon = (categoryId: number): string => {
    const iconMap: Record<number, string> = {
      1: "fa-utensils",
      2: "fa-hands",
      3: "fa-tshirt",
      4: "fa-monument",
      5: "fa-tree",
    };
    return iconMap[categoryId] || "fa-map-marker-alt";
  };

  const getCategoryColorClass = (categoryId: number): string => {
    const colorMap: Record<number, string> = {
      1: "text-amber-500 bg-amber-50",
      2: "text-green-500 bg-green-50",
      3: "text-purple-500 bg-purple-50",
      4: "text-blue-500 bg-blue-50",
      5: "text-emerald-500 bg-emerald-50",
    };
    return colorMap[categoryId] || "text-gray-500 bg-gray-50";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex justify-between items-center">
            <span>Filters</span>
            {(selectedCity || selectedCategory) && (
              <button 
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-primary"
              >
                Clear all
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Cities filter */}
            <div>
              <h3 className="font-medium text-sm mb-3">Cities</h3>
              {isLoadingCities ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {citiesData?.cities?.map((city: any) => (
                    <button
                      key={city.id}
                      onClick={() => handleCityChange(city.id.toString())}
                      className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedCity === city.id.toString()
                          ? "bg-primary text-white"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span>{city.name}</span>
                      {selectedCity === city.id.toString() && (
                        <i className="fas fa-check-circle"></i>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Categories filter */}
            <div>
              <h3 className="font-medium text-sm mb-3">Categories</h3>
              {isLoadingCategories ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {categoriesData?.categories?.map((category: any) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id.toString())}
                      className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedCategory === category.id.toString()
                          ? "bg-primary text-white"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                        selectedCategory === category.id.toString()
                          ? "bg-white/20"
                          : getCategoryColorClass(category.id)
                      }`}>
                        <i className={`fas ${getCategoryIcon(category.id)} ${
                          selectedCategory === category.id.toString() ? "text-white" : ""
                        }`}></i>
                      </div>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="flex items-start space-x-2">
              <i className="fas fa-lightbulb text-amber-500 mt-1"></i>
              <p>Use the voice guide feature to learn about the history and culture of each place in your preferred language.</p>
            </div>
            <div className="flex items-start space-x-2">
              <i className="fas fa-map-marked-alt text-primary mt-1"></i>
              <p>Enable location services to find hidden gems near you and get real-time navigation.</p>
            </div>
            <div className="flex items-start space-x-2">
              <i className="fas fa-heart text-red-500 mt-1"></i>
              <p>Save your favorite places to create your own personalized travel itinerary.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
