import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star, ArrowRight } from "lucide-react";

export default function PopularDestinations() {
  const { data, isLoading, error } = useQuery<{cities: any[]}>({
    queryKey: ["/api/cities"],
  });

  const cities = data?.cities || [];

  if (error) {
    return (
      <section className="py-16 md:py-24 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Destinations</h2>
            <p className="text-red-500 mb-4">Error loading destinations. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Popular Destinations</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore hidden gems in these vibrant Indian cities
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <Skeleton className="h-60 w-full" />
                <div className="p-6">
                  <Skeleton className="h-7 w-3/4 mb-2" />
                  <Skeleton className="h-5 w-24 mb-4" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-full mb-5" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            cities.slice(0, 3).map((city: any) => (
              <Link 
                key={city.id} 
                href={`/explore?city=${city.id}`}
                className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 block border border-gray-100"
              >
                <div className="relative h-60 overflow-hidden">
                  <img 
                    src={`${city.imageUrl}`} 
                    alt={`${city.name} cityscape`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
                    <div className="p-6">
                      <div className="flex items-center mb-1">
                        <MapPin className="h-4 w-4 text-white mr-1.5" />
                        <span className="text-white font-medium">{city.state}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{city.name}</h3>
                      <div className="flex items-center text-amber-400">
                        {Array(Math.floor(city.rating / 10)).fill(0).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                        {city.rating % 10 >= 5 && (
                          <Star className="h-4 w-4 fill-current" />
                        )}
                        <span className="ml-2 text-white text-sm">{(city.rating / 10).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4 line-clamp-2">{city.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">Historical Sites</span>
                    <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">Local Food</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">Cultural Experience</span>
                  </div>
                  <div className="flex items-center text-blue-500 font-medium group-hover:text-blue-600">
                    <span>Explore Hidden Gems</span>
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        
        <div className="text-center mt-12">
          <Link 
            href="/explore" 
            className="inline-flex items-center bg-white hover:bg-blue-50 border border-gray-200 px-6 py-3 rounded-lg transition-colors shadow-sm hover:shadow text-blue-600 font-medium group"
          >
            <span>View all destinations</span>
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
