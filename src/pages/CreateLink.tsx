import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storage, generateShortCode } from "@/utils/storage";
import { ShortLink } from "@/types";
import { ArrowLeft, Link, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function CreateLink() {
  const navigate = useNavigate();
  const settings = storage.getSettings();
  
  const [originalUrl, setOriginalUrl] = useState("");
  const [prefix, setPrefix] = useState(settings.preferredPrefix);
  const [alias, setAlias] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState<ShortLink | null>(null);
  const [copied, setCopied] = useState(false);

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originalUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    if (!isValidUrl(originalUrl)) {
      toast.error("Please enter a valid URL");
      return;
    }

    if (!prefix.trim()) {
      toast.error("Please enter a prefix");
      return;
    }

    if (!alias.trim()) {
      toast.error("Please enter an alias");
      return;
    }

    // Check if alias already exists
    const existingLinks = storage.getLinks();
    const aliasExists = existingLinks.some(link => 
      link.alias.toLowerCase() === alias.toLowerCase()
    );

    if (aliasExists) {
      toast.error("This alias already exists. Please choose a different one.");
      return;
    }

    setIsLoading(true);
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newLink: ShortLink = {
      id: Date.now().toString(),
      originalUrl: originalUrl.trim(),
      shortCode: generateShortCode(),
      alias: alias.trim(),
      prefix: prefix.trim(),
      clicks: 0,
      createdAt: new Date().toISOString(),
    };

    storage.addLink(newLink);
    setCreatedLink(newLink);
    setIsLoading(false);
    toast.success("Short link created successfully!");
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setOriginalUrl("");
    setPrefix(settings.preferredPrefix);
    setAlias("");
    setCreatedLink(null);
    setCopied(false);
  };

  if (createdLink) {
    const shortUrl = `${createdLink.prefix}/${createdLink.alias}`;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="max-w-2xl mx-auto space-y-6 pt-16">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center shadow-lg">
              <Check className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Link Created Successfully!</h1>
          </div>

          <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle>Your Short Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Short URL</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-lg">
                    {shortUrl}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(shortUrl)}
                    className="gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Original URL</Label>
                <div className="p-3 bg-muted rounded-lg break-all text-sm">
                  {createdLink.originalUrl}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {new Date(createdLink.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Created</div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Create Another
                </Button>
                <Button
                  variant="gradient"
                  onClick={() => navigate('/links')}
                  className="flex-1"
                >
                  View All Links
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold">Create Short Link</h1>
            <p className="text-muted-foreground">
              Transform your long URL into a short, shareable link
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="w-5 h-5" />
              Link Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="originalUrl">Long URL</Label>
                <Input
                  id="originalUrl"
                  type="url"
                  placeholder="https://example.com/very/long/url/here"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  disabled={isLoading}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the URL you want to shorten
                </p>
              </div>

              <div className="grid grid-cols-5 gap-2 items-end">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="prefix">Prefix</Label>
                  <Input
                    id="prefix"
                    type="text"
                    placeholder="snap"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                    disabled={isLoading}
                    className="text-sm"
                  />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label htmlFor="alias">Alias</Label>
                  <Input
                    id="alias"
                    type="text"
                    placeholder="my-awesome-link"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                    disabled={isLoading}
                    className="text-sm"
                  />
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                <code className="text-sm font-mono text-primary">
                  {prefix || "prefix"}/{alias || "your-alias"}
                </code>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Short Link"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Tips:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use descriptive aliases that are easy to remember</li>
              <li>• Aliases can contain letters, numbers, hyphens, and underscores</li>
              <li>• Keep aliases short but meaningful</li>
              <li>• Each alias must be unique</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}