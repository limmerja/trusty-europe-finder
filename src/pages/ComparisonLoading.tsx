import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, Shield, Server, FileCheck, Gavel, AlertTriangle } from "lucide-react";

interface AlternativeItem {
  name: string;
  type: string;
  hosting: string;
  price_hint: string;
  why_better: string;
  links: string[];
}

const ComparisonLoading = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [alternatives, setAlternatives] = useState<AlternativeItem[]>([]);
  const [scoringProgress, setScoringProgress] = useState<{ [key: string]: boolean }>({});
  
  const query = searchParams.get("q") || "";

  const criteria = [
    { id: "jurisdiction", label: "Jurisdiction", icon: Gavel, description: "Company headquarters and legal jurisdiction" },
    { id: "hosting", label: "Data Hosting", icon: Server, description: "Data storage and processing location" },
    { id: "control", label: "Data Control", icon: Shield, description: "Security measures and data access controls" },
    { id: "governance", label: "Governance", icon: FileCheck, description: "Privacy policies and data governance" },
    { id: "news_risk", label: "News Risk", icon: AlertTriangle, description: "Recent news and reputation risk" }
  ];

  const steps = [
    "Fetching European alternatives...",
    "Analyzing alternatives...",
    "Evaluating sovereignty criteria...",
    "Generating comparison report..."
  ];

  useEffect(() => {
    const runComparison = async () => {
      try {
        // Step 1: Fetch alternatives
        setCurrentStep(0);
        setProgress(10);
        
        const alternativesResponse = await fetch(`https://limmerja.app.n8n.cloud/webhook/alternatives?query=${query}`);
        const alternativesData = await alternativesResponse.json();
        setAlternatives(alternativesData);
        setProgress(25);

        // Step 2: Analyze alternatives
        setCurrentStep(1);
        setProgress(35);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 3: Score each alternative
        setCurrentStep(2);
        setProgress(45);

        const scoredAlternatives = await Promise.all(
          alternativesData.map(async (alt: AlternativeItem, index: number) => {
            try {
              setScoringProgress(prev => ({ ...prev, [alt.name]: false }));
              
              const scoreResponse = await fetch(`https://limmerja.app.n8n.cloud/webhook/sovereignty?query=${alt.name}`);
              const scoreData = await scoreResponse.json();
              
              setScoringProgress(prev => ({ ...prev, [alt.name]: true }));
              setProgress(45 + ((index + 1) / alternativesData.length) * 40);
              
              // Parse score data
              const tryParse = (t: string) => {
                try { return JSON.parse(t); } catch { return t; }
              };

              let scoringData = null;
              const raw = tryParse(scoreData);
              if (raw && typeof raw === "object" && "score" in raw) {
                scoringData = raw;
              } else if (raw && typeof raw === "object" && (raw as any).message?.content) {
                const inner = tryParse((raw as any).message.content);
                if (inner && typeof inner === "object" && "score" in inner) {
                  scoringData = inner;
                }
              }

              if (scoringData) {
                const overallScore = scoringData.score.overall || 50;
                const criteriaScores = Object.entries({
                  jurisdiction: { label: "Jurisdiction", description: "Company headquarters and legal jurisdiction" },
                  hosting: { label: "Data Hosting", description: "Data storage and processing location" },
                  control: { label: "Data Control", description: "Security measures and data access controls" },
                  governance: { label: "Governance", description: "Privacy policies and data governance" },
                  news_risk: { label: "News Risk", description: "Recent news and reputation risk" }
                }).map(([key, mapping]) => {
                  const dimension = scoringData.score.dimensions[key];
                  const scoreValue = dimension ? Math.round(dimension.score / 10) : 5;
                  
                  return {
                    id: key,
                    label: mapping.label,
                    score: scoreValue,
                    maxScore: 10,
                    description: mapping.description,
                    why: dimension?.why,
                    evidence: dimension?.evidence
                  };
                });

                return {
                  ...alt,
                  score: overallScore,
                  criteriaScores
                };
              }

              return {
                ...alt,
                score: 50,
                criteriaScores: []
              };
            } catch (error) {
              console.error(`Failed to score ${alt.name}:`, error);
              setScoringProgress(prev => ({ ...prev, [alt.name]: true }));
              return {
                ...alt,
                score: 50,
                criteriaScores: []
              };
            }
          })
        );

        // Step 4: Generate report
        setCurrentStep(3);
        setProgress(90);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgress(100);

        // Navigate to comparison results page with data
        const originalData = location.state?.originalData || {
          name: query,
          score: 50,
          criteriaScores: [],
          type: "Current Solution"
        };

        setTimeout(() => {
          navigate(`/comparison-results?q=${query}`, { 
            state: { 
              comparisonData: scoredAlternatives,
              originalData
            } 
          });
        }, 500);

      } catch (error) {
        console.error("Comparison failed:", error);
        // Navigate back to results without comparison data
        navigate(`/results?q=${query}`);
      }
    };

    runComparison();
  }, [query, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Comparing Alternatives</h1>
            <p className="text-muted-foreground mt-2">
              Analyzing European alternatives for {query}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{steps[currentStep]}</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Alternatives being analyzed */}
        {alternatives.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Found Alternatives</h3>
              <div className="space-y-3">
                {alternatives.map((alt, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <div className="font-medium">{alt.name}</div>
                      <div className="text-sm text-muted-foreground">{alt.type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {scoringProgress[alt.name] ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : currentStep >= 2 ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Criteria being evaluated */}
        {currentStep >= 2 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Evaluating Criteria</h3>
              <div className="grid gap-3">
                {criteria.map((criterion) => {
                  const IconComponent = criterion.icon;
                  return (
                    <div key={criterion.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <IconComponent className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">{criterion.label}</div>
                        <div className="text-sm text-muted-foreground">{criterion.description}</div>
                      </div>
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ComparisonLoading;