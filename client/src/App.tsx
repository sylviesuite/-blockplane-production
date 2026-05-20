import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { HelmetProvider } from "react-helmet-async";

import Home from "./pages/Home";
import Features from "./pages/Features";
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
import GoldInsightPage from "./pages/GoldInsightPage";
import Assistant from "./pages/Assistant";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BetaSignup from "./pages/BetaSignup";
import TermsOfService from "./pages/TermsOfService";
import HowItWorks from "./pages/HowItWorks";
import CarbonCalculator from "./pages/CarbonCalculator";
import Benchmark from "./pages/Benchmark";
import MyProjects from "./pages/MyProjects";
import FrontierPage from "./pages/FrontierPage";
import ComparePage from "./pages/ComparePage";
import AuthGate from "./components/AuthGate";
import OnboardingModal from "./components/OnboardingModal";
import AnonWelcomeModal from "./components/AnonWelcomeModal";
import { useState } from "react";
import { useAuth } from "./contexts/AuthContext";

function OnboardingGate() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  if (!user || user.onboarding_complete || dismissed) return null;
  return <OnboardingModal onDismiss={() => setDismissed(true)} />;
}

function AnonWelcomeGate() {
  const { user, isLoading } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Wait for auth to resolve so we never flash the modal at a logged-in user.
  if (isLoading || user) return null;
  if (dismissed || localStorage.getItem("bp_welcomed")) return null;

  function handleDismiss() {
    localStorage.setItem("bp_welcomed", "true");
    setDismissed(true);
  }

  return <AnonWelcomeModal onDismiss={handleDismiss} />;
}

function DefaultRoute() {
  return <Home />;
}

function Router() {
  return (
    <Switch>
      <Route path="/home" component={Home} />
      <Route path={"/"} component={DefaultRoute} />
      <Route path="/insights/gold/:slug" component={GoldInsightPage} />
      <Route path={"/features"} component={Features} />
      <Route path={"/visuals"} component={Visuals} />
      <Route path={"/lifecycle"} component={Lifecycle} />
      <Route path={"/breakdown"} component={LifecycleBreakdown} />
      <Route path={"/analysis"} component={Analysis} />
      <Route path="/assistant" component={Assistant} />
      <Route path={"/impact"} component={KPIDashboard} />
      <Route path="/calculator" component={CarbonCalculator} />
      <Route path="/benchmark" component={Benchmark} />
      <Route path="/materials/:id" component={MaterialDetailEnhanced} />
      <Route path="/projects">
        {() => <AuthGate redirect><ProjectAnalysis /></AuthGate>}
      </Route>
      <Route path="/my-projects">
        {() => <AuthGate redirect><MyProjects /></AuthGate>}
      </Route>
      <Route path="/admin">
        {() => <AuthGate redirect><AdminDashboard /></AuthGate>}
      </Route>
      <Route path="/budget-optimizer">
        {() => <AuthGate redirect><BudgetOptimizer /></AuthGate>}
      </Route>
      <Route path="/swap-assistant">
        {() => <AuthGate redirect><MaterialSwapAssistant /></AuthGate>}
      </Route>
      <Route path="/global-impact">
        {() => <AuthGate redirect><GlobalImpactDashboard /></AuthGate>}
      </Route>
      <Route path="/frontier" component={FrontierPage} />
      <Route path="/compare" component={ComparePage} />
      <Route path="/materials" component={MaterialBrowser} />
      <Route path="/api-docs" component={APIDocumentation} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/beta" component={BetaSignup} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <OnboardingGate />
              <AnonWelcomeGate />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
