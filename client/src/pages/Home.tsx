import { Link } from 'wouter';
import MinimalFooter from '@/components/MinimalFooter';
import { FloatingParticles } from '@/components/FloatingParticles';
import { Button } from '@/components/ui/button';
import { Search, GitCompare, FileText, Database, Layers, CheckCircle } from 'lucide-react';

export default function Home() {
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section - Architect-First Messaging */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden min-h-screen py-20">
        <FloatingParticles />
        
        <div className="relative z-10 container text-center px-4 max-w-5xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Stop Second-Guessing<br />Material Choices
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Compare lifecycle impact, carbon footprint, and circularity scores for <span className="text-[#09FBD3] font-semibold">85+ building materials</span>—so you can specify with confidence, not guesswork.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/features">
              <Button 
                size="lg"
                className="relative overflow-hidden bg-gradient-to-r from-[#09FBD3] to-[#FF8E4A] text-black font-semibold text-lg px-8 py-6 h-auto hover:shadow-[0_0_40px_rgba(9,251,211,0.6)] transition-all duration-300"
              >
                Explore Materials
              </Button>
            </Link>
            
            <Button 
              size="lg"
              variant="outline"
              onClick={scrollToHowItWorks}
              className="bg-transparent border-2 border-white/30 text-white font-semibold text-lg px-8 py-6 h-auto hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            >
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-20 bg-slate-900/50">
        <div className="container px-4 max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Three simple steps to make informed material decisions
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50 hover:border-[#09FBD3]/50 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#09FBD3] to-[#07C9B3] flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">1. Search</h3>
              <p className="text-gray-300 leading-relaxed">
                Find materials by type, performance requirements, or project needs. Filter by category, carbon threshold, or circularity score.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50 hover:border-[#FF8E4A]/50 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF8E4A] to-[#FF6B35] flex items-center justify-center mb-6">
                <GitCompare className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">2. Compare</h3>
              <p className="text-gray-300 leading-relaxed">
                See side-by-side lifecycle data, embodied carbon, durability scores, and cost implications. Understand trade-offs clearly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50 hover:border-[#09FBD3]/50 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#09FBD3] to-[#FF8E4A] flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">3. Specify</h3>
              <p className="text-gray-300 leading-relaxed">
                Export reports, comparison charts, and AI-powered recommendations for your project specifications and stakeholder presentations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats Section */}
      <section className="relative py-20 bg-slate-950">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center mb-4">
                <Database className="w-12 h-12 text-[#09FBD3]" />
              </div>
              <div className="text-5xl font-bold text-white">85+</div>
              <div className="text-xl text-gray-400">Building Materials</div>
              <div className="text-sm text-gray-500">With full lifecycle data</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center mb-4">
                <Layers className="w-12 h-12 text-[#FF8E4A]" />
              </div>
              <div className="text-5xl font-bold text-white">7</div>
              <div className="text-xl text-gray-400">Material Categories</div>
              <div className="text-sm text-gray-500">Timber, Steel, Concrete, Earth, Insulation, Composites, Masonry</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-[#09FBD3]" />
              </div>
              <div className="text-5xl font-bold text-white">100%</div>
              <div className="text-xl text-gray-400">Transparent Data</div>
              <div className="text-sm text-gray-500">Carbon, circularity, durability, cost</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 bg-gradient-to-b from-slate-950 to-slate-900">
        <FloatingParticles />
        <div className="relative z-10 container px-4 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Make Clearer Material Decisions?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join architects who are specifying with confidence, backed by transparent lifecycle data.
          </p>
          <Link href="/features">
            <Button 
              size="lg"
              className="relative overflow-hidden bg-gradient-to-r from-[#09FBD3] to-[#FF8E4A] text-black font-semibold text-lg px-10 py-6 h-auto hover:shadow-[0_0_40px_rgba(9,251,211,0.6)] transition-all duration-300"
            >
              Start Exploring
            </Button>
          </Link>
        </div>
      </section>
      
      <MinimalFooter />
    </div>
  );
}
