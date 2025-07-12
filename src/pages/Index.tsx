
import HeroSection from '@/components/HeroSection';
import PackageCarousel from '@/components/PackageCarousel';
import DestinationCarousel from '@/components/DestinationCarousel';
import InteractiveMapSection from '@/components/InteractiveMapSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <PackageCarousel />
        <DestinationCarousel />
        <InteractiveMapSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
