import { Link } from 'wouter';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FloatingParticles } from '@/components/FloatingParticles';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const featureCards = [
  {
    href: '/materials',
    icon: '🔍',
    title: 'Material Database',
    description: 'Browse our comprehensive database of sustainable building materials with transparent carbon data and confidence ratings',
    link: 'Browse Materials →',
    color: 'indigo',
  },
  {
    href: '/visuals',
    icon: '📊',
    title: 'Material Visualizations',
    description: 'Explore materials through interactive quadrant charts showing lifecycle impact and sustainability metrics',
    link: 'View Charts →',
    color: 'emerald',
  },
  {
    href: '/lifecycle',
    icon: '🔄',
    title: 'Lifecycle Breakdown',
    description: 'Detailed analysis of material lifecycle phases from production to disposal with carbon impact data',
    link: 'View Breakdown →',
    color: 'cyan',
  },
  {
    href: '/analysis',
    icon: '🎯',
    title: 'Analysis Tools',
    description: 'Advanced visualization tools: Quadrant plots, MSI calculator, and multi-material comparison with radar charts',
    link: 'Explore Tools →',
    color: 'purple',
  },
  {
    href: '/projects',
    icon: '📁',
    title: 'Project Analysis',
    description: 'Upload your Bill of Materials to analyze project-level carbon footprint and get optimization recommendations',
    link: 'Analyze Project →',
    color: 'blue',
  },
  {
    href: '/impact',
    icon: '📈',
    title: 'Impact Dashboard',
    description: 'Track platform KPIs: material substitutions, carbon avoided, AI engagement, and recommendation acceptance rates',
    link: 'View Impact →',
    color: 'green',
  },
  {
    href: '/swap-assistant',
    icon: '✨',
    title: 'Material Swap Assistant',
    description: 'AI-powered conversational interface for instant material recommendations with carbon savings and cost analysis',
    link: 'Ask AI →',
    color: 'purple',
  },
  {
    href: '/budget-optimizer',
    icon: '💰',
    title: 'Budget Optimizer',
    description: 'Maximize carbon reduction within your budget. Find the most cost-effective sustainable materials for your project',
    link: 'Optimize Budget →',
    color: 'amber',
  },
  {
    href: '/admin',
    icon: '🛠️',
    title: 'Admin Dashboard',
    description: 'Manage materials, view analytics, perform bulk imports, and monitor platform usage (Admin only)',
    link: 'Admin Panel →',
    color: 'red',
  },
];

export default function Home() {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section with Floating Particles */}
      <section className="relative flex items-center justify-center overflow-hidden min-h-[70vh]">
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
          
          <Button 
            size="lg"
            onClick={scrollToFeatures}
            className="relative overflow-hidden bg-gradient-to-r from-[#09FBD3] to-[#FF8E4A] text-black font-semibold text-lg px-8 py-6 h-auto hover:shadow-[0_0_40px_rgba(9,251,211,0.6)] transition-all duration-300"
          >
            Explore Features
          </Button>
        </div>
      </section>

      {/* Feature Tiles Section */}
      <section id="features" className="relative py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-foreground mb-16">
            Choose Your Path to Clarity
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featureCards.map((card, index) => (
              <Link key={card.href} href={card.href}>
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-${card.color}-500/20 hover:border-${card.color}-500/50 bg-card/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationDuration: '600ms',
                    animationFillMode: 'backwards',
                  }}
                >
                  <CardHeader>
                    <div className="text-4xl mb-4">{card.icon}</div>
                    <CardTitle className="text-card-foreground">{card.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-${card.color}-400 font-semibold`}>
                      {card.link}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
