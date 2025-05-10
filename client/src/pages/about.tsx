import { Helmet } from "react-helmet";
import { Link } from "wouter";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About HiddenHeu - Discover Hidden Treasures Near You</title>
        <meta 
          name="description" 
          content="Learn about HiddenHeu's mission to help travelers discover authentic hidden gems across India."
        />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">About HiddenHeu</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Connecting travelers with authentic experiences and hidden gems across India
          </p>
        </div>
      </div>

      {/* Our Mission */}
      <section className="py-12 md:py-16" id="mission">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Our Mission</h2>
            <p className="text-gray-700 mb-6">
              HiddenHeu was founded with a simple but powerful mission: to help travelers discover 
              the authentic, off-the-beaten-path experiences that make India so special. While 
              popular attractions have their place, we believe that the true essence of a destination 
              lies in its hidden corners, local favorites, and lesser-known treasures.
            </p>
            <p className="text-gray-700 mb-6">
              Through our platform, we aim to connect travelers with local experiences that they 
              might otherwise miss, supporting small businesses and communities while providing 
              visitors with memorable, authentic adventures. We're passionate about showcasing 
              the diverse cultural tapestry of India, from secret food streets and artisan 
              workshops to serene natural spots and historical gems.
            </p>
            <p className="text-gray-700">
              By breaking language barriers with our multilingual voice guides and making 
              navigation simple with our integrated maps, we're making these hidden gems 
              accessible to everyone. Every place on HiddenHeu has been carefully curated 
              to ensure it offers an authentic, meaningful experience that goes beyond 
              the typical tourist trail.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-16 bg-gray-50" id="how-it-works">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-primary text-2xl"></i>
              </div>
              <h3 className="font-semibold text-lg mb-3">Discover</h3>
              <p className="text-gray-600">
                Search for hidden gems by city, category, or use our interactive map to find places near you. Filter based on your interests to find the perfect spot.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-headphones text-primary text-2xl"></i>
              </div>
              <h3 className="font-semibold text-lg mb-3">Experience</h3>
              <p className="text-gray-600">
                Use our voice guide feature to learn about the history and cultural significance of each place in your preferred language as you explore.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-heart text-primary text-2xl"></i>
              </div>
              <h3 className="font-semibold text-lg mb-3">Share</h3>
              <p className="text-gray-600">
                Save your favorite places, create personalized itineraries, and share your discoveries with friends and fellow travelers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-12 md:py-16" id="team">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Meet Our Team</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <i className="fas fa-user-circle text-7xl text-gray-400"></i>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-lg">Arjun Sharma</h3>
                <p className="text-gray-500 mb-2">Founder & CEO</p>
                <p className="text-sm text-gray-600">
                  Travel enthusiast with a passion for discovering hidden cultural gems across India.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <i className="fas fa-user-circle text-7xl text-gray-400"></i>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-lg">Priya Patel</h3>
                <p className="text-gray-500 mb-2">Chief Content Officer</p>
                <p className="text-sm text-gray-600">
                  Cultural historian who researches and curates the most authentic local experiences.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <i className="fas fa-user-circle text-7xl text-gray-400"></i>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-lg">Rahul Mehra</h3>
                <p className="text-gray-500 mb-2">Chief Technology Officer</p>
                <p className="text-sm text-gray-600">
                  Tech innovator focused on creating seamless, accessible travel experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-12 md:py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Join Our Journey</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Become part of our community and discover the true heart of India
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/register" 
              className="bg-white text-primary hover:bg-blue-50 px-6 py-3 rounded-md transition-colors font-medium"
            >
              Create an Account
            </Link>
            <Link 
              href="/explore" 
              className="bg-transparent hover:bg-blue-700 border border-white text-white px-6 py-3 rounded-md transition-colors font-medium"
            >
              Start Exploring
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section Teaser */}
      <section className="py-12 md:py-16" id="blog">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">From Our Blog</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <i className="fas fa-image text-5xl text-gray-400"></i>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">5 Hidden Food Streets Every Foodie Must Visit</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Discover the culinary treasures tucked away in the narrow lanes of India's vibrant cities.
                </p>
                <p className="text-primary text-sm font-medium">Coming Soon</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <i className="fas fa-image text-5xl text-gray-400"></i>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">The Forgotten Temples of Southern India</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Explore ancient architectural marvels that remain largely undiscovered by tourists.
                </p>
                <p className="text-primary text-sm font-medium">Coming Soon</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <i className="fas fa-image text-5xl text-gray-400"></i>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Meet the Artisans: Traditional Crafts in Modern India</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Stories of craftspeople keeping ancient traditions alive in workshops across the country.
                </p>
                <p className="text-primary text-sm font-medium">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section className="py-12 md:py-16 bg-gray-50" id="careers">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Join Our Team</h2>
            <p className="text-gray-700 mb-8">
              We're always looking for passionate individuals who share our love for travel, 
              culture, and technology. If you're excited about helping people discover the 
              authentic side of India, we'd love to hear from you.
            </p>
            
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h3 className="font-semibold text-lg mb-3">Current Openings</h3>
              <ul className="space-y-2 text-left">
                <li className="flex justify-between items-center border-b pb-2">
                  <span>Content Curator - Delhi Region</span>
                  <span className="text-primary text-sm">Coming Soon</span>
                </li>
                <li className="flex justify-between items-center border-b pb-2">
                  <span>Mobile App Developer</span>
                  <span className="text-primary text-sm">Coming Soon</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Community Manager</span>
                  <span className="text-primary text-sm">Coming Soon</span>
                </li>
              </ul>
            </div>
            
            <p className="text-gray-600">
              Don't see a role that fits? We're always interested in meeting talented people. 
              Send your resume to <span className="text-primary">careers@hiddenheu.com</span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
