import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface MobileMenuProps {
  isOpen: boolean;
  toggleMobileMenu: () => void;
}

export default function MobileMenu({ isOpen, toggleMobileMenu }: MobileMenuProps) {
  const [location] = useLocation();
  const [language, setLanguage] = useState("English");
  const [voiceGuideEnabled, setVoiceGuideEnabled] = useState(false);

  // Check if user is logged in
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const isLoggedIn = !!userData?.user;

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const toggleVoiceGuide = () => {
    setVoiceGuideEnabled(!voiceGuideEnabled);
  };

  const handleLogout = async () => {
    await apiRequest("POST", "/api/auth/logout", {});
    window.location.href = "/";
    toggleMobileMenu();
  };

  const isActive = (path: string) => {
    return location === path ? "text-primary" : "text-neutral-dark hover:text-primary";
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white border-t border-gray-100 p-4">
      <nav className="flex flex-col space-y-4">
        <Link href="/" className={`${isActive("/")} py-2`} onClick={toggleMobileMenu}>
          home
        </Link>
        <Link href="/explore" className={`${isActive("/explore")} py-2`} onClick={toggleMobileMenu}>
          explore
        </Link>
        <Link href="/about" className={`${isActive("/about")} py-2`} onClick={toggleMobileMenu}>
          about
        </Link>
        <Link href="/contact" className={`${isActive("/contact")} py-2`} onClick={toggleMobileMenu}>
          contact
        </Link>
        
        <div className="flex items-center justify-between py-2">
          <span>Language:</span>
          <select 
            className="appearance-none bg-transparent pr-8 py-1 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            value={language}
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
        
        <button 
          onClick={toggleVoiceGuide}
          className={`flex items-center space-x-1 rounded-full px-3 py-2 w-max ${
            voiceGuideEnabled ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          <i className={`fas ${voiceGuideEnabled ? "fa-volume-up" : "fa-volume-mute"}`}></i>
          <span className="text-sm">voiceGuide</span>
        </button>
        
        <div className="flex space-x-3 pt-2">
          {isLoggedIn ? (
            <div className="flex flex-col space-y-2 w-full">
              <span className="text-sm font-medium">Welcome, {userData?.user?.username}</span>
              <button 
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md transition-colors w-full text-center"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-neutral-dark hover:text-primary transition-colors flex-1 text-center"
                onClick={toggleMobileMenu}
              >
                login
              </Link>
              <Link 
                href="/register" 
                className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors flex-1 text-center"
                onClick={toggleMobileMenu}
              >
                register
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
