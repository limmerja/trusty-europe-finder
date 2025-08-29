import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  AlertTriangle
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

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const navigate = useNavigate();
  
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
      score: score.overall,
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
    // Simulate loading and API call
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate n8n workflow call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock n8n workflow response (based on provided format)
      const mockN8nResponse: ScoringData = {
        score: {
          overall: 69,
          weights: {
            jurisdiction: 0.25,
            hosting: 0.25,
            control: 0.25,
            governance: 0.15,
            news_risk: 0.10
          },
          dimensions: {
            jurisdiction: {
              score: 25,
              why: `${query} is headquartered in the United States, a non-EU country without adequacy, leading to a lower jurisdictional score.`,
              evidence: ["https://en.wikipedia.org/wiki/" + query.replace(' ', '_')]
            },
            hosting: {
              score: 75,
              why: `${query} offers customers the option to choose data residency in multiple global regions including the EU, but defaults to US storage if no choice is made.`,
              evidence: ["https://example.com/data-residency"]
            },
            control: {
              score: 100,
              why: `${query} benefits from strong control and security policies under a reputable parent company.`,
              evidence: ["https://example.com/security"]
            },
            governance: {
              score: 75,
              why: `${query} publicly shares its security practices and provides regional data residency options, indicating good governance though detailed data protection agreements are not cited.`,
              evidence: ["https://example.com/governance"]
            },
            news_risk: {
              score: 50,
              why: "There is no notable recent news risk, but given its US base and high-profile status, a moderate news risk is assigned.",
              evidence: []
            }
          }
        }
      };
      
      const parsedData = parseN8nData(mockN8nResponse);
      setCompanyData(parsedData);
      setIsLoading(false);
    };

    if (query) {
      loadData();
    }
  }, [query]);

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