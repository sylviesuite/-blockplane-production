import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Leaf, TrendingUp, Users, Sparkles, Award, ArrowLeft,
  BarChart3, Target, Zap
} from "lucide-react";
import { Link } from "wouter";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

// Mock data - in production, this would come from tRPC query
const mockGlobalMetrics = {
  totalCarbonSaved: 125847.5, // kg CO₂e
  totalSubstitutions: 3421,
  totalProjectsOptimized: 892,
  totalAIRecommendations: 5234,
  aiAcceptanceRate: 65.3, // %
  activeUsers: 1247,
};

const mockTrendData = [
  { date: "Jan", carbonSaved: 8500, projects: 45 },
  { date: "Feb", carbonSaved: 12300, projects: 67 },
  { date: "Mar", carbonSaved: 18700, projects: 98 },
  { date: "Apr", carbonSaved: 24100, projects: 134 },
  { date: "May", carbonSaved: 31200, projects: 178 },
  { date: "Jun", carbonSaved: 30800, projects: 170 },
];

const mockTopMaterials = [
  { name: "FSC Certified Softwood", substitutions: 487, carbonSaved: 18234 },
  { name: "Recycled Steel Rebar", substitutions: 412, carbonSaved: 22145 },
  { name: "Geopolymer Concrete", substitutions: 356, carbonSaved: 15678 },
  { name: "Sheep Wool Insulation", substitutions: 298, carbonSaved: 8912 },
  { name: "CLT Panels", substitutions: 267, carbonSaved: 12456 },
];

const mockLeaderboard = [
  { rank: 1, user: "Architect A", carbonSaved: 8234, projects: 23 },
  { rank: 2, user: "Architect B", carbonSaved: 7156, projects: 19 },
  { rank: 3, user: "Architect C", carbonSaved: 6892, projects: 21 },
  { rank: 4, user: "Architect D", carbonSaved: 5678, projects: 15 },
  { rank: 5, user: "Architect E", carbonSaved: 4923, projects: 14 },
];

export default function GlobalImpactDashboard() {
  // Calculate equivalent metrics
  const carsOffRoad = Math.round(mockGlobalMetrics.totalCarbonSaved / 4600); // avg car = 4.6 tons/year
  const treesPlanted = Math.round(mockGlobalMetrics.totalCarbonSaved / 21); // avg tree absorbs 21kg/year

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 rounded-lg">
              <Leaf className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Global Impact Dashboard</h1>
              <p className="text-muted-foreground">
                Platform-wide carbon savings and material substitutions
              </p>
            </div>
          </div>
        </div>

        {/* Hero Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardDescription>Total Carbon Avoided</CardDescription>
              <CardTitle className="text-4xl text-green-600">
                {(mockGlobalMetrics.totalCarbonSaved / 1000).toFixed(1)}
                <span className="text-2xl ml-2">tons CO₂e</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>≈ {carsOffRoad} cars off the road for 1 year</p>
                <p>≈ {treesPlanted.toLocaleString()} trees planted</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardDescription>Material Substitutions</CardDescription>
              <CardTitle className="text-4xl text-blue-600">
                {mockGlobalMetrics.totalSubstitutions.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{mockGlobalMetrics.totalProjectsOptimized} projects optimized</p>
                <p>{mockGlobalMetrics.activeUsers} active users</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardDescription>AI Recommendations</CardDescription>
              <CardTitle className="text-4xl text-purple-600">
                {mockGlobalMetrics.totalAIRecommendations.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{mockGlobalMetrics.aiAcceptanceRate}% acceptance rate</p>
                <p>{Math.round(mockGlobalMetrics.totalAIRecommendations * mockGlobalMetrics.aiAcceptanceRate / 100)} accepted</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trend Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Carbon Savings Trend</CardTitle>
              <CardDescription>Monthly carbon avoided (kg CO₂e)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="carbonSaved" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projects Optimized</CardTitle>
              <CardDescription>Monthly project count</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="projects" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Materials & Leaderboard */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Top Performing Materials
              </CardTitle>
              <CardDescription>Most substituted sustainable materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTopMaterials.map((material, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-semibold text-sm">{material.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {material.substitutions} substitutions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 text-sm">
                        {(material.carbonSaved / 1000).toFixed(1)}t
                      </p>
                      <p className="text-xs text-muted-foreground">CO₂e saved</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Carbon Savings Leaderboard
              </CardTitle>
              <CardDescription>Top contributors (anonymized)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLeaderboard.map((entry) => (
                  <div key={entry.rank} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={entry.rank <= 3 ? "default" : "outline"}
                        className="w-8 h-8 flex items-center justify-center"
                      >
                        {entry.rank}
                      </Badge>
                      <div>
                        <p className="font-semibold text-sm">{entry.user}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.projects} projects
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 text-sm">
                        {(entry.carbonSaved / 1000).toFixed(1)}t
                      </p>
                      <p className="text-xs text-muted-foreground">CO₂e saved</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="mt-8 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Join the Movement</h3>
                <p className="text-muted-foreground">
                  Every material substitution counts. Start optimizing your projects today.
                </p>
              </div>
              <Link href="/swap-assistant">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get AI Recommendations
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
