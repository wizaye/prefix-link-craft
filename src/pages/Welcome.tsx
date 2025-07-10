import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { storage } from "@/utils/storage";
import { Link, Eye, Plus, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();
  const settings = storage.getSettings();
  const links = storage.getLinks();
  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-8 pt-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary-glow rounded-3xl flex items-center justify-center shadow-xl">
            <Link className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              LinkSnap
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Your personal URL shortener
            </p>
            <p className="text-sm text-muted-foreground">
              Using prefix: <span className="font-medium text-primary">{settings.preferredPrefix}</span>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center border-0 bg-card/50 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{links.length}</div>
              <p className="text-sm text-muted-foreground">Total Links</p>
            </CardContent>
          </Card>
          <Card className="text-center border-0 bg-card/50 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{totalClicks}</div>
              <p className="text-sm text-muted-foreground">Total Clicks</p>
            </CardContent>
          </Card>
          <Card className="text-center border-0 bg-card/50 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">
                {links.length > 0 ? Math.round(totalClicks / links.length) : 0}
              </div>
              <p className="text-sm text-muted-foreground">Avg Clicks</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm cursor-pointer group" onClick={() => navigate('/links')}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">View My Links</CardTitle>
              <CardDescription>
                Manage your existing shortened URLs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                View Links
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm cursor-pointer group" onClick={() => navigate('/create')}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Create Short Link</CardTitle>
              <CardDescription>
                Transform your long URLs into short ones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="gradient" className="w-full">
                Create Link
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Links Preview */}
        {links.length > 0 && (
          <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Recent Links
              </CardTitle>
              <CardDescription>
                Your 3 most recently created links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {links.slice(0, 3).map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {link.prefix}/{link.alias}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {link.originalUrl}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">{link.clicks} clicks</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(link.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}