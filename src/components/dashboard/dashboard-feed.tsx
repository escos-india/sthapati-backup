"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Image as ImageIcon,
  Send,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ThumbsUp,
  Loader2,
  Trash2,
  X,
  Package,
  GraduationCap,
  FileText,
  User,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { IUser } from "@/types/user";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface DashboardFeedProps {
  user: IUser;
  readOnly?: boolean;
}

interface Post {
  _id: string;
  author: {
    _id: string;
    name: string;
    image?: string;
    category: string;
    headline?: string;
  };
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  liked?: boolean;
}

export function DashboardFeed({ user, readOnly = false }: DashboardFeedProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [openToWork, setOpenToWork] = useState(user.isOpenToWork || false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null); // State for selected project view

  const handleStatusUpdate = async (checked: boolean) => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch('/api/user/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpenToWork: checked })
      });

      if (response.ok) {
        setOpenToWork(checked);
        toast.success(checked ? "You are now Open to Work!" : "Status updated");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const [isPosting, setIsPosting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
  }, [user._id, readOnly]);

  const fetchPosts = async () => {
    try {
      // In read-only mode, fetch only the user's posts
      const url = readOnly ? `/api/posts?userId=${user._id}` : "/api/posts";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (type: "image" | "video") => {
    setFileType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === "image" ? "image/*" : "video/*";
      fileInputRef.current.click();
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePost = async () => {
    if (!newPost.trim() && !selectedFile) return;

    setIsPosting(true);
    try {
      let mediaUrl = "";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const data = await uploadResponse.json();
          mediaUrl = data.url;
        } else {
          throw new Error("Failed to upload media");
        }
      }

      const postData: any = { content: newPost };
      if (fileType === "image") postData.image = mediaUrl;
      if (fileType === "video") postData.video = mediaUrl;

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const post = await response.json();
        setPosts([post, ...posts]);
        setNewPost("");
        clearFile();
        toast.success("Post created successfully!");
        // Refresh page to update article count
        router.refresh();
      } else {
        toast.error("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Something went wrong");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts?id=${postId}`, { method: "DELETE" });
      if (response.ok) {
        setPosts(posts.filter(p => p._id !== postId));
        toast.success("Post deleted");
        // Refresh page to update article count
        router.refresh();
      } else {
        toast.error("Failed to delete post");
      }
    } catch (error) {
      toast.error("Error deleting post");
    }
  };

  const toggleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post._id === postId
          ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={onFileChange}
      />

      {/* Project Details Modal */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-2xl font-bold">{selectedProject?.title}</DialogTitle>
            {selectedProject?.role && (
              <p className="text-sm text-muted-foreground font-medium">{selectedProject.role}</p>
            )}
          </DialogHeader>

          <div className="space-y-6 mt-4 text-center">
            {/* Project Media */}
            {selectedProject?.media && selectedProject.media.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4">
                {selectedProject.media.map((media: any, i: number) => (
                  <div key={i} className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full md:w-[45%] h-64">
                    <img
                      src={media.url}
                      alt={`${selectedProject.title} - ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">About this project</h4>
              <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-gray-300">
                {selectedProject?.description}
              </p>
            </div>

            {/* Tools */}
            {selectedProject?.tools && selectedProject.tools.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Tools Used</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedProject.tools.map((tool: string, i: number) => (
                    <Badge key={i} variant="secondary" className="px-3 py-1">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Status Widget (Open to Work) */}
      {user.category === 'Student' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Job Seeker Status</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Keep your profile visible to recruiters.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="open-work" className="font-medium cursor-pointer text-slate-700 dark:text-gray-200">Open to Work</Label>
                  <Switch
                    id="open-work"
                    checked={openToWork}
                    onCheckedChange={handleStatusUpdate}
                    disabled={isUpdatingStatus}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Student Specialization Section */}
      {user.category === 'Student' && user.specialization && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Specialization</h3>
                  <p className="text-slate-600 dark:text-gray-400">{user.specialization}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Student Resume Section */}
      {user.category === 'Student' && user.resume && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Professional Resume</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400">PDF Document • Ready for applications</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="rounded-xl border-pink-200 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30 text-pink-600 dark:text-pink-400"
                  asChild
                >
                  <a href={user.resume} target="_blank" rel="noopener noreferrer">
                    View Resume
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* My Projects Section */}
      {user.projects && user.projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My Projects</h3>
            <Button variant="ghost" size="sm" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300">
              View All
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {user.projects.map((project: any, idx: number) => (
              <Card
                key={idx}
                className="min-w-[280px] rounded-2xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedProject(project)}
              >
                <div className="relative h-40 w-full overflow-hidden rounded-t-2xl">
                  {project.media && project.media[0] ? (
                    <img src={project.media[0].url} alt={project.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="h-full w-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-slate-300 dark:text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white truncate">{project.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{project.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
      {/* My Materials Section (For Material Suppliers) */}
      {user.category === 'Material Supplier' && user.materials && user.materials.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My Materials</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
              onClick={() => router.push(readOnly ? `/profile/${user._id}/catalog` : '/dashboard/catalog')}
            >
              View Catalog
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {user.materials.map((material: any, idx: number) => (
              <Card
                key={idx}
                className="min-w-[280px] rounded-2xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                onClick={() => router.push(readOnly ? `/profile/${user._id}/catalog/${material._id}` : `/dashboard/catalog/${material._id}`)}
              >
                <div className="relative h-40 w-full overflow-hidden rounded-t-2xl">
                  {material.photos && material.photos[0] ? (
                    <img src={material.photos[0].url} alt={material.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="h-full w-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                      <Package className="h-8 w-8 text-slate-300 dark:text-gray-600" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-orange-500 text-white border-0 shadow-sm">
                      {material.price}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white truncate">{material.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{material.type}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Create Post Card */}
      {!readOnly && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg transition-colors duration-300">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.image || undefined} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <Textarea
                    placeholder="Share an article or update..."
                    className="min-h-[100px] resize-none border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                  />

                  {previewUrl && (
                    <div className="relative rounded-lg overflow-hidden bg-slate-100 dark:bg-gray-800 max-h-64">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full"
                        onClick={clearFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {fileType === "video" ? (
                        <video src={previewUrl} controls className="w-full h-full object-contain" />
                      ) : (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileSelect("image")}
                        className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-800"
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Add Image
                      </Button>
                    </div>
                    <Button
                      onClick={handlePost}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 border-0"
                      disabled={(!newPost.trim() && !selectedFile) || isPosting}
                    >
                      {isPosting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      Post Article
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post, idx) => {
          if (!post.author) return null;
          return (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg overflow-hidden transition-colors duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={post.author.image} alt={post.author.name} />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                          {post.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{post.author.name}</h4>
                        <p className="text-sm text-slate-500 dark:text-gray-400">
                          {post.author.headline || post.author.category} · {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Delete/Edit Options - Only for Owner or Admin */}
                    {!readOnly && (user._id === post.author._id || user.isAdmin || user.category === 'Admin') && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                            onClick={() => handleDeletePost(post._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                  {/* Attached Media */}
                  {post.image && (
                    <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-gray-800">
                      <img src={post.image} alt="Post attachment" className="w-full h-auto max-h-[500px] object-contain" />
                    </div>
                  )}
                  {post.video && (
                    <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-gray-800">
                      <video src={post.video} controls className="w-full h-auto max-h-[500px] object-contain" />
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-gray-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex-1 ${post.liked ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-800"}`}
                      onClick={() => toggleLike(post._id)}
                    >
                      <ThumbsUp className={`mr-2 h-4 w-4 ${post.liked ? "fill-current" : ""}`} />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-800">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-800">
                      <Share2 className="mr-2 h-4 w-4" />
                      {post.shares}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

import { useRef } from "react";
