import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface ExploreHeaderProps {
  onViewChange: (view: 'grid' | 'map') => void;
  activeView: 'grid' | 'map';
}

export default function ExploreHeader({ onViewChange, activeView }: ExploreHeaderProps) {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const cityId = searchParams.get("city");
  const categoryId = searchParams.get("category");

  const [title, setTitle] = useState("Explore Hidden Gems");
  const [subtitle, setSubtitle] = useState("Discover authentic experiences across India");

  // Fetch city data if cityId is provided
  const { data: cityData } = useQuery({
    queryKey: cityId ? [`/api/cities/${cityId}`] : null,
    enabled: !!cityId,
  });

  // Fetch category data if categoryId is provided
  const { data: categoryData } = useQuery({
    queryKey: categoryId ? [`/api/categories/${categoryId}`] : null,
    enabled: !!categoryId,
  });

  // Update title and subtitle based on the selected filters
  useEffect(() => {
    if (cityData?.city && categoryData?.category) {
      setTitle(`${categoryData.category.name} in ${cityData.city.name}`);
      setSubtitle(`Discover hidden ${categoryData.category.description.toLowerCase()} in ${cityData.city.name}, ${cityData.city.state}`);
    } else if (cityData?.city) {
      setTitle(`Explore ${cityData.city.name}`);
      setSubtitle(cityData.city.description);
    } else if (categoryData?.category) {
      setTitle(categoryData.category.name);
      setSubtitle(categoryData.category.description);
    } else {
      setTitle("Explore Hidden Gems");
      setSubtitle("Discover authentic experiences across India");
    }
  }, [cityData, categoryData]);

  // Clear filters
  const clearFilters = () => {
    setLocation("/explore");
  };

  return (
    <div className="bg-primary text-white py-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
            <p className="text-blue-100 max-w-2xl mb-4">{subtitle}</p>
            
            {(cityId || categoryId) && (
              <button 
                onClick={clearFilters}
                className="inline-flex items-center text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
              >
                <span>Clear all filters</span>
                <i className="fas fa-times ml-2"></i>
              </button>
            )}
          </div>
          
          <div className="hidden md:flex space-x-2">
            <button 
              onClick={() => onViewChange('grid')}
              className={`px-3 py-2 rounded flex items-center ${
                activeView === 'grid' 
                  ? 'bg-white text-primary' 
                  : 'bg-blue-700/30 text-white hover:bg-blue-700/50'
              }`}
              aria-label="Grid view"
            >
              <i className="fas fa-th-large mr-2"></i>
              <span>Grid</span>
            </button>
            <button 
              onClick={() => onViewChange('map')}
              className={`px-3 py-2 rounded flex items-center ${
                activeView === 'map' 
                  ? 'bg-white text-primary' 
                  : 'bg-blue-700/30 text-white hover:bg-blue-700/50'
              }`}
              aria-label="Map view"
            >
              <i className="fas fa-map-marked-alt mr-2"></i>
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
