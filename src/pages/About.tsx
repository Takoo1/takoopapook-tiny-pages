
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-12 sm:pb-16 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
        <div className="container mx-auto container-padding relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in">
              <h1 className="mb-4 sm:mb-6 leading-tight">
                About{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  TAKOO-PAPOOK
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8">
                Revolutionizing eco-tourism in Arunachal Pradesh through sustainable and culturally enriching experiences
              </p>
              <div className="w-16 sm:w-20 lg:w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Company Description */}
      <section className="section-padding bg-background">
        <div className="container mx-auto container-padding">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              <div className="content-spacing animate-fade-in">
                <div>
                  <h2 className="mb-4 sm:mb-6">
                    Our Story
                  </h2>
                  <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                    <p>
                      TAKOO-PAPOOK Eco-Tourist seeks to revolutionize eco-tourism in Arunachal Pradesh by providing tourists with memorable experiences that reflect the region's rich culture, natural beauty, and ecological diversity.
                    </p>
                    <p>
                      Our focus on sustainability, local employment, and customer satisfaction ensures that we not only grow as a business but also contribute to the well-being of the local community and environment.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-6">
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-medium">
                      Eco-Tourism
                    </span>
                    <span className="bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 px-4 py-2 rounded-full text-sm font-medium">
                      Cultural Heritage
                    </span>
                    <span className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 px-4 py-2 rounded-full text-sm font-medium">
                      Sustainability
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="relative animate-scale-in">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Arunachal Pradesh landscape"
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent" />
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-full animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-cyan-400/30 to-emerald-500/30 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder's Background */}
      <section className="py-20 bg-gradient-to-br from-muted/30 to-accent/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Founder's Background
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full" />
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Founder Image */}
              <div className="relative animate-scale-in order-2 lg:order-1">
                <div className="relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                    <img
                      src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                      alt="Jumnya John Dini - Founder"
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 via-transparent to-transparent" />
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-full animate-pulse" />
                  <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-gradient-to-br from-cyan-400/30 to-emerald-500/30 rounded-full animate-pulse" />
                  
                  {/* Founder Name Badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800">Jumnya John Dini</h3>
                    <p className="text-emerald-600 font-semibold">Founder & CEO</p>
                  </div>
                </div>
              </div>

              {/* Founder Description */}
              <div className="space-y-6 animate-fade-in order-1 lg:order-2">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                    About Jumnya John Dini
                    <span className="block text-lg font-normal text-emerald-600 mt-2">(Founder)</span>
                  </h3>
                  
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      Jumnya John Dini, founder of TAKOO - PAPOOK Eco-Tourist, hails from Llikabali, Arunachal Pradesh—a land of rich cultural heritage and natural beauty. Growing up amidst dense forests, flowing rivers, and vibrant indigenous traditions, Jumnya developed a deep-rooted love for nature and his homeland's unique culture.
                    </p>
                    
                    <p>
                      His journey into eco-tourism began early, inspired by the environment around him. With a Diploma in Tourism Studies, Jumnya combined formal education with real-world knowledge gained from local communities, history, and ecology. His passion for travel and conservation drives his mission to promote sustainable tourism while preserving the environment and culture of Arunachal Pradesh.
                    </p>
                  </div>

                  {/* Read More Button */}
                  <div className="mt-8 text-center">
                    <button 
                      onClick={() => window.location.href = '/founder-profile'}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-full font-semibold hover:from-emerald-600 hover:to-teal-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
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

      {/* Vision & Mission Section */}
      <section className="py-20 bg-gradient-to-br from-muted/30 to-accent/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Vision & Mission
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full" />
            </div>

            <div className="grid lg:grid-cols-2 gap-16">
              {/* Vision */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/30 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <span className="text-3xl">🌟</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-emerald-800 dark:text-emerald-200">Our Vision</h3>
                </div>
                <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed text-center">
                  To become the leading eco-tourism service provider in the region, offering sustainable, culturally enriching travel experiences that contribute to the conservation of nature and the upliftment of local communities.
                </p>
              </div>

              {/* Mission */}
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-900/30 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-teal-800 dark:text-teal-200">Our Mission</h3>
                </div>
                <ul className="space-y-3 text-teal-700 dark:text-teal-300">
                  <li className="flex items-start">
                    <span className="text-teal-500 mr-2 mt-1 font-bold">•</span>
                    <span>Promote the unique and diverse culture of Arunachal Pradesh and its natural beauty to a global audience.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-500 mr-2 mt-1 font-bold">•</span>
                    <span>Provide affordable and genuine eco-tourism packages with a focus on environmental conservation and sustainable travel.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-500 mr-2 mt-1 font-bold">•</span>
                    <span>Offer tourists a seamless travel experience via our digital platforms, providing detailed, curated tour plans, transportation, accommodation, and guided experiences.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-500 mr-2 mt-1 font-bold">•</span>
                    <span>Hire and empower local youth, offering them meaningful employment and an opportunity to preserve and promote their heritage.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 animate-fade-in">
              Our Core Values
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/30 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-fade-in group">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🌿</span>
                </div>
                <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-4">Sustainability</h3>
                <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed">Preserving nature for future generations through responsible tourism practices and environmental conservation.</p>
              </div>
              
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-900/30 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-fade-in group">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🤝</span>
                </div>
                <h3 className="text-xl font-bold text-teal-800 dark:text-teal-200 mb-4">Community</h3>
                <p className="text-teal-700 dark:text-teal-300 leading-relaxed">Supporting local employment and empowering indigenous communities while preserving cultural heritage.</p>
              </div>
              
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/30 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-fade-in group">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">⭐</span>
                </div>
                <h3 className="text-xl font-bold text-cyan-800 dark:text-cyan-200 mb-4">Excellence</h3>
                <p className="text-cyan-700 dark:text-cyan-300 leading-relaxed">Delivering memorable experiences that exceed expectations through quality service and attention to detail.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto container-padding">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Services
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full mb-8" />
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-12">
                Discover Arunachal Pradesh through our comprehensive travel solutions, 
                designed to create unforgettable experiences while preserving local culture and nature.
              </p>
            </div>
          </div>
        </div>
        
        {/* Comprehensive Tour Packages */}
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="h-6 w-6 sm:h-8 sm:w-8 text-primary">📍</div>
              <h3 className="text-2xl md:text-3xl font-bold">Comprehensive Tour Packages</h3>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Catering to nature enthusiasts, adventure seekers, cultural tourists, and pilgrims
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
            {[
              { 
                icon: '🚗', 
                title: "Complete Transportation", 
                desc: "All modes covered - flights to Guwahati, road transfers via Bhalukpong/Tenga, helicopter services to remote areas, and local vehicle arrangements with experienced drivers familiar with mountain terrain"
              },
              { 
                icon: '🏠', 
                title: "Authentic Accommodation", 
                desc: "Eco-friendly homestays with local families, heritage hotels showcasing regional architecture, luxury resorts with mountain views, and camping sites in pristine wilderness areas with proper facilities"
              },
              { 
                icon: '👨‍🏫', 
                title: "Expert Local Guidance", 
                desc: "Certified local guides fluent in multiple languages, wildlife experts for nature tours, cultural interpreters for festival participation, and safety specialists for adventure activities"
              },
              { 
                icon: '🎭', 
                title: "Immersive Cultural Programs", 
                desc: "Participation in Mopin, Solung, and Losar festivals, traditional craft workshops, tribal cooking classes, meditation sessions at monasteries, and authentic village ceremonies"
              },
              { 
                icon: '🌲', 
                title: "Nature & Wildlife Expeditions", 
                desc: "Guided treks through Namdapha National Park, bird watching tours with over 500 species, orchid trails during blooming season, and responsible wildlife photography experiences"
              },
              { 
                icon: '🍜', 
                title: "Authentic Cuisine Experience", 
                desc: "Traditional Arunachali dishes including thukpa, momos, and bamboo shoot delicacies, cooking demonstrations by local chefs, organic farm-to-table meals, and special dietary accommodations"
              }
            ].map((feature, index) => (
              <div key={index} className="group hover-scale border border-border/50 bg-card/50 backdrop-blur-sm h-full overflow-hidden rounded-xl p-6">
                <div className="text-center pb-3 sm:pb-4">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-3 sm:mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
                    <div className="text-4xl sm:text-5xl">
                      {feature.icon}
                    </div>
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold group-hover:text-primary transition-colors duration-300">{feature.title}</h4>
                </div>
                <div className="text-center flex-1">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Platform Features */}
        <div className="bg-muted/30 py-16">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="h-8 w-8 text-primary">🌐</div>
                <h3 className="text-2xl md:text-3xl font-bold">Digital Platform Features</h3>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our digital platforms provide seamless booking and comprehensive travel support
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {[
                { 
                  icon: '📦', 
                  title: "Smart Custom Packages", 
                  desc: "AI-powered itinerary planning based on your interests, travel dates, budget, and group size. Real-time pricing with transparent cost breakdown and flexible payment options"
                },
                { 
                  icon: '🧠', 
                  title: "Live Travel Intelligence", 
                  desc: "Real-time weather updates, road conditions, permit status, festival schedules, and location-based recommendations. Interactive map with GPS coordinates for all destinations"
                },
                { 
                  icon: '✅', 
                  title: "Verified Destinations", 
                  desc: "Hand-curated locations verified by our local team, detailed accessibility information, crowd density indicators, best visiting times, and insider tips from experienced travelers"
                },
                { 
                  icon: '🔒', 
                  title: "Military-Grade Security", 
                  desc: "256-bit SSL encryption, PCI DSS compliant payment processing, secure document storage for permits, and comprehensive travel insurance options with emergency evacuation coverage"
                },
                { 
                  icon: '🎯', 
                  title: "24/7 Concierge Support", 
                  desc: "Multi-language support team, emergency assistance hotline, real-time trip monitoring, instant rebooking for weather delays, and local emergency contacts in every destination"
                },
                { 
                  icon: '📱', 
                  title: "Offline-First Technology", 
                  desc: "Downloadable maps and guides for areas with limited connectivity, offline translation tools, emergency contact information, and pre-loaded local tips and cultural etiquette guides"
                }
              ].map((feature, index) => (
                <div key={index} className="group hover-scale border border-border/50 bg-background/80 backdrop-blur-sm h-full overflow-hidden rounded-xl p-6">
                  <div className="text-center pb-4">
                    <div className="w-22 h-22 sm:w-28 sm:h-28 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:shadow-xl">
                      <div className="text-4xl sm:text-5xl">
                        {feature.icon}
                      </div>
                    </div>
                    <h4 className="text-xl font-semibold group-hover:text-secondary transition-colors duration-300">{feature.title}</h4>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Local Experiences */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="h-8 w-8 text-primary">📸</div>
                <h3 className="text-2xl md:text-3xl font-bold">Unique Local Experiences</h3>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Immerse yourself in authentic Arunachal Pradesh culture and pristine nature
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {[
                { 
                  icon: '🏛️', 
                  title: "Sacred Ancient Sites", 
                  desc: "Explore Tawang Monastery (largest in India), Urgelling Monastery (birthplace of 6th Dalai Lama), Malithan Temple with its mystical caves, and Akashi Ganga's sacred waters with spiritual significance"
                },
                { 
                  icon: '🥾', 
                  title: "Epic Trekking Adventures", 
                  desc: "Multi-day treks through Sela Pass (13,700 ft), Bumla Pass border crossing, Mechuka Valley's hidden trails, Ziro Valley's rice fields, and virgin forests with rare flora and fauna"
                },
                { 
                  icon: '🌿', 
                  title: "Pristine Wilderness Areas", 
                  desc: "Kane Wildlife Sanctuary with golden langurs, Magi Lake's crystal waters, Namdapha's four big cats, Dibru-Saikhowa's river dolphins, and Eaglenest's endemic bird species"
                },
                { 
                  icon: '🎉', 
                  title: "Vibrant Cultural Festivals", 
                  desc: "BASCON celebration with traditional competitions, Yomgo River Festival's community gatherings, Mopin harvest celebrations, Solung agricultural festivals, and Losar Tibetan New Year ceremonies"
                },
                { 
                  icon: '🏡', 
                  title: "Authentic Community Living", 
                  desc: "Stay with Monpa families in Tawang, experience Apatani culture in Ziro, live with Mishmi tribes in remote villages, participate in daily routines, and learn traditional crafts and farming"
                },
                { 
                  icon: '⛰️', 
                  title: "Adventure Sports & Activities", 
                  desc: "White water rafting on Brahmaputra tributaries, paragliding over Ziro Valley, rock climbing in Sela Pass, fishing in pristine mountain streams, and camping under star-filled skies"
                },
                { 
                  icon: '📷', 
                  title: "Photography Expeditions", 
                  desc: "Specialized tours for wildlife photography, landscape captures of dramatic mountain vistas, cultural documentation of tribal life, and exclusive access to remote photogenic locations"
                },
                { 
                  icon: '🧘', 
                  title: "Wellness & Spiritual Retreats", 
                  desc: "Meditation programs at ancient monasteries, yoga sessions amid Himalayan peaks, traditional healing therapies, spiritual guidance from Buddhist monks, and digital detox experiences"
                }
              ].map((experience, index) => (
                <div key={index} className="group hover-scale border border-border/50 bg-card/50 backdrop-blur-sm h-full overflow-hidden rounded-xl p-6">
                  <div className="text-center pb-4">
                    <div className="w-22 h-22 sm:w-28 sm:h-28 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg group-hover:rotate-3">
                      <div className="text-4xl sm:text-5xl">
                        {experience.icon}
                      </div>
                    </div>
                    <h4 className="text-xl font-semibold group-hover:text-accent-foreground transition-colors duration-300">{experience.title}</h4>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-muted-foreground leading-relaxed">{experience.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 py-16">
          <div className="max-w-4xl mx-auto text-center container-padding">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Ready to Start Your Adventure?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of travelers who have discovered the magic of Arunachal Pradesh with our expert guidance and sustainable tourism practices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.href = '/packages'}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Explore Packages
              </button>
              <button 
                onClick={() => window.location.href = '/booking'}
                className="border border-primary text-primary px-8 py-3 rounded-xl font-semibold hover:bg-primary hover:text-white transform hover:scale-105 transition-all duration-300"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
