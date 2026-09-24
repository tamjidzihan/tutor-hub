export type UserRole = 'ADMIN' | 'TUTOR' | 'STUDENT' | 'PARENT' | 'STAFF';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: UserRole;
  profile_image?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface TutorEducation {
  id: string;
  degree: string;
  institution: string;
  department: string;
  passing_year: number | string;
  result: string;
  is_current?: boolean;
}

export interface TutorExperience {
  id: string;
  organization: string;
  position: string;
  description: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
}

export interface TutorReview {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Tutor {
  id: string;
  tutor_id: string; // e.g. "TT-T-000842"
  user_id?: string;
  name: string;
  profile_photo: string;
  gender: 'MALE' | 'FEMALE';
  bio: string;
  present_address: string;
  city: string;
  area: string;
  education_level: string;
  university: string;
  department: string;
  graduation_year: number;
  experience_years: number;
  expected_salary: number;
  preferred_salary_range?: string;
  is_verified: boolean;
  is_available: boolean;
  profile_completion: number;
  rating: number;
  total_reviews: number;
  subjects: string[];
  preferred_classes: string[];
  preferred_locations: string[];
  preferred_tuition_type: ('Home Tutoring' | 'Online' | 'Batch' | 'Crash Course')[];
  education: TutorEducation[];
  experience: TutorExperience[];
  reviews?: TutorReview[];
  member_since: string;
}

export type JobStatus = 'PUBLISHED' | 'DRAFT' | 'CLOSED' | 'CANCELLED';

export interface TuitionJob {
  id: string;
  job_id: string; // e.g. "TT-J-004521"
  title: string;
  description: string;
  student_gender?: 'Male' | 'Female' | 'Any';
  class_level: string;
  curriculum: 'Bangla Medium' | 'English Version' | 'English Medium' | 'Edexcel' | 'Cambridge' | 'Admission Prep';
  subjects: string[];
  city: string;
  area: string;
  location_detail?: string;
  tuition_type: 'Home Tutoring' | 'Online Tutoring' | 'Group/Batch' | 'Crash Course';
  preferred_tutor_gender: 'Male' | 'Female' | 'Any';
  days_per_week: number;
  preferred_days?: string[];
  preferred_time?: string;
  salary: number;
  salary_negotiable?: boolean;
  additional_requirements?: string;
  status: JobStatus;
  posted_at: string;
  deadline?: string;
  applicants_count: number;
  posted_by_name?: string;
}

export type ApplicationStatus = 'PENDING' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN';

export interface JobApplication {
  id: string;
  application_id: string; // e.g. "APP-8291"
  job_id: string;
  job_title: string;
  job_reference: string;
  tutor_id: string;
  tutor_name: string;
  tutor_university: string;
  tutor_department: string;
  tutor_photo?: string;
  cover_message: string;
  expected_salary: number;
  status: ApplicationStatus;
  applied_at: string;
  admin_note?: string;
}

export type RequirementStatus = 'SUBMITTED' | 'MATCHING' | 'SHORTLISTED' | 'TUTOR_SELECTED' | 'CLOSED';

export interface TutorRequirement {
  id: string;
  requirement_id: string; // e.g. "REQ-1092"
  user_id?: string;
  parent_name: string;
  phone: string;
  email: string;
  student_name: string;
  student_gender: 'Male' | 'Female';
  class_level: string;
  curriculum: string;
  subjects: string[];
  city: string;
  area: string;
  address?: string;
  tuition_type: string;
  preferred_tutor_gender: 'Male' | 'Female' | 'Any';
  days_per_week: number;
  preferred_time?: string;
  budget: number;
  additional_requirements?: string;
  status: RequirementStatus;
  created_at: string;
  matched_tutors?: Array<{
    tutor_id: string;
    name?: string;
    university?: string;
    department?: string;
    profile_photo?: string;
    rating?: number;
    score: number;
    matching_reasons: string[];
  }>;
  selected_tutor_id?: string;
}

export interface ServiceCategory {
  id: string;
  name?: string;
  title?: string;
  slug: string;
  subtitle?: string;
  description: string;
  hero_image?: string;
  image?: string;
  icon_name?: string;
  iconName?: string;
  tutor_count?: number;
  tutors_count?: number;
  is_popular?: boolean;
  features?: string[];
  learning_topics?: string[];
  popular_subjects?: string[];
  subcategories?: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
  }>;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  institution_or_location?: string;
  institution?: string;
  avatar: string;
  video_thumbnail?: string;
  video_url?: string;
  quote: string;
  type: 'PARENT' | 'TUTOR' | 'STAKEHOLDER';
  rating: number;
  city?: string;
  is_featured?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author?: string | {
    name: string;
    role: string;
    avatar: string;
  };
  author_role?: string;
  category: string;
  read_time: string;
  cover_image: string;
  summary?: string;
  excerpt?: string;
  content: string;
  is_featured?: boolean;
  created_at?: string;
  published_at?: string;
  tags?: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  photo?: string;
  education?: string;
  linkedin?: string;
  socials?: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
  display_order?: number;
}

export interface Career {
  id: string;
  title: string;
  department: string;
  location: string;
  type?: string;
  employment_type?: 'Full-time' | 'Part-time' | 'Remote' | 'Internship' | string;
  experience?: string;
  deadline?: string;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  salary_range?: string;
  application_email?: string;
  is_active?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption?: string;
  description?: string;
  image?: string;
  image_url?: string;
  category: string;
  date: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'APPLICATION' | 'APPLICATION_STATUS' | 'JOB' | 'REQUIREMENT' | 'TUTOR_MATCH' | 'SYSTEM';
  is_read: boolean;
  created_at: string;
  link?: string;
}

export interface AffiliatePartner {
  id: string;
  user_id: string;
  affiliate_code: string;
  name: string;
  email: string;
  phone: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  commission_rate: number;
  total_referrals: number;
  total_earnings: number;
  created_at: string;
}
