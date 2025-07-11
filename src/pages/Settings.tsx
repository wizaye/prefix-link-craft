import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { storage } from "@/utils/storage";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const settings = storage.getSettings();
  
  const [preferredPrefix, setPreferredPrefix] = useState(settings.preferredPrefix);
  const [usePrefixBehavior, setUsePrefixBehavior] = useState(settings.usePrefixBehavior);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!preferredPrefix.trim()) {
      toast.error("Please enter a preferred prefix");
      return;
    }

    setIsLoading(true);
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    storage.saveSettings({
      ...settings,
      preferredPrefix: preferredPrefix.trim(),
      usePrefixBehavior,
    });
    
    toast.success("Settings saved successfully!");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-2xl mx-auto space-y-6 pt-16">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your URL shortener preferences
            </p>
          </div>
        </div>

        {/* Settings Form */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Prefix Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="preferredPrefix">Preferred Prefix</Label>
                <Input
                  id="preferredPrefix"
                  type="text"
                  placeholder="e.g., snap, short, my"
                  value={preferredPrefix}
                  onChange={(e) => setPreferredPrefix(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Your default prefix for new links
                </p>
              </div>

              <div className="space-y-4">
                <Label>Prefix Behavior</Label>
                <RadioGroup 
                  value={usePrefixBehavior} 
                  onValueChange={(value: 'preferred' | 'lastUsed') => setUsePrefixBehavior(value)}
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="preferred" id="preferred" />
                    <Label htmlFor="preferred">Always use preferred prefix</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lastUsed" id="lastUsed" />
                    <Label htmlFor="lastUsed">Use last used prefix</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Choose whether to default to your preferred prefix or remember the last prefix you used
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Current Settings Preview */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Current Settings:</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Preferred prefix: <span className="font-medium text-primary">{settings.preferredPrefix}</span></p>
              <p>• Prefix behavior: <span className="font-medium text-primary">
                {settings.usePrefixBehavior === 'preferred' ? 'Always use preferred' : 'Use last used'}
              </span></p>
              {settings.lastUsedPrefix && (
                <p>• Last used prefix: <span className="font-medium text-primary">{settings.lastUsedPrefix}</span></p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}