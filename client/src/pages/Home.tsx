import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FloatingParticles } from '@/components/FloatingParticles';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section with Floating Particles */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden">
        <FloatingParticles />
        
        <div className="relative z-10 container text-center px-4 py-20">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            BlockPlane
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-4">
            Material Lifecycle Analysis
          </p>
          
          <p className="text-sm md:text-base text-gray-400 mb-12 tracking-[0.3em] uppercase">
            CARBON · CIRCULARITY · MATERIALS · CLARITY
          </p>
          
          <Link href="/lifecycle">
            <Button 
              size="lg"
              className="relative overflow-hidden bg-gradient-to-r from-[#09FBD3] to-[#FF8E4A] text-black font-semibold text-lg px-8 py-6 h-auto hover:shadow-[0_0_40px_rgba(9,251,211,0.6)] transition-all duration-300"
            >
              View Lifecycle Breakdown
            </Button>
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
