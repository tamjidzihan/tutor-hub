import React, { useState, useEffect } from 'react';
import { contentApi } from '../api/content';
import type { TeamMember } from '../types';
import { Users, Mail, GraduationCap, Globe } from 'lucide-react';
import { LoadingSkeleton } from '../components/common/FeedbackStates';

export const OurTeam: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await contentApi.getTeam();
        setTeam(data);
      } catch (err) {
        console.error('Failed to load team data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            Leadership & Vision
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading tracking-tight">
            Meet the Team Behind TutorHub
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            We are a group of BUET, Dhaka Medical, DU, and IBA alumni on a mission to modernize personalized education and tutor matching across Bangladesh.
          </p>
        </div>

        {/* Team Grid */}
        {loading ? (
          <LoadingSkeleton count={3} type="card" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover overflow-hidden transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="h-64 overflow-hidden bg-slate-100">
                    <img
                      src={member.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6 space-y-2">
                    <div className="flex items-center gap-1 text-xs font-bold text-brand-700">
                      <GraduationCap className="w-4 h-4" />
                      <span>BUET / DU Advisory Member</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{member.role}</p>
                    <p className="text-xs text-slate-600 leading-relaxed pt-2">{member.bio}</p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center gap-3">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:text-white hover:bg-brand-600 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  <a
                    href="mailto:contact@tutorhub.com.bd"
                    className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:text-white hover:bg-brand-600 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
