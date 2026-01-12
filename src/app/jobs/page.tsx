'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Briefcase,
  Bookmark,
  Share2,
  X,
  DollarSign,
  Building,
  Linkedin,
  FileText,
  User,
  LayoutGrid,
  List,
  Upload,
  CheckCircle,
  BriefcaseBusiness,
  Phone,
  Mail,
  Copy,
  Loader2
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { CldUploadWidget } from 'next-cloudinary';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/ui/logo';
import Image from 'next/image';

// --- Types ---

type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  salary_range: string;
  type: string;
  description: string;
  requirements: string[];
  posted_by: {
    _id: string;
    name: string;
    image?: string;
    category?: string;
    email?: string;
    phone?: string;
  };
  createdAt: string;
};

type Talent = {
  _id: string;
  name: string;
  headline: string;
  image?: string;
  category: string;
  specialization?: string;
  resume?: string;
  skills?: { name: string }[];
  location?: { city: string; country: string };
  isOpenToWork?: boolean;
  email?: string;
  phone?: string;
};

const JOB_POSTERS = ['Architect', 'Contractor', 'Builder', 'Agency', 'Material Supplier'];

// --- Components ---

const JobCard = ({ job, isSelected, onClick }: { job: Job; isSelected: boolean; onClick: () => void; }) => (
  <motion.div
    layoutId={`job-card-${job._id}`}
    onClick={onClick}
    className={cn(
      "p-4 rounded-lg cursor-pointer transition-all duration-300 border-2 bg-card",
      isSelected
        ? "border-primary shadow-lg shadow-primary/10"
        : "border-border/50 hover:border-primary/50 hover:bg-accent"
    )}
  >
    <div className="flex justify-between items-start">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
          {job.posted_by?.image ? (
            <Image src={job.posted_by.image} alt={job.posted_by.name} width={40} height={40} className="object-cover h-full w-full" />
          ) : (
            <Building className="h-5 w-5 text-primary" />
          )}
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground line-clamp-1">{job.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{job.company}</p>
        </div>
      </div>
      {/* <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary -mt-1 -mr-1">
                <Bookmark className="h-4 w-4" />
            </Button> */}
    </div>

    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md">
        <MapPin className="h-3 w-3" /> {job.location}
      </span>
      <span className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md">
        <DollarSign className="h-3 w-3" /> {job.salary_range || 'Not specified'}
      </span>
      <span className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md">
        <Briefcase className="h-3 w-3" /> {job.type}
      </span>
    </div>

    <p className="text-xs text-muted-foreground mt-3 text-right">
      Posted {new Date(job.createdAt).toLocaleDateString()}
    </p>
  </motion.div>
);

const TalentCard = ({ talent }: { talent: Talent }) => {
  const { toast } = useToast();
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex flex-col items-center text-center gap-4">
        <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-primary/20">
          {talent.image ? (
            <Image src={talent.image} alt={talent.name} width={96} height={96} className="object-cover h-full w-full" />
          ) : (
            <User className="h-10 w-10 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col items-center">
          <h3 className="font-bold text-xl">{talent.name}</h3>
          {talent.isOpenToWork && (
            <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
              Open to Work
            </Badge>
          )}
          <p className="text-sm text-primary font-medium mt-1">{talent.category} {talent.specialization && `• ${talent.specialization}`}</p>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{talent.headline}</p>
        </div>

        <div className="flex flex-wrap gap-1 justify-center mt-2">
          {talent.skills?.slice(0, 3).map((skill, i) => (
            <span key={i} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground">
              {skill.name}
            </span>
          ))}
          {(talent.skills?.length || 0) > 3 && (
            <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground">+{(talent.skills?.length || 0) - 3} more</span>
          )}
        </div>

        <div className="flex gap-2 w-full mt-4">
          <Button className="flex-1" variant="outline" asChild disabled={!talent.resume}>
            {talent.resume ? (
              <Link href={talent.resume} target="_blank">
                <FileText className="h-4 w-4 mr-2" /> Resume
              </Link>
            ) : (
              <span className="cursor-not-allowed opacity-50"><FileText className="h-4 w-4 mr-2" /> No Resume</span>
            )}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md">
                Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl overflow-hidden p-0 border-0">
              <DialogTitle className="sr-only">Contact {talent.name}</DialogTitle>
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-center text-white">
                <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center mb-4 border-4 border-white/30 shadow-xl">
                  {talent.image ? (
                    <Image src={talent.image} alt={talent.name} width={96} height={96} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-white" />
                  )}
                </div>
                <h3 className="text-2xl font-bold">{talent.name}</h3>
                <p className="text-blue-100">{talent.headline}</p>
              </div>

              <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
                <p className="text-center text-sm text-muted-foreground mb-4">Connect directly regarding opportunities.</p>

                {talent.phone && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group transition-all hover:bg-blue-50 dark:hover:bg-blue-900/10">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Phone Number</p>
                      <p className="font-semibold text-lg text-slate-900 dark:text-white">{talent.phone}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-blue-600" onClick={() => { navigator.clipboard.writeText(talent.phone || ''); toast({ title: "Copied!" }) }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {talent.email && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group transition-all hover:bg-purple-50 dark:hover:bg-purple-900/10">
                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Email Address</p>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white break-all">{talent.email}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-purple-600" onClick={() => { navigator.clipboard.writeText(talent.email || ''); toast({ title: "Copied!" }) }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <Button className="w-full mt-2" variant="outline" onClick={() => (document.querySelector('[data-state="open"]') as HTMLElement)?.click()}>
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

const JobDetails = ({ job, onClose }: { job: Job; onClose: () => void; }) => (
  <motion.div
    layoutId={`job-card-${job._id}`}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="h-full"
  >
    <Card className="h-full flex flex-col overflow-hidden border-l-0 rounded-l-none md:border-l md:rounded-l-lg">
      <CardHeader className="flex flex-row items-start justify-between border-b bg-muted/20 pb-6">
        <div className="gap-4 flex flex-col md:flex-row md:items-center">
          <div className="h-16 w-16 rounded-xl bg-background border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {job.posted_by?.image ? (
              <Image src={job.posted_by.image} alt={job.posted_by.name} width={64} height={64} className="object-cover h-full w-full" />
            ) : (
              <Building className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <CardTitle className="text-2xl">{job.title}</CardTitle>
            <CardDescription className="text-base mt-1 flex items-center gap-2">
              {job.company} •
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
            </CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/10 hover:text-destructive">
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-secondary/50 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Salary</p>
            <p className="font-semibold text-sm ">{job.salary_range || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Job Type</p>
            <p className="font-semibold text-sm ">{job.type}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Posted</p>
            <p className="font-semibold text-sm ">{new Date(job.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Poster</p>
            <p className="font-semibold text-sm line-clamp-1">{job.posted_by?.name || 'Unknown'}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Description
          </h3>
          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {job.description}
          </div>
        </div>

        {job.requirements && job.requirements.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" /> Requirements
            </h3>
            <ul className="space-y-2">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      <div className="p-4 border-t bg-background flex gap-4 sticky bottom-0 z-10">
        <Button className="flex-1" size="lg">Apply Now</Button>
        <Button variant="outline" size="icon" className="h-11 w-11 shrink-0">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  </motion.div>
);

// --- Main Page ---



// Helper to parse salary string "50k - 80k" -> [50, 80]
const parseSalary = (salaryStr: string | undefined): [number, number] | null => {
  if (!salaryStr) return null;
  try {
    // Normalize: remove '$', ',', 'year', etc, keep 'k'
    const normalized = salaryStr.toLowerCase().replace(/[^0-9k\-]/g, '');
    const parts = normalized.split('-');

    const parsePart = (p: string) => {
      let val = parseFloat(p);
      if (p.includes('k')) val *= 1000;
      return val;
    };

    if (parts.length === 2) {
      return [parsePart(parts[0]), parsePart(parts[1])];
    } else if (parts.length === 1) {
      const val = parsePart(parts[0]);
      return [val, val]; // Treat single value as point
    }
  } catch (e) {
    return null;
  }
  return null;
};

// --- Main Page ---

export default function JobsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter controls
  const [jobFilters, setJobFilters] = useState({
    type: 'All',
    location: '',
    salaryRange: [0, 200] // 0k to 200k
  });

  const [talentFilters, setTalentFilters] = useState({
    category: 'All',
    location: ''
  });

  // ...

  // Derived State for Filtering



  const [isApplying, setIsApplying] = useState(false);
  const [applicationData, setApplicationData] = useState({
    resume: session?.user?.email ? '' : '', // Will be pre-filled if profile loaded
    coverLetter: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [userCategory, setUserCategory] = useState('');

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [jobsRes, talentRes] = await Promise.all([
          fetch('/api/jobs'),
          fetch('/api/users/talent'),
        ]);
        const jobsData = jobsRes.ok ? await jobsRes.json() : [];
        const talentData = talentRes.ok ? await talentRes.json() : [];

        if (Array.isArray(jobsData)) setJobs(jobsData);
        if (Array.isArray(talentData)) setTalents(talentData);

        // Fetch user category and resume if logged in
        if (session?.user) {
          try {
            const profileRes = await fetch('/api/user/profile');
            if (profileRes.ok) {
              const profile = await profileRes.json();
              setUserCategory(profile.category || '');
              if (profile.resume) {
                setApplicationData(prev => ({ ...prev, resume: profile.resume }));
              }
            }
          } catch (err) {
            console.error("Failed to fetch user profile", err);
          }
        }

      } catch (error) {
        console.error("Error loading data", error);
        toast({ title: "Error", description: "Failed to load jobs data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, toast]);

  // Handle Application Submission
  const handleApplyJob = async (jobId: string) => {
    if (!applicationData.resume) {
      toast({ title: "Resume Required", description: "Please upload or provide a resume link.", variant: "destructive" });
      return;
    }

    setIsApplying(true);
    try {
      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          resume: applicationData.resume,
          coverLetter: applicationData.coverLetter
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to apply');
      }

      toast({ title: "Application Sent!", description: "Your application has been submitted successfully." });
      setApplicationData(prev => ({ ...prev, coverLetter: '' })); // Reset cover letter
      // Optionally close dialog or update UI state to show "Applied"
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsApplying(false);
    }
  };


  const handlePostJob = async (e: React.FormEvent) => {
    // Simple form handling logic - ideally this would be a separate component or hook
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const jobData = {
      title: formData.get('title'),
      company: formData.get('company'),
      location: formData.get('location'),
      type: formData.get('type'),
      salary_range: formData.get('salary'),
      description: formData.get('description'),
      requirements: (formData.get('requirements') as string).split('\n').filter(Boolean)
    };

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      toast({ title: "Job Posted!", description: "Your job listing is now live." });
      // Refresh jobs
      const jobsRes = await fetch('/api/jobs');
      setJobs(await jobsRes.json());
      (document.getElementById('post-job-trigger') as HTMLButtonElement)?.click(); // Hacky close
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to post job", variant: "destructive" });
    }
  }



  // Derived State for Filtering
  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = jobFilters.type === 'All' || j.type === jobFilters.type;
    const matchesLocation = !jobFilters.location || j.location.toLowerCase().includes(jobFilters.location.toLowerCase());

    let matchesSalary = true;
    if (j.salary_range) {
      const range = parseSalary(j.salary_range);
      if (range) {
        // Check overlap: (StartA <= EndB) and (EndA >= StartB)
        // Job Range: [range[0], range[1]]
        // Filter Range: [jobFilters.salaryRange[0]*1000, jobFilters.salaryRange[1]*1000]
        const minFilter = jobFilters.salaryRange[0] * 1000;
        const maxFilter = jobFilters.salaryRange[1] * 1000;

        matchesSalary = (range[0] <= maxFilter) && (range[1] >= minFilter);
      }
    }

    return matchesSearch && matchesType && matchesLocation && matchesSalary;
  });


  const filteredTalent = talents.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || (t.headline && t.headline.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = talentFilters.category === 'All' || t.category === talentFilters.category;
    // const matchesOpenToWork = !talentFilters.openToWork || t.isOpenToWork; // Removed per instruction
    const matchesLocation = !talentFilters.location || (t.location?.city && t.location.city.toLowerCase().includes(talentFilters.location.toLowerCase()));

    return matchesSearch && matchesCategory && matchesLocation;
  });


  return (
    <div className="bg-background min-h-screen flex flex-col font-sans text-foreground">

      {/* Header */}


      <main className="flex-1 container mx-auto py-8 lg:px-8">

        {/* Intro */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Opportunities & Talent</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Find your next project or recruit the best professionals in the industry.
            </p>
          </div>
          {JOB_POSTERS.includes(userCategory) && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="hidden md:flex gap-2" id="post-job-trigger"> <BriefcaseBusiness className='h-4 w-4' /> Post a Job</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Post a New Job</DialogTitle>
                  <DialogDescription>Find the perfect candidate for your project.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePostJob} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job Title</Label>
                      <Input name="title" required placeholder="e.g. Senior Architect" />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input name="company" required placeholder="Your Company Name" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input name="location" required placeholder="City, Country" />
                    </div>
                    <div className="space-y-2">
                      <Label>Job Type</Label>
                      <Select name="type" required>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Freelance">Freelance</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Salary Range</Label>
                    <Input name="salary" placeholder="e.g. $50k - $70k / year" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea name="description" required placeholder="Describe the role and responsibilities..." className="h-32" />
                  </div>
                  <div className="space-y-2">
                    <Label>Requirements (one per line)</Label>
                    <Textarea name="requirements" placeholder="- 5 years experience&#10;- Revit proficiency" className="h-32" />
                  </div>
                  <Button type="submit" className="w-full">Post Job</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>


        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary/50 p-1 rounded-xl h-auto w-full md:w-auto inline-flex">
            <TabsTrigger value="jobs" className="rounded-lg px-8 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Find Jobs
            </TabsTrigger>
            <TabsTrigger value="talent" className="rounded-lg px-8 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Find Talent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6 animate-in fade-in-50">
            {/* Job Filters */}
            <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={jobFilters.type} onValueChange={(val) => setJobFilters({ ...jobFilters, type: val })}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-full md:w-[200px]">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  className="pl-9"
                  value={jobFilters.location}
                  onChange={(e) => setJobFilters({ ...jobFilters, location: e.target.value })}
                />
              </div>
              <div className="relative w-full md:w-[260px] px-2 space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min Salary</span>
                  <span>${jobFilters.salaryRange[0]}k - ${jobFilters.salaryRange[1]}k+</span>
                </div>
                <Slider
                  value={jobFilters.salaryRange}
                  min={0}
                  max={200}
                  step={5}
                  onValueChange={(val) => setJobFilters({ ...jobFilters, salaryRange: val })}
                  className="py-2"
                />
              </div>
              <Button variant="ghost" onClick={() => { setSearchTerm(''); setJobFilters({ type: 'All', location: '', salaryRange: [0, 200] }); }}>
                Reset
              </Button>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-16rem)]">
              {/* Job List */}
              <div className={cn("lg:col-span-5 space-y-4 overflow-y-auto pr-2 pb-20 custom-scrollbar", selectedJob ? "hidden lg:block" : "block")}>
                {isLoading ? (
                  <p className="text-center p-8 text-muted-foreground">Loading jobs...</p>
                ) : filteredJobs.length === 0 ? (
                  <p className="text-center p-8 text-muted-foreground">No jobs found.</p>
                ) : (
                  filteredJobs.map(job => (
                    <JobCard
                      key={job._id}
                      job={job}
                      isSelected={selectedJob?._id === job._id}
                      onClick={() => setSelectedJob(job)}
                    />
                  ))
                )}
              </div>

              {/* Job Details Panel */}
              <div className={cn("lg:col-span-7 h-full", selectedJob ? "block" : "hidden lg:block")}>
                <AnimatePresence mode="wait">
                  {selectedJob ? (
                    <div className="h-full">
                      <Card className="h-full flex flex-col overflow-hidden border-l-0 rounded-l-none md:border-l md:rounded-l-lg">
                        <CardHeader className="flex flex-row items-start justify-between border-b bg-muted/20 pb-6">
                          <div className="gap-4 flex flex-col md:flex-row md:items-center">
                            <div className="h-16 w-16 rounded-xl bg-background border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                              {selectedJob.posted_by?.image ? (
                                <Image src={selectedJob.posted_by.image} alt={selectedJob.posted_by.name} width={64} height={64} className="object-cover h-full w-full" />
                              ) : (
                                <Building className="h-8 w-8 text-primary" />
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-2xl">{selectedJob.title}</CardTitle>
                              <CardDescription className="text-base mt-1 flex items-center gap-2">
                                {selectedJob.company} •
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {selectedJob.location}</span>
                              </CardDescription>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedJob(null)} className="hover:bg-destructive/10 hover:text-destructive">
                            <X className="h-5 w-5" />
                          </Button>
                        </CardHeader>

                        <CardContent className="flex-1 overflow-y-auto p-6 space-y-8">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-secondary/50 rounded-lg">
                            <div>
                              <p className="text-xs text-muted-foreground">Salary</p>
                              <p className="font-semibold text-sm ">{selectedJob.salary_range || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Job Type</p>
                              <p className="font-semibold text-sm ">{selectedJob.type}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Posted</p>
                              <p className="font-semibold text-sm ">{new Date(selectedJob.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Poster</p>
                              <p className="font-semibold text-sm line-clamp-1">{selectedJob.posted_by?.name || 'Unknown'}</p>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <FileText className="h-5 w-5 text-primary" /> Description
                            </h3>
                            <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                              {selectedJob.description}
                            </div>
                          </div>

                          {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                            <div>
                              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-primary" /> Requirements
                              </h3>
                              <ul className="space-y-2">
                                {selectedJob.requirements.map((req, i) => (
                                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>

                        <div className="p-4 border-t bg-background flex gap-4 sticky bottom-0 z-10">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="flex-1" size="lg">Apply</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="h-16 w-16 rounded-full overflow-hidden border">
                                    {selectedJob.posted_by?.image ? (
                                      <Image src={selectedJob.posted_by.image} alt={selectedJob.posted_by.name} width={64} height={64} className="object-cover h-full w-full" />
                                    ) : (
                                      <div className="h-full w-full bg-secondary flex items-center justify-center">
                                        <User className="h-8 w-8 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <DialogTitle>Contact {selectedJob.posted_by?.name}</DialogTitle>
                                    <DialogDescription>{selectedJob.company}</DialogDescription>
                                  </div>
                                </div>
                              </DialogHeader>
                              <div className="space-y-4">
                                {selectedJob.posted_by?.phone && (
                                  <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <div className="flex gap-2">
                                      <div className="relative flex-1">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input readOnly value={selectedJob.posted_by.phone} className="pl-9" />
                                      </div>
                                      <Button size="icon" variant="outline" onClick={() => {
                                        navigator.clipboard.writeText(selectedJob.posted_by.phone!);
                                        toast({ title: "Copied!", description: "Phone number copied to clipboard." });
                                      }}>
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                {selectedJob.posted_by?.email && (
                                  <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <div className="flex gap-2">
                                      <div className="relative flex-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input readOnly value={selectedJob.posted_by.email} className="pl-9" />
                                      </div>
                                      <Button size="icon" variant="outline" onClick={() => {
                                        navigator.clipboard.writeText(selectedJob.posted_by.email!);
                                        toast({ title: "Copied!", description: "Email copied to clipboard." });
                                      }}>
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                {!selectedJob.posted_by?.phone && !selectedJob.posted_by?.email && (
                                  <p className="text-center text-muted-foreground py-4">No contact details available.</p>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0">
                            <Share2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </Card>
                    </div>
                  ) : (
                    <div className="h-full rounded-lg border-2 border-dashed border-border/50 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-secondary/10">
                      <Briefcase className="h-16 w-16 mb-4 opacity-20" />
                      <h3 className="text-xl font-semibold">Select a job to view details</h3>
                      <p className="max-w-xs mt-2 opacity-70">Click on any job card from the list to see full description and requirements.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="talent" className="animate-in fade-in-50">
            {/* Talent Filters */}
            <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search talent..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={talentFilters.category} onValueChange={(val) => setTalentFilters({ ...talentFilters, category: val })}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Architect">Architect</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Interior Designer">Interior Designer</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-full md:w-[200px]">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  className="pl-9"
                  value={talentFilters.location}
                  onChange={(e) => setTalentFilters({ ...talentFilters, location: e.target.value })}
                />
              </div>
              <Button variant="ghost" onClick={() => { setSearchTerm(''); setTalentFilters({ category: 'All', location: '' }); }}>
                Reset
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                <p className="col-span-full text-center p-8 text-muted-foreground">Loading talent...</p>
              ) : filteredTalent.length === 0 ? (
                <div className="col-span-full text-center p-12 flex flex-col items-center text-muted-foreground">
                  <User className="h-12 w-12 mb-4 opacity-20" />
                  <p>No talent found matching your criteria.</p>
                </div>
              ) : (
                filteredTalent.map(talent => (
                  <TalentCard key={talent._id} talent={talent} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

      </main>
    </div>
  );
}
