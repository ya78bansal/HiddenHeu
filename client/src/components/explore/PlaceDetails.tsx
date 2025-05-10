import { Link } from "wouter";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useVoiceGuide } from "@/hooks/useVoiceGuide";
import { useGeolocation } from "@/hooks/useGeolocation";
import { calculateDistance, getDirectionsUrl } from "@/lib/mapUtils";
import { getTranslation } from "@/lib/translationUtils";

interface PlaceDetailsProps {
  place: {
    id: number;
    name: string;
    description: string;
    address: string;
    cityId: number;
    categoryId: number;
    imageUrl: string;
    rating: number;
    reviewCount: number;
    tags: string[];
    latitude?: string;
    longitude?: string;
  };
  onClose?: () => void;
  isModal?: boolean;
  userLocation?: { lat: number, lng: number } | null;
}

export default function PlaceDetails({ place, onClose, isModal = false, userLocation = null }: PlaceDetailsProps) {
  const { toast } = useToast();
  const { speak, isSpeaking, stop } = useVoiceGuide();
  const [currentLanguage, setCurrentLanguage] = useState("English");
  const [translatedDescription, setTranslatedDescription] = useState<string>(place.description);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  
  // Also get user's location from hook if not provided as prop
  const { location: geoLocation } = useGeolocation();
  
  // Translate description when language changes
  useEffect(() => {
    const translateDescription = async () => {
      if (currentLanguage === "English") {
        setTranslatedDescription(place.description);
        return;
      }
      
      setIsTranslating(true);
      try {
        const translated = await getTranslation(place.description, currentLanguage);
        setTranslatedDescription(translated);
      } catch (error) {
        console.error("Translation error:", error);
        toast({
          title: "Translation Failed",
          description: "Could not translate the description. Using original text.",
          variant: "destructive",
        });
      } finally {
        setIsTranslating(false);
      }
    };
    
    translateDescription();
  }, [place.description, currentLanguage, toast]);
  
  // Check if user is logged in
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });
  
  const isLoggedIn = !!userData?.user;
  
  // Check if place is in user's favorites
  const { data: favoriteData } = useQuery({
    queryKey: isLoggedIn ? [`/api/favorites/${place.id}`] : null,
    enabled: isLoggedIn,
  });
  
  const isFavorite = favoriteData?.isFavorite;

  const getCategoryName = (categoryId: number): string => {
    const categoryMap: Record<number, string> = {
      1: "Food",
      2: "Lifestyle",
      3: "Clothing",
      4: "Historical",
      5: "Nature",
    };
    return categoryMap[categoryId] || "Place";
  };

  const getCategoryColorClass = (categoryId: number): string => {
    const colorMap: Record<number, string> = {
      1: "bg-amber-100 text-amber-800",
      2: "bg-green-100 text-green-800",
      3: "bg-purple-100 text-purple-800",
      4: "bg-blue-100 text-blue-800",
      5: "bg-emerald-100 text-emerald-800",
    };
    return colorMap[categoryId] || "bg-gray-100 text-gray-800";
  };

  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${place.id}`, undefined);
        toast({
          title: "Removed from favorites",
          description: `${place.name} has been removed from your favorites`,
          duration: 3000,
        });
      } else {
        await apiRequest("POST", "/api/favorites", { placeId: place.id });
        toast({
          title: "Added to favorites",
          description: `${place.name} has been added to your favorites`,
          duration: 3000,
        });
      }
      
      // Invalidate the favorites cache
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${place.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceGuide = () => {
    if (isSpeaking) {
      stop();
    } else {
      // Use the translated description for voice narration
      speak(translatedDescription, currentLanguage);
      toast({
        title: "Voice Guide Active",
        description: `Now playing in ${currentLanguage}`,
        duration: 3000,
      });
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setCurrentLanguage(newLanguage);
    
    // Update voice guide if it's playing
    if (isSpeaking) {
      stop();
      setTimeout(() => {
        // Use translated description with the voice guide
        speak(translatedDescription, newLanguage);
      }, 300);
    }
    
    // Toast to inform user about translation
    if (newLanguage !== "English") {
      toast({
        title: `Translating to ${newLanguage}`,
        description: isTranslating ? "Translation in progress..." : "Description has been translated",
        duration: 3000,
      });
    }
  };

  // Calculate distance from user if location is available
  const calculateDistanceFromUser = (): string | null => {
    if (!place.latitude || !place.longitude) return null;
    
    // Use provided userLocation or get from geolocation hook
    const userLat = userLocation?.lat || (geoLocation ? parseFloat(geoLocation.latitude) : null);
    const userLng = userLocation?.lng || (geoLocation ? parseFloat(geoLocation.longitude) : null);
    
    if (userLat === null || userLng === null) return null;
    
    const distance = calculateDistance(
      userLat,
      userLng,
      parseFloat(place.latitude),
      parseFloat(place.longitude)
    );
    
    // Format distance: if less than 1km, show in meters
    return distance < 1 
      ? `${Math.round(distance * 1000)}m` 
      : `${distance.toFixed(1)}km`;
  };

  const getDirections = () => {
    if (!place.latitude || !place.longitude) {
      toast({
        title: "Unable to get directions",
        description: "Location coordinates are not available for this place.",
        variant: "destructive",
      });
      return;
    }
    
    const url = getDirectionsUrl(
      parseFloat(place.latitude),
      parseFloat(place.longitude),
      place.name
    );
    window.open(url, '_blank');
  };

  return (
    <div className={isModal ? "p-0" : "p-4"}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{place.name}</h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
      
      <div className="flex space-x-3 mb-3">
        <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
          <img 
            src={`${place.imageUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200`} 
            alt={place.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="flex items-center mb-1">
            <i className="fas fa-map-marker-alt text-sm text-red-500"></i>
            <span className="text-gray-500 text-sm ml-1">{place.address}</span>
          </div>
          {calculateDistanceFromUser() && (
            <div className="flex items-center mb-1">
              <i className="fas fa-route text-sm text-blue-500"></i>
              <span className="text-gray-500 text-sm ml-1">{calculateDistanceFromUser()} away</span>
            </div>
          )}
          <div className="flex items-center text-yellow-400 mb-1">
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
          <div className="flex items-center space-x-1">
            <span className={`text-xs ${getCategoryColorClass(place.categoryId)} px-2 py-0.5 rounded-full`}>
              {getCategoryName(place.categoryId)}
            </span>
            {place.tags && place.tags.slice(0, 1).map((tag: string, index: number) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mb-3">
        {isTranslating ? (
          <div className="flex items-center justify-center py-2 text-sm">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
            <span>Translating...</span>
          </div>
        ) : (
          <p className="text-sm text-gray-600">{translatedDescription}</p>
        )}
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center">
            <span className="text-xs text-gray-400">Language:</span>
            <select
              className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-transparent ml-1"
              value={currentLanguage}
              onChange={handleLanguageChange}
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Tamil</option>
              <option>Bengali</option>
              <option>Gujarati</option>
              <option>Marathi</option>
            </select>
          </div>
          {currentLanguage !== "English" && (
            <button 
              onClick={() => setCurrentLanguage("English")}
              className="text-xs text-primary"
            >
              Show original
            </button>
          )}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button 
          onClick={getDirections}
          className="flex items-center space-x-1 text-sm text-primary"
        >
          <i className="fas fa-directions"></i>
          <span>Get Directions</span>
        </button>
        
        <button 
          onClick={handleVoiceGuide}
          className="flex items-center space-x-1 text-sm text-primary"
        >
          <i className={`fas ${isSpeaking ? 'fa-pause' : 'fa-volume-up'}`}></i>
          <span>{isSpeaking ? 'Pause' : 'Voice Guide'}</span>
        </button>
        
        {isModal ? (
          <button 
            onClick={toggleFavorite}
            className="flex items-center space-x-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
          >
            <i className={`${isFavorite ? 'fas text-red-500' : 'far text-gray-600'} fa-heart`}></i>
            <span>{isFavorite ? 'Saved' : 'Save'}</span>
          </button>
        ) : (
          <Link 
            href={`/place/${place.id}`}
            className="bg-primary hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}
