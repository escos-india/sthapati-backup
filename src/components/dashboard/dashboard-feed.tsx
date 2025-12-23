"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Video,
  FileText,
  Send,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ThumbsUp,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import type { IUser } from "@/types/user";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardFeedProps {
  user: IUser;
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

export function DashboardFeed({ user }: DashboardFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
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

        // Use the existing upload API or a new one. Assuming /api/upload handles generic files.
        // If not, we might need to adjust. Let's try /api/upload first as it was used in ImageUpload.
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
      // In a real app, call API to delete. For now, optimistically update UI.
      // We need a DELETE endpoint.
      // await fetch(`/api/posts/${postId}`, { method: 'DELETE' });

      // Since we don't have a DELETE endpoint yet, let's just filter it out locally 
      // AND assuming we'd add the endpoint. 
      // But user asked for "Provide options to delete or modify". 
      // I should probably add the DELETE endpoint or at least simulate it.
      // Let's stick to UI for now as per "implement... exactly".
      // Wait, "implement... exactly" implies full functionality.
      // I'll add the DELETE endpoint in next step.

      const response = await fetch(`/api/posts?id=${postId}`, { method: "DELETE" });
      if (response.ok) {
        setPosts(posts.filter(p => p._id !== postId));
        toast.success("Post deleted");
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

      {/* Create Post Card */}
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
                  placeholder="Share an update, article, or project..."
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
                      Photo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileSelect("video")}
                      className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-800"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Video
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-800">
                      <FileText className="mr-2 h-4 w-4" />
                      Article
                    </Button>
                  </div>
                  <Button
                    onClick={handlePost}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 border-0"
                    disabled={(!newPost.trim() && !selectedFile) || isPosting}
                  >
                    {isPosting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Projects Section */}
      {user.projects && user.projects.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white px-1">My Projects</h3>
          {user.projects.map((project, idx) => (
            <motion.div
              key={project._id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg overflow-hidden transition-colors duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.image || undefined} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{project.title}</h4>
                        <p className="text-sm text-slate-500 dark:text-gray-400">
                          {project.role} · {project.location} · {project.year}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">
                        Project
                      </Badge>
                      {/* Only show actions if it's the logged-in user's project */}
                      {/* Since this is "My Projects" section, it's always the user's project */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-700 dark:text-gray-300 leading-relaxed">{project.description}</p>

                  {/* Project Media Gallery */}
                  {project.media && project.media.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 rounded-2xl overflow-hidden">
                      {project.media.map((media, mIdx) => (
                        <div key={mIdx} className="relative w-full h-64 bg-slate-100 dark:bg-gray-800">
                          {media.type === 'video' ? (
                            <video src={media.url} controls className="w-full h-full object-cover" />
                          ) : (
                            <img src={media.url} alt={project.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.tags?.map((tag, tIdx) => (
                      <span key={tIdx} className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <div className="border-b border-slate-200 dark:border-gray-800 my-4"></div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post, idx) => (
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

                  {/* Delete/Edit Options - Only for Owner */}
                  {user._id === post.author._id && (
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
        ))}
      </div>
    </div>
  );
}

