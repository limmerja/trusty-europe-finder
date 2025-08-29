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
      "lock-in-risk": number;
      "lock-in-risk": number;
    };
    dimensions: {
      [key: string]: {
        score: number;
        why: string;
        evidence: string[];
      };
    };
    rating?: number;
    logo_url?: string;
    pricing?: string;
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
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comparisonData, setComparisonData] = useState<AlternativeComparison[]>([]);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);
  const [alternativesError, setAlternativesError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const query = searchParams.get("q") || "";

  // Mapping for n8n workflow dimensions to UI components
  const dimensionMapping = {
    jurisdiction: { label: "Jurisdiction", icon: Gavel, description: "Company headquarters and legal jurisdiction assessment" },
    hosting: { label: "Data Hosting", icon: Server, description: "Data storage and processing location practices" },
    control: { label: "Data Control", icon: Shield, description: "Security measures and data access controls" },
    governance: { label: "Governance", icon: FileCheck, description: "Privacy policies and data governance practices" },
    "lock-in-risk": { label: "Lock-in Risk", icon: AlertTriangle, description: "Vendor lock-in and open-source compliance assessment" }
  };

  const parseN8nData = (rawData: ScoringData): CompanyData => {
    const { score } = rawData;
    
    // Validate that we have the required score data
    if (!score) {
      throw new Error("No score data available in API response");
    }
    
    if (typeof score.overall !== "number") {
      throw new Error("Overall score is missing from API response");
    }
    
    if (!score.dimensions || Object.keys(score.dimensions).length === 0) {
      throw new Error("No dimension scores available in API response");
    }
    
    // Validate that all required dimensions are present
    const requiredDimensions = Object.keys(dimensionMapping);
    const missingDimensions = requiredDimensions.filter(dim => !score.dimensions[dim]);
    if (missingDimensions.length > 0) {
      throw new Error(`Missing dimension scores: ${missingDimensions.join(', ')}`);
    }
    
    // Create criteria scores from dimensions - no defaults, use actual data
    const criteriaScores: CriteriaScore[] = Object.entries(dimensionMapping).map(([key, mapping]) => {
      const dimension = score.dimensions[key];
      if (!dimension || typeof dimension.score !== "number") {
        throw new Error(`Invalid or missing score for dimension: ${key}`);
      }
      
      return {
        id: key,
        label: mapping.label,
        icon: mapping.icon,
        score: Math.round(dimension.score / 10), // Convert 0-100 to 0-10
        maxScore: 10,
        description: mapping.description,
        why: dimension.why,
        evidence: dimension.evidence
      };
    });
    
    // Logo can use default if not provided
    
    // Pricing is optional, can be null or missing

    return {
      name: query,
      logo: score.logo_url && score.logo_url !== null ? score.logo_url : "🛠️",
      score: score.overall,
      headquarters: "Unknown", // Will be derived from API data
      gdprCompliant: score.dimensions.jurisdiction?.score >= 60,
      dataHandling: score.dimensions.jurisdiction?.why || "No assessment data available",
      features: [], // Remove hardcoded features
      pricing: score.pricing || "Pricing not available",
      userRating: score.rating || 0, // Use 0 if not provided
      reviewCount: 0, // Remove hardcoded review count
      criteriaScores,
      alternatives: [] // Remove hardcoded alternatives
    };
  };

  useEffect(() => {
    // Use data passed from LoadingPage or fallback
    const loadData = async () => {
      setIsLoading(true);
      console.log('SearchResults: Loading data for query:', query);
      console.log('SearchResults: Location state:', location.state);

      try {
        // Check if we have data passed from LoadingPage
        const responseData = location.state?.responseData;
        console.log('SearchResults: Response data:', responseData);
        
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
          console.log('SearchResults: Parsed company data:', parsedData);
          setCompanyData(parsedData);
        } else {
          throw new Error("No data received from LoadingPage");
        }
      } catch (err) {
        console.error("SearchResults: Failed to process scoring data:", err);
        // Don't use fallback data - show the error to user
        setError(err instanceof Error ? err.message : "Failed to process scoring data");
        setCompanyData(null);
        setIsLoading(false);
        return; // Exit early without fetching alternatives
      } finally {
        console.log('SearchResults: Finished loading');
        setIsLoading(false);
      }
      
      // Automatically fetch alternatives
      if (query) {
        await fetchAlternatives();
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

  const fetchAlternatives = async () => {
    setIsLoadingAlternatives(true);
    setAlternativesError(null);
    try {
      console.log('Fetching alternatives for:', query);
      // Create AbortController for 4-minute timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 240000);
      
      const response = await fetch(`https://limmerja.app.n8n.cloud/webhook/alternatives?query=${encodeURIComponent(query)}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      console.log('Raw alternatives response:', text);
      
      let alternatives;
      try {
        alternatives = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse alternatives JSON:', parseError);
        throw new Error('Invalid JSON response from alternatives API');
      }
      
      console.log('Parsed alternatives:', alternatives);
      
      if (Array.isArray(alternatives)) {
        setComparisonData(alternatives);
        setAlternativesError(null);
      } else {
        console.error('Alternatives response is not an array:', alternatives);
        setComparisonData([]);
        setAlternativesError('Invalid response format from alternatives API');
      }
    } catch (error) {
      console.error("Failed to fetch alternatives:", error);
      setComparisonData([]);
      setAlternativesError(error instanceof Error ? error.message : 'Failed to fetch alternatives');
    } finally {
      setIsLoadingAlternatives(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Failed to Load Data</h1>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          <p className="text-muted-foreground mb-4">
            The API response is missing required scoring data. Please check the API response format.
          </p>
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
            <div className="text-4xl">
              {companyData.logo.startsWith('http') ? (
                <img src={companyData.logo} alt={`${companyData.name} logo`} className="w-16 h-16 object-contain" />
              ) : (
                companyData.logo
              )}
            </div>
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
            {isLoadingAlternatives && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Finding European Alternatives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-lg mb-2">Searching for alternatives...</div>
                    <div className="text-sm text-muted-foreground">This may take a few seconds</div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {comparisonData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    European Alternatives Found
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {comparisonData.map((alt, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div>
                          <div className="font-semibold">{alt.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Type: {alt.type}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Hosting: {alt.hosting}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Pricing: {alt.price_hint}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="mb-2">
                            <div className="text-sm font-medium text-green-700">Why Better:</div>
                            <div className="text-xs text-muted-foreground max-w-48">{alt.why_better}</div>
                          </div>
                          <div className="space-y-1">
                            {alt.links.map((link, linkIndex) => (
                              <Button 
                                key={linkIndex}
                                size="sm" 
                                variant="outline"
                                onClick={() => window.open(link, '_blank')}
                              >
                                Visit
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Score Comparison Button */}
                  <div className="mt-6 pt-4 border-t">
                    <Button 
                      onClick={() => navigate(`/comparison-loading?q=${query}`, {
                        state: {
                          originalData: {
                            name: companyData.name,
                            score: companyData.score,
                            criteriaScores: companyData.criteriaScores.map(criteria => ({
                              id: criteria.id,
                              label: criteria.label,
                              score: criteria.score,
                              maxScore: criteria.maxScore,
                              description: criteria.description,
                              why: criteria.why,
                              evidence: criteria.evidence
                            })),
                            type: "Current Solution"
                          }
                        }
                      })}
                      className="w-full"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Compare Detailed Scores
                    </Button>
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
                <CardTitle>European Alternatives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Discover more European alternatives to popular software and services
                  </p>
                  <Button 
                    onClick={() => window.open('https://european-alternatives.eu', '_blank')}
                    className="w-full"
                    variant="default"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Find EU Alternatives
                  </Button>
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