'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Briefcase,
  Bookmark,
  Share2,
  X,
  ChevronDown,
  DollarSign,
  Building,
  Star,
  Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Logo from '@/components/ui/logo';

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: { min: number; max: number };
  type: string;
  posted: string;
  specialty: string;
  experience: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
};

const jobs: Job[] = [
  {
    id: 1,
    title: 'Senior Architect',
    company: 'Foster + Partners',
    location: 'London, UK',
    salary: { min: 75000, max: 90000 },
    type: 'Full-time',
    posted: '2 days ago',
    specialty: 'Architecture',
    experience: 'Senior',
    description: 'Seeking a visionary Senior Architect to lead iconic projects from conception to completion. You will collaborate with a world-class team to push the boundaries of design and innovation.',
    responsibilities: [
      'Lead project teams and mentor junior architects.',
      'Develop design concepts and presentations.',
      'Oversee construction documentation and administration.',
    ],
    qualifications: [
      '10+ years of professional experience.',
      'Licensed Architect with a portfolio of built work.',
      'Proficiency in Revit, Rhino, and Adobe Creative Suite.',
    ],
  },
  {
    id: 2,
    title: 'Civil Engineer',
    company: 'Arup',
    location: 'New York, NY',
    salary: { min: 80000, max: 110000 },
    type: 'Full-time',
    posted: '5 days ago',
    specialty: 'Civil Engineering',
    experience: 'Mid-Level',
    description: 'Join our award-winning infrastructure team to work on challenging and sustainable projects that shape the future of our cities.',
    responsibilities: [
      'Perform structural analysis and design calculations.',
      'Prepare engineering reports and drawings.',
      'Coordinate with clients, contractors, and regulatory agencies.',
    ],
    qualifications: [
      'Bachelors degree in Civil Engineering.',
      '5+ years of experience in a similar role.',
      'EIT/PE license is a plus.',
    ],
  },
  {
    id: 3,
    title: 'BIM Specialist',
    company: 'Skidmore, Owings & Merrill (SOM)',
    location: 'Chicago, IL',
    salary: { min: 65000, max: 85000 },
    type: 'Contract',
    posted: '1 week ago',
    specialty: 'BIM',
    experience: 'Mid-Level',
    description: 'We are looking for a talented BIM Specialist to support our design teams in the creation and management of digital models for complex projects.',
    responsibilities: [
      'Develop and maintain BIM models.',
      'Collaborate with design teams to resolve clashes.',
      'Create custom families and templates.',
    ],
    qualifications: [
      'Expertise in Revit and Navisworks.',
      'Strong understanding of architectural and engineering principles.',
      '3+ years of experience in a BIM role.',
    ],
  },
    {
    id: 4,
    title: 'Junior Urban Planner',
    company: 'Gehl Architects',
    location: 'Copenhagen, DK',
    salary: { min: 45000, max: 55000 },
    type: 'Internship',
    posted: '3 days ago',
    specialty: 'Architecture',
    experience: 'Entry-Level',
    description: 'An exciting opportunity for a recent graduate to join our people-focused urban design practice. You will contribute to projects that enhance public life.',
    responsibilities: [
      'Assist with site analysis and research.',
      'Prepare diagrams, drawings, and presentations.',
      'Engage in community outreach and workshops.',
    ],
    qualifications: [
      'Masters degree in Architecture, Urban Design, or Planning.',
      'Strong graphic and communication skills.',
      'Passion for creating people-first cities.',
    ],
  },
];

const specialties = ['Architecture', 'Civil Engineering', 'BIM', 'Urban Planning', 'Landscape Architecture'];
const experienceLevels = ['Entry-Level', 'Mid-Level', 'Senior', 'Lead', 'Manager'];


const JobFilters = () => (
    <Card className="bg-background/70 backdrop-blur-sm border-border/50 sticky top-24">
        <CardHeader>
            <CardTitle className="text-xl text-foreground">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h4 className="font-semibold mb-2 text-foreground/80">Salary Range</h4>
                <Slider defaultValue={[50000]} max={200000} step={1000} className="text-primary"/>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$0</span>
                    <span>$200k+</span>
                </div>
            </div>
            <div>
                <h4 className="font-semibold mb-2 text-foreground/80">Location</h4>
                <Select>
                    <SelectTrigger className="w-full bg-background border-border/50">
                        <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="london">London, UK</SelectItem>
                        <SelectItem value="new-york">New York, NY</SelectItem>
                        <SelectItem value="chicago">Chicago, IL</SelectItem>
                        <SelectItem value="copenhagen">Copenhagen, DK</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <h4 className="font-semibold mb-2 text-foreground/80">Specialty</h4>
                <div className="space-y-2">
                    {specialties.map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={item.toLowerCase().replace(' ', '')} />
                            <label htmlFor={item.toLowerCase().replace(' ', '')} className="text-sm text-foreground/90">{item}</label>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h4 className="font-semibold mb-2 text-foreground/80">Experience Level</h4>
                <div className="space-y-2">
                    {experienceLevels.map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={item.toLowerCase().replace(' ', '')} />
                            <label htmlFor={item.toLowerCase().replace(' ', '')} className="text-sm text-foreground/90">{item}</label>
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
    </Card>
);

const JobCard = ({ job, isSelected, onClick }: { job: Job; isSelected: boolean; onClick: () => void; }) => (
    <motion.div
        layoutId={`job-card-${job.id}`}
        onClick={onClick}
        className={cn(
            "p-4 rounded-lg cursor-pointer transition-all duration-300 border-2",
            isSelected
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                : "border-transparent bg-background/50 hover:bg-primary/5"
        )}
    >
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-bold text-lg text-foreground">{job.title}</h3>
                <p className="text-sm text-muted-foreground">{job.company}</p>
                <p className="text-xs text-muted-foreground mt-1">{job.location}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Bookmark className="h-5 w-5" />
            </Button>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
            <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> ${job.salary.min / 1000}k - ${job.salary.max / 1000}k</span>
            <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.type}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-right">{job.posted}</p>
    </motion.div>
);

const JobDetails = ({ job, onClose }: { job: Job; onClose: () => void; }) => (
    <motion.div
        layoutId={`job-card-${job.id}`}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="sticky top-24 h-[calc(100vh-7rem)]"
    >
        <Card className="h-full overflow-y-auto bg-background/70 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-2xl text-foreground">{job.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">{job.company} - {job.location}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Share2 className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Bookmark className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-destructive"><X className="h-5 w-5" /></Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 text-foreground/90">
                <div>
                    <h4 className="font-semibold text-lg mb-2">Job Description</h4>
                    <p className="text-sm leading-relaxed">{job.description}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-lg mb-2">Responsibilities</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        {job.responsibilities.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold text-lg mb-2">Qualifications</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        {job.qualifications.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            </CardContent>
            <div className="p-6 sticky bottom-0 bg-background/70 backdrop-blur-sm border-t border-border/50 mt-auto">
                 <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Apply Now</Button>
            </div>
        </Card>
    </motion.div>
);

export default function JobsPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(jobs[0]);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black text-white min-h-screen">
      
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="container flex h-16 items-center">
              <Link href="/" className="flex items-center gap-2 mr-auto">
                <Logo />
                <span className="text-xl font-semibold font-headline">Sthāpati</span>
              </Link>
              <div className="hidden md:flex items-center gap-4">
                  <Button variant="ghost" asChild><Link href="/login">Login</Link></Button>
                  <Button asChild><Link href="/register">Get Started</Link></Button>
                  <Button variant="outline" size="icon"><Linkedin className="h-5 w-5"/></Button>
              </div>
          </div>
      </header>

      <main className="container mx-auto py-8">
        <motion.div initial={{opacity:0, y: -20}} animate={{opacity:1, y:0}} transition={{duration:0.5}}>
            <h1 className="text-4xl md:text-5xl font-bold text-center text-primary/90">Explore Job Opportunities</h1>
            <p className="text-lg md:text-xl text-center mt-2 text-muted-foreground">Your next career move in the AEC industry starts here.</p>
        </motion.div>
          
        <div className="grid lg:grid-cols-12 gap-8 mt-8">
          <div className="hidden lg:block lg:col-span-3">
              <JobFilters />
          </div>

          <div className="lg:col-span-4 h-[calc(100vh-7rem)] overflow-y-auto space-y-4 pr-2">
            {jobs.map(job => (
              <JobCard 
                key={job.id}
                job={job}
                isSelected={selectedJob?.id === job.id}
                onClick={() => setSelectedJob(job)}
              />
            ))}
          </div>
          
          <div className="hidden lg:block lg:col-span-5">
            <AnimatePresence>
                {selectedJob && <JobDetails job={selectedJob} onClose={() => setSelectedJob(null)} />}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
