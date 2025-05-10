import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useVoiceGuide } from "@/hooks/useVoiceGuide";

export default function PlaceDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { speak, isSpeaking, stop } = useVoiceGuide();
  const [currentLanguage, setCurrentLanguage] = useState("English");

  // Fetch place details
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/places/${id}`],
    enabled: !!id,
  });

  const place = data?.place;

  // Check if user is logged in
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });
  
  const isLoggedIn = !!userData?.user;
  
  // Check if place is in user's favorites
  const { data: favoriteData, isLoading: isFavoriteLoading } = useQuery({
    queryKey: isLoggedIn ? [`/api/favorites/${id}`] : null,
    enabled: isLoggedIn,
  });
  
  const isFavorite = favoriteData?.isFavorite;

  // Fetch reviews for this place
  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
    queryKey: [`/api/places/${id}/reviews`],
    enabled: !!id,
  });

  const reviews = reviewsData?.reviews || [];

  // Update page title when place data is loaded
  useEffect(() => {
    if (place) {
      document.title = `${place.name} - HiddenHeu`;
    }
  }, [place]);

  // Handle voice guide functionality
  const handleVoiceGuide = () => {
    if (isSpeaking) {
      stop();
    } else if (place) {
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
    if (isSpeaking && place) {
      stop();
      setTimeout(() => {
        speak(place.description, e.target.value);
      }, 300);
    }
  };

  // Handle favorite toggle
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
        await apiRequest("DELETE", `/api/favorites/${id}`, undefined);
        toast({
          title: "Removed from favorites",
          description: `${place.name} has been removed from your favorites`,
          duration: 3000,
        });
      } else {
        await apiRequest("POST", "/api/favorites", { placeId: parseInt(id) });
        toast({
          title: "Added to favorites",
          description: `${place.name} has been added to your favorites`,
          duration: 3000,
        });
      }
      
      // Invalidate the favorites cache
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDirections = () => {
    if (place) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&destination_place_id=${place.name}`;
      window.open(url, '_blank');
    }
  };

  // Helper functions
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2 mb-4" />
          <Skeleton className="h-80 w-full rounded-xl mb-6" />
          <Skeleton className="h-40 w-full mb-6" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <i className="fas fa-exclamation-circle text-5xl text-red-500 mb-4"></i>
          <h1 className="text-2xl font-bold mb-2">Place Not Found</h1>
          <p className="text-gray-600 mb-6">
            The place you are looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/explore")}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Explore Other Places
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${place.name} - HiddenHeu`}</title>
        <meta name="description" content={place.description.substring(0, 160)} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{place.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt text-red-500 mr-1"></i>
                <span className="text-gray-600">{place.address}</span>
              </div>
              <span className="mx-2 text-gray-300">•</span>
              <div className="flex items-center text-yellow-400">
                {Array(Math.floor(place.rating / 10)).fill(0).map((_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
                {place.rating % 10 >= 5 && (
                  <i className="fas fa-star-half-alt"></i>
                )}
                <span className="ml-1 text-gray-700">
                  {(place.rating / 10).toFixed(1)} ({place.reviewCount} reviews)
                </span>
              </div>
              <span className="mx-2 text-gray-300">•</span>
              <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColorClass(place.categoryId)}`}>
                {getCategoryName(place.categoryId)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {place.tags && place.tags.map((tag: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative rounded-xl overflow-hidden mb-8 h-72 md:h-96">
            <img
              src={`${place.imageUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600`}
              alt={place.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={toggleFavorite}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavoriteLoading ? (
                  <div className="w-5 h-5 border-2 border-t-primary border-gray-300 rounded-full animate-spin"></div>
                ) : (
                  <i className={`${isFavorite ? 'fas text-red-500' : 'far text-gray-600'} fa-heart text-lg`}></i>
                )}
              </button>
              <button 
                onClick={handleVoiceGuide}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                  isSpeaking ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                aria-label={isSpeaking ? "Stop voice guide" : "Start voice guide"}
              >
                <i className={`fas ${isSpeaking ? 'fa-pause' : 'fa-volume-up'} text-lg`}></i>
              </button>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={getDirections}
                className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                <i className="fas fa-directions"></i>
                <span>Get Directions</span>
              </button>
              
              {isSpeaking && (
                <div className="flex items-center">
                  <select
                    className="text-sm border border-gray-200 rounded px-2 py-1 bg-transparent"
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
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/explore')}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <i className="fas fa-arrow-left mr-1"></i>
                Back to Explore
              </button>
            </div>
          </div>

          {/* Tabs for Description and Reviews */}
          <Tabs defaultValue="description" className="mb-8">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="map" className="flex-1">Map</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">About {place.name}</h2>
                  <p className="text-gray-700 mb-4">{place.description}</p>
                  
                  {isSpeaking && (
                    <div className="bg-blue-50 rounded-lg p-4 mt-6 border border-blue-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <i className="fas fa-volume-up text-primary mr-2"></i>
                          <span className="font-medium">Voice Guide Active</span>
                        </div>
                        <button 
                          onClick={stop}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Stop
                        </button>
                      </div>
                      <div className="h-8 bg-white rounded-md flex items-center justify-center overflow-hidden px-2">
                        {/* Voice wave animation */}
                        {Array(10).fill(0).map((_, i) => (
                          <div 
                            key={i} 
                            className="voice-wave-bar animate-wave mx-0.5"
                            style={{
                              animationDelay: `${i * 0.1}s`,
                              height: `${Math.floor(Math.random() * 12) + 4}px`
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Visitor Reviews</h2>
                  
                  {isLoadingReviews ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border-b pb-4 mb-4">
                          <div className="flex items-center mb-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="ml-2">
                              <Skeleton className="h-4 w-32 mb-1" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-6">
                      <i className="fas fa-comment-alt text-4xl text-gray-300 mb-3"></i>
                      <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review: any) => (
                        <div key={review.id} className="border-b pb-4 mb-4">
                          <div className="flex items-center mb-2">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-primary font-semibold">
                                {review.user?.username?.substring(0, 2).toUpperCase() || "U"}
                              </span>
                            </div>
                            <div className="ml-2">
                              <p className="font-medium">{review.user?.username || "Anonymous"}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center text-yellow-400 mb-2">
                            {Array(review.rating).fill(0).map((_, i) => (
                              <i key={i} className="fas fa-star text-xs"></i>
                            ))}
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {isLoggedIn ? (
                    <button 
                      className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                      onClick={() => {
                        toast({
                          title: "Coming Soon",
                          description: "The review feature will be available soon!",
                        });
                      }}
                    >
                      Write a Review
                    </button>
                  ) : (
                    <p className="mt-4 text-sm text-gray-500">
                      Please <a href="/login" className="text-primary hover:underline">log in</a> to write a review.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="map">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Location</h2>
                  
                  <div className="h-80 bg-gray-100 rounded-lg overflow-hidden">
                    <iframe 
                      title={`Map of ${place.name}`}
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      style={{ border: 0 }} 
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyC2EcC8GBWAyFmw5RY8A1n1nNhDJeUoUJI&q=${place.latitude},${place.longitude}`} 
                      allowFullScreen
                    ></iframe>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-gray-700">
                      <i className="fas fa-map-marker-alt text-red-500 mr-2"></i>
                      {place.address}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
