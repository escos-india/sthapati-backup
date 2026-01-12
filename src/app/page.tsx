"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommunityUpdates } from '@/components/landing/community-updates';
import { HeroSection } from '@/components/landing/hero-section';

// 1. URLs for the 5 background images.
const images = [
  "https://i.ibb.co/XZq70JY0/1.jpg",
  "https://i.ibb.co/cSZYdbhq/2.jpg",
  "https://i.ibb.co/PsHwQx8S/3.jpg",
  "https://i.ibb.co/q3svyY5y/4.jpg",
  "https://i.ibb.co/qMN1rPT2/5.jpg"
];

export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);

  // 2. Slideshow timing logic: Cycle every 6 seconds.
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 6000); // 6-second interval for each image
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative">
      <HeroSection />
      
      {/* 
        This div container holds the animated background and its overlay.
        It's positioned absolutely to sit behind the content of the page.
      */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <AnimatePresence>
          <motion.div
            key={currentImage}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }} // 1.5-second crossfade
          >
            {images[currentImage] && (
              <img
                src={images[currentImage]}
                // No alt text as requested, to prevent fallback text on load failure.
                // The role is set to presentation as it is purely decorative.
                role="presentation"
                // The image is styled to cover the entire container.
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
        {/* 
          3. Semi-transparent black overlay for text readability.
          Opacity is set to 40% (0.4).
        */}
        <div 
          className="absolute inset-0 z-10" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        ></div>
      </div>
      
      {/* 
        The CommunityUpdates section is placed outside the relative positioning
        of the hero section's background, so it will have the default page background.
      */}
      <div className="bg-transparent">
        <CommunityUpdates />
      </div>
    </div>
  );
}
