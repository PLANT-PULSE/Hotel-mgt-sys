'use client';

import Navbar from '@/components/Navbar';
import { Star, Award, Users, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-10 sm:pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            About LuxeStay
          </h1>
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto">
            Experience luxury redefined. We create unforgettable moments for every guest.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-10 sm:py-16 px-4 bg-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Our Story</h2>
              <p className="text-slate-300 mb-4">
                Founded in 2010, LuxeStay has been at the forefront of hospitality, 
                providing exceptional accommodations that blend modern luxury with 
                timeless elegance.
              </p>
              <p className="text-slate-300 mb-4">
                Our commitment to excellence has earned us recognition as one of the 
                premier hotel destinations, with properties in the most desirable 
                locations around the world.
              </p>
              <p className="text-slate-300">
                Every guest is family to us, and we strive to make every stay 
                a memorable experience.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-slate-700 p-4 sm:p-6 rounded-xl text-center">
                <Star className="h-6 sm:h-8 w-6 sm:w-8 text-amber-400 mx-auto mb-2 sm:mb-3" />
                <div className="text-xl sm:text-2xl font-bold text-white">4.9</div>
                <div className="text-slate-400 text-xs sm:text-sm">Guest Rating</div>
              </div>
              <div className="bg-slate-700 p-4 sm:p-6 rounded-xl text-center">
                <Award className="h-6 sm:h-8 w-6 sm:w-8 text-amber-400 mx-auto mb-2 sm:mb-3" />
                <div className="text-xl sm:text-2xl font-bold text-white">15+</div>
                <div className="text-slate-400 text-xs sm:text-sm">Awards Won</div>
              </div>
              <div className="bg-slate-700 p-4 sm:p-6 rounded-xl text-center">
                <Users className="h-6 sm:h-8 w-6 sm:w-8 text-amber-400 mx-auto mb-2 sm:mb-3" />
                <div className="text-xl sm:text-2xl font-bold text-white">50K+</div>
                <div className="text-slate-400 text-xs sm:text-sm">Happy Guests</div>
              </div>
              <div className="bg-slate-700 p-4 sm:p-6 rounded-xl text-center">
                <Heart className="h-6 sm:h-8 w-6 sm:w-8 text-amber-400 mx-auto mb-2 sm:mb-3" />
                <div className="text-xl sm:text-2xl font-bold text-white">100%</div>
                <div className="text-slate-400 text-xs sm:text-sm">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-10 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-12">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-slate-800 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-white mb-4">Excellence</h3>
              <p className="text-slate-400">
                We pursue excellence in every aspect of our service, from the 
                cleanliness of our rooms to the warmth of our hospitality.
              </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-white mb-4">Innovation</h3>
              <p className="text-slate-400">
                We continuously innovate to provide modern amenities and smart 
                solutions that enhance your comfort and convenience.
              </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-white mb-4">Sustainability</h3>
              <p className="text-slate-400">
                We are committed to sustainable practices that protect our 
                environment while providing luxurious experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-slate-900 text-center">
        <p className="text-slate-400">
          © 2024 LuxeStay Hotel. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
