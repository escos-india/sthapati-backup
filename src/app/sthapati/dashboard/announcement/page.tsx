'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import initialAnnouncements from '@/lib/announcements-mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, EyeOff, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Define the type for an announcement
// Define the type for an announcement (matching DB)
interface Announcement {
  _id: string;
  title: string;
  message: string;
  isActive: boolean;
  createdAt: string;
}

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
import { toast } from 'sonner';

// ... imports

const announcementSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(5, { message: "Message must be at least 5 characters." }),
});

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error("Failed to fetch announcements", error);
    }
  };

  const form = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof announcementSchema>, status: 'Published' | 'Draft') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          message: values.content,
          isActive: status === 'Published'
        })
      });

      if (res.ok) {
        toast.success(status === 'Published' ? 'Announcement published!' : 'Draft saved!');
        form.reset();
        fetchAnnouncements(); // Refresh list
      } else {
        toast.error('Failed to save announcement');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error saving announcement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Announcement deleted");
        setAnnouncements(prev => prev.filter(a => a._id !== id));
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      toast.error("Error deleting");
    }
  };

  const watchedContent = form.watch("content");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full"
    >
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">Announcement</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <Card className="bg-gray-800/60 border-gray-700/50 shadow-lg rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">Create a New Announcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Announcement Title (Internal Reference)"
                            className="bg-gray-900/70 border-gray-700 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormControl>
                            <Textarea
                              placeholder="Write your announcement message..."
                              className="bg-gray-900/70 border-gray-700 focus:ring-blue-500 h-64 md:h-80 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="prose prose-invert bg-gray-900/50 p-4 rounded-md border border-gray-700/50 h-64 md:h-80 overflow-y-auto">
                      <ReactMarkdown>{watchedContent || 'Preview will appear here'}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4">
                    {/* Draft button functionality can be refined if needed, currently treats as active=false (if api supported it, currently set to Draft=false) */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={form.handleSubmit((data) => onSubmit(data, 'Draft'))}
                      disabled={isLoading}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      type="button"
                      onClick={form.handleSubmit((data) => onSubmit(data, 'Published'))}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Publish'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>


        <div>
          <Card className="bg-gray-800/60 border-gray-700/50 shadow-lg rounded-lg h-full max-h-[800px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Previous Announcements</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-2 space-y-4">
              {announcements.length > 0 ? (
                announcements.map((a) => (
                  <div key={a._id} className="p-4 rounded-lg bg-gray-900/50 border border-gray-700/30 space-y-2 group">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-200">{a.title || 'Untitled'}</h4>
                      <Badge variant={a.isActive ? "default" : "secondary"} className={a.isActive ? "bg-green-900 text-green-300" : ""}>
                        {a.isActive ? "Active" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{a.message}</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={() => handleDelete(a._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No announcements found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
