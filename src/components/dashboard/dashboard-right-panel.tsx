"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, TrendingUp, Briefcase, Building2, Users, FileText } from "lucide-react";
import type { IUser } from "@/types/user";

interface DashboardRightPanelProps {
  user: IUser;
}

interface SimplePost {
  _id: string;
  content: string;
  author: {
    name: string;
  };
}

const suggestedConnections: { name: string; title: string; category: string; mutual: number }[] = [];

const jobSuggestions: { title: string; company: string; location: string; type: string }[] = [];

export function DashboardRightPanel({ user }: DashboardRightPanelProps) {
  const [recentPosts, setRecentPosts] = useState<SimplePost[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts");
        if (response.ok) {
          const data = await response.json();
          // Take only the first 5 posts
          setRecentPosts(data.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch posts for articles section", error);
      }
    };

    fetchPosts();
  }, []);
  return (
    <div className="space-y-6">
      {/* Suggested Connections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">People you may know</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestedConnections.map((person, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-sm">
                      {person.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{person.name}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      {person.title} · {person.mutual} mutual
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs border-slate-200 dark:border-gray-700 text-slate-900 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-800">
                  <UserPlus className="mr-1 h-3 w-3" />
                  Connect
                </Button>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/30">
              See all suggestions
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
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Articles</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPosts.length > 0 ? (
              recentPosts.map((post, idx) => (
                <div key={idx} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-gray-200 line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {post.content}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-gray-400">
                      {post.author.name}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-gray-800 text-slate-900 dark:text-gray-300">
                    Read
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-gray-400">No articles yet.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Job Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg transition-colors duration-300">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Job suggestions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobSuggestions.map((job, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{job.title}</h4>
                <p className="text-xs text-slate-600 dark:text-gray-400">{job.company} · {job.location}</p>
                <Badge variant="outline" className="text-xs border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400">
                  {job.type}
                </Badge>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/30">
              See all jobs
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Network Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 backdrop-blur-xl shadow-lg transition-colors duration-300">
          <CardContent className="p-6 text-center">
            <Building2 className="h-12 w-12 text-cyan-600 dark:text-cyan-500 mx-auto mb-4" />
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Grow your network</h4>
            <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
              Connect with professionals in your industry
            </p>
            <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 border-0">
              <Users className="mr-2 h-4 w-4" />
              Explore Network
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

