'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { previousPosts as initialPosts, type CommunityPost } from '@/lib/community-posts-mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function CommunityPostsPage() {
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full"
    >
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">Community Posts</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <Card className="bg-gray-800/60 border-gray-700/50 shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Create a New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input 
                placeholder="Post Title" 
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="bg-gray-900/70 border-gray-700 focus:ring-blue-500"
              />
              <Input 
                placeholder="Tags (comma-separated)" 
                value={newPostTags}
                onChange={(e) => setNewPostTags(e.target.value)}
                className="bg-gray-900/70 border-gray-700 focus:ring-blue-500"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea 
                  placeholder="Write your post content in Markdown..." 
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="bg-gray-900/70 border-gray-700 focus:ring-blue-500 h-64 md:h-96"
                />
                <div className="prose prose-invert bg-gray-900/50 p-4 rounded-md border border-gray-700/50">
                  <ReactMarkdown>{newPostContent || 'Preview will appear here'}</ReactMarkdown>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                  <Button variant="outline">Save as Draft</Button>
                  <Button>Publish</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-gray-800/60 border-gray-700/50 shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Your Previous Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <p className="text-sm text-gray-400">No posts have been published yet.</p>
              ) : (
                <ul className="divide-y divide-gray-700/50">
                  {posts.map((post) => (
                    <li key={post.id} className="py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-white">{post.title}</h4>
                          <div className="text-sm text-gray-400">{post.date} - <Badge variant={post.status === 'Published' ? 'success' : 'secondary'}>{post.status}</Badge></div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="icon" variant="ghost" className="hover:text-blue-400"><Edit className="h-4 w-4"/></Button>
                          <Button size="icon" variant="ghost" className="hover:text-red-400"><Trash2 className="h-4 w-4"/></Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
