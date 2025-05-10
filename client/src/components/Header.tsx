import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  Menu, 
  Globe,
  User,
  LogOut,
  Settings,
  Heart
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  toggleMobileMenu: () => void;
}

export default function Header({ toggleMobileMenu }: HeaderProps) {
  const [location] = useLocation();
  const [language, setLanguage] = useState("English");
  const [voiceGuideEnabled, setVoiceGuideEnabled] = useState(false);
  const { toast } = useToast();

  // Check if user is logged in
  const { data: userData, isLoading: isAuthLoading } = useQuery<{user?: {id: number; username: string; email: string}}>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const isLoggedIn = !!userData?.user;

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const toggleVoiceGuide = () => {
    setVoiceGuideEnabled(!voiceGuideEnabled);
    toast({
      title: voiceGuideEnabled ? "Voice Guide Disabled" : "Voice Guide Enabled",
      description: voiceGuideEnabled ? 
        "Voice narration has been turned off." : 
        "Voice narration is now active for supported content.",
      duration: 3000,
    });
  };

  const isActive = (path: string) => {
    return location === path 
      ? "text-blue-500 font-medium" 
      : "text-gray-700 hover:text-blue-500 transition-colors";
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="text-blue-500 text-2xl font-bold">Hidden<span className="text-amber-500">Heu</span></span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className={isActive("/")}>home</Link>
          <Link href="/explore" className={isActive("/explore")}>explore</Link>
          <Link href="/about" className={isActive("/about")}>about</Link>
          <Link href="/contact" className={isActive("/contact")}>contact</Link>

          <div className="flex items-center">
            <Globe className="h-4 w-4 text-gray-500 mr-1" />
            <div className="relative">
              <select 
                className="appearance-none bg-transparent pr-8 py-1 focus:outline-none text-gray-700"
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
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-500">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <button 
            onClick={toggleVoiceGuide}
            className={`flex items-center space-x-1 rounded-full px-3 py-1 border transition-colors ${
              voiceGuideEnabled 
                ? "bg-blue-50 text-blue-500 border-blue-200" 
                : "bg-gray-50 text-gray-500 border-gray-200"
            }`}
          >
            {voiceGuideEnabled ? <Volume2 className="h-4 w-4 mr-1" /> : <VolumeX className="h-4 w-4 mr-1" />}
            <span className="text-sm">voiceGuide</span>
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          {isAuthLoading ? (
            <div className="hidden md:block w-16 h-8 bg-gray-200 animate-pulse rounded"></div>
          ) : isLoggedIn && userData && userData.user ? (
            <div className="hidden md:flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 text-sm text-gray-700 hover:text-blue-500 transition-colors">
                    <span>{userData.user.username}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Favorites</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await apiRequest("POST", "/api/auth/logout", {});
                      window.location.href = "/";
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden md:block text-gray-700 hover:text-blue-500 transition-colors font-medium">
                login
              </Link>
              <Link 
                href="/register" 
                className="hidden md:block bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md transition-colors font-medium shadow-sm hover:shadow"
              >
                register
              </Link>
            </>
          )}
          
          <button 
            className="md:hidden text-gray-700" 
            onClick={toggleMobileMenu}
            aria-label="Open mobile menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
