import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Layers, MapPin, FileCheck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  console.log("Index component rendering...");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate("/loading", { state: { query: searchQuery.trim() } });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      const filtered = allSoftware.filter(software =>
        software.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 6);
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    navigate("/loading", { state: { query: suggestion } });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allSoftware = [
    "Slack", "Google Workspace", "Microsoft 365", "Zoom", "Dropbox", "Trello",
    "Notion", "Figma", "Adobe Creative Suite", "Salesforce", "HubSpot", "Mailchimp",
    "Spotify", "Netflix", "YouTube", "WhatsApp", "Instagram", "Facebook",
    "Twitter", "LinkedIn", "TikTok", "Discord", "Telegram", "Signal",
    "Shopify", "WooCommerce", "Stripe", "PayPal", "Square", "Klarna"
  ];

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
      icon: Layers,
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
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <Layers className="w-6 h-6 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  bestfor
                  <span className="relative">
                    <span className="text-primary">eu</span>
                    <span className="absolute inset-0 text-primary/30 hover:text-primary/10 transition-colors duration-300 cursor-help" title="Also reads as 'bestforyou'">
                      u
                    </span>
                  </span>
                </h1>
              </div>
              <p className="text-5xl md:text-6xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Discover European Apps
              </p>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                European alternatives that respect your privacy and data sovereignty.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative group" ref={searchRef}>
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
                  <Input
                    type="text"
                    placeholder="Enter software name or URL to check sovereignty score..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => searchQuery && setShowSuggestions(true)}
                    className="pl-12 pr-32 h-14 text-lg border-2 border-border focus:border-primary transition-all shadow-lg hover:shadow-xl bg-card"
                  />
                  <Button 
                    type="submit" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all z-10"
                    disabled={!searchQuery.trim()}
                  >
                    Check Score
                  </Button>
                  
                  {/* Autocomplete Suggestions */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                      {filteredSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-b-0 flex items-center gap-2"
                        >
                          <Search className="w-4 h-4 text-muted-foreground" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}
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
                    onClick={() => {
                      navigate("/loading", { state: { query: software.name } });
                    }}
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
