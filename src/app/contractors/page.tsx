'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Search, Mail, Phone, MessageSquare, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

type Contractor = {
  id: number;
  name: string;
  service: string;
  rating: number;
  logo: string;
  location: string;
};

const contractors: Contractor[] = [
  {
    id: 1,
    name: 'Precision Electrical',
    service: 'Electrical Contractor',
    rating: 5,
    logo: '/images/7.png',
    location: 'New York, NY',
  },
  {
    id: 2,
    name: 'FlowRight Plumbing',
    service: 'Plumbing Contractor',
    rating: 4,
    logo: '/images/8.png',
    location: 'Los Angeles, CA',
  },
  {
    id: 3,
    name: 'Climate Control HVAC',
    service: 'HVAC Contractor',
    rating: 5,
    logo: '/images/9.png',
    location: 'Miami, FL',
  },
  {
    id: 4,
    name: 'SureFoundation',
    service: 'Concrete Contractor',
    rating: 4,
    logo: '/images/10.png',
    location: 'Chicago, IL',
  },
  {
    id: 5,
    name: 'PaintPerfect',
    service: 'Painting Contractor',
    rating: 5,
    logo: '/images/11.png',
    location: 'Austin, TX',
  },
  {
    id: 6,
    name: 'Apex Roofing',
    service: 'Roofing Contractor',
    rating: 4,
    logo: '/images/12.png',
    location: 'Houston, TX',
  },
];

const ContractorCard = ({ contractor }: { contractor: Contractor }) => {
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
                <h3 className="text-xl font-bold">{contractor.name}</h3>
                <p className="text-sm text-gray-400">{contractor.service}</p>
                <div className="flex items-center mt-2">
                  {[...Array(contractor.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" />
                  ))}
                  {[...Array(5 - contractor.rating)].map((_, i) => (
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
                <Image src={contractor.logo} alt={`${contractor.name} logo`} width={64} height={64} className="rounded-full mb-2" />
                 <h3 className="text-xl font-bold">{contractor.name}</h3>
                <p className="text-sm text-gray-400">{contractor.service}</p>
                <p className="text-sm flex items-center mt-2"><MapPin className="h-4 w-4 mr-1" /> {contractor.location}</p>
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

export default function ContractorsPage() {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center text-blue-400">Hire Expert Contractors</h1>
          <p className="text-lg md:text-xl text-center mt-2 text-gray-300">Find reliable contractors for every phase of your project.</p>
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
              placeholder="Search by name, service, or location..."
              className="pl-10 pr-4 py-2 w-full bg-gray-800 border-gray-700 rounded-full focus:ring-blue-400 focus:border-blue-400"
            />
          </div>
          <Select>
            <SelectTrigger className="w-full sm:w-48 bg-gray-800 border-gray-700 rounded-full">
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white border-gray-700">
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="hvac">HVAC</SelectItem>
              <SelectItem value="concrete">Concrete</SelectItem>
              <SelectItem value="painting">Painting</SelectItem>
              <SelectItem value="roofing">Roofing</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {contractors.map((contractor) => (
            <ContractorCard key={contractor.id} contractor={contractor} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
