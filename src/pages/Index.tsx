import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Shield, MapPin, FileCheck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const popularSoftware = [
    { name: "Slack", logo: "💬" },
    { name: "Google Workspace", logo: "📧" },
    { name: "Microsoft 365", logo: "📊" },
    { name: "Zoom", logo: "📹" },
    { name: "Dropbox", logo: "📁" },
    { name: "Trello", logo: "📋" }
  ];

  const features = [
    {
      icon: Shield,
      title: "Privacy First",
      description: "GDPR compliant European alternatives prioritizing your data privacy"
    },
    {
      icon: MapPin,
      title: "European Sovereignty",
      description: "Software solutions headquartered in Europe with transparent data handling"
    },
    {
      icon: FileCheck,
      title: "Comprehensive Analysis",
      description: "Detailed sovereignty scores based on multiple trust criteria"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Real user reviews and ratings from privacy-conscious professionals"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Logo and Title */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">EuroSoft</h1>
              </div>
              <p className="text-5xl md:text-6xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Find European Alternatives
              </p>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover privacy-first European software alternatives with our comprehensive sovereignty scoring system
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Enter software name or URL to check sovereignty score..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-32 h-14 text-lg border-2 border-border focus:border-primary transition-all shadow-lg hover:shadow-xl bg-card"
                  />
                  <Button 
                    type="submit" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all"
                    disabled={!searchQuery.trim()}
                  >
                    Check Score
                  </Button>
                </div>
              </form>
            </div>

            {/* Popular Software */}
            <div className="mb-16">
              <p className="text-sm text-muted-foreground mb-4">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {popularSoftware.map((software) => (
                  <button
                    key={software.name}
                    onClick={() => setSearchQuery(software.name)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full hover:bg-accent transition-colors text-sm"
                  >
                    <span className="text-lg">{software.logo}</span>
                    {software.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose European Software?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Make informed decisions about your digital tools with our comprehensive analysis
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-border hover:border-primary/50 transition-all hover:shadow-lg">
                <CardContent className="pt-6 pb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
