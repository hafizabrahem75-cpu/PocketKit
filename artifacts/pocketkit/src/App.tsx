import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Shell } from "@/components/layout/Shell";
import { Home } from "@/pages/Home";
import { Settings } from "@/pages/Settings";
import { Calculator } from "@/pages/Calculator";
import { WordCounter } from "@/pages/WordCounter";
import { QrGenerator } from "@/pages/QrGenerator";
import { Notes } from "@/pages/Notes";
import { ImageTextExtractor } from "@/pages/ImageTextExtractor";
import { Translator } from "@/pages/Translator";
import { ImageToPdf } from "@/pages/ImageToPdf";
import { ClipboardManager } from "@/pages/ClipboardManager";
import { ThemeProvider } from "@/lib/theme";
import { LanguageProvider } from "@/lib/i18n";

const queryClient = new QueryClient();

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/settings" component={Settings} />
        <Route path="/calculator" component={Calculator} />
        <Route path="/word-counter" component={WordCounter} />
        <Route path="/qr-generator" component={QrGenerator} />
        <Route path="/notes" component={Notes} />
        <Route path="/image-text-extractor" component={ImageTextExtractor} />
        <Route path="/translator" component={Translator} />
        <Route path="/image-to-pdf" component={ImageToPdf} />
        <Route path="/clipboard" component={ClipboardManager} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
