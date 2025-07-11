import { useEffect, useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom"; // ✅ Use HashRouter
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Extend the Window interface to include linkStore
declare global {
  interface Window {
    linkStore: Record<string, any>;
  }
}

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ThemeToggle";

import { storage } from "@/utils/storage";
import WelcomeSetup from "./pages/WelcomeSetup";
import Welcome from "./pages/Welcome";
import ViewLinks from "./pages/ViewLinks";
import CreateLink from "./pages/CreateLink";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);

  useEffect(() => {
    // Sync localStorage links to memory on app load
    window.linkStore = {};
    const links = storage.getLinks();
    for (const link of links) {
      const id = `${link.prefix}/${link.alias}`;
      window.linkStore[id] = link;
    }

    const settings = storage.getSettings();
    setIsFirstTime(settings.isFirstTime);
  }, []);

  const handleSetupComplete = () => {
    setIsFirstTime(false);
  };

  if (isFirstTime === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isFirstTime) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ThemeToggle />
          <WelcomeSetup onComplete={handleSetupComplete} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ThemeToggle />
        <HashRouter> {/* ✅ Changed from BrowserRouter to HashRouter */}
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/links" element={<ViewLinks />} />
            <Route path="/create" element={<CreateLink />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
