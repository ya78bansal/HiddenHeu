import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Utensils,
  Landmark,
  Music,
  Mountain,
  ShoppingBag
} from "lucide-react";

export default function Categories() {
  const { data, isLoading, error } = useQuery<{categories: any[]}>({
    queryKey: ["/api/categories"],
  });

  const categories = data?.categories || [];

  if (error) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Explore by Experience</h2>
            <p className="text-red-500 mb-4">Error loading categories. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  const getCategoryIcon = (iconName: string) => {
    switch(iconName) {
      case 'fa-utensils':
        return <Utensils className="h-7 w-7" />;
      case 'fa-landmark':
        return <Landmark className="h-7 w-7" />;
      case 'fa-music':
        return <Music className="h-7 w-7" />;
      case 'fa-mountain':
        return <Mountain className="h-7 w-7" />;
      case 'fa-shopping-bag':
        return <ShoppingBag className="h-7 w-7" />;
      default:
        return <Utensils className="h-7 w-7" />;
    }
  };

  const getColorClass = (colorName: string) => {
    const colorMap: Record<string, string> = {
      'amber': 'bg-amber-100 text-amber-600',
      'green': 'bg-green-100 text-green-600',
      'purple': 'bg-purple-100 text-purple-600',
      'blue': 'bg-blue-100 text-blue-600',
      'emerald': 'bg-emerald-100 text-emerald-600',
    };
    
    return colorMap[colorName] || 'bg-amber-100 text-amber-600';
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Popular Destinations</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Find hidden gems based on your interests and travel preferences
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {isLoading ? (
            Array(5).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center">
                <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-28 mx-auto mb-3" />
                <Skeleton className="h-4 w-36 mx-auto" />
              </div>
            ))
          ) : (
            categories.map((category: any) => (
              <Link 
                key={category.id} 
                href={`/explore?category=${category.id}`}
                className="group bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-100"
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${getColorClass(category.colorClass)}`}>
                  {getCategoryIcon(category.icon)}
                </div>
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-500 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 mt-2">{category.description}</p>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
