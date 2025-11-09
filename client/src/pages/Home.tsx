import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            BlockPlane Materials Explorer
          </h1>
          <p className="text-xl text-gray-600">
            Sustainable Materials Platform - Crafting a Sustainable Future
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Visualizations Card */}
          <Link href="/visuals">
            <a className="block p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-emerald-200 hover:border-emerald-400">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Material Visualizations
              </h2>
              <p className="text-gray-600 mb-4">
                Explore materials through interactive quadrant charts showing lifecycle impact and sustainability metrics
              </p>
              <div className="text-emerald-600 font-semibold">
                View Charts →
              </div>
            </a>
          </Link>

          {/* Lifecycle Breakdown Card */}
          <Link href="/lifecycle">
            <a className="block p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-cyan-200 hover:border-cyan-400">
              <div className="text-4xl mb-4">🔄</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Lifecycle Breakdown
              </h2>
              <p className="text-gray-600 mb-4">
                Detailed analysis of material lifecycle phases from production to disposal with carbon impact data
              </p>
              <div className="text-cyan-600 font-semibold">
                View Breakdown →
              </div>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
