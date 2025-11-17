import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Visuals from "./pages/Visuals";
import LifecycleBreakdown from "./pages/LifecycleBreakdown";
import Lifecycle from "./pages/Lifecycle";
import Analysis from "./pages/Analysis";
import KPIDashboard from "./pages/KPIDashboard";
import MaterialDetail from "./pages/MaterialDetail";
import MaterialDetailEnhanced from "./pages/MaterialDetailEnhanced";
import ProjectAnalysis from "./pages/ProjectAnalysis";
import AdminDashboard from "./pages/AdminDashboard";
import BudgetOptimizer from "./pages/BudgetOptimizer";
import MaterialSwapAssistant from "./pages/MaterialSwapAssistant";
import GlobalImpactDashboard from "./pages/GlobalImpactDashboard";
import MaterialBrowser from "./pages/MaterialBrowser";
import APIDocumentation from "./pages/APIDocumentation";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/visuals"} component={Visuals} />
      <Route path={"/lifecycle"} component={Lifecycle} />
      <Route path={"/breakdown"} component={LifecycleBreakdown} />
      <Route path={"/analysis"} component={Analysis} />
      <Route path={"/impact"} component={KPIDashboard} />
      <Route path="/material/:id" component={MaterialDetailEnhanced} />
      <Route path="/projects" component={ProjectAnalysis} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/budget-optimizer" component={BudgetOptimizer} />
      <Route path="/swap-assistant" component={MaterialSwapAssistant} />
      <Route path="/global-impact" component={GlobalImpactDashboard} />
      <Route path="/materials" component={MaterialBrowser} />
      <Route path="/api-docs" component={APIDocumentation} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
