import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

export default function HeroSection() {
  const [, setLocation] = useLocation();
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Fetch cities for dropdown
  const { data: citiesData, isLoading: isLoadingCities } = useQuery<{cities: any[]}>({
    queryKey: ["/api/cities"],
  });

  // Fetch categories for dropdown
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery<{categories: any[]}>({
    queryKey: ["/api/categories"],
  });

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleExplore = () => {
    let queryParams = new URLSearchParams();
    
    if (selectedCity) {
      queryParams.append("city", selectedCity);
    }
    
    if (selectedCategory) {
      queryParams.append("category", selectedCategory);
    }
    
    const queryString = queryParams.toString();
    setLocation(`/explore${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <section className="relative bg-gradient-to-b from-white to-blue-50 py-24 md:py-32">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-dark mb-6 leading-tight">
            Discover Hidden Treasures Near You
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Explore lesser-known spots, local cuisines, and authentic experiences in Indian cities
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 max-w-3xl mx-auto backdrop-blur-sm border border-gray-100">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                selectCity
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm hover:shadow"
                  value={selectedCity}
                  onChange={handleCityChange}
                  disabled={isLoadingCities}
                >
                  <option value="">chooseCity</option>
                  {citiesData && citiesData.cities && citiesData.cities.map((city: any) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                lookingFor
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm hover:shadow"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  disabled={isLoadingCategories}
                >
                  <option value="">anyExperience</option>
                  {categoriesData && categoriesData.categories && categoriesData.categories.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleExplore}
              className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg font-medium"
            >
              <Search className="h-5 w-5 mr-1" />
              <span>explore</span>
            </button>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute left-0 bottom-0 w-32 h-32 md:w-48 md:h-48 bg-blue-100 rounded-full opacity-50 -translate-x-1/2 translate-y-1/3 blur-xl"></div>
      <div className="absolute right-0 top-0 w-24 h-24 md:w-40 md:h-40 bg-amber-100 rounded-full opacity-60 translate-x-1/3 -translate-y-1/4 blur-xl"></div>
      <div className="absolute right-1/4 bottom-1/4 w-16 h-16 bg-blue-100 rounded-full opacity-40 blur-md"></div>
      <div className="absolute left-1/4 top-1/3 w-20 h-20 bg-amber-50 rounded-full opacity-40 blur-md"></div>
    </section>
  );
}
