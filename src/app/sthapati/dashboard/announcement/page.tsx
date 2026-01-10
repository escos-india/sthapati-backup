'use client';

import { useState, useMemo } from 'react';
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
interface Announcement {
  id: string;
  title: string;
  date: string;
  status: 'Published' | 'Draft';
  content: string;
}

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const isEditing = editingId !== null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', content: '' });
  };

  const handleSubmit = (status: 'Published' | 'Draft') => {
    if (!formData.title || !formData.content) {
      alert('Title and content cannot be empty.');
      return;
    }

    if (isEditing) {
      setAnnouncements(announcements.map(announcement =>
        announcement.id === editingId
          ? { ...announcement, ...formData, status, date: new Date().toISOString().split('T')[0] }
          : announcement
      ));
    } else {
      // Use a more robust unique ID generation method
      const newAnnouncement: Announcement = {
        id: `announcement-${Date.now()}`,
        ...formData,
        status,
        date: new Date().toISOString().split('T')[0],
      };
      setAnnouncements([newAnnouncement, ...announcements]);
    }
    resetForm();
  };

  const handleEdit = (id: string) => {
    const announcementToEdit = announcements.find(a => a.id === id);
    if (announcementToEdit) {
      setEditingId(id);
      setFormData({ title: announcementToEdit.title, content: announcementToEdit.content });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(announcements.filter(a => a.id !== id));
      if(editingId === id) {
        resetForm();
      }
    }
  };

  const handleToggleStatus = (id: string) => {
    setAnnouncements(announcements.map(announcement =>
      announcement.id === id
        ? { ...announcement, status: announcement.status === 'Published' ? 'Draft' : 'Published' }
        : announcement
    ));
  };

  const sortedAnnouncements = useMemo(() => {
      return [...announcements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [announcements]);

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
              <CardTitle className="text-xl font-bold">{isEditing ? 'Edit Announcement' : 'Create a New Announcement'}</CardTitle>
              {isEditing && <Button variant="ghost" size="icon" onClick={resetForm}><X className="h-4 w-4" /></Button>}
            </CardHeader>
            <CardContent className="space-y-6">
              <Input 
                name="title"
                placeholder="Announcement Title"
                value={formData.title}
                onChange={handleInputChange}
                className="bg-gray-900/70 border-gray-700 focus:ring-blue-500"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea 
                  name="content"
                  placeholder="Write your announcement content in Markdown..."
                  value={formData.content}
                  onChange={handleInputChange}
                  className="bg-gray-900/70 border-gray-700 focus:ring-blue-500 h-64 md:h-80"
                />
                <div className="prose prose-invert bg-gray-900/50 p-4 rounded-md border border-gray-700/50 h-64 md:h-80 overflow-y-auto">
                  <ReactMarkdown>{formData.content || 'Preview will appear here'}</ReactMarkdown>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => handleSubmit('Draft')}>Save as Draft</Button>
                  <Button onClick={() => handleSubmit('Published')}>{isEditing ? 'Update Announcement' : 'Publish'}</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-gray-800/60 border-gray-700/50 shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Previous Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedAnnouncements.length === 0 ? (
                <p className="text-gray-400 text-sm">No announcements yet. Create one to get started.</p>
              ) : (
                <ul className="divide-y divide-gray-700/50">
                  {sortedAnnouncements.map((announcement) => (
                    <li key={announcement.id} className="py-4">
                      <div className="flex justify-between items-start">
                        <div className='flex-1 pr-4'>
                          <h4 className="font-semibold text-white break-words">{announcement.title}</h4>
                          <div className="text-sm text-gray-400">{announcement.date} - <Badge variant={announcement.status === 'Published' ? 'success' : 'secondary'}>{announcement.status}</Badge></div>
                        </div>
                        <div className="flex space-x-1">
                          <Button size="icon" variant="ghost" className="hover:text-blue-400 shrink-0" onClick={() => handleEdit(announcement.id)}><Edit className="h-4 w-4"/></Button>
                          <Button size="icon" variant="ghost" className={`shrink-0 ${announcement.status === 'Published' ? 'hover:text-yellow-400' : 'hover:text-green-400'}`} onClick={() => handleToggleStatus(announcement.id)}>
                            {announcement.status === 'Published' ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                          </Button>
                          <Button size="icon" variant="ghost" className="hover:text-red-400 shrink-0" onClick={() => handleDelete(announcement.id)}><Trash2 className="h-4 w-4"/></Button>
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
