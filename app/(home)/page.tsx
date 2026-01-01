import { CtaSection } from "@/components/home/cta";
import { FeaturesSection } from "@/components/home/features";
import { HeroSection } from "@/components/home/hero";
import { HowItWorksSection } from "@/components/home/how-it-works-section";

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
    </div>
  );
};

export default HomePage;
