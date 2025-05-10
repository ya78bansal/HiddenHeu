import { useState } from 'react';
import { MapPin, AlertTriangle, Shield } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';

interface LocationPermissionUIProps {
  onLocationGranted?: (lat: string, lng: string) => void;
}

export default function LocationPermissionUI({ onLocationGranted }: LocationPermissionUIProps) {
  const { 
    location, 
    error, 
    loading, 
    permissionStatus, 
    requestLocation 
  } = useGeolocation();
  
  const { toast } = useToast();
  const [showHelp, setShowHelp] = useState(false);
  
  // Call the callback when location is available
  if (location && onLocationGranted && !loading) {
    onLocationGranted(location.latitude, location.longitude);
  }
  
  const handleRequestLocation = () => {
    requestLocation();
    toast({
      title: "Location Request Sent",
      description: "Please allow location access when prompted by your browser.",
      duration: 5000,
    });
  };
  
  // Different states based on permission status
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center p-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-gray-600">Locating you...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center p-4">
          <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
          <p className="text-gray-700 font-medium mb-1">Location Error</p>
          <p className="text-gray-600 text-sm text-center mb-4">{error}</p>
          
          {permissionStatus === 'denied' && (
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mb-4 text-sm">
              <p className="text-amber-700 font-medium mb-1">Location Access Blocked</p>
              <p className="text-amber-600">Please update your browser settings to allow location access for this site.</p>
              <button 
                onClick={() => setShowHelp(!showHelp)}
                className="text-blue-500 mt-2"
              >
                {showHelp ? 'Hide help' : 'Show me how'}
              </button>
              
              {showHelp && (
                <div className="mt-2 space-y-2 text-xs text-gray-600">
                  <p><strong>Chrome:</strong> Click the lock icon in address bar → Site settings → Location → Allow</p>
                  <p><strong>Firefox:</strong> Click the lock icon in address bar → Connection secure → More information → Permissions → Access Your Location → Allow</p>
                  <p><strong>Safari:</strong> Preferences → Websites → Location → Find this site and change to Allow</p>
                </div>
              )}
            </div>
          )}
          
          <button 
            onClick={handleRequestLocation}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      );
    }
    
    if (permissionStatus === 'prompt' || permissionStatus === 'unknown') {
      return (
        <div className="flex flex-col items-center p-4">
          <Shield className="w-12 h-12 text-blue-500 mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Enable Location</h3>
          <p className="text-gray-600 text-sm text-center mb-4">
            Allow HiddenHeu to access your location to discover nearby hidden gems and get directions.
          </p>
          <button 
            onClick={handleRequestLocation}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Enable Location
          </button>
          <p className="text-xs text-gray-500 mt-3">
            Your location is only used within this app and is never stored on our servers.
          </p>
        </div>
      );
    }
    
    if (location) {
      return (
        <div className="flex flex-col items-center p-4">
          <div className="bg-green-100 rounded-full p-3 mb-3">
            <MapPin className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-gray-700 font-medium mb-1">Location Found</p>
          {location.city && (
            <p className="text-gray-600 text-sm mb-2">
              {[location.city, location.state, location.country].filter(Boolean).join(', ')}
            </p>
          )}
          <p className="text-xs text-gray-500">
            {location.latitude}, {location.longitude}
          </p>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center p-4">
        <button 
          onClick={handleRequestLocation}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Get My Location
        </button>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {renderContent()}
    </div>
  );
}