import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { storage } from "@/utils/storage";
import { toast } from "sonner";
import { Link, Settings } from "lucide-react";

interface WelcomeSetupProps {
  onComplete: () => void;
}

export default function WelcomeSetup({ onComplete }: WelcomeSetupProps) {
  const [prefix, setPrefix] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prefix.trim()) {
      toast.error("Please enter a preferred prefix");
      return;
    }

    setIsLoading(true);
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    storage.saveSettings({
      preferredPrefix: prefix.trim(),
      isFirstTime: false,
    });
    
    toast.success("Setup completed successfully!");
    setIsLoading(false);
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center shadow-lg">
            <Link className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Welcome to LinkSnap
            </h1>
            <p className="text-muted-foreground mt-2">
              Let's set up your URL shortener
            </p>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Settings className="w-5 h-5" />
              Initial Setup
            </CardTitle>
            <CardDescription>
              Choose your preferred prefix for shortened URLs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prefix">Preferred Prefix</Label>
                <div className="relative">
                  <Input
                    id="prefix"
                    type="text"
                    placeholder="e.g., snap, short, my"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Your links will look like: {prefix || "prefix"}/abc123
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                variant="gradient"
                disabled={isLoading}
              >
                {isLoading ? "Setting up..." : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}