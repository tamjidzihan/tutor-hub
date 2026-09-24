import React, { useState, useEffect } from 'react';
import { contentApi } from '../api/content';
import type { GalleryItem } from '../types';
import { Image, Calendar } from 'lucide-react';
import { LoadingSkeleton } from '../components/common/FeedbackStates';

export const Gallery: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', 'Campus Drives', 'Conferences', 'Workshops', 'Awards'];

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await contentApi.getGallery();
        setGallery(data);
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const filtered = selectedCategory === 'All'
    ? gallery
    : gallery.filter((item: GalleryItem) => item.category === selectedCategory);

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
            <Image className="w-3.5 h-3.5" />
            Moments & Milestones
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading tracking-tight">
            TutorHub Events & Recognition Gallery
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Highlights from our national workshops, annual tutor excellence awards, and community education initiatives.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <LoadingSkeleton count={4} type="card" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map((item: GalleryItem) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover overflow-hidden transition-all duration-300 group"
              >
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-navy-950/80 backdrop-blur-md text-white text-xs font-bold">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
