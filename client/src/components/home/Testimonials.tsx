import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

export default function Testimonials() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/testimonials'],
  });

  const testimonials = data?.testimonials || [];

  if (error) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">What Travelers Say</h2>
          <p className="text-red-500 mb-4">Error loading testimonials. Please try again later.</p>
        </div>
      </section>
    );
  }

  // Generate star ratings based on rating score (out of 50)
  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating / 10);
    const hasHalfStar = (rating % 10) >= 5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center space-x-1 text-yellow-400 mb-4">
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="fas fa-star"></i>
        ))}
        {hasHalfStar && <i className="fas fa-star-half-alt"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="far fa-star"></i>
        ))}
      </div>
    );
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">What Travelers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover how our platform has helped travelers uncover authentic experiences across India
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <div className="flex items-center">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="ml-3">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            testimonials.map((testimonial: any) => (
              <div key={testimonial.id} className="bg-white rounded-xl shadow-md p-6">
                {renderStarRating(testimonial.rating)}
                <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-primary font-semibold">{testimonial.avatarInitials}</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">{testimonial.name}</h3>
                    <p className="text-xs text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
