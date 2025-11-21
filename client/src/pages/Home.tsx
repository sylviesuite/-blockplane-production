import { Link } from 'wouter';
import { Header } from '@/components/Header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            BlockPlane Materials Explorer
          </h1>
          <p className="text-xl text-muted-foreground">
            Sustainable Materials Platform - Crafting a Sustainable Future
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-8">
          {/* Material Browser Card */}
          <Link href="/materials">
            <Card className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500/50">
              <CardHeader>
                <div className="text-4xl mb-4">🔍</div>
                <CardTitle>Material Database</CardTitle>
                <CardDescription>
                  Browse our comprehensive database of sustainable building materials with transparent carbon data and confidence ratings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-indigo-400 font-semibold">
                  Browse Materials →
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Visualizations Card */}
          <Link href="/visuals">
            <Card className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-500/50">
              <CardHeader>
                <div className="text-4xl mb-4">📊</div>
                <CardTitle>Material Visualizations</CardTitle>
                <CardDescription>
                  Explore materials through interactive quadrant charts showing lifecycle impact and sustainability metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-emerald-400 font-semibold">
                  View Charts →
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Lifecycle Breakdown Card */}
          <Link href="/lifecycle">
            <Card className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 hover:border-cyan-500/50">
              <CardHeader>
                <div className="text-4xl mb-4">🔄</div>
                <CardTitle>Lifecycle Breakdown</CardTitle>
                <CardDescription>
                  Detailed analysis of material lifecycle phases from production to disposal with carbon impact data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-cyan-400 font-semibold">
                  View Breakdown →
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Analysis Tools Card */}
          <Link href="/analysis">
            <Card className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/50">
              <CardHeader>
                <div className="text-4xl mb-4">🎯</div>
                <CardTitle>Analysis Tools</CardTitle>
                <CardDescription>
                  Advanced visualization tools: Quadrant plots, MSI calculator, and multi-material comparison with radar charts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-purple-400 font-semibold">
                  Explore Tools →
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Project Analysis Card */}
          <Link href="/projects">
            <Card className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/50">
              <CardHeader>
                <div className="text-4xl mb-4">📁</div>
                <CardTitle>Project Analysis</CardTitle>
                <CardDescription>
                  Upload your Bill of Materials to analyze project-level carbon footprint and get optimization recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-blue-400 font-semibold">
                  Analyze Project →
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* KPI Dashboard Card */}
          <Link href="/impact">
            <Card className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 hover:border-green-500/50">
              <CardHeader>
                <div className="text-4xl mb-4">📈</div>
                <CardTitle>Impact Dashboard</CardTitle>
                <CardDescription>
                  Track platform KPIs: material substitutions, carbon avoided, AI engagement, and recommendation acceptance rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-green-400 font-semibold">
                  View Impact →
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Material Swap Assistant Card */}
          <Link href="/swap-assistant">
            <Card className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/50">
              <CardHeader>
                <div className="text-4xl mb-4">✨</div>
                <CardTitle>Material Swap Assistant</CardTitle>
                <CardDescription>
                  AI-powered conversational interface for instant material recommendations with carbon savings and cost analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-purple-400 font-semibold">
                  Ask AI →
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Budget Optimizer Card */}
          <Link href="/budget-optimizer">
            <Card className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20 hover:border-amber-500/50">
              <CardHeader>
                <div className="text-4xl mb-4">💰</div>
                <CardTitle>Budget Optimizer</CardTitle>
                <CardDescription>
                  Maximize carbon reduction within your budget. Find the most cost-effective sustainable materials for your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-amber-400 font-semibold">
                  Optimize Budget →
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Admin Dashboard Card */}
          <Link href="/admin">
            <Card className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 hover:border-red-500/50">
              <CardHeader>
                <div className="text-4xl mb-4">🛠️</div>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>
                  Manage materials, view analytics, perform bulk imports, and monitor platform usage (Admin only)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-red-400 font-semibold">
                  Admin Panel →
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
