import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function DownloadCTA() {
  // Check if user is logged in
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const isLoggedIn = !!userData?.user;

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Get Started with HiddenHeu</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Create an account to save your favorite hidden gems, track your visits, and get personalized recommendations
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
          {isLoggedIn ? (
            <Link 
              href="/explore" 
              className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <i className="fas fa-compass"></i>
              <span>Explore Hidden Gems</span>
            </Link>
          ) : (
            <>
              <Link 
                href="/register" 
                className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <i className="fas fa-user-plus"></i>
                <span>Create an Account</span>
              </Link>
              <Link 
                href="/login" 
                className="bg-white hover:bg-gray-100 text-neutral-dark border border-gray-300 px-6 py-3 rounded-md transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <i className="fab fa-google"></i>
                <span>Continue with Google</span>
              </Link>
            </>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-10">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fas fa-map-marked-alt text-primary"></i>
            </div>
            <span className="font-medium">500+ Hidden Gems</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fas fa-language text-primary"></i>
            </div>
            <span className="font-medium">10+ Languages</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fas fa-city text-primary"></i>
            </div>
            <span className="font-medium">30+ Indian Cities</span>
          </div>
        </div>
      </div>
    </section>
  );
}
