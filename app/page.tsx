import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Navbar />
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-slate-900/40"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
            LuxeStay
          </h1>
          <p className="text-xl md:text-2xl text-amber-100 mb-8">
            Premium Hotel Booking Experience
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link 
              href="/rooms" 
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white text-lg font-semibold rounded-lg transition-colors"
            >
              Browse Rooms
            </Link>
            <a 
              href="/rooms.html" 
              className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-slate-900 text-lg font-semibold rounded-lg transition-colors"
            >
              View Hotel Site
            </a>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 px-4 bg-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Explore Our Hotel
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Link href="/rooms" className="block p-8 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
              <div className="text-4xl mb-4">🛏️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Rooms & Suites</h3>
              <p className="text-slate-300">Discover our luxurious accommodations</p>
            </Link>
            <Link href="/about" className="block p-8 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
              <div className="text-4xl mb-4">ℹ️</div>
              <h3 className="text-xl font-semibold text-white mb-2">About Us</h3>
              <p className="text-slate-300">Learn about our story and values</p>
            </Link>
            <Link href="/contact" className="block p-8 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="text-xl font-semibold text-white mb-2">Contact</h3>
              <p className="text-slate-300">Get in touch with our team</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-slate-900 text-center">
        <p className="text-slate-400">
          © 2024 LuxeStay Hotel. All rights reserved.
        </p>
      </footer>
    </main>
  )
}
