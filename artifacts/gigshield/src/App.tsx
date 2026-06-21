import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";

import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Plans from "@/pages/Plans";
import Wallet from "@/pages/Wallet";
import Claims from "@/pages/Claims";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: any }) {
  const { deliveryId, isInitialized } = useAuth();
  
  if (!isInitialized) return null;
  
  if (!deliveryId) {
    // If not logged in, show onboarding
    return <Onboarding />;
  }
  
  return <Component />;
}

function RootRoute() {
  const { deliveryId, isInitialized } = useAuth();
  if (!isInitialized) return null;
  return deliveryId ? <Dashboard /> : <Onboarding />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRoute} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/plans"><ProtectedRoute component={Plans} /></Route>
      <Route path="/wallet"><ProtectedRoute component={Wallet} /></Route>
      <Route path="/claims"><ProtectedRoute component={Claims} /></Route>
      <Route path="/profile"><ProtectedRoute component={Profile} /></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
