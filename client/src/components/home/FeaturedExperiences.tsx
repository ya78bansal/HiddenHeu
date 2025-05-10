import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedExperiences() {
  const [position, setPosition] = useState(0);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [cardsToShow, setCardsToShow] = useState(3);
  const cardWidth = 350; // Same as the min-width in the CSS

  // Check viewport size on mount and resize
  useEffect(() => {
    const checkSize = () => {
      const viewportWidth = window.innerWidth;
      setIsMobile(viewportWidth < 768);
      
      if (viewportWidth < 768) {
        setCardsToShow(1);
      } else if (viewportWidth < 1024) {
        setCardsToShow(2);
      } else {
        setCardsToShow(3);
      }
    };
    
    checkSize();
    window.addEventListener('resize', checkSize);
    
    return () => {
      window.removeEventListener('resize', checkSize);
    };
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/places/featured"],
  });

  const featuredPlaces = data?.places || [];

  // Handle navigation
  const goNext = () => {
    if (!carouselTrackRef.current || !featuredPlaces.length) return;
    
    const maxPosition = -cardWidth * (featuredPlaces.length - cardsToShow);
    setPosition(Math.max(position - cardWidth, maxPosition));
  };

  const goPrev = () => {
    if (!carouselTrackRef.current) return;
    setPosition(Math.min(position + cardWidth, 0));
  };

  if (error) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured Experiences</h2>
          <p className="text-red-500 mb-4">Error loading experiences. Please try again later.</p>
        </div>
      </section>
    );
  }

  const getCategoryIcon = (categoryId: number) => {
    const iconMap: Record<number, { icon: string, color: string }> = {
      1: { icon: "fa-utensils", color: "amber" },
      2: { icon: "fa-hands", color: "green" },
      3: { icon: "fa-tshirt", color: "purple" },
      4: { icon: "fa-monument", color: "blue" },
      5: { icon: "fa-tree", color: "emerald" },
    };
    
    return iconMap[categoryId] || { icon: "fa-map-marker", color: "gray" };
  };

  const getCategoryName = (categoryId: number) => {
    const nameMap: Record<number, string> = {
      1: "Food",
      2: "Lifestyle",
      3: "Clothing",
      4: "Historical",
      5: "Nature",
    };
    
    return nameMap[categoryId] || "Place";
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured Experiences</h2>
            <p className="text-gray-600">Handpicked hidden gems across India</p>
          </div>
          <div className="hidden md:flex space-x-3">
            <button 
              onClick={goPrev}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Previous"
              disabled={position === 0}
            >
              <i className="fas fa-arrow-left text-gray-600"></i>
            </button>
            <button 
              onClick={goNext}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Next"
              disabled={isLoading || featuredPlaces.length <= cardsToShow || position <= -cardWidth * (featuredPlaces.length - cardsToShow)}
            >
              <i className="fas fa-arrow-right text-gray-600"></i>
            </button>
          </div>
        </div>
        
        <div className="overflow-hidden">
          <div 
            ref={carouselTrackRef}
            className="flex space-x-6 transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(${position}px)` }}
          >
            {isLoading ? (
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="min-w-[280px] md:min-w-[350px] bg-white rounded-xl shadow-md overflow-hidden">
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
              ))
            ) : (
              featuredPlaces.map((place: any) => (
                <div key={place.id} className="min-w-[280px] md:min-w-[350px] bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={`${place.imageUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400`} 
                      alt={place.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="place-category-badge">
                      <i className={`fas ${getCategoryIcon(place.categoryId).icon} text-${getCategoryIcon(place.categoryId).color}-500`}></i>
                      <span className="ml-1">{getCategoryName(place.categoryId)}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1">{place.name}</h3>
                    <div className="flex items-center mb-2">
                      <i className="fas fa-map-marker-alt text-sm text-red-500"></i>
                      <span className="text-gray-500 text-sm ml-1">{place.address}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{place.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-yellow-400">
                        {Array(Math.floor(place.rating / 10)).fill(0).map((_, i) => (
                          <i key={i} className="fas fa-star text-xs"></i>
                        ))}
                        {place.rating % 10 >= 5 && (
                          <i className="fas fa-star-half-alt text-xs"></i>
                        )}
                        <span className="ml-1 text-gray-700 text-xs">
                          {(place.rating / 10).toFixed(1)} ({place.reviewCount})
                        </span>
                      </div>
                      <Link href={`/place/${place.id}`} className="text-primary hover:text-blue-700 text-sm font-medium">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {!isLoading && featuredPlaces.length > 1 && (
          <div className="mt-6 flex justify-center md:hidden">
            <div className="flex space-x-1">
              {featuredPlaces.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full ${Math.abs(position) / cardWidth === i ? 'bg-primary' : 'bg-gray-300'}`}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
