"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Briefcase, BookOpen, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import type { IUser } from "@/types/user";

interface DashboardSidebarProps {
  user: IUser & { articleCount?: number };
  readOnly?: boolean;
}

export function DashboardSidebar({ user, readOnly = false }: DashboardSidebarProps) {
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isJobSeeker = ['Student', 'Trade Professional'].includes(user.category);

  const quickLinks = [
    { icon: Building2, label: "My Network", href: "/network" },
    { icon: Briefcase, label: isJobSeeker ? "Find Jobs" : "My Job Posts", href: "/jobs" },
    { icon: TrendingUp, label: "Analytics", href: "/analytics" },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg overflow-hidden transition-colors duration-300">
          <div className="h-24 relative overflow-hidden">
            {user.cover_image ? (
              <img
                src={user.cover_image}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-blue-600" />
            )}
          </div>
          <CardContent className="p-6 -mt-12">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-900 shadow-lg">
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{user.name}</h3>
              {user.headline && (
                <p className="text-xs text-slate-600 dark:text-gray-400 mt-1 max-w-[200px] leading-tight text-center">
                  {user.headline}
                </p>
              )}
              {user.location?.city && (
                <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 dark:text-gray-500">
                  <Building2 className="h-3 w-3" />
                  <span>{user.location.city}, {user.location.country}</span>
                </div>
              )}

              {user.bio && (
                <div className="mt-3 px-2 w-full">
                  <p className={`text-sm text-slate-600 dark:text-gray-400 transition-all duration-300 ${isBioExpanded ? "" : "line-clamp-3"}`}>
                    {user.bio}
                  </p>
                  {user.bio.length > 100 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs mt-1 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 p-0 hover:bg-transparent"
                      onClick={() => setIsBioExpanded(!isBioExpanded)}
                    >
                      {isBioExpanded ? (
                        <span className="flex items-center">Read less <ChevronUp className="ml-1 h-3 w-3" /></span>
                      ) : (
                        <span className="flex items-center">Read more <ChevronDown className="ml-1 h-3 w-3" /></span>
                      )}
                    </Button>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
                  {user.category}
                </Badge>
                {!readOnly && (
                  <Button variant="outline" size="sm" className="h-6 text-xs" asChild>
                    <a href="/dashboard/edit-profile">Edit</a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg transition-colors duration-300">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Connections */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-slate-600 dark:text-gray-300">Connections</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">0</span>
              </div>
              {/* Projects */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm text-slate-600 dark:text-gray-300">Projects</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{user.projects?.length || 0}</span>
              </div>
              {/* Articles */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  <span className="text-sm text-slate-600 dark:text-gray-300">Articles</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{user.articleCount || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg transition-colors duration-300">
          <CardContent className="p-6">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Quick Links</h4>
            <div className="space-y-2">
              {quickLinks.map((link, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className="w-full justify-start text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-800"
                  asChild
                >
                  <a href={link.href}>
                    <link.icon className="mr-3 h-4 w-4" />
                    {link.label}
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
