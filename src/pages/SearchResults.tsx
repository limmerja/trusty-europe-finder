import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  Shield, 
  MapPin, 
  FileCheck, 
  Star, 
  DollarSign,
  Users,
  ExternalLink,
  CheckCircle,
  XCircle,
  Lock,
  Database,
  Server,
  Gavel,
  AlertTriangle,
  BarChart3
} from "lucide-react";

interface CriteriaScore {
  id: string;
  label: string;
  icon: React.ElementType;
  score: number;
  maxScore: number;
  description: string;
  why?: string;
  evidence?: string[];
}

interface ScoringData {
  score: {
    overall: number;
    weights: {
      jurisdiction: number;
      hosting: number;
      control: number;
      governance: number;
      news_risk: number;
    };
    dimensions: {
      [key: string]: {
        score: number;
        why: string;
        evidence: string[];
      };
    };
  };
}

interface CompanyData {
  name: string;
  logo: string;
  score: number;
  headquarters: string;
  gdprCompliant: boolean;
  dataHandling: string;
  features: string[];
  pricing: string;
  userRating: number;
  reviewCount: number;
  criteriaScores: CriteriaScore[];
  alternatives: Array<{
    name: string;
    score: number;
    headquarters: string;
    pricing: string;
  }>;
}

interface AlternativeComparison {
  name: string;
  type: string;
  hosting: string;
  price_hint: string;
  why_better: string;
  links: string[];
  score?: number;
  criteriaScores?: CriteriaScore[];
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<AlternativeComparison[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const query = searchParams.get("q") || "";

  // Mapping for n8n workflow dimensions to UI components
  const dimensionMapping = {
    jurisdiction: { label: "Jurisdiction", icon: Gavel, description: "Company headquarters and legal jurisdiction assessment" },
    hosting: { label: "Data Hosting", icon: Server, description: "Data storage and processing location practices" },
    control: { label: "Data Control", icon: Shield, description: "Security measures and data access controls" },
    governance: { label: "Governance", icon: FileCheck, description: "Privacy policies and data governance practices" },
    news_risk: { label: "News Risk", icon: AlertTriangle, description: "Recent news and reputation risk assessment" }
  };

  const parseN8nData = (rawData: ScoringData): CompanyData => {
    const { score } = rawData;
    
    // Compute overall if missing, using weights if provided, else equal weights
    const keys = Object.keys(dimensionMapping);
    const hasWeights = !!score?.weights && Object.values(score.weights).some((w) => typeof w === "number" && w > 0);
    const overallComputed = hasWeights
      ? Math.round(
          keys.reduce((acc, key) => {
            const dimScore = score.dimensions[key]?.score ?? 50; // default 50/100
            const w = (score.weights as any)?.[key] ?? 0;
            return acc + dimScore * w;
          }, 0)
        )
      : Math.round(
          keys.reduce((acc, key) => acc + (score.dimensions[key]?.score ?? 50), 0) / keys.length
        );
    const overall = typeof score?.overall === "number" ? score.overall : overallComputed;
    
    // Create criteria scores from dimensions
    const criteriaScores: CriteriaScore[] = Object.entries(dimensionMapping).map(([key, mapping]) => {
      const dimension = score.dimensions[key];
      const scoreValue = dimension ? Math.round(dimension.score / 10) : 5; // Convert 0-100 to 0-10, default to 5
      
      return {
        id: key,
        label: mapping.label,
        icon: mapping.icon,
        score: scoreValue,
        maxScore: 10,
        description: mapping.description,
        why: dimension?.why,
        evidence: dimension?.evidence
      };
    });

    return {
      name: query,
      logo: "🔧",
      score: overall,
      headquarters: "United States",
      gdprCompliant: (score.dimensions.jurisdiction?.score || 50) >= 60,
      dataHandling: score.dimensions.jurisdiction?.why || "Assessment data not available",
      features: ["Team collaboration", "File sharing", "Video calls", "Integrations"],
      pricing: "€12-25/month per user",
      userRating: 4.2,
      reviewCount: 1247,
      criteriaScores,
      alternatives: [
        { name: "Nextcloud", score: 95, headquarters: "Germany", pricing: "€5-15/month" },
        { name: "Element", score: 92, headquarters: "France", pricing: "€3-8/month" },
        { name: "Mattermost", score: 88, headquarters: "Germany", pricing: "€7-18/month" }
      ]
    };
  };

  useEffect(() => {
    // Use data passed from LoadingPage or fallback
    const loadData = () => {
      setIsLoading(true);

      try {
        // Check if we have data passed from LoadingPage
        const responseData = location.state?.responseData;
        
        // Check if we have comparison data from ComparisonLoading
        if (location.state?.showComparison && location.state?.comparisonData) {
          setComparisonData(location.state.comparisonData);
          setShowComparison(true);
        }
        
        if (responseData) {
          // Try to robustly extract the scoring payload from different possible shapes
          const tryParse = (t: string) => {
            try { return JSON.parse(t); } catch { return t; }
          };

          const raw = tryParse(responseData);
          let scoringData: ScoringData | null = null;

          if (raw && typeof raw === "object" && "score" in raw) {
            scoringData = raw as ScoringData;
          } else if (raw && typeof raw === "object" && (raw as any).message?.content) {
            const inner = tryParse((raw as any).message.content);
            if (inner && typeof inner === "object" && "score" in inner) {
              scoringData = inner as ScoringData;
            }
          } else if (typeof raw === "string") {
            const inner = tryParse(raw);
            if (inner && typeof inner === "object" && "score" in inner) {
              scoringData = inner as ScoringData;
            }
          }

          if (!scoringData) {
            throw new Error("Invalid scoring response format");
          }

          const parsedData = parseN8nData(scoringData);
          setCompanyData(parsedData);
        } else {
          throw new Error("No data received from LoadingPage");
        }
      } catch (err) {
        console.error("Failed to process scoring data:", err);
        // Fallback to defaults (5/10 => 50/100 per dimension)
        const fallback: ScoringData = {
          score: {
            overall: 50,
            weights: {
              jurisdiction: 0.25,
              hosting: 0.25,
              control: 0.25,
              governance: 0.15,
              news_risk: 0.10,
            },
            dimensions: {}
          }
        };
        setCompanyData(parseN8nData(fallback));
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      loadData();
    }
  }, [query, location.state]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
    if (score >= 60) return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800";
    return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  const fetchComparison = async () => {
    // Navigate to comparison loading page with original company data (without React components)
    const serializedCriteriaScores = companyData.criteriaScores.map(criteria => ({
      id: criteria.id,
      label: criteria.label,
      score: criteria.score,
      maxScore: criteria.maxScore,
      description: criteria.description,
      why: criteria.why,
      evidence: criteria.evidence
    }));

    navigate(`/comparison-loading?q=${query}`, {
      state: {
        originalData: {
          name: companyData.name,
          score: companyData.score,
          criteriaScores: serializedCriteriaScores,
          type: "Current Solution"
        }
      }
    });
  };

  if (isLoading) {
    navigate("/loading", { state: { query } });
    return null;
  }

  if (!companyData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No data found</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={() => navigate("/")} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Search
          </Button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl">{companyData.logo}</div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{companyData.name}</h1>
              <p className="text-muted-foreground">Sovereignty Analysis Report</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Score Card */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  European Sovereignty Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className={`text-6xl font-bold mb-2 ${getScoreColor(companyData.score)}`}>
                    {companyData.score}
                  </div>
                  <div className="text-lg text-muted-foreground mb-4">
                    {getScoreLabel(companyData.score)} Sovereignty Rating
                  </div>
                  <Progress value={companyData.score} className="h-3" />
                </div>

                <Separator className="my-6" />

                {/* Detailed Criteria Scores */}
                <div>
                  <h3 className="font-semibold mb-4">Detailed Analysis by Criteria</h3>
                  <div className="grid gap-4">
                    {companyData.criteriaScores.map((criteria) => {
                      const IconComponent = criteria.icon;
                      const percentage = (criteria.score / criteria.maxScore) * 100;
                      return (
                        <div
                          key={criteria.id}
                          className={`p-4 rounded-lg border transition-all ${getScoreBgColor(criteria.score * 10)}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <IconComponent className="w-5 h-5 text-primary" />
                              <div>
                                <div className="font-semibold">{criteria.label}</div>
                                <div className="text-sm text-muted-foreground">{criteria.description}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getScoreColor(criteria.score * 10)}`}>
                                {criteria.score}/{criteria.maxScore}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {getScoreLabel(criteria.score * 10)}
                              </div>
                            </div>
                           </div>
                           <Progress value={percentage} className="h-2" />
                           {criteria.why && (
                             <div className="mt-3 p-3 bg-muted/50 rounded-md">
                               <p className="text-sm text-muted-foreground">{criteria.why}</p>
                               {criteria.evidence && criteria.evidence.length > 0 && (
                                 <div className="mt-2 flex flex-wrap gap-1">
                                   {criteria.evidence.map((link, idx) => (
                                     <a
                                       key={idx}
                                       href={link}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="inline-flex items-center text-xs text-primary hover:underline"
                                     >
                                       Source
                                       <ExternalLink className="w-3 h-3 ml-1" />
                                     </a>
                                   ))}
                                 </div>
                               )}
                             </div>
                           )}
                         </div>
                      );
                    })}
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="font-semibold mb-3">Overall Assessment</h3>
                  <p className="text-muted-foreground">{companyData.dataHandling}</p>
                </div>
              </CardContent>
            </Card>

            {/* European Alternatives */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Recommended European Alternatives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companyData.alternatives.map((alt, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <div className="font-semibold">{alt.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Headquarters: {alt.headquarters}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Pricing: {alt.pricing}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {alt.score}/100
                        </Badge>
                        <div className="mt-2">
                          <Button size="sm" variant="outline">
                            Learn More
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
               </CardContent>
             </Card>

             {/* Compare Button */}
             <div className="mt-4">
               <Button 
                 onClick={fetchComparison} 
                 disabled={isLoadingComparison}
                 className="w-full"
               >
                 {isLoadingComparison ? (
                   "Loading Comparison..."
                 ) : (
                   <>
                     <BarChart3 className="w-4 h-4 mr-2" />
                     Compare Alternatives
                   </>
                 )}
               </Button>
             </div>

             {/* Comparison Table */}
             {showComparison && (
               <Card className="mt-6">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <BarChart3 className="w-5 h-5" />
                     Detailed Comparison
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="overflow-x-auto">
                     <Table>
                       <TableHeader>
                         <TableRow>
                           <TableHead>Service</TableHead>
                           <TableHead>Overall Score</TableHead>
                           <TableHead>Hosting</TableHead>
                           <TableHead>Pricing</TableHead>
                           <TableHead>Why Better</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         <TableRow className="bg-muted/50">
                           <TableCell className="font-medium">
                             {companyData.name} (Current)
                           </TableCell>
                           <TableCell>
                             <Badge variant="secondary" className={getScoreColor(companyData.score)}>
                               {companyData.score}/100
                             </Badge>
                           </TableCell>
                           <TableCell>{companyData.headquarters}</TableCell>
                           <TableCell>{companyData.pricing}</TableCell>
                           <TableCell>-</TableCell>
                         </TableRow>
                         {comparisonData.map((alt, index) => (
                           <TableRow key={index}>
                             <TableCell className="font-medium">
                               <div>
                                 <div>{alt.name}</div>
                                 <div className="text-sm text-muted-foreground">{alt.type}</div>
                               </div>
                             </TableCell>
                             <TableCell>
                               <Badge variant="secondary" className={getScoreColor(alt.score || 50)}>
                                 {alt.score || 50}/100
                               </Badge>
                             </TableCell>
                             <TableCell>{alt.hosting}</TableCell>
                             <TableCell>{alt.price_hint}</TableCell>
                             <TableCell className="max-w-xs">
                               <div className="text-sm">{alt.why_better}</div>
                               {alt.links && alt.links.length > 0 && (
                                 <div className="mt-1">
                                   {alt.links.map((link, linkIndex) => (
                                     <a
                                       key={linkIndex}
                                       href={link}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="inline-flex items-center text-xs text-primary hover:underline mr-2"
                                     >
                                       Link
                                       <ExternalLink className="w-3 h-3 ml-1" />
                                     </a>
                                   ))}
                                 </div>
                               )}
                             </TableCell>
                           </TableRow>
                         ))}
                       </TableBody>
                     </Table>
                   </div>
                 </CardContent>
               </Card>
             )}
           </div>

          {/* Sidebar */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">Pricing</div>
                    <div className="text-sm text-muted-foreground">{companyData.pricing}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <div>
                    <div className="font-semibold">User Rating</div>
                    <div className="text-sm text-muted-foreground">
                      {companyData.userRating}/5 ({companyData.reviewCount} reviews)
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">Company Size</div>
                    <div className="text-sm text-muted-foreground">Enterprise</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {companyData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;