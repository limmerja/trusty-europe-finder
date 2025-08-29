import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ExternalLink, Shield, Server, FileCheck, Gavel, AlertTriangle } from "lucide-react";

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

interface CompanyComparison {
  name: string;
  type?: string;
  hosting?: string;
  price_hint?: string;
  why_better?: string;
  links?: string[];
  score: number;
  criteriaScores: CriteriaScore[];
}

const ComparisonResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [comparisonData, setComparisonData] = useState<CompanyComparison[]>([]);
  const [originalCompany, setOriginalCompany] = useState<CompanyComparison | null>(null);
  
  const query = searchParams.get("q") || "";

  const dimensionMapping = {
    jurisdiction: { label: "Jurisdiction", icon: Gavel, description: "Company headquarters and legal jurisdiction" },
    hosting: { label: "Data Hosting", icon: Server, description: "Data storage and processing location" },
    control: { label: "Data Control", icon: Shield, description: "Security measures and data access controls" },
    governance: { label: "Governance", icon: FileCheck, description: "Privacy policies and data governance" },
    "lock-in-risk/open-source compliance": { label: "Lock-in Risk", icon: AlertTriangle, description: "Vendor lock-in and open-source compliance" }
  };

  const criteriaOrder = ['jurisdiction', 'hosting', 'control', 'governance', 'lock-in-risk/open-source compliance'];

  useEffect(() => {
    const data = location.state?.comparisonData;
    const originalData = location.state?.originalData;
    
    if (data && originalData) {
      // Reconstruct the original data with icons
      const reconstructedOriginal = {
        ...originalData,
        criteriaScores: originalData.criteriaScores.map((criteria: any) => ({
          ...criteria,
          icon: dimensionMapping[criteria.id as keyof typeof dimensionMapping]?.icon || Shield
        }))
      };
      
      // Reconstruct alternatives data with icons
      const reconstructedAlternatives = data.map((alt: any) => ({
        ...alt,
        criteriaScores: alt.criteriaScores.map((criteria: any) => ({
          ...criteria,
          icon: dimensionMapping[criteria.id as keyof typeof dimensionMapping]?.icon || Shield
        }))
      }));
      
      setOriginalCompany(reconstructedOriginal);
      setComparisonData(reconstructedAlternatives);
    } else {
      // Redirect back if no data
      navigate(`/results?q=${query}`);
    }
  }, [location.state, navigate, query]);

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

  if (!originalCompany || comparisonData.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading comparison...</h1>
        </div>
      </div>
    );
  }

  const allCompanies = [originalCompany, ...comparisonData];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={() => navigate(`/results?q=${query}`)} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">European Alternatives Comparison</h1>
              <p className="text-muted-foreground">Detailed sovereignty analysis for {query} and alternatives</p>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Sovereignty Criteria Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48">Criteria</TableHead>
                    {allCompanies.map((company, index) => (
                      <TableHead key={index} className="text-center min-w-64">
                        <div>
                          <div className="font-semibold">{company.name}</div>
                          {index === 0 && <Badge variant="outline" className="mt-1">Current</Badge>}
                          {index > 0 && <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">Alternative</Badge>}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Overall Score Row */}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-semibold">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Overall Score
                      </div>
                    </TableCell>
                    {allCompanies.map((company, index) => (
                      <TableCell key={index} className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(company.score)}`}>
                          {company.score}
                        </div>
                        <div className="text-sm text-muted-foreground">out of 100</div>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Criteria Rows */}
                  {criteriaOrder.map(criteriaId => {
                    const mapping = dimensionMapping[criteriaId as keyof typeof dimensionMapping];
                    const IconComponent = mapping.icon;
                    
                    return (
                      <TableRow key={criteriaId}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4 text-primary" />
                            <div>
                              <div>{mapping.label}</div>
                              <div className="text-xs text-muted-foreground">{mapping.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        {allCompanies.map((company, companyIndex) => {
                          const criteria = company.criteriaScores.find(c => c.id === criteriaId);
                          const score = criteria ? criteria.score * 10 : 50; // Convert back to 0-100 scale
                          
                          return (
                            <TableCell key={companyIndex} className="text-center">
                              <div className={`text-2xl font-bold ${getScoreColor(score)} mb-1`}>
                                {criteria ? criteria.score : 5}/10
                              </div>
                              {criteria?.why && (
                                <div className="text-xs text-muted-foreground text-left mb-2 p-2 bg-muted/50 rounded">
                                  {criteria.why}
                                </div>
                              )}
                              {criteria?.evidence && criteria.evidence.length > 0 && (
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {criteria.evidence.map((link, linkIndex) => (
                                    <a
                                      key={linkIndex}
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
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}

                  {/* Hosting & Pricing Info Row */}
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-primary" />
                        Hosting & Pricing
                      </div>
                    </TableCell>
                    {allCompanies.map((company, index) => (
                      <TableCell key={index} className="text-center">
                        <div className="space-y-1">
                          {company.hosting && (
                            <div className="text-sm">
                              <span className="font-medium">Hosting:</span> {company.hosting}
                            </div>
                          )}
                          {company.price_hint && (
                            <div className="text-sm">
                              <span className="font-medium">Pricing:</span> {company.price_hint}
                            </div>
                          )}
                          {company.why_better && index > 0 && (
                            <div className="text-xs text-muted-foreground mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                              <span className="font-medium">Why better:</span> {company.why_better}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Action Buttons Row */}
                  <TableRow className="border-t-2">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-primary" />
                        Learn More
                      </div>
                    </TableCell>
                    {allCompanies.map((company, index) => (
                      <TableCell key={index} className="text-center">
                        {index === 0 ? (
                          <Button variant="outline" disabled>
                            Current Solution
                          </Button>
                        ) : (
                          <div className="space-y-2">
                            {company.links && company.links.map((link, linkIndex) => (
                              <Button
                                key={linkIndex}
                                variant={linkIndex === 0 ? "default" : "outline"}
                                size="sm"
                                className="w-full"
                                onClick={() => window.open(link, '_blank')}
                              >
                                {linkIndex === 0 ? 'Visit Website' : `Link ${linkIndex + 1}`}
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Comparison Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Best Overall Score</h3>
                {(() => {
                  const best = allCompanies.reduce((prev, current) => 
                    (prev.score > current.score) ? prev : current
                  );
                  return (
                    <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-lg">
                      <div className="font-semibold">{best.name}</div>
                      <div className="text-sm text-muted-foreground">Score: {best.score}/100</div>
                    </div>
                  );
                })()}
              </div>
              <div>
                <h3 className="font-semibold mb-3">European Alternatives Found</h3>
                <div className="text-2xl font-bold text-primary">{comparisonData.length}</div>
                <div className="text-sm text-muted-foreground">
                  Sovereignty-focused alternatives analyzed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComparisonResults;