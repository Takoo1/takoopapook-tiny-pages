import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

const FounderProfile = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30 relative overflow-hidden">
        {/* Back Button */}
        <div className="absolute top-24 left-4 z-10">
          <button
            onClick={() => navigate('/about')}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-emerald-600 hover:text-emerald-700 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to About Us
          </button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                About{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Jumnya John Dini
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Founder & Visionary of TAKOO-PAPOOK Eco-Tourist
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mt-8 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Early Life & Background */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Early Life & Inspiration
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Jumnya John Dini, the passionate and visionary founder of TAKOO - PAPOOK Eco-Tourist, was born and raised in Likabali, Arunachal Pradesh—a region known for its rich cultural heritage, lush landscapes, and breathtaking natural beauty. Surrounded by dense forests, rivers, and the diverse traditions of indigenous tribes, Jumnya grew up with a deep appreciation for nature and the unique culture of his homeland.
                  </p>
                  <p>
                    His journey into eco-tourism and environmental conservation began early, inspired by the mesmerizing surroundings of Arunachal Pradesh. Driven by his love for travel and a commitment to preserving the environment, Jumnya pursued Diploma in Tourism Studies, gaining the technical knowledge needed to turn his passion into a sustainable business.
                  </p>
                  <p>
                    However, his education went beyond the classroom, as he learned about Arunachal's rich history, culture, and ecology firsthand from the region's communities. These early experiences laid the foundation for his future venture into eco-tourism.
                  </p>
                </div>
              </div>
              
              <div className="relative animate-scale-in">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Arunachal Pradesh landscape"
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent" />
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-20 animate-pulse" />
              </div>
            </div>

            {/* Professional Journey */}
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
              <div className="relative animate-scale-in order-2 lg:order-1">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Conservation work"
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-600/20 to-transparent" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-full opacity-30 animate-pulse" />
              </div>

              <div className="space-y-6 animate-fade-in order-1 lg:order-2">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Professional Journey & Leadership in Conservation
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Jumnya's career in environmental advocacy began with his role as Project Coordinator at the Eco-Friendly Society (EFS), a local NGO dedicated to environmental conservation and sustainable development in Arunachal Pradesh. In this role, he worked closely with government departments and local communities to promote the importance of preserving the region's natural habitats.
                  </p>
                  <p>
                    He conducted awareness programs, collaborated on conservation initiatives, and empowered local people to protect the rich biodiversity of Arunachal's forests and wildlife sanctuaries. His dedication and leadership led to his appointment as General Secretary of the EFS, where he served for three years.
                  </p>
                  <p>
                    Under his guidance, the NGO grew in its reach and impact, conducting numerous awareness campaigns and projects aimed at environmental protection. Jumnya's work during this period was instrumental in fostering a culture of sustainability and respect for nature in the region.
                  </p>
                </div>
              </div>
            </div>

            {/* Creative Ventures */}
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Creative Ventures & Promotion of Arunachal's Beauty
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Alongside his work in conservation, Jumnya nurtured his creative talents as a photographer and videographer. He established XD Green Mellow Frame, a production house focused on showcasing the untouched beauty of Arunachal Pradesh through captivating visual storytelling.
                  </p>
                  <p>
                    Jumnya used his platform to create promotional videos for regional tourist destinations, such as the historic Malithan Temple and other hidden gems, highlighting the rich cultural and natural heritage of the state.
                  </p>
                  <p>
                    His production house's tagline—"Explore, Capture, Create, and Inspire"—reflects Jumnya's mission to bring the unique beauty of Arunachal Pradesh to a global audience. Through his creative work, he has not only promoted eco-tourism but also raised awareness of the need for environmental conservation.
                  </p>
                </div>
              </div>
              
              <div className="relative animate-scale-in">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Photography and videography"
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/20 to-transparent" />
                </div>
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-teal-500/30 rounded-full animate-pulse" />
              </div>
            </div>

            {/* TAKOO-PAPOOK Inspiration */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl p-8 md:p-12 mb-20 animate-fade-in">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-8">
                  The Inspiration Behind TAKOO - PAPOOK
                </h2>
                <div className="space-y-6 text-emerald-700 leading-relaxed">
                  <p>
                    The name TAKOO - PAPOOK is deeply inspired by a rare and mystical local bird known for its distinct and melodic call, "TAKO... PAPOOK..." This bird, which sings its tune loudly enough to be heard from miles away, is closely tied to the changing of seasons and features prominently in the folklore, storytelling, and folk songs of the region's tribal communities.
                  </p>
                  <p>
                    It is considered a symbol of renewal and new beginnings in many of the traditional stories passed down through generations. For Jumnya, this mystical bird represents more than just a natural wonder—it embodies the essence of the land and its people.
                  </p>
                  <p>
                    The bird's rare appearance and cultural significance inspired him to name his eco-tourism venture after it, ensuring that his company remains deeply rooted in the traditions and also keeps it connected to its cultural origins, offering an authentic experience to travelers while preserving the local heritage.
                  </p>
                </div>
              </div>
            </div>

            {/* Vision & Legacy */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative animate-scale-in">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Mountain landscape with sunlight"
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-30 animate-pulse" />
              </div>

              <div className="space-y-6 animate-fade-in">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  TAKOO-PAPOOK Eco-Tourist: The Vision
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    TAKOO - PAPOOK Eco-Tourist is the culmination of Jumnya John Dini's lifelong passion for nature, culture, and responsible tourism. With Likabali, the gateway to central Arunachal Pradesh, as its base of operations, the company aims to introduce visitors from across the globe to the untouched beauty of the region.
                  </p>
                  <p>
                    The goal is to provide travelers with immersive, eco-friendly experiences that showcase Arunachal's rich cultural heritage, diverse wildlife, and pristine landscapes, while promoting sustainability and conservation.
                  </p>
                  <p>
                    Jumnya's vision for TAKOO - PAPOOK is to not only attract global tourists but also to give back to the local communities. By employing skilled youths and collaborating with local stakeholders, the company aims to uplift the region's economy and empower the indigenous people.
                  </p>
                </div>
              </div>
            </div>

            {/* Legacy Section */}
            <div className="mt-20 text-center bg-gradient-to-br from-teal-50 to-teal-100 rounded-3xl p-8 md:p-12 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-teal-800 mb-8">
                A Legacy Rooted in Arunachal's Soil
              </h2>
              <div className="max-w-4xl mx-auto space-y-6 text-teal-700 leading-relaxed">
                <p>
                  Jumnya John Dini's personal journey from a young nature lover to an eco-tourism entrepreneur is a testament to his deep-rooted connection to his homeland. His work in conservation, leadership in the NGO sector, and creative ventures in photography and film have all contributed to the realization of his dream project, TAKOO - PAPOOK Eco-Tourist.
                </p>
                <p>
                  Jumnya's respect for the land and its traditions, combined with his entrepreneurial spirit and passion for storytelling, ensures that TAKOO - PAPOOK will offer travelers an experience that is not only unforgettable but also responsible and sustainable. With the mystical TAKOO - PAPOOK bird as its symbol, the company is set to soar, introducing the world to the magical beauty of Arunachal Pradesh while preserving its heritage and natural resources for generations to come.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default FounderProfile;