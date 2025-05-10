import { Helmet } from "react-helmet";
import HeroSection from "@/components/home/HeroSection";
import PopularDestinations from "@/components/home/PopularDestinations";
import Categories from "@/components/home/Categories";
import FeaturedExperiences from "@/components/home/FeaturedExperiences";
import MapIntegration from "@/components/home/MapIntegration";
import VoiceGuideFeature from "@/components/home/VoiceGuideFeature";
import Testimonials from "@/components/home/Testimonials";
import DownloadCTA from "@/components/home/DownloadCTA";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>HiddenHeu - Discover Hidden Treasures Near You</title>
        <meta 
          name="description" 
          content="Explore lesser-known spots, local cuisines, and authentic experiences in Indian cities with HiddenHeu - your guide to hidden gems."
        />
      </Helmet>

      <HeroSection />
      <PopularDestinations />
      <Categories />
      <FeaturedExperiences />
      <MapIntegration />
      <VoiceGuideFeature />
      <Testimonials />
      <DownloadCTA />
    </>
  );
}
