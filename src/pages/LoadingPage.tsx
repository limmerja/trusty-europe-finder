import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2, Shield, MapPin, FileCheck, Users, Database, Lock } from "lucide-react";

interface CheckItem {
  id: string;
  label: string;
  icon: React.ElementType;
  completed: boolean;
  duration: number;
}

const LoadingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = location.state?.query || "Software";
  
  const [progress, setProgress] = useState(0);
  const [checks, setChecks] = useState<CheckItem[]>([
    { id: "gdpr", label: "GDPR Compliance Check", icon: Lock, completed: false, duration: 1000 },
    { id: "headquarters", label: "Company Headquarters Location", icon: MapPin, completed: false, duration: 1500 },
    { id: "data", label: "Data Handling Practices", icon: Database, completed: false, duration: 2000 },
    { id: "privacy", label: "Privacy Policy Analysis", icon: FileCheck, completed: false, duration: 2500 },
    { id: "security", label: "Security Standards Review", icon: Shield, completed: false, duration: 3000 },
    { id: "users", label: "User Reviews & Ratings", icon: Users, completed: false, duration: 3500 }
  ]);

  useEffect(() => {
    // Start the n8n request immediately when loading page loads
    const startAnalysis = async () => {
      try {
        const url = `https://limmerja.app.n8n.cloud/webhook/sovereignty?query=${encodeURIComponent(query)}`;
        await fetch(url, { headers: { Accept: "application/json" } });
        // Request completed, navigate to results
        navigate(`/results?q=${encodeURIComponent(query)}`);
      } catch (err) {
        console.error("Analysis failed:", err);
        // Even if request fails, navigate to results (which will show fallback data)
        navigate(`/results?q=${encodeURIComponent(query)}`);
      }
    };

    // Start the actual request
    startAnalysis();

    // Progress animation for UI feedback
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1;
        return newProgress >= 95 ? 95 : newProgress; // Cap at 95% until request completes
      });
    }, 100);

    // Complete checks one by one for visual feedback
    checks.forEach((check, index) => {
      setTimeout(() => {
        setChecks(prev => 
          prev.map(c => 
            c.id === check.id ? { ...c, completed: true } : c
          )
        );
      }, check.duration);
    });

    return () => clearInterval(timer);
  }, [navigate, query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-card/95 backdrop-blur">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl mb-2">
            Analyzing {query}
          </CardTitle>
          <p className="text-muted-foreground">
            Calculating sovereignty score and finding European alternatives...
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Analysis Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3 bg-muted" />
          </div>

          {/* Check Items */}
          <div className="space-y-3">
            {checks.map((check) => {
              const IconComponent = check.icon;
              return (
                <div
                  key={check.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                    check.completed 
                      ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                      : 'bg-muted/30'
                  }`}
                >
                  <div className="relative">
                    {check.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600 animate-pulse" />
                    ) : (
                      <div className="relative">
                        <IconComponent className="w-5 h-5 text-muted-foreground" />
                        <Loader2 className="w-3 h-3 text-primary absolute -top-1 -right-1 animate-spin" />
                      </div>
                    )}
                  </div>
                  <span className={`flex-1 ${check.completed ? 'text-green-700 dark:text-green-300 font-medium' : 'text-muted-foreground'}`}>
                    {check.label}
                  </span>
                  {check.completed && (
                    <span className="text-xs text-green-600 font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                      ✓ Complete
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Loading Status */}
          <div className="text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing sovereignty analysis...</span>
            </div>
            <p>This usually takes a few seconds</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingPage;