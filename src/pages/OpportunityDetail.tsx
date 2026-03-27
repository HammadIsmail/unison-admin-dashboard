import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, Calendar, MapPin, Briefcase, 
  ExternalLink, Clock, Building2, User2,
  FileText, CheckCircle2, Share2
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface OpportunityDetail {
  id: string;
  title: string;
  type: string;
  description: string;
  requirements: string;
  location: string;
  is_remote: boolean;
  deadline: string;
  apply_link: string;
  company: {
    name: string;
  };
  media: string[];
  required_skills: string[];
  posted_at: string;
  posted_by: {
    id: string;
    display_name: string;
    username: string;
    profile_picture?: string;
    role: string;
  };
}

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<OpportunityDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<OpportunityDetail>(`/api/opportunities/${id}`);
        setData(res);
      } catch (error) {
        toast({ title: "Failed to load details", variant: "destructive" });
        navigate("/opportunities");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardHeader className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const isExpired = new Date(data.deadline) < new Date();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate("/opportunities")}
        className="gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Opportunities
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="h-2 bg-primary" />
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-bold tracking-tight">{data.title}</CardTitle>
                  <CardDescription className="text-lg flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    {data.company?.name || "Multiple Companies"}
                  </CardDescription>
                </div>
                <Badge variant={isExpired ? "destructive" : "default"} className="px-3 py-1 uppercase tracking-wider font-bold text-[10px]">
                  {isExpired ? "Expired" : data.type.replace("-", " ")}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {data.is_remote ? "Remote" : data.location}
                </div>
                <Separator orientation="vertical" className="h-4 hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Posted {new Date(data.posted_at).toLocaleDateString()}
                </div>
                <Separator orientation="vertical" className="h-4 hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Deadline: {new Date(data.deadline).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-4">
              {data.media && data.media.length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Media Gallery
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.media.map((url, i) => (
                      <div key={i} className="relative aspect-video rounded-xl overflow-hidden border bg-muted group">
                        {url.toLowerCase().endsWith(".mp4") ? (
                          <video 
                            src={url} 
                            controls 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img 
                            src={url} 
                            alt={`Media ${i + 1}`} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onClick={() => window.open(url, '_blank')}
                          />
                        )}
                        {!url.toLowerCase().endsWith(".mp4") && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <ExternalLink className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </h3>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap pl-6 border-l-2 border-muted">
                  {data.description}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Requirements
                </h3>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap pl-6 border-l-2 border-muted">
                  {data.requirements}
                </div>
              </section>

              <div className="pt-4 flex items-center gap-4">
                <Button className="gap-2" asChild>
                  <a href={data.apply_link} target="_blank" rel="noopener noreferrer">
                    Apply Now
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Posted By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/10 cursor-pointer group">
                <Avatar className="h-12 w-12 border-2 border-background shadow-sm group-hover:scale-105 transition-transform">
                  {data.posted_by?.profile_picture && <AvatarImage src={data.posted_by.profile_picture} />}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {data.posted_by?.display_name?.split(" ").map(n => n[0]).join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{data.posted_by?.display_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">@{data.posted_by?.username}</p>
                  <Badge variant="secondary" className="mt-2 text-[8px] h-4 px-1.5 uppercase font-bold tracking-tighter">
                    {data.posted_by?.role}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Skills Required</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.required_skills?.map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-background hover:bg-muted transition-colors px-2 py-1 text-[11px]"
                  >
                    {skill}
                  </Badge>
                ))}
                {(!data.required_skills || data.required_skills.length === 0) && (
                  <p className="text-xs text-muted-foreground italic">No specific skills listed</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-primary/5 border border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Admin Note</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                As an administrator, you are seeing the full depth of this posting. You can remove it if it violates community guidelines.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
