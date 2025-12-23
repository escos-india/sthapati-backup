'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Search, Mail, Phone, MessageSquare, Building, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

type Builder = {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  logo: string;
  location: string;
};

const builders: Builder[] = [
  {
    id: 1,
    name: 'Apex Constructions',
    specialty: 'Residential & Commercial',
    rating: 5,
    logo: '/images/1.png',
    location: 'New York, NY',
  },
  {
    id: 2,
    name: 'BuildRight Developers',
    specialty: 'Modern Homes',
    rating: 4,
    logo: '/images/2.png',
    location: 'Los Angeles, CA',
  },
  {
    id: 3,
    name: 'Coastal Builders',
    specialty: 'Coastal Properties',
    rating: 5,
    logo: '/images/3.png',
    location: 'Miami, FL',
  },
  {
    id: 4,
    name: 'Urban Structures',
    specialty: 'High-Rise Buildings',
    rating: 4,
    logo: '/images/4.png',
    location: 'Chicago, IL',
  },
  {
    id: 5,
    name: 'Greenwood Homes',
    specialty: 'Eco-Friendly Housing',
    rating: 5,
    logo: '/images/5.png',
    location: 'Austin, TX',
  },
  {
    id: 6,
    name: 'Stone & Steel Inc.',
    specialty: 'Industrial Construction',
    rating: 4,
    logo: '/images/6.png',
    location: 'Houston, TX',
  },
];

const BuilderCard = ({ builder }: { builder: Builder }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative rounded-lg overflow-hidden shadow-lg"
      style={{ background: 'hsl(var(--card))' }}
      whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
    >
      <Card className="h-full flex flex-col text-white" style={{ background: 'transparent' }}>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center h-48">
          <AnimatePresence>
            {!isHovered ? (
              <motion.div
                key="default"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center"
              >
                <h3 className="text-xl font-bold">{builder.name}</h3>
                <p className="text-sm text-gray-400">{builder.specialty}</p>
                <div className="flex items-center mt-2">
                  {[...Array(builder.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" />
                  ))}
                  {[...Array(5 - builder.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-gray-600" />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="hover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center"
              >
                <Image src={builder.logo} alt={`${builder.name} logo`} width={64} height={64} className="rounded-full mb-2" />
                <p className="text-sm flex items-center"><MapPin className="h-4 w-4 mr-1" /> {builder.location}</p>
                <div className="flex mt-4 space-x-2">
                  <Button variant="outline" size="icon" className="text-white border-blue-400 hover:bg-blue-400"><Mail className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="text-white border-blue-400 hover:bg-blue-400"><Phone className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="text-white border-blue-400 hover:bg-blue-400"><MessageSquare className="h-4 w-4" /></Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function BuildersPage() {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center text-blue-400">Find Your Perfect Builder</h1>
          <p className="text-lg md:text-xl text-center mt-2 text-gray-300">Connect with top-rated builders in the industry.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="my-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name, specialty, or location..."
              className="pl-10 pr-4 py-2 w-full bg-gray-800 border-gray-700 rounded-full focus:ring-blue-400 focus:border-blue-400"
            />
          </div>
          <Select>
            <SelectTrigger className="w-full sm:w-48 bg-gray-800 border-gray-700 rounded-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white border-gray-700">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="modern">Modern Homes</SelectItem>
              <SelectItem value="coastal">Coastal Properties</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {builders.map((builder) => (
            <BuilderCard key={builder.id} builder={builder} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
