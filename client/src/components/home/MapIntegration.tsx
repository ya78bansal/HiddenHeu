import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGeolocation } from '@/hooks/useGeolocation';

interface Place {
  id: number;
  name: string;
  description: string;
  address: string;
  categoryId: number;
  cityId: number;
  imageUrl: string;
  latitude: string;
  longitude: string;
  rating: number;
  reviewCount: number;
  tags: string[];
}

export default function MapIntegration() {
  const [range, setRange] = useState(5);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, boolean>>({
    food: true,
    historical: true,
    cultural: true,
    nature: true,
    markets: true,
  });
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  
  const { 
    location, 
    error: locationError, 
    loading: locationLoading, 
    requestLocation 
  } = useGeolocation();

  // Fetch places data
  const { data: placesData } = useQuery({
    queryKey: ['/api/places'],
    enabled: !!location,
  });

  // Initialize and update map when the location is available
  useEffect(() => {
    if (!location || !window.google || !mapRef.current) return;

    // Create map instance
    const mapOptions = {
      center: { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) },
      zoom: 13,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    };

    const map = new google.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;

    // Add user location marker
    new google.maps.Marker({
      position: { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) },
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      title: 'Your Location',
    });

    // Draw a circle with the range radius
    new google.maps.Circle({
      strokeColor: '#4285F4',
      strokeOpacity: 0.3,
      strokeWeight: 2,
      fillColor: '#4285F4',
      fillOpacity: 0.1,
      map,
      center: { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) },
      radius: range * 1000, // convert km to meters
    });

    return () => {
      // Clean up markers when component unmounts
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [location, range]);

  // Add or update place markers
  useEffect(() => {
    if (!mapInstanceRef.current || !placesData?.places || !location) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Filter places based on selected filters
    const filteredPlaces = placesData.places.filter((place: Place) => {
      // Check if the place category is selected
      if (place.categoryId === 1 && !selectedFilters.food) return false;
      if (place.categoryId === 4 && !selectedFilters.historical) return false;
      if (place.categoryId === 3 && !selectedFilters.cultural) return false;
      if (place.categoryId === 5 && !selectedFilters.nature) return false;
      if (place.categoryId === 2 && !selectedFilters.markets) return false;

      // Calculate distance from user (simple approximation)
      const lat1 = parseFloat(location.latitude);
      const lon1 = parseFloat(location.longitude);
      const lat2 = parseFloat(place.latitude);
      const lon2 = parseFloat(place.longitude);
      
      const R = 6371; // Radius of earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      const distance = R * c; // Distance in km
      
      return distance <= range;
    });

    // Add new markers for filtered places
    filteredPlaces.forEach((place: Place) => {
      const marker = new google.maps.Marker({
        position: { 
          lat: parseFloat(place.latitude), 
          lng: parseFloat(place.longitude) 
        },
        map: mapInstanceRef.current,
        title: place.name,
        icon: {
          url: `https://maps.google.com/mapfiles/ms/icons/${getCategoryIconColor(place.categoryId)}-dot.png`,
        },
      });

      // Add click listener to marker
      marker.addListener('click', () => {
        setSelectedPlace(place);
      });

      markersRef.current.push(marker);
    });
  }, [placesData, location, selectedFilters, range]);

  const getCategoryIconColor = (categoryId: number): string => {
    switch (categoryId) {
      case 1: return 'orange'; // Food
      case 2: return 'purple'; // Lifestyle/Markets
      case 3: return 'pink';   // Clothing/Cultural
      case 4: return 'blue';   // Historical
      case 5: return 'green';  // Nature
      default: return 'red';
    }
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRange(parseInt(e.target.value));
  };

  const getCategoryName = (categoryId: number): string => {
    switch (categoryId) {
      case 1: return 'Food';
      case 2: return 'Lifestyle';
      case 3: return 'Clothing';
      case 4: return 'Historical';
      case 5: return 'Nature';
      default: return 'Place';
    }
  };

  return (
    <section className="py-12 md:py-16 bg-gray-50" id="mapSection">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Discover Hidden Gems Near You</h2>
            <p className="text-gray-600 mb-6">
              Use our interactive map to find unique experiences around your location. 
              Enable location services to see places near you.
            </p>
            
            <div className="bg-white rounded-xl shadow-md p-5 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <i className="fas fa-location-arrow text-primary"></i>
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold">Your Location</h3>
                  <p className="text-sm text-gray-500" id="currentLocation">
                    {locationLoading 
                      ? 'Detecting location...' 
                      : locationError 
                        ? 'Location not detected' 
                        : location 
                          ? `${location.city || 'Your location'}, ${location.state || 'India'}`
                          : 'Location not detected'
                    }
                  </p>
                </div>
              </div>
              <button 
                onClick={requestLocation}
                className="w-full bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center"
                disabled={locationLoading}
              >
                <i className="fas fa-location-crosshairs mr-2"></i>
                <span>{locationLoading ? 'Detecting...' : 'Enable Location'}</span>
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-5">
              <h3 className="font-semibold mb-3">Filter Nearby Places</h3>
              <div className="space-y-3 mb-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-primary" 
                    checked={selectedFilters.food}
                    onChange={() => handleFilterChange('food')}
                  />
                  <span>Food Places</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-primary" 
                    checked={selectedFilters.historical}
                    onChange={() => handleFilterChange('historical')}
                  />
                  <span>Historical Spots</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-primary" 
                    checked={selectedFilters.cultural}
                    onChange={() => handleFilterChange('cultural')}
                  />
                  <span>Cultural Sites</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-primary" 
                    checked={selectedFilters.nature}
                    onChange={() => handleFilterChange('nature')}
                  />
                  <span>Nature Trails</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-primary" 
                    checked={selectedFilters.markets}
                    onChange={() => handleFilterChange('markets')}
                  />
                  <span>Local Markets</span>
                </label>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Distance Range</label>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={range} 
                  onChange={handleRangeChange}
                  className="w-full accent-primary" 
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 km</span>
                  <span>{range} km</span>
                  <span>20 km</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden h-[500px] relative">
              {/* Map container */}
              <div 
                ref={mapRef} 
                className="absolute inset-0 bg-gray-200"
              >
                {!location && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6">
                      <i className="fas fa-map-marked-alt text-5xl text-gray-400 mb-3"></i>
                      <p className="text-gray-500">
                        {locationLoading 
                          ? 'Detecting your location...' 
                          : 'Enable location to view hidden gems near you.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Place details overlay */}
              {selectedPlace && (
                <div className="absolute bottom-0 left-0 right-0 bg-white p-4 shadow-md transition-transform z-10">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold">{selectedPlace.name}</h3>
                    <button 
                      onClick={() => setSelectedPlace(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="flex space-x-3 mb-3">
                    <div className="w-20 h-20 rounded-md overflow-hidden">
                      <img 
                        src={`${selectedPlace.imageUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100`} 
                        alt={selectedPlace.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        <i className="fas fa-map-marker-alt text-sm text-red-500"></i>
                        <span className="text-gray-500 text-sm ml-1">{selectedPlace.address}</span>
                      </div>
                      <div className="flex items-center text-yellow-400 mb-1">
                        {Array(Math.floor(selectedPlace.rating / 10)).fill(0).map((_, i) => (
                          <i key={i} className="fas fa-star text-xs"></i>
                        ))}
                        {selectedPlace.rating % 10 >= 5 && (
                          <i className="fas fa-star-half-alt text-xs"></i>
                        )}
                        <span className="ml-1 text-gray-700 text-xs">
                          {(selectedPlace.rating / 10).toFixed(1)} ({selectedPlace.reviewCount})
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`text-xs bg-${getCategoryIconColor(selectedPlace.categoryId)}-100 text-${getCategoryIconColor(selectedPlace.categoryId)}-800 px-2 py-0.5 rounded-full`}>
                          {getCategoryName(selectedPlace.categoryId)}
                        </span>
                        {selectedPlace.tags && selectedPlace.tags.slice(0, 1).map((tag, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{selectedPlace.description}</p>
                  <div className="flex justify-between">
                    <button className="flex items-center space-x-1 text-sm text-primary">
                      <i className="fas fa-directions"></i>
                      <span>Get Directions</span>
                    </button>
                    <button className="flex items-center space-x-1 text-sm text-primary">
                      <i className="fas fa-volume-up"></i>
                      <span>Voice Guide</span>
                    </button>
                    <button className="bg-primary hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      onClick={() => window.location.href = `/place/${selectedPlace.id}`}>
                      View Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
