
import HeroSection from '@/components/HeroSection';
import PackageCarousel from '@/components/PackageCarousel';
import DestinationCarousel from '@/components/DestinationCarousel';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { Star, Eye, Heart, Users } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        
        {/* About TAKOO-PAPOOK Section */}
        <section className="section-padding bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
          <div className="container mx-auto container-padding relative">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6 sm:mb-8 lg:mb-10 animate-fade-in">
                <h2 className="mb-4 sm:mb-6">
                  About{' '}
                  <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    TAKOO-PAPOOK
                  </span>
                </h2>
                <div className="w-16 sm:w-20 lg:w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full" />
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="content-spacing animate-fade-in text-center">
                  <div className="content-spacing-sm">
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      TAKOO-PAPOOK Eco-Tourist seeks to revolutionize eco-tourism in Arunachal Pradesh by providing tourists with memorable experiences that reflect the region's rich culture, natural beauty, and ecological diversity.
                    </p>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      Our focus on sustainability, local employment, and customer satisfaction ensures that we not only grow as a business but also contribute to the well-being of the local community and environment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PackageCarousel />

        {/* Vision & Mission Section */}
        <section className="section-padding bg-background">
          <div className="container mx-auto container-padding">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6 sm:mb-8 lg:mb-10 animate-fade-in">
                <h2 className="mb-3 sm:mb-4">
                  Vision & Mission
                </h2>
                <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full" />
              </div>

              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-16">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/30 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                      <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-emerald-800 dark:text-emerald-200">Our Vision</h3>
                  </div>
                  <p className="text-sm sm:text-base text-emerald-700 dark:text-emerald-300 leading-relaxed text-center">
                    To become the leading eco-tourism service provider in the region, offering sustainable, culturally enriching travel experiences that contribute to the conservation of nature and the upliftment of local communities.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-900/30 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                      <Star className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-teal-800 dark:text-teal-200">Our Mission</h3>
                  </div>
                  <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-teal-700 dark:text-teal-300">
                    <li className="flex items-start justify-center">
                      <span className="text-teal-500 mr-2 mt-1 text-sm">•</span>
                      <span>Promote Arunachal Pradesh's unique culture and natural beauty globally</span>
                    </li>
                    <li className="flex items-start justify-center">
                      <span className="text-teal-500 mr-2 mt-1 text-sm">•</span>
                      <span>Provide affordable, genuine eco-tourism packages with environmental focus</span>
                    </li>
                    <li className="flex items-start justify-center">
                      <span className="text-teal-500 mr-2 mt-1 text-sm">•</span>
                      <span>Offer seamless digital travel experiences with curated tour plans</span>
                    </li>
                    <li className="flex items-start justify-center">
                      <span className="text-teal-500 mr-2 mt-1 text-sm">•</span>
                      <span>Empower local youth and preserve cultural heritage</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <DestinationCarousel />

        {/* Founder Section */}
        <section className="section-padding bg-gradient-to-br from-muted/30 to-accent/20">
          <div className="container mx-auto container-padding">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6 sm:mb-8 lg:mb-10 animate-fade-in">
                <h2 className="mb-3 sm:mb-4">
                  Meet Our Founder
                </h2>
                <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full" />
              </div>

              <div className="text-center">
                <div className="relative animate-scale-in mb-6 sm:mb-8 lg:mb-10 flex justify-center">
                  <div className="relative">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                      <img
                        src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                        alt="Jumnya John Dini - Founder"
                        className="w-80 h-80 sm:w-96 sm:h-96 lg:w-[400px] lg:h-[400px] object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 via-transparent to-transparent" />
                    </div>
                    
                    <div className="absolute -top-3 -left-3 sm:-top-6 sm:-left-6 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-full animate-pulse" />
                    <div className="absolute -bottom-3 -right-3 sm:-bottom-6 sm:-right-6 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-cyan-400/30 to-emerald-500/30 rounded-full animate-pulse" />
                    
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-lg">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800">Jumnya John Dini</h3>
                      <p className="text-sm sm:text-base text-emerald-600 font-semibold">Founder & CEO</p>
                    </div>
                  </div>
                </div>

                <div className="content-spacing animate-fade-in max-w-4xl mx-auto">
                  <div>
                    <h3 className="mb-4 sm:mb-6 text-center">
                      Visionary Leader
                      <span className="block text-sm sm:text-base font-normal text-emerald-600 mt-1 sm:mt-2">From Likabali, Arunachal Pradesh</span>
                    </h3>
                    
                    <div className="content-spacing-sm text-sm sm:text-base text-muted-foreground leading-relaxed text-center">
                      <p className="mb-4">
                        Jumnya John Dini, founder of TAKOO-PAPOOK Eco-Tourist, hails from Likabali, Arunachal Pradesh—a land of rich cultural heritage and natural beauty. Growing up amidst dense forests, flowing rivers, and vibrant indigenous traditions, Jumnya developed a deep-rooted love for nature and his homeland's unique culture.
                      </p>
                      
                      <p>
                        With a Diploma in Tourism Studies and years of experience in environmental conservation, Jumnya combines formal education with real-world knowledge to promote sustainable tourism while preserving Arunachal Pradesh's environment and culture.
                      </p>
                    </div>

                    <div className="mt-6 sm:mt-8">
                      <button 
                        onClick={() => navigate('/founder-profile')}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-semibold hover:from-emerald-600 hover:to-teal-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Read More About Him
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        
      </main>
      <Footer />
    </div>
  );
};

export default Index;
