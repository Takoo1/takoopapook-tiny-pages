
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Explore = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20 min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Explore Arunachal Pradesh</h1>
          <p className="text-xl text-gray-600">Coming Soon - Discover hidden gems and popular destinations</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Explore;
