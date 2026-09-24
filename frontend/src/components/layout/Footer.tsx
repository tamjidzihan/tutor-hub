import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-[#07131f] pt-16 pb-12 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">

          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-white font-heading">
                  Tutor<span className="text-brand-400">Hub</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tuition Terminal Bangladesh
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed pr-6">
              TutorHub (Tuition Terminal) is Bangladesh's premier full-stack tutor matching and learning platform. Connecting parents, students, and institutions with verified, qualified tutors from BUET, Medical Colleges, DU, IBA, and leading universities.
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-brand-400 font-semibold bg-brand-950/80 px-3 py-1.5 rounded-lg border border-brand-800">
                <ShieldCheck className="w-4 h-4" />
                Govt. Registered & Trade Licensed Platform
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-brand-500 pl-2">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/find-tutor" className="hover:text-brand-400 transition-colors">Find a Tutor</Link>
              </li>
              <li>
                <Link to="/job-board" className="hover:text-brand-400 transition-colors">Tuition Job Board</Link>
              </li>
              <li>
                <Link to="/appoint-a-tutor" className="hover:text-brand-400 transition-colors">Appoint A Tutor</Link>
              </li>
              <li>
                <Link to="/become-a-tutor" className="hover:text-brand-400 transition-colors">Become A Tutor</Link>
              </li>
              <li>
                <Link to="/affiliate-program" className="hover:text-brand-400 transition-colors">Affiliate Partner</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-brand-500 pl-2">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/our-team" className="hover:text-brand-400 transition-colors">Our Team</Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-brand-400 transition-colors">Careers / Jobs</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-brand-400 transition-colors">Educational Blog</Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-brand-400 transition-colors">Event Gallery</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-brand-400 transition-colors">FAQs & Help</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-brand-400 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-brand-400 transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Office */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-brand-500 pl-2">
              Head Office
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-1" />
                <span>Level 4, House 12, Road 2, Sector 10, Mirpur DOHS, Dhaka-1216, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span className="text-white font-medium">+880 1894-800900</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>support@tutorhub.com.bd</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Sat – Thu (9:00 AM – 10:00 PM)</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar & Payment Gateways */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <p>© {currentYear} <strong>TutorHub (Tuition Terminal)</strong>. All rights reserved. Registered under Bangladesh ICT Act.</p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-slate-400 font-medium">Secured Payments:</span>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-navy-900 text-pink-400 font-bold rounded border border-slate-700">bKash</span>
              <span className="px-2 py-1 bg-navy-900 text-orange-400 font-bold rounded border border-slate-700">Nagad</span>
              <span className="px-2 py-1 bg-navy-900 text-purple-400 font-bold rounded border border-slate-700">Rocket</span>
              <span className="px-2 py-1 bg-navy-900 text-sky-400 font-bold rounded border border-slate-700">Visa / MC</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
