import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChevronLeft, 
  ChevronRight,
  MapPin, 
  Star, 
  ChevronRight as ArrowRight,
  Utensils,
  Hand,
  Shirt,
  Landmark,
  TreePine
} from "lucide-react";

export default function FeaturedExperiences() {
  const [position, setPosition] = useState(0);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [cardsToShow, setCardsToShow] = useState(3);
  const cardWidth = 380; // Same as the min-width in the CSS

  // Check viewport size on mount and resize
  useEffect(() => {
    const checkSize = () => {
      const viewportWidth = window.innerWidth;
      setIsMobile(viewportWidth < 768);
      
      if (viewportWidth < 768) {
        setCardsToShow(1);
      } else if (viewportWidth < 1200) {
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

  const { data, isLoading, error } = useQuery<{places: any[]}>({
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
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Experiences</h2>
            <p className="text-red-500 mb-4">Error loading experiences. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  const getCategoryIcon = (categoryId: number) => {
    switch(categoryId) {
      case 1:
        return <Utensils className="h-4 w-4" />;
      case 2:
        return <Hand className="h-4 w-4" />;
      case 3:
        return <Shirt className="h-4 w-4" />;
      case 4:
        return <Landmark className="h-4 w-4" />;
      case 5:
        return <TreePine className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (categoryId: number) => {
    const colorMap: Record<number, string> = {
      1: "text-amber-500 bg-amber-50",
      2: "text-green-500 bg-green-50",
      3: "text-purple-500 bg-purple-50",
      4: "text-blue-500 bg-blue-50",
      5: "text-emerald-500 bg-emerald-50",
    };
    
    return colorMap[categoryId] || "text-gray-500 bg-gray-50";
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
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Experiences</h2>
            <p className="text-gray-600 text-lg">Handpicked hidden gems across India</p>
          </div>
          <div className="hidden md:flex space-x-4">
            <button 
              onClick={goPrev}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                position === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-50 text-blue-500 hover:bg-blue-100'
              }`}
              aria-label="Previous"
              disabled={position === 0}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={goNext}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isLoading || featuredPlaces.length <= cardsToShow || position <= -cardWidth * (featuredPlaces.length - cardsToShow)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-50 text-blue-500 hover:bg-blue-100'
              }`}
              aria-label="Next"
              disabled={isLoading || featuredPlaces.length <= cardsToShow || position <= -cardWidth * (featuredPlaces.length - cardsToShow)}
            >
              <ChevronRight className="h-6 w-6" />
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
                <div key={index} className="min-w-[300px] md:min-w-[380px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                  <Skeleton className="h-56 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-7 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-8 w-28 rounded-md" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              featuredPlaces.map((place: any) => (
                <div key={place.id} className="min-w-[300px] md:min-w-[380px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={`${place.imageUrl}`} 
                      alt={place.name} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <div className={`absolute top-4 left-4 rounded-full px-3 py-1.5 text-xs font-medium flex items-center ${getCategoryColor(place.categoryId)}`}>
                      <span className="mr-1.5">{getCategoryIcon(place.categoryId)}</span>
                      <span>{getCategoryName(place.categoryId)}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{place.name}</h3>
                    <div className="flex items-center mb-3 text-gray-500">
                      <MapPin className="h-4 w-4 text-red-500 mr-1.5" />
                      <span className="text-sm">{place.address}</span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{place.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-amber-400">
                        {Array(Math.floor(place.rating / 10)).fill(0).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                        {place.rating % 10 >= 5 && (
                          <Star className="h-4 w-4 fill-current" />
                        )}
                        <span className="ml-2 text-gray-700 text-sm">
                          {(place.rating / 10).toFixed(1)} ({place.reviewCount})
                        </span>
                      </div>
                      <Link 
                        href={`/place/${place.id}`} 
                        className="flex items-center text-blue-500 hover:text-blue-700 font-medium text-sm group"
                      >
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {!isLoading && featuredPlaces.length > 1 && (
          <div className="mt-8 flex justify-center md:hidden">
            <div className="flex space-x-2">
              {featuredPlaces.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2.5 h-2.5 rounded-full ${Math.abs(position) / cardWidth === i ? 'bg-blue-500' : 'bg-gray-300'}`}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
