import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import ExploreHeader from "@/components/explore/ExploreHeader";
import FilterSidebar from "@/components/explore/FilterSidebar";
import PlaceCard from "@/components/explore/PlaceCard";
import MapView from "@/components/explore/MapView";
import { Skeleton } from "@/components/ui/skeleton";
import { useMobile } from "@/hooks/use-mobile";

export default function Explore() {
  const searchParams = new URLSearchParams(useSearch());
  const cityId = searchParams.get("city");
  const categoryId = searchParams.get("category");
  const [activeView, setActiveView] = useState<'grid' | 'map'>('grid');
  const isMobile = useMobile();

  // Set a default title for the page
  const [pageTitle, setPageTitle] = useState("Explore Hidden Gems - HiddenHeu");
  const [metaDescription, setMetaDescription] = useState(
    "Discover authentic experiences and hidden treasures across India with HiddenHeu's curated travel guide."
  );

  // Fetch places based on filters
  const { data: placesData, isLoading, error } = useQuery({
    queryKey: ['/api/places', cityId, categoryId],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (cityId) queryParams.append('cityId', cityId);
      if (categoryId) queryParams.append('categoryId', categoryId);
      
      const response = await fetch(`/api/places?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch places');
      return response.json();
    },
  });

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

  // Update page title and meta description based on filters
  useEffect(() => {
    let title = "Explore Hidden Gems";
    let description = "Discover authentic experiences across India with HiddenHeu.";

    if (cityData?.city && categoryData?.category) {
      title = `${categoryData.category.name} in ${cityData.city.name}`;
      description = `Discover hidden ${categoryData.category.description.toLowerCase()} in ${cityData.city.name}, ${cityData.city.state}.`;
    } else if (cityData?.city) {
      title = `Explore ${cityData.city.name}`;
      description = cityData.city.description;
    } else if (categoryData?.category) {
      title = categoryData.category.name;
      description = categoryData.category.description;
    }

    setPageTitle(`${title} - HiddenHeu`);
    setMetaDescription(description);
  }, [cityData, categoryData]);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
      </Helmet>

      <ExploreHeader onViewChange={setActiveView} activeView={activeView} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter Sidebar - Hidden in Map View on Mobile */}
          <div className={`md:w-1/4 ${isMobile && activeView === 'map' ? 'hidden' : ''}`}>
            <FilterSidebar />
          </div>
          
          {/* Main Content */}
          <div className="md:w-3/4">
            {activeView === 'grid' ? (
              /* Grid View */
              <>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                        <Skeleton className="h-48 w-full" />
                        <div className="p-4">
                          <Skeleton className="h-6 w-3/4 mb-1" />
                          <Skeleton className="h-4 w-1/2 mb-2" />
                          <Skeleton className="h-4 w-full mb-3" />
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="bg-red-50 text-red-500 p-4 rounded-md">
                    <p>Error loading places. Please try again later.</p>
                  </div>
                ) : placesData?.places?.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-search text-5xl text-gray-300 mb-4"></i>
                    <h3 className="text-xl font-semibold mb-2">No places found</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your filters or explore a different area.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {placesData.places.map((place: any) => (
                      <PlaceCard key={place.id} place={place} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Map View */
              <div className="h-[70vh] md:h-[80vh] rounded-xl overflow-hidden shadow-md">
                <MapView className="w-full h-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
