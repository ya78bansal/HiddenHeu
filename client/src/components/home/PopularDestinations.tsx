import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function PopularDestinations() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/cities"],
  });

  const cities = data?.cities || [];

  if (error) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Popular Destinations</h2>
          <p className="text-red-500 mb-4">Error loading destinations. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Popular Destinations</h2>
        <p className="text-gray-600 mb-8">Explore hidden gems in these vibrant Indian cities</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-4 w-full mb-3" />
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
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow block"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={`${city.imageUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400`} 
                    alt={`${city.name} cityscape`} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-white">{city.name}</h3>
                      <div className="flex items-center text-yellow-400">
                        {Array(Math.floor(city.rating / 10)).fill(0).map((_, i) => (
                          <i key={i} className="fas fa-star text-sm"></i>
                        ))}
                        {city.rating % 10 >= 5 && (
                          <i className="fas fa-star-half-alt text-sm"></i>
                        )}
                        <span className="ml-1 text-white text-sm">{(city.rating / 10).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-3">{city.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Historical Spots</span>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Food Places</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">Cultural Sites</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        
        <div className="text-center mt-10">
          <Link href="/explore" className="inline-flex items-center space-x-2 text-primary hover:text-blue-700 font-medium">
            <span>View all destinations</span>
            <i className="fas fa-arrow-right text-sm"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
