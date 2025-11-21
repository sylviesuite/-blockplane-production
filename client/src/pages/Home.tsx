import { Link } from 'wouter';
import { Header } from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            BlockPlane Materials Explorer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Sustainable Materials Platform - Crafting a Sustainable Future
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-8">
          {/* Material Browser Card */}
          <Link href="/materials">
            <div className="block p-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-400 dark:hover:border-indigo-400 cursor-pointer backdrop-blur-sm">
              <div className="text-4xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Material Database
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Browse our comprehensive database of sustainable building materials with transparent carbon data and confidence ratings
              </p>
              <div className="text-indigo-600 dark:text-indigo-400 font-semibold">
                Browse Materials →
              </div>
            </div>
          </Link>

          {/* Visualizations Card */}
          <Link href="/visuals">
            <div className="block p-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-400 cursor-pointer backdrop-blur-sm">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Material Visualizations
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Explore materials through interactive quadrant charts showing lifecycle impact and sustainability metrics
              </p>
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                View Charts →
              </div>
            </div>
          </Link>

          {/* Lifecycle Breakdown Card */}
          <Link href="/lifecycle">
            <div className="block p-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-cyan-200 dark:border-cyan-500/30 hover:border-cyan-400 dark:hover:border-cyan-400 cursor-pointer backdrop-blur-sm">
              <div className="text-4xl mb-4">🔄</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Lifecycle Breakdown
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Detailed analysis of material lifecycle phases from production to disposal with carbon impact data
              </p>
              <div className="text-cyan-600 dark:text-cyan-400 font-semibold">
                View Breakdown →
              </div>
            </div>
          </Link>

          {/* Analysis Tools Card */}
          <Link href="/analysis">
            <div className="block p-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-purple-200 dark:border-purple-500/30 hover:border-purple-400 dark:hover:border-purple-400 cursor-pointer backdrop-blur-sm">
              <div className="text-4xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Analysis Tools
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Advanced visualization tools: Quadrant plots, MSI calculator, and multi-material comparison with radar charts
              </p>
              <div className="text-purple-600 dark:text-purple-400 font-semibold">
                Explore Tools →
              </div>
            </div>
          </Link>

          {/* Project Analysis Card */}
          <Link href="/projects">
            <div className="block p-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-blue-200 dark:border-blue-500/30 hover:border-blue-400 dark:hover:border-blue-400 cursor-pointer backdrop-blur-sm">
              <div className="text-4xl mb-4">📁</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Project Analysis
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Upload your Bill of Materials to analyze project-level carbon footprint and get optimization recommendations
              </p>
              <div className="text-blue-600 dark:text-blue-400 font-semibold">
                Analyze Project →
              </div>
            </div>
          </Link>

          {/* KPI Dashboard Card */}
          <Link href="/impact">
            <div className="block p-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-green-200 dark:border-green-500/30 hover:border-green-400 dark:hover:border-green-400 cursor-pointer backdrop-blur-sm">
              <div className="text-4xl mb-4">📈</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Impact Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Track platform KPIs: material substitutions, carbon avoided, AI engagement, and recommendation acceptance rates
              </p>
              <div className="text-green-600 dark:text-green-400 font-semibold">
                View Impact →
              </div>
            </div>
          </Link>

          {/* Material Swap Assistant Card */}
          <Link href="/swap-assistant">
            <div className="block p-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-purple-200 dark:border-purple-500/30 hover:border-purple-400 dark:hover:border-purple-400 cursor-pointer backdrop-blur-sm">
              <div className="text-4xl mb-4">✨</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Material Swap Assistant
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                AI-powered conversational interface for instant material recommendations with carbon savings and cost analysis
              </p>
              <div className="text-purple-600 dark:text-purple-400 font-semibold">
                Ask AI →
              </div>
            </div>
          </Link>

          {/* Budget Optimizer Card */}
          <Link href="/budget-optimizer">
            <div className="block p-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-amber-200 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-400 cursor-pointer backdrop-blur-sm">
              <div className="text-4xl mb-4">💰</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Budget Optimizer
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Maximize carbon reduction within your budget. Find the most cost-effective sustainable materials for your project
              </p>
              <div className="text-amber-600 dark:text-amber-400 font-semibold">
                Optimize Budget →
              </div>
            </div>
          </Link>

          {/* Admin Dashboard Card */}
          <Link href="/admin">
            <div className="block p-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-red-200 dark:border-red-500/30 hover:border-red-400 dark:hover:border-red-400 cursor-pointer backdrop-blur-sm">
              <div className="text-4xl mb-4">🛠️</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Admin Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Manage materials, view analytics, perform bulk imports, and monitor platform usage (Admin only)
              </p>
              <div className="text-red-600 dark:text-red-400 font-semibold">
                Admin Panel →
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
