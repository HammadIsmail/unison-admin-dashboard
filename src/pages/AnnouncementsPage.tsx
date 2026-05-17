import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Megaphone, Send, Trash2, Calendar as CalendarIcon,
  Image as ImageIcon, Video, X, Loader2, Play, Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient, getAuthToken } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
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
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Announcement {
  id: string;
  title: string;
  description: string;
  media_url?: string | null;
  media_type?: 'image' | 'video' | null;
  event_date?: string | null;
  created_by_admin?: {
    id: string;
    name: string;
  } | string;
  created_at: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  // Detail view state
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ data: Announcement[] }>("/api/admin/announcements");
      setAnnouncements(res.data || []);
    } catch {
      toast({ title: "Failed to load announcements", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const fetchAnnouncementDetail = async (id: string) => {
    setFetchingDetail(true);
    setIsDetailOpen(true);
    try {
      const res = await apiClient.get<Announcement>(`/api/admin/announcements/${id}`);
      setSelectedAnnouncement(res);
    } catch {
      toast({ title: "Failed to load announcement details", variant: "destructive" });
      setIsDetailOpen(false);
    } finally {
      setFetchingDetail(false);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    }
  };

  const handleBroadcast = async () => {
    if (!title || !description) return;

    setBroadcasting(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (eventDate) formData.append("event_date", new Date(eventDate).toISOString());
      if (media) formData.append("media", media);

      setProgress(30);

      const token = getAuthToken();
      const baseUrl = import.meta.env.VITE_NEXT_PUBLIC_API_BASE_URL;

      const response = await fetch(`${baseUrl}/api/admin/announcements`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      setProgress(80);

      if (!response.ok) throw new Error("Broadcast failed");

      setProgress(100);
      toast({ title: "Announcement Broadcasted", description: "All active users have been notified." });

      // Reset form
      setTitle("");
      setDescription("");
      setEventDate("");
      setMedia(null);
      setMediaPreview(null);
      setIsDialogOpen(false);

      fetchAnnouncements();
    } catch {
      toast({ title: "Broadcast Failed", variant: "destructive" });
    } finally {
      setBroadcasting(false);
      setProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!announcementToDelete) return;
    try {
      await apiClient.del(`/api/admin/announcements/${announcementToDelete}`);
      setAnnouncements(prev => prev.filter(a => a.id !== announcementToDelete));
      toast({ title: "Announcement deleted" });
    } catch {
      toast({ title: "Failed to delete announcement", variant: "destructive" });
    } finally {
      setAnnouncementToDelete(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-gradient-to-br from-primary/5 to-background p-8 rounded-2xl border border-primary/10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Broadcast Center</h1>
            <p className="text-sm text-muted-foreground mt-1">Push real-time notifications to the entire UNISON network.</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="h-12 px-8 gap-2 shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all font-bold">
              <Send className="h-4 w-4" /> New Broadcast
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-primary p-6 text-primary-foreground">
              <DialogTitle className="text-2xl font-bold">Create Announcement</DialogTitle>
              <DialogDescription className="text-primary-foreground/70">
                Compose a message to be sent to all approved users.
              </DialogDescription>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto scrollbar-thin">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Announcement Title</Label>
                  <Input
                    placeholder="e.g., Annual Convocation 2025"
                    className="h-11 focus-visible:ring-primary/20"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Message Body</Label>
                  <div className="quill-editor-wrapper">
                    <ReactQuill
                      theme="snow"
                      value={description}
                      onChange={setDescription}
                      placeholder="Provide full details about the announcement..."
                      className="bg-card rounded-md overflow-hidden border border-input focus-within:ring-2 focus-within:ring-primary/20 transition-all"
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                          ['link', 'clean']
                        ]
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Event Date (Optional)</Label>
                    <Input
                      type="datetime-local"
                      className="h-11 focus-visible:ring-primary/20"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Attachment</Label>
                    <div
                      className="h-11 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative overflow-hidden"
                      onClick={() => document.getElementById('media-upload')?.click()}
                    >
                      {media ? (
                        <span className="text-xs font-medium truncate px-8 text-primary">{media.name}</span>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                          <span className="text-xs font-medium">Add Media</span>
                        </div>
                      )}
                      <input
                        id="media-upload"
                        type="file"
                        hidden
                        accept="image/*,video/*"
                        onChange={handleMediaChange}
                      />
                    </div>
                  </div>
                </div>

                {mediaPreview && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border bg-black/5">
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 h-7 w-7 rounded-full z-10"
                      onClick={() => { setMedia(null); setMediaPreview(null); }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {media?.type.startsWith('video') ? (
                      <div className="w-full h-full flex items-center justify-center bg-black">
                        <Play className="h-12 w-12 text-white/50" />
                      </div>
                    ) : (
                      <img src={mediaPreview} alt="Preview" className="w-full h-full object-contain" />
                    )}
                  </div>
                )}
              </div>

              {broadcasting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                    <span className="text-primary italic animate-pulse">Broadcasting in progress...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-primary/10" />
                </div>
              )}
            </div>

            <DialogFooter className="p-6 bg-muted/30 border-t flex flex-row items-center justify-between">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={broadcasting}>Cancel</Button>
              <Button
                onClick={handleBroadcast}
                disabled={!title || !description || broadcasting}
                className="gap-2 min-w-[140px]"
              >
                {broadcasting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Broadcast Now
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight">Announcement History</h2>
          <Badge variant="outline" className="bg-muted/50">{announcements.length}</Badge>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-t-xl" />
                <CardContent className="p-6 space-y-4">
                  <div className="h-6 w-3/4 bg-muted rounded" />
                  <div className="h-12 w-full bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((item) => (
              <Card 
                key={item.id} 
                className="group overflow-hidden border-primary/10 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
                onClick={() => fetchAnnouncementDetail(item.id)}
              >
                {item.media_url ? (
                  <div className="relative aspect-video overflow-hidden bg-black/5">
                    {item.media_type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-black">
                        <Video className="h-10 w-10 text-white/30" />
                      </div>
                    ) : (
                      <img src={item.media_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-black/50 backdrop-blur-md border-white/20 capitalize text-[10px]">
                        {item.media_type}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Megaphone className="h-12 w-12 text-primary/20" />
                  </div>
                )}
                <CardHeader className="p-6 pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-bold leading-tight line-clamp-2">{item.title}</CardTitle>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAnnouncementToDelete(item.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-3 mt-2 text-xs leading-relaxed ql-editor prose prose-sm dark:prose-invert max-w-none !p-0">
                    <div dangerouslySetInnerHTML={{ __html: item.description }} />
                  </CardDescription>
                </CardHeader>
                <CardFooter className="p-6 pt-4 flex flex-col gap-3 border-t bg-muted/10">
                  <div className="flex items-center justify-between w-full text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="h-3 w-3" />
                      Broadcasted
                    </span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                  {item.event_date && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 text-primary text-[10px] font-bold border border-primary/10 w-full">
                      <CalendarIcon className="h-3 w-3" />
                      EVENT DATE: {new Date(item.event_date).toLocaleString()}
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
            {announcements.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground gap-4 border-2 border-dashed rounded-3xl bg-muted/10">
                <div className="p-4 rounded-full bg-muted">
                  <Megaphone className="h-8 w-8 opacity-20" />
                </div>
                <p className="font-medium">No past announcements found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Slider (Sheet) */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent side="right" className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl flex flex-col h-full">
          {fetchingDetail ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 bg-background">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">Fetching announcement details...</p>
            </div>
          ) : selectedAnnouncement ? (
            <>
              <div className="bg-primary px-8 py-4 text-primary-foreground relative">
                <SheetTitle className="text-2xl font-bold tracking-tight pr-8 text-primary-foreground leading-tight">
                  {selectedAnnouncement.title}
                </SheetTitle>
              </div>

              <div className="overflow-y-auto scrollbar-none bg-card flex-1">
                {selectedAnnouncement.media_url && (
                  <div className="aspect-video w-full bg-black relative">
                    {selectedAnnouncement.media_type === 'video' ? (
                      <video
                        src={selectedAnnouncement.media_url}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={selectedAnnouncement.media_url}
                        alt={selectedAnnouncement.title}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                )}

                <div className="p-8 space-y-8">
                  <div className="ql-editor prose prose-lg dark:prose-invert max-w-none !p-0">
                    <div
                      dangerouslySetInnerHTML={{ __html: selectedAnnouncement.description }}
                      className="text-foreground/90 leading-relaxed"
                    />
                  </div>

                  <div className="space-y-6 pt-8 border-t border-border/50">
                    <div className="space-y-4">
                      <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground flex items-center gap-2">
                        <div className="h-1 w-4 bg-primary rounded-full" />
                        Temporal Data
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                          <CalendarIcon className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Broadcasted On</p>
                            <p className="text-sm font-semibold">{formatDate(selectedAnnouncement.created_at)}</p>
                          </div>
                        </div>
                        {selectedAnnouncement.event_date && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-[10px] font-bold text-primary uppercase">Scheduled Event Date</p>
                              <p className="text-sm font-semibold">{new Date(selectedAnnouncement.event_date).toLocaleString()}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground flex items-center gap-2">
                        <div className="h-1 w-4 bg-primary rounded-full" />
                        Administrative Info
                      </Label>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {typeof selectedAnnouncement.created_by_admin === 'object' 
                            ? selectedAnnouncement.created_by_admin.name.charAt(0) 
                            : 'A'}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Created By Admin</p>
                          <p className="text-sm font-semibold">
                            {typeof selectedAnnouncement.created_by_admin === 'object'
                              ? selectedAnnouncement.created_by_admin.name
                              : (selectedAnnouncement.created_by_admin || "System Admin")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={!!announcementToDelete} onOpenChange={(open) => !open && setAnnouncementToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the announcement
              from the system and it will no longer be visible to students and alumni.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Announcement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
