import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { storage } from "@/utils/storage";
import { ShortLink } from "@/types";
import { ArrowLeft, Edit, Trash2, Copy, ExternalLink, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ViewLinks() {
  const navigate = useNavigate();
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editLink, setEditLink] = useState<ShortLink | null>(null);
  const [editAlias, setEditAlias] = useState("");
  const [editPrefix, setEditPrefix] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadLinks = async () => {
      const req = indexedDB.open('PrefixLinkDB', 1);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('links', 'readonly');
        const store = tx.objectStore('links');
        const getAll = store.getAll();

        getAll.onsuccess = () => {
          const data = getAll.result as ShortLink[];
          setLinks(data);
        };
      };
    };
    loadLinks();
  }, []);

  const filteredLinks = links.filter(link => 
    link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    storage.deleteLink(id);
    setLinks(prev => prev.filter(link => link.id !== id));
    setDeleteId(null);
    toast.success("Link deleted successfully");
  };

  const handleEdit = (link: ShortLink) => {
    setEditLink(link);
    setEditAlias(link.alias);
    setEditPrefix(link.prefix);
  };
const handleSaveEdit = () => {
  if (!editLink || !editAlias.trim()) {
    toast.error("Alias cannot be empty");
    return;
  }

  if (!editPrefix.trim()) {
    toast.error("Prefix cannot be empty");
    return;
  }

  const existingLink = links.find(link =>
    link.prefix.toLowerCase() === editPrefix.toLowerCase() &&
    link.alias.toLowerCase() === editAlias.toLowerCase() &&
    link.id !== editLink.id
  );

  if (existingLink) {
    toast.error("This prefix/alias combination already exists");
    return;
  }

  const updated: ShortLink = {
    ...editLink,
    alias: editAlias.trim(),
    prefix: editPrefix.trim(),
    id: `${editPrefix.trim()}/${editAlias.trim()}` // 🔥 important
  };

  // Update IndexedDB
  const req = indexedDB.open('PrefixLinkDB', 1);
  req.onsuccess = () => {
    const db = req.result;
    const tx = db.transaction('links', 'readwrite');
    const store = tx.objectStore('links');

    // 1. Delete old entry by old ID
    store.delete(editLink.id);

    // 2. Insert updated link with new ID
    store.put(updated);
  };

  // Update UI state
  setLinks(prev => prev.map(link => link.id === editLink.id ? updated : link));
  setEditLink(null);
  setEditAlias("");
  setEditPrefix("");
  toast.success("Link updated successfully");
};



  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

 return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-6xl mx-auto space-y-6 pt-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">My Links</h1>
              <p className="text-muted-foreground">
                Manage your shortened URLs
              </p>
            </div>
          </div>
          <Button
            variant="gradient"
            onClick={() => navigate('/create')}
            className="gap-2"
          >
            Create New Link
          </Button>
        </div>

        {/* Search */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search links by URL, alias, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Links Table */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle>
              {filteredLinks.length} Link{filteredLinks.length !== 1 ? 's' : ''}
              {searchTerm && ` (filtered from ${links.length} total)`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredLinks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {links.length === 0 ? "No links created yet" : "No links match your search"}
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/create')}
                  className="mt-4"
                >
                  Create Your First Link
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Short URL</TableHead>
                      <TableHead>Original URL</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLinks.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                              {link.prefix}/{link.alias}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(`${link.prefix}/${link.alias}`)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 max-w-xs">
                            <span className="truncate text-sm">{link.originalUrl}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 flex-shrink-0"
                              onClick={() => openLink(link.originalUrl)}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{link.clicks}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(link.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(link)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(link.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Link</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this link? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && handleDelete(deleteId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Dialog */}
        <Dialog open={!!editLink} onOpenChange={() => setEditLink(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Original URL</label>
                <p className="text-sm text-muted-foreground mt-1 break-all">
                  {editLink?.originalUrl}
                </p>
              </div>
              <div className="grid grid-cols-5 gap-2 items-end">
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">Prefix</label>
                  <Input
                    value={editPrefix}
                    onChange={(e) => setEditPrefix(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                    placeholder="Enter prefix"
                    className="text-sm"
                  />
                </div>
                <div className="col-span-3 space-y-2">
                  <label className="text-sm font-medium">Alias</label>
                  <Input
                    value={editAlias}
                    onChange={(e) => setEditAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                    placeholder="Enter alias"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                <code className="text-sm font-mono text-primary">
                  {editPrefix || "prefix"}/{editAlias || "alias"}
                </code>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditLink(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
