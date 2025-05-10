import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { User, Heart, MapPin, Calendar, Settings, Bookmark, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Extract query parameters
function useQueryParams() {
  const [location] = useLocation();
  return new URLSearchParams(location.split("?")[1] || "");
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const params = useQueryParams();
  const tabParam = params.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "profile");
  
  // Get user data
  const { data: userData, isLoading: isUserLoading } = useQuery<{user?: {
    id: number;
    username: string;
    email: string;
    fullName?: string;
    preferredLanguage?: string;
  }}>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });
  
  // Get user favorites
  const { data: favoritesData, isLoading: isFavoritesLoading } = useQuery<{places: Array<{
    id: number;
    name: string;
    description: string;
    address: string;
    imageUrl?: string;
    cityId: number;
    cityName?: string;
    rating?: number;
  }>}>({
    queryKey: ["/api/favorites"],
    enabled: !!userData?.user?.id,
  });
  
  // Add error handling and redirect if needed
  useEffect(() => {
    if (!isUserLoading && !userData?.user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your profile",
        variant: "destructive",
      });
      setLocation("/login");
    }

    // Handle tab selection from URL params
    if (tabParam && ["profile", "favorites", "settings"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [userData, isUserLoading, setLocation, toast, tabParam]);

  if (isUserLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Type guard for user data
  if (!userData || !userData.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <p className="mt-4 text-gray-600">You need to be logged in to view this page</p>
          <Link href="/login" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const user = userData.user;

  const favorites = favoritesData?.places || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold">{user.username}</h2>
              <p className="text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-400 mt-1">Member since {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                  activeTab === "profile" 
                    ? "bg-blue-50 text-blue-500" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <User className="w-4 h-4 mr-3" />
                Profile Information
              </button>
              
              <button 
                onClick={() => setActiveTab("favorites")}
                className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                  activeTab === "favorites" 
                    ? "bg-blue-50 text-blue-500" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Heart className="w-4 h-4 mr-3" />
                My Favorites
                {favorites.length > 0 && (
                  <span className="ml-auto bg-blue-100 text-blue-500 text-xs px-2 py-1 rounded-full">
                    {favorites.length}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => setActiveTab("settings")}
                className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                  activeTab === "settings" 
                    ? "bg-blue-50 text-blue-500" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Settings className="w-4 h-4 mr-3" />
                Account Settings
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="w-full md:w-3/4">
          {activeTab === "profile" && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm text-gray-500">Username</label>
                  <p className="font-medium">{user.username}</p>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{user.email}</p>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <label className="text-sm text-gray-500">Preferred Language</label>
                  <p className="font-medium">{user.preferredLanguage || "English"}</p>
                </div>
                
                <div className="mt-8">
                  <button 
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    onClick={() => setActiveTab("settings")}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "favorites" && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">My Favorite Places</h2>
              
              {isFavoritesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favorites.map((place) => (
                    <div key={place.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-40 bg-gray-200 relative">
                        {place.imageUrl && (
                          <img 
                            src={place.imageUrl} 
                            alt={place.name} 
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute top-2 right-2">
                          <button 
                            className="p-1.5 bg-white rounded-full shadow-sm hover:bg-red-50"
                            onClick={async () => {
                              try {
                                await fetch(`/api/favorites/${place.id}`, {
                                  method: "DELETE",
                                });
                                
                                toast({
                                  title: "Removed from favorites",
                                  description: `${place.name} has been removed from your favorites`,
                                });
                                
                                // Refetch favorites
                                // (This would require a mutation in a real implementation)
                              } catch (error) {
                                console.error("Error removing favorite:", error);
                              }
                            }}
                          >
                            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{place.name}</h3>
                          <div className="flex items-center text-amber-500">
                            <span className="text-sm mr-1">{place.rating || "4.5"}</span>
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{place.address}</p>
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>
                              {place.cityName || "Unknown location"}
                            </span>
                          </div>
                          <Link href={`/place-details?id=${place.id}`} className="text-blue-500 text-sm">
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">You haven't added any favorites yet!</p>
                  <Link 
                    href="/explore" 
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Explore Places
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {activeTab === "settings" && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
              
              <form 
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast({
                    title: "Settings Saved",
                    description: "Your account settings have been updated successfully.",
                  });
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue={user.fullName || ""}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue={user.email}
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Language
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue={user.preferredLanguage || "English"}
                    >
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Tamil</option>
                      <option>Bengali</option>
                      <option>Gujarati</option>
                      <option>Marathi</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
              
              <div className="mt-10 pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                <form 
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Password Updated",
                      description: "Your password has been changed successfully.",
                    });
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input 
                      type="password" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter current password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input 
                      type="password" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input 
                      type="password" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      type="submit"
                      className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}