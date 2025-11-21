import { Link } from 'wouter';
import MinimalFooter from '@/components/MinimalFooter';
import { FloatingParticles } from '@/components/FloatingParticles';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with Floating Particles - No Header for Maximum Impact */}
      <section className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
        <FloatingParticles />
        
        <div className="relative z-10 container text-center px-4 py-20 flex-1 flex flex-col items-center justify-center max-w-5xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            BlockPlane
          </h1>
          
          <p className="text-2xl md:text-3xl text-white mb-8 font-medium">
            Clarity for Every Material You Use
          </p>
          
          <p className="text-base md:text-lg text-gray-300 mb-12 max-w-3xl leading-relaxed">
            A lifecycle intelligence platform that turns complex material data into clear, actionable insight—carbon, circularity, durability, and long-term performance.
          </p>
          
          <Link href="/features">
            <Button 
              size="lg"
              className="relative overflow-hidden bg-gradient-to-r from-[#09FBD3] to-[#FF8E4A] text-black font-semibold text-lg px-8 py-6 h-auto hover:shadow-[0_0_40px_rgba(9,251,211,0.6)] transition-all duration-300"
            >
              Explore the Platform
            </Button>
          </Link>
        </div>

        {/* Section Header at bottom of hero */}
        <div className="relative z-10 pb-16 px-4 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose the Clearer Path Forward
          </h2>
          <p className="text-lg md:text-xl text-gray-300">
            See your projects in a new light—understand impact, compare options, and build with confidence and clarity.
          </p>
        </div>
      </section>
      
      <MinimalFooter />
    </div>
  );
}
