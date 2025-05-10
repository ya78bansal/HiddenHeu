import { Link } from "wouter";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface PlaceCardProps {
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
  };
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const { toast } = useToast();
  
  // Check if user is logged in
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });
  
  const isLoggedIn = !!userData?.user;
  
  // Check if place is in user's favorites
  const { data: favoriteData, isLoading: isFavoriteLoading } = useQuery({
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

  const getCategoryIcon = (categoryId: number): string => {
    const iconMap: Record<number, string> = {
      1: "fa-utensils text-amber-500",
      2: "fa-hands text-green-500",
      3: "fa-tshirt text-purple-500",
      4: "fa-monument text-blue-500",
      5: "fa-tree text-emerald-500",
    };
    return iconMap[categoryId] || "fa-map-marker-alt text-gray-500";
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

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={`${place.imageUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400`} 
          alt={place.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium flex items-center space-x-1">
          <i className={`fas ${getCategoryIcon(place.categoryId)}`}></i>
          <span>{getCategoryName(place.categoryId)}</span>
        </div>
        <button
          onClick={toggleFavorite}
          className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavoriteLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
          ) : (
            <i className={`${isFavorite ? 'fas text-red-500' : 'far text-gray-600'} fa-heart`}></i>
          )}
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{place.name}</h3>
        <div className="flex items-center mb-2">
          <i className="fas fa-map-marker-alt text-sm text-red-500"></i>
          <span className="text-gray-500 text-sm ml-1">{place.address}</span>
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{place.description}</p>
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
          <Link 
            href={`/place/${place.id}`} 
            className="text-primary hover:text-blue-700 text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
