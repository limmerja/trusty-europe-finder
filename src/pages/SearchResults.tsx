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
  XCircle
} from "lucide-react";

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

  useEffect(() => {
    // Simulate loading and API call
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate n8n workflow call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data - in reality this would come from the n8n workflow
      const mockData: CompanyData = {
        name: query,
        logo: "🔧",
        score: Math.floor(Math.random() * 40) + 30, // 30-70 range for demo
        headquarters: "United States",
        gdprCompliant: Math.random() > 0.5,
        dataHandling: "Data stored in US servers with limited EU compliance",
        features: ["Team collaboration", "File sharing", "Video calls", "Integrations"],
        pricing: "€12-25/month per user",
        userRating: 4.2,
        reviewCount: 1247,
        alternatives: [
          { name: "Nextcloud", score: 95, headquarters: "Germany", pricing: "€5-15/month" },
          { name: "Element", score: 92, headquarters: "France", pricing: "€3-8/month" },
          { name: "Mattermost", score: 88, headquarters: "Germany", pricing: "€7-18/month" }
        ]
      };
      
      setCompanyData(mockData);
      setIsLoading(false);
    };

    if (query) {
      loadData();
    }
  }, [query]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
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

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">Headquarters</div>
                    <div className="text-sm text-muted-foreground">{companyData.headquarters}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                      {companyData.gdprCompliant ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-600" />
                      )}
                    </div>
                    <div className="font-semibold">GDPR Compliance</div>
                    <div className="text-sm text-muted-foreground">
                      {companyData.gdprCompliant ? "Compliant" : "Limited"}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <FileCheck className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">Data Handling</div>
                    <div className="text-sm text-muted-foreground">Analyzed</div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="font-semibold mb-3">Data Handling Assessment</h3>
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