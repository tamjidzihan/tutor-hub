import React, { useState, useEffect } from 'react';
import { Users, FileCheck, Briefcase, HeartHandshake } from 'lucide-react';
import { contentApi } from '../../api/content';

export const Statistics: React.FC = () => {
  const [stats, setStats] = useState({
    registeredTutors: 0,
    liveTuitionJobs: 0,
    happyParents: 0,
    verifiedTeachers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await contentApi.getStats();
        if (data) {
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      }
    };
    fetchStats();
  }, []);

  const statItems = [
    {
      label: 'Registered Tutors',
      value: `${(stats.registeredTutors || 0).toLocaleString()}+`,
      subtitle: 'From BUET, DU, DMC, NSU & more',
      icon: <Users className="w-6 h-6 text-brand-600" />,
      bgColor: 'bg-brand-50',
      borderColor: 'border-brand-200'
    },
    {
      label: 'Verified Teachers',
      value: `${(stats.verifiedTeachers || 0).toLocaleString()}+`,
      subtitle: 'National ID & degree authenticated',
      icon: <FileCheck className="w-6 h-6 text-emerald-600" />,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      label: 'Live Tuition Jobs',
      value: `${(stats.liveTuitionJobs || 0).toLocaleString()}+`,
      subtitle: 'Active openings right now',
      icon: <Briefcase className="w-6 h-6 text-sky-600" />,
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200'
    },
    {
      label: 'Happy Guardians',
      value: `${(stats.happyParents || 0).toLocaleString()}+`,
      subtitle: 'Parents & students nationwide',
      icon: <HeartHandshake className="w-6 h-6 text-purple-600" />,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <section className="py-12 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${item.bgColor} border ${item.borderColor} flex items-center justify-center`}>
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-slate-400">Live API</span>
              </div>
              
              <h3 className="text-3xl font-black text-slate-900 tracking-tight font-heading mb-1">
                {item.value}
              </h3>
              <p className="text-sm font-bold text-slate-800 mb-0.5">
                {item.label}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
