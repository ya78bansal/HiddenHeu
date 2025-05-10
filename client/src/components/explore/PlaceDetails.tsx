import { Link } from "wouter";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useVoiceGuide } from "@/hooks/useVoiceGuide";
import { useGeolocation } from "@/hooks/useGeolocation";
import { calculateDistance, getDirectionsUrl } from "@/lib/mapUtils";

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

export default function PlaceDetails({ place, onClose, isModal = false }: PlaceDetailsProps) {
  const { toast } = useToast();
  const { speak, isSpeaking, stop } = useVoiceGuide();
  const [currentLanguage, setCurrentLanguage] = useState("English");
  
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
      speak(place.description, currentLanguage);
      toast({
        title: "Voice Guide Active",
        description: `Now playing in ${currentLanguage}`,
        duration: 3000,
      });
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLanguage(e.target.value);
    if (isSpeaking) {
      stop();
      setTimeout(() => {
        speak(place.description, e.target.value);
      }, 300);
    }
  };

  const getDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&destination_place_id=${place.name}`;
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
      
      <p className="text-sm text-gray-600 mb-3">{place.description}</p>
      
      <div className="flex justify-between">
        <button 
          onClick={getDirections}
          className="flex items-center space-x-1 text-sm text-primary"
        >
          <i className="fas fa-directions"></i>
          <span>Get Directions</span>
        </button>
        
        <div className="flex items-center">
          <button 
            onClick={handleVoiceGuide}
            className="flex items-center space-x-1 text-sm text-primary mr-3"
          >
            <i className={`fas ${isSpeaking ? 'fa-pause' : 'fa-volume-up'}`}></i>
            <span>{isSpeaking ? 'Pause' : 'Voice Guide'}</span>
          </button>
          
          {isSpeaking && (
            <select
              className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-transparent"
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
          )}
        </div>
        
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
