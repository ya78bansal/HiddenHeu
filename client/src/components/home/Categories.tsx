import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function Categories() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/categories"],
  });

  const categories = data?.categories || [];

  if (error) {
    return (
      <section className="py-12 md:py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Explore by Experience</h2>
          <p className="text-red-500 mb-4">Error loading categories. Please try again later.</p>
        </div>
      </section>
    );
  }

  const getColorClass = (colorName: string) => {
    const colorMap: Record<string, string> = {
      'amber': 'category-icon-food',
      'green': 'category-icon-lifestyle',
      'purple': 'category-icon-clothing',
      'blue': 'category-icon-historical',
      'emerald': 'category-icon-nature',
    };
    
    return colorMap[colorName] || 'category-icon-food';
  };

  return (
    <section className="py-12 md:py-16 bg-blue-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Explore by Experience</h2>
        <p className="text-gray-600 mb-8">Find hidden gems based on your interests</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {isLoading ? (
            Array(5).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-4 text-center">
                <Skeleton className="w-16 h-16 rounded-full mx-auto mb-3" />
                <Skeleton className="h-5 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-36 mx-auto" />
              </div>
            ))
          ) : (
            categories.map((category: any) => (
              <Link 
                key={category.id} 
                href={`/explore?category=${category.id}`}
                className="group bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className={`category-icon ${getColorClass(category.colorClass)}`}>
                  <i className={`fas ${category.icon} text-2xl`}></i>
                </div>
                <h3 className="font-medium text-neutral-dark group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{category.description}</p>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
