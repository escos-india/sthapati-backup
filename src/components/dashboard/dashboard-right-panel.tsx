"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Building2,
  Users,
  FileText,
  Image as ImageIcon,
  Search,
  Plus,
  Loader2,
  MapPin,
  Trash2,
  ChevronRight,
  Package
} from "lucide-react";
import type { IUser } from "@/types/user";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface DashboardRightPanelProps {
  user: IUser;
  readOnly?: boolean;
}

interface SimplePost {
  _id: string;
  content: string;
  author: {
    name: string;
    image?: string;
    headline?: string;
  };
  createdAt: string;
  image?: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  posted_by?: {
    _id: string;
    name: string;
  }
}

interface SearchUser {
  _id: string;
  name: string;
  image?: string;
  headline?: string;
  category: string;
}

const dummyAssociates: SearchUser[] = [
  { _id: "d1", name: "Sarah Jenkins", category: "Architect", headline: "Senior Architect at BuildCo" },
  { _id: "d2", name: "David Chen", category: "Interior Designer", headline: "Creative Director" },
  { _id: "d3", name: "Elena Rodriguez", category: "Landscape Architect", headline: "Green Spaces Lead" },
];

const jobSchema = z.object({
  title: z.string().min(3, { message: "Job title is required." }),
  company: z.string().min(2, { message: "Company name is required." }),
  location: z.string().min(2, { message: "Location is required." }),
  type: z.string(),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  salary_range: z.string().optional(),
});

export function DashboardRightPanel({ user, readOnly = false }: DashboardRightPanelProps) {
  const router = useRouter();
  const [recentPosts, setRecentPosts] = useState<SimplePost[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Job Creation State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isPostingJob, setIsPostingJob] = useState(false);

  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      type: "Full-time",
      description: "",
      salary_range: "",
    },
  });

  // Article View State
  const [selectedArticle, setSelectedArticle] = useState<SimplePost | null>(null);

  const isJobSeeker = ['Student', 'Trade Professional'].includes(user.category);

  useEffect(() => {
    fetchPosts();
    fetchJobs();
    // Initialize search results with dummy data if empty
    if (searchResults.length === 0) {
      setSearchResults(dummyAssociates);
    }
  }, [user._id, readOnly]);

  const fetchPosts = async () => {
    try {
      // In read-only mode, fetch only the user's posts
      const url = readOnly ? `/api/posts?userId=${user._id}` : "/api/posts";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // Filter out posts with missing authors and take the first 5
        const validPosts = data.filter((post: any) => post.author && post.author.name);
        setRecentPosts(validPosts.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    }
  };

  const fetchJobs = async () => {
    try {
      // In read-only mode, always fetch the user's jobs
      // Otherwise: If job seeker, fetch all active jobs (suggestions); If job poster, fetch their own jobs
      const url = readOnly
        ? `/api/jobs?userId=${user._id}`
        : (isJobSeeker ? "/api/jobs" : `/api/jobs?userId=${user._id}`);
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults(dummyAssociates); // Revert to dummy data
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.length > 0 ? data : dummyAssociates); // Fallback to dummy if no results? Or just show empty? Let's show data if found.
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  }

  const handleCreateJob = async (values: z.infer<typeof jobSchema>) => {
    setIsPostingJob(true);
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success("Job posted successfully!");
        setIsJobModalOpen(false);
        form.reset();
        fetchJobs(); // Refresh list
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to post job");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsPostingJob(false);
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs?id=${jobId}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Job deleted successfully");
        setJobs(jobs.filter(j => j._id !== jobId));
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete job");
      }
    } catch (error) {
      toast.error("Error deleting job");
    }
  }

  return (
    <div className="space-y-6">
      {/* Material Catalog Section (For Material Suppliers) */}
      {user.category === 'Material Supplier' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg transition-colors duration-300 overflow-hidden group cursor-pointer"
            onClick={() => router.push(readOnly ? `/profile/${user._id}/catalog` : '/dashboard/catalog')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg">My Catalog</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400">Manage your materials</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-slate-400 group-hover:text-orange-600 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Gallery Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg transition-colors duration-300 overflow-hidden group cursor-pointer" onClick={() => router.push(readOnly ? `/profile/${user._id}/gallery` : '/dashboard/gallery')}>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-6 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg">View Gallery</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400">Browse your collection</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400 group-hover:text-cyan-600 transition-colors">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Articles Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Articles</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300" onClick={() => router.push(readOnly ? `/profile/${user._id}/articles` : '/dashboard/articles')}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPosts.length > 0 ? (
              recentPosts.map((post, idx) => (
                <Dialog key={post._id}>
                  <DialogTrigger asChild>
                    <div
                      className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
                      onClick={() => setSelectedArticle(post)}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-slate-900 dark:text-gray-200 line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {post.content}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1">
                          {post.author.name} · {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-gray-800 text-slate-900 dark:text-gray-300">
                        Read
                      </Badge>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">{post.author.name}'s Article</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar>
                          <AvatarImage src={post.author.image} />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{post.author.name}</p>
                          <p className="text-sm text-slate-500">{post.author.headline}</p>
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-gray-300">
                        {post.content}
                      </p>
                      {post.image && (
                        <img src={post.image} alt="Article attachment" className="rounded-lg w-full object-contain max-h-[400px]" />
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-gray-400">No articles yet.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Job Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                {isJobSeeker ? "Job Suggestions" : "My Job Posts"}
              </CardTitle>
            </div>
            {!isJobSeeker && !readOnly && (
              <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" className="h-8 w-8 bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm rounded-lg">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create Job Post</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreateJob)} className="space-y-4 py-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Senior Architect" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input placeholder="Company Name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="City, Country" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Full-time">Full-time</SelectItem>
                                  <SelectItem value="Part-time">Part-time</SelectItem>
                                  <SelectItem value="Contract">Contract</SelectItem>
                                  <SelectItem value="Freelance">Freelance</SelectItem>
                                  <SelectItem value="Internship">Internship</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="salary_range"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Salary Range (in K)</FormLabel>
                              <FormControl>
                                <Input required placeholder="e.g. $50k - $80k" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Job description and requirements..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                        disabled={isPostingJob}
                      >
                        {isPostingJob ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Post Job"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {jobs.length > 0 ? (
              jobs.map((job, idx) => (
                <div key={idx} className="group relative p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-gray-800">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{job.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-gray-400 flex items-center gap-2">
                      <Building2 className="h-3 w-3" /> {job.company}
                      <MapPin className="h-3 w-3 ml-2" /> {job.location}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400">
                        {job.type}
                      </Badge>
                    </div>
                  </div>

                  {/* Delete Button for Job Owner */}
                  {!isJobSeeker && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteJob(job._id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-gray-400 text-center py-4">
                {isJobSeeker ? "No job suggestions found." : "You haven't posted any jobs yet."}
              </p>
            )}
            <Button
              variant="ghost"
              className="w-full text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
              onClick={() => router.push('/jobs')}
            >
              See all jobs
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Our Associates (Search) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 backdrop-blur-xl shadow-lg transition-colors duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Our Associates</h4>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search associates..."
                className="pl-9 bg-white/50 dark:bg-gray-900/50 border-slate-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="mt-4 space-y-3">
              {searchResults.map((person) => (
                <div
                  key={person._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  onClick={() => toast.info(`Viewing ${person.name}'s profile (Coming soon)`)}
                >
                  <Avatar className="h-8 w-8 border border-white/50 dark:border-gray-700">
                    <AvatarImage src={person.image} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs">
                      {person.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{person.name}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{person.headline || person.category}</p>
                  </div>
                </div>
              ))}
            </div>

            {isSearching && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
