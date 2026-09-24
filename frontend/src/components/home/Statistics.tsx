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
    <section className="border-b border-slate-200/80 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statItems.map((item, idx) => (
            <div
              key={idx}
              className="group rounded-[1.6rem] border border-slate-200/90 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bgColor} border ${item.borderColor}`}>
                  {item.icon}
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Live API
                </span>
              </div>

              <h3 className="mb-2 font-heading text-3xl font-black tracking-[-0.04em] text-slate-900">
                {item.value}
              </h3>
              <p className="mb-1 text-sm font-bold text-slate-800">
                {item.label}
              </p>
              <p className="text-xs font-medium text-slate-500">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
