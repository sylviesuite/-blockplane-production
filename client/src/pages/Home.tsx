import { Link } from 'wouter';
import { Header } from '@/components/Header';
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
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-in fade-in duration-700">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            BlockPlane Materials Explorer
          </h1>
          <p className="text-xl text-muted-foreground">
            Sustainable Materials Platform - Crafting a Sustainable Future
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-8">
          {featureCards.map((card, index) => (
            <Link key={card.href} href={card.href}>
              <Card
                className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-${card.color}-500/20 hover:border-${card.color}-500/50 animate-in fade-in slide-in-from-bottom-4`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationDuration: '600ms',
                  animationFillMode: 'backwards',
                }}
              >
                <CardHeader>
                  <div className="text-4xl mb-4">{card.icon}</div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
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
    </div>
  );
}
