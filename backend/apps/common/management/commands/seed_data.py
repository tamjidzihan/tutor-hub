from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from apps.locations.models import City, Area
from apps.categories.models import ServiceCategory, SubCategory
from apps.tutors.models import TutorProfile, TutorEducation, TutorExperience
from apps.tuition_jobs.models import TuitionJob
from apps.requirements.models import TutorRequirement
from apps.testimonials.models import Testimonial
from apps.content.models import BlogPost, FAQItem, TeamMember, Career, GalleryItem
from apps.reviews.models import Review

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial complete dataset for TutorHub backend'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Starting TutorHub database seeding...'))

        # 1. Superuser & Demo Users
        admin_user, _ = User.objects.get_or_create(
            email='admin@tutorhub.com.bd',
            defaults={
                'first_name': 'Super',
                'last_name': 'Admin',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True
            }
        )
        admin_user.set_password('Admin123!')
        admin_user.save()

        tutor_user, _ = User.objects.get_or_create(
            email='tutor@tutorhub.com.bd',
            defaults={
                'first_name': 'Tamzid',
                'last_name': 'Ahmed',
                'phone': '01712345678',
                'role': User.Role.TUTOR,
                'is_verified': True
            }
        )
        tutor_user.set_password('Password123!')
        tutor_user.save()

        parent_user, _ = User.objects.get_or_create(
            email='parent@tutorhub.com.bd',
            defaults={
                'first_name': 'Mrs. Sultana',
                'last_name': 'Kamal',
                'phone': '01711223344',
                'role': User.Role.PARENT,
                'is_verified': True
            }
        )
        parent_user.set_password('Password123!')
        parent_user.save()

        # Additional Tutors Users
        extra_tutor_users = [
            ('anika.tabassum@tutorhub.com.bd', 'Anika', 'Tabassum', '01812345679', 'FEMALE'),
            ('saadman.sakib@tutorhub.com.bd', 'Saadman', 'Sakib', '01912345680', 'MALE'),
            ('farhana.rahman@tutorhub.com.bd', 'Dr. Farhana', 'Rahman', '01612345681', 'FEMALE'),
            ('tanzil.hasan@tutorhub.com.bd', 'Tanzil', 'Hasan', '01512345682', 'MALE'),
            ('nusrat.jahan@tutorhub.com.bd', 'Nusrat', 'Jahan', '01712345683', 'FEMALE')
        ]
        tutor_user_objs = {}
        for email, fn, ln, phone, _ in extra_tutor_users:
            u, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': fn,
                    'last_name': ln,
                    'phone': phone,
                    'role': User.Role.TUTOR,
                    'is_verified': True
                }
            )
            u.set_password('Password123!')
            u.save()
            tutor_user_objs[email] = u

        # 2. Cities & Areas
        cities_data = [
            {
                'name': 'Dhaka',
                'areas': ['Mirpur', 'Uttara', 'Dhanmondi', 'Gulshan', 'Banani', 'Mohammadpur', 'Badda', 'Bashundhara R/A', 'Khilgaon', 'Old Dhaka', 'Rampura', 'Malibagh', 'Shantinagar', 'Baridhara', 'Lalmatia', 'Farmgate']
            },
            {
                'name': 'Chittagong',
                'areas': ['GEC Circle', 'Panchlaish', 'Agrabad', 'Nasirabad', 'Khulshi', 'Chawkbazar', 'Halishahar', 'Muradpur', 'Kotwali']
            },
            {
                'name': 'Sylhet',
                'areas': ['Zindabazar', 'Amberkhana', 'Uposhohor', 'Shibgonj', 'Subidbazar', 'Kumarpara', 'Mirabazar']
            },
            {
                'name': 'Rajshahi',
                'areas': ['Shaheb Bazar', 'Motihar', 'Kazla', 'Upashahar', 'Talaimari', 'Laxmipur']
            }
        ]

        for c_data in cities_data:
            city_obj, _ = City.objects.get_or_create(
                name=c_data['name'],
                defaults={'slug': slugify(c_data['name'])}
            )
            for a_name in c_data['areas']:
                Area.objects.get_or_create(
                    city=city_obj,
                    name=a_name,
                    defaults={'slug': slugify(f"{c_data['name']}-{a_name}")}
                )

        # 3. Service Categories
        categories_data = [
            {
                'name': 'Bangla Medium',
                'slug': 'bangla-medium',
                'icon_name': 'BookOpen',
                'description': 'Comprehensive NCTB syllabus tutoring from Class 1 to HSC with top-performing teachers from BUET, DU, and DMC.',
                'hero_image': 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=1200',
                'features': ['NCTB Curriculum Specialist Teachers', 'Creative Question (CQ & MCQ) Mastery', 'Board Exam Past Paper Solve & Model Tests', 'SSC & HSC GPA-5 Targeted Routine'],
                'tutor_count': 14200,
                'is_popular': True,
                'display_order': 1,
                'subs': ['Class 1-5 Primary', 'Class 6-8 Junior', 'SSC Science & Commerce', 'HSC Science (Phy, Chem, Math, Bio)', 'HSC Commerce & Arts']
            },
            {
                'name': 'English Version',
                'slug': 'english-version',
                'icon_name': 'Globe',
                'description': 'NCTB curriculum in English medium. Expert tutors fluent in English explaining complex science, mathematics, and commerce concepts.',
                'hero_image': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200',
                'features': ['Bilingual Conceptual Clarity', 'Science & Higher Math in English Terminology', 'Custom Chapter Summaries & Notes', 'Regular Mock Tests & Feedback'],
                'tutor_count': 11800,
                'is_popular': True,
                'display_order': 2,
                'subs': ['EV Class 6-8', 'EV SSC Science', 'EV HSC Science', 'EV Mathematics & Physics Focus']
            },
            {
                'name': 'English Medium (Cambridge / Edexcel)',
                'slug': 'english-medium',
                'icon_name': 'GraduationCap',
                'description': 'Certified IGCSE, O Level, and A Level specialists with track records of producing world toppers in Edexcel and Cambridge CAIE exams.',
                'hero_image': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200',
                'features': ['CAIE & Pearson Edexcel Syllabus Specialists', 'Past Paper Solving with Grade Threshold Focus', 'Pure Mathematics (P1-P4), Mechanics & Statistics', 'A-Star Producing Mentors from IBA & Top Universities'],
                'tutor_count': 9400,
                'is_popular': True,
                'display_order': 3,
                'subs': ['Checkpoint (Year 7-9)', 'O Level / IGCSE (Science & Commerce)', 'A Level (AS & A2 Science)', 'A Level Economics & Business']
            },
            {
                'name': 'Admission Test Coaching',
                'slug': 'admission-test',
                'icon_name': 'Award',
                'description': 'One-on-one rigorous mentorship for BUET Engineering, Medical (DMC), Dhaka University (A/B/C unit), and IBA admission.',
                'hero_image': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200',
                'features': ['Top 100 Rank Holders as Personal Mentors', 'Shortcut Techniques & Concept Building', 'Daily Problem Sheets & Question Bank Solve', 'Weekly Full-Length OMR Model Tests'],
                'tutor_count': 5600,
                'is_popular': True,
                'display_order': 4,
                'subs': ['BUET & Engineering Admission', 'Medical College (DMC/SSMC) Admission', 'DU A-Unit (Science) Admission', 'IBA & DU C-Unit Admission']
            },
            {
                'name': 'Religious & Quran Studies',
                'slug': 'religious-studies',
                'icon_name': 'Languages',
                'description': 'Certified Quranic Tajweed, Nazira, Hifz, and Arabic language instruction by verified Islamic scholars and university graduates.',
                'hero_image': 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&q=80&w=1200',
                'features': ['Accurate Quran Recitation with Tajweed Rules', 'Arabic Grammar & Everyday Vocabulary', 'Islamic Studies for School Curriculum', 'Polite & Nurturing Mentorship Environment'],
                'tutor_count': 3200,
                'is_popular': False,
                'display_order': 5,
                'subs': ['Quran Reading with Tajweed', 'Hifz Revision Mentorship', 'Basic Arabic Language', 'Islamic Studies (NCTB)']
            },
            {
                'name': 'Arts, Music & Extracurricular',
                'slug': 'arts-and-music',
                'icon_name': 'Palette',
                'description': 'Professional instruction in Fine Arts, Drawing, Classical Singing, Guitar, Keyboard, and Creative Writing from certified artists.',
                'hero_image': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200',
                'features': ['Charukola (Fine Arts) Trained Instructors', 'Step-by-step Watercolor, Sketching & Acrylics', 'Acoustic Guitar, Keyboard & Vocal Practice', 'National Competition Preparation'],
                'tutor_count': 2100,
                'is_popular': False,
                'display_order': 6,
                'subs': ['Drawing & Painting (Water/Acrylic)', 'Acoustic & Classical Guitar', 'Keyboard & Piano Basics', 'Public Speaking & Debate']
            },
            {
                'name': 'Language Learning (IELTS, Spoken)',
                'slug': 'language-learning',
                'icon_name': 'Languages',
                'description': 'Score 7.5+ in IELTS (Academic/General), Spoken English, Business Communication, and Foreign Languages (German, French, Japanese).',
                'hero_image': 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=1200',
                'features': ['Certified IELTS Trainers (Band 8.0+ Holders)', 'Daily Speaking & Mock Interview Sessions', 'Writing Task 1 & 2 Detailed Evaluation', 'Pronunciation & Accent Neutralization'],
                'tutor_count': 4300,
                'is_popular': False,
                'display_order': 7,
                'subs': ['IELTS Band 7.5+ Target', 'Spoken & Conversational English', 'German A1-B1 Language', 'Japanese JLPT N5/N4']
            },
            {
                'name': 'Special Skill Development (Coding, Robotics)',
                'slug': 'special-skills',
                'icon_name': 'Cpu',
                'description': 'Hands-on programming in Python, Web Development, Scratch for Kids, Arduino Robotics, and Graphic Design.',
                'hero_image': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200',
                'features': ['BUET & DU CSE Programmers as Mentors', 'Project-Based Coding & Portfolio Building', 'Scratch & Python Fundamentals for Young Learners', 'Arduino Robotics & Circuit Experiments'],
                'tutor_count': 2800,
                'is_popular': False,
                'display_order': 8,
                'subs': ['Python & Data Fundamentals', 'Full-Stack Web Development', 'Kids Coding (Scratch & Roblox)', 'Robotics & Microcontrollers']
            }
        ]

        for cat in categories_data:
            subs = cat.pop('subs')
            category_obj, _ = ServiceCategory.objects.get_or_create(
                slug=cat['slug'],
                defaults=cat
            )
            for sub_name in subs:
                SubCategory.objects.get_or_create(
                    category=category_obj,
                    slug=slugify(sub_name),
                    defaults={'name': sub_name}
                )

        # 4. Verified Tutors
        tutors_seed = [
            {
                'user': tutor_user,
                'tutor_id': 'TT-T-019842',
                'headline': 'BUET Mechanical 4th Year | 4+ Yrs Teaching O/A Levels & HSC Science',
                'bio': 'Passionate physics and mathematics instructor from BUET. Mentored 40+ students with 92% securing GPA 5.0 and A* grades.',
                'gender': 'MALE',
                'university': 'BUET (Bangladesh University of Engineering and Technology)',
                'department': 'Mechanical Engineering',
                'degree_title': 'B.Sc in Mechanical Engineering',
                'passing_year': '2025',
                'cgpa': '3.91 / 4.00',
                'city': 'Dhaka',
                'area': 'Mirpur',
                'expected_salary': 10000,
                'experience_years': 4,
                'subjects': ['Physics', 'Higher Math', 'General Math', 'Chemistry'],
                'classes': ['Class 9', 'Class 10 (SSC)', 'HSC 1st Year', 'HSC 2nd Year', 'O Level', 'A Level'],
                'curriculums': ['Bangla Medium', 'English Version', 'English Medium (Cambridge / Edexcel)'],
                'preferred_locations': ['Mirpur', 'Dhanmondi', 'Mohammadpur', 'Uttara'],
                'tutoring_types': ['Home Tutoring', 'Online Tutoring'],
                'rating': 5.0,
                'total_reviews': 28,
                'is_verified': True,
                'verification_status': 'VERIFIED',
                'profile_photo_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
                'profile_completion_score': 100
            },
            {
                'user': tutor_user_objs['anika.tabassum@tutorhub.com.bd'],
                'tutor_id': 'TT-T-020419',
                'headline': 'DMC (Dhaka Medical College) Intern Doctor | Biology & Chemistry Expert',
                'bio': 'Medical student at Dhaka Medical College with profound understanding of Human Physiology, Botany, and Organic Chemistry.',
                'gender': 'FEMALE',
                'university': 'Dhaka Medical College (DMC)',
                'department': 'MBBS',
                'degree_title': 'Bachelor of Medicine, Bachelor of Surgery (MBBS)',
                'passing_year': '2024',
                'cgpa': 'Honours Mark',
                'city': 'Dhaka',
                'area': 'Dhanmondi',
                'expected_salary': 12000,
                'experience_years': 3,
                'subjects': ['Biology', 'Chemistry', 'General Science', 'Medical Admission Prep'],
                'classes': ['Class 9', 'Class 10 (SSC)', 'HSC 1st Year', 'HSC 2nd Year', 'Medical Admission'],
                'curriculums': ['Bangla Medium', 'English Version'],
                'preferred_locations': ['Dhanmondi', 'Lalmatia', 'Mohammadpur', 'Old Dhaka'],
                'tutoring_types': ['Home Tutoring', 'Online Tutoring'],
                'rating': 4.9,
                'total_reviews': 34,
                'is_verified': True,
                'verification_status': 'VERIFIED',
                'profile_photo_url': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
                'profile_completion_score': 95
            },
            {
                'user': tutor_user_objs['saadman.sakib@tutorhub.com.bd'],
                'tutor_id': 'TT-T-021105',
                'headline': 'IBA, University of Dhaka (BBA 31st Batch) | English, Math & SAT Specialist',
                'bio': 'IBA Dhaka University undergraduate. Specializes in O & A Level Economics, Business Studies, and English Language.',
                'gender': 'MALE',
                'university': 'IBA, University of Dhaka',
                'department': 'BBA (Finance & Marketing)',
                'degree_title': 'Bachelor of Business Administration',
                'passing_year': '2025',
                'cgpa': '3.88 / 4.00',
                'city': 'Dhaka',
                'area': 'Gulshan',
                'expected_salary': 15000,
                'experience_years': 3,
                'subjects': ['English Language', 'Economics', 'Business Studies', 'SAT / IBA Prep', 'Accounting'],
                'classes': ['O Level', 'A Level', 'Class 9', 'Class 10 (SSC)', 'IBA Admission'],
                'curriculums': ['English Medium (Cambridge / Edexcel)', 'English Version'],
                'preferred_locations': ['Gulshan', 'Banani', 'Baridhara', 'Bashundhara R/A'],
                'tutoring_types': ['Home Tutoring', 'Online Tutoring'],
                'rating': 4.8,
                'total_reviews': 19,
                'is_verified': True,
                'verification_status': 'VERIFIED',
                'profile_photo_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
                'profile_completion_score': 90
            }
        ]

        for t_data in tutors_seed:
            t_user = t_data.pop('user')
            tutor_prof, _ = TutorProfile.objects.get_or_create(
                tutor_id=t_data['tutor_id'],
                defaults={'user': t_user, **t_data}
            )
            TutorEducation.objects.get_or_create(
                tutor=tutor_prof,
                degree=t_data['degree_title'],
                institution=t_data['university'],
                defaults={'department': t_data['department'], 'passing_year': t_data['passing_year'], 'result': t_data['cgpa']}
            )
            TutorExperience.objects.get_or_create(
                tutor=tutor_prof,
                title='Senior Academic Mentor',
                institution_or_platform='TutorHub Bangladesh',
                defaults={'duration': '3+ Years', 'description': 'Mentored students for Board and International Exams.'}
            )
            Review.objects.get_or_create(
                tutor=tutor_prof,
                guardian_name='Mrs. Sultana Kamal',
                student_class='Class 10 (SSC)',
                rating=5,
                defaults={'comment': 'Outstanding mentor. My child’s physics grades improved remarkably within two months.'}
            )

        # 5. Live Tuition Jobs
        jobs_seed = [
            {
                'job_id': 'TT-J-004814',
                'title': 'Need English Version Class 9 Tutor for Physics & Chemistry',
                'city': 'Dhaka',
                'area': 'Mirpur',
                'student_gender': 'Male',
                'preferred_tutor_gender': 'Male',
                'curriculum': 'English Version',
                'class_level': 'Class 9',
                'subjects': ['Physics', 'Chemistry', 'Higher Mathematics'],
                'days_per_week': 3,
                'tutoring_time': '5:30 PM - 7:00 PM',
                'salary': 8000,
                'tuition_type': 'Home Tutoring',
                'status': 'AVAILABLE',
                'requirements_text': 'Looking for a dedicated BUET/DU student who has strong conceptual knowledge in English Version NCTB curriculum.',
                'is_urgent': True,
                'is_verified': True
            },
            {
                'job_id': 'TT-J-004815',
                'title': 'Looking for O-Level Physics & Pure Math Tutor (Edexcel)',
                'city': 'Dhaka',
                'area': 'Dhanmondi',
                'student_gender': 'Female',
                'preferred_tutor_gender': 'Any',
                'curriculum': 'English Medium (Cambridge / Edexcel)',
                'class_level': 'O Level (Year 10)',
                'subjects': ['Physics', 'Pure Mathematics', 'Chemistry'],
                'days_per_week': 4,
                'tutoring_time': '4:00 PM - 5:30 PM',
                'salary': 12000,
                'tuition_type': 'Home Tutoring',
                'status': 'AVAILABLE',
                'requirements_text': 'Student is appearing for Edexcel IGCSE exam in May 2025. Needs extensive past paper practice.',
                'is_urgent': True,
                'is_verified': True
            },
            {
                'job_id': 'TT-J-004816',
                'title': 'HSC 2nd Year Science (Physics, Math, ICT) — Mirpur DOHS',
                'city': 'Dhaka',
                'area': 'Mirpur',
                'student_gender': 'Male',
                'preferred_tutor_gender': 'Male',
                'curriculum': 'Bangla Medium',
                'class_level': 'HSC 2nd Year',
                'subjects': ['Physics', 'Higher Math', 'ICT'],
                'days_per_week': 3,
                'tutoring_time': '6:30 PM - 8:00 PM',
                'salary': 9000,
                'tuition_type': 'Home Tutoring',
                'status': 'AVAILABLE',
                'requirements_text': 'HSC 2025 candidate. Needs board exam model tests and engineering admission fundamental guidance.',
                'is_urgent': False,
                'is_verified': True
            },
            {
                'job_id': 'TT-J-004817',
                'title': 'Female Tutor Needed for Class 7 (All Subjects) — Uttara Sector 11',
                'city': 'Dhaka',
                'area': 'Uttara',
                'student_gender': 'Female',
                'preferred_tutor_gender': 'Female',
                'curriculum': 'English Version',
                'class_level': 'Class 7',
                'subjects': ['General Science', 'Mathematics', 'English', 'BGS'],
                'days_per_week': 5,
                'tutoring_time': '4:30 PM - 6:00 PM',
                'salary': 10000,
                'tuition_type': 'Home Tutoring',
                'status': 'AVAILABLE',
                'requirements_text': 'Caring female mentor from DU/NSU preferred. Must be punctual with interactive study techniques.',
                'is_urgent': True,
                'is_verified': True
            }
        ]

        for j_data in jobs_seed:
            TuitionJob.objects.get_or_create(
                job_id=j_data['job_id'],
                defaults=j_data
            )

        # 6. Testimonials
        testimonials_seed = [
            {
                'name': 'Dr. M. A. Rashid',
                'role': 'Parent (Professor, Dhaka University)',
                'institution_or_location': 'Dhanmondi, Dhaka',
                'type': 'PARENT',
                'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
                'quote': 'TutorHub matched our daughter with an exceptional BUET engineering tutor within 24 hours. Her grade jumped from C to A* in O Level Physics.',
                'rating': 5,
                'is_featured': True
            },
            {
                'name': 'Saadman Sakib',
                'role': 'Top-Rated Tutor (BUET EEE)',
                'institution_or_location': 'Mirpur, Dhaka',
                'type': 'TUTOR',
                'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
                'quote': 'Managing tuition requests was never this easy. The ID verification and automated matching connect me with respectful guardians in my area.',
                'rating': 5,
                'is_featured': True
            }
        ]

        for t_data in testimonials_seed:
            Testimonial.objects.get_or_create(
                name=t_data['name'],
                defaults=t_data
            )

        # 7. Blog Posts
        blogs_seed = [
            {
                'title': 'How to Score GPA 5.0 in HSC 2025 Science: Ultimate Preparation Strategy',
                'slug': 'how-to-score-gpa-5-hsc-2025-science',
                'author': 'Engr. Tamzid Ahmed',
                'author_role': 'Academic Advisor, TutorHub',
                'category': 'Board Exam Strategy',
                'read_time': '6 min read',
                'cover_image': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200',
                'summary': 'A complete chapter-by-chapter roadmap for Physics, Chemistry, and Higher Math with Creative Question (CQ) scoring techniques.',
                'content': 'Scoring GPA 5.0 in HSC Science requires disciplined routine and consistent problem practice. Master the NCTB textbook fundamental definitions first before jumping to guidebooks...',
                'is_featured': True
            },
            {
                'title': 'Cambridge vs Edexcel O Level: Which Curriculum Fits Bangladeshi Students Better?',
                'slug': 'cambridge-vs-edexcel-o-level-bangladesh-guide',
                'author': 'Saadman Sakib (IBA DU)',
                'author_role': 'Senior English Medium Mentor',
                'category': 'Curriculum Comparison',
                'read_time': '5 min read',
                'cover_image': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200',
                'summary': 'Detailed comparative analysis of CAIE and Pearson Edexcel grading thresholds, examination formats, and university acceptance.',
                'content': 'Both Cambridge Assessment International Education (CAIE) and Pearson Edexcel are globally recognized international qualifications. In Bangladesh, schools choose either syllabus...',
                'is_featured': False
            }
        ]

        for b_data in blogs_seed:
            BlogPost.objects.get_or_create(
                slug=b_data['slug'],
                defaults=b_data
            )

        # 8. FAQs
        faqs_seed = [
            {
                'question': 'How does TutorHub verify tutor credentials and university IDs?',
                'answer': 'Every tutor must upload their official University Student ID Card and National ID (NID). Our verification team verifies the credentials directly before awarding the verified badge.',
                'category': 'GENERAL',
                'display_order': 1
            },
            {
                'question': 'Is there any fee for guardians to request a tutor?',
                'answer': 'No! Requesting a tutor and reviewing matched CVs is 100% free for guardians. You only pay the agreed tuition fee to the tutor after classes begin.',
                'category': 'PARENTS',
                'display_order': 2
            },
            {
                'question': 'How does the free trial demo class work?',
                'answer': 'Guardians get 1 complimentary trial class with the matched tutor to evaluate teaching style and compatibility before confirming the monthly tuition.',
                'category': 'PARENTS',
                'display_order': 3
            },
            {
                'question': 'How can university students register as tutors?',
                'answer': 'Click "Become a Tutor", complete the 8-step registration form with your university background, upload your ID card, and start applying for live jobs immediately.',
                'category': 'TUTORS',
                'display_order': 4
            }
        ]

        for f_data in faqs_seed:
            FAQItem.objects.get_or_create(
                question=f_data['question'],
                defaults=f_data
            )

        # 9. Team Members
        team_seed = [
            {
                'name': 'Dr. Tarequl Islam',
                'role': 'Founder & Chief Academic Officer',
                'bio': 'Former BUET faculty member with 14+ years of passion in transforming Bangladesh educational accessibility.',
                'image': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
                'linkedin': 'https://linkedin.com',
                'display_order': 1
            },
            {
                'name': 'Sultana Parveen',
                'role': 'Head of Teacher Verification & Quality',
                'bio': 'Oversees academic background authentication, police verification, and teacher pedagogy training.',
                'image': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
                'linkedin': 'https://linkedin.com',
                'display_order': 2
            }
        ]

        for tm in team_seed:
            TeamMember.objects.get_or_create(
                name=tm['name'],
                defaults=tm
            )

        # 10. Careers
        careers_seed = [
            {
                'title': 'Academic Verification Coordinator',
                'department': 'Operations',
                'location': 'Dhaka, Bangladesh',
                'type': 'Full-time',
                'experience': '1+ Year',
                'description': 'Responsible for verifying university documents and coordinating free trial demo sessions between tutors and guardians.',
                'responsibilities': ['Validate university ID cards and transcripts', 'Call guardians to clarify tuition requirements', 'Schedule demo classes and collect feedback'],
                'requirements': ['Bachelor degree from any reputed university', 'Excellent communication skills in Bangla and English', 'Punctual and detail-oriented'],
                'is_active': True
            }
        ]

        for cr in careers_seed:
            Career.objects.get_or_create(
                title=cr['title'],
                defaults=cr
            )

        # 11. Gallery
        gallery_seed = [
            {
                'title': 'BUET Campus Tutor Engagement Workshop',
                'caption': 'Empowering top engineering students with modern pedagogical and digital tutoring tools.',
                'image_url': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
                'category': 'Campus Drives',
                'date': 'October 2024'
            },
            {
                'title': 'Annual Top Tutor Excellence Awards',
                'caption': 'Celebrating 50+ star mentors who produced board toppers and GPA-5 achievements.',
                'image_url': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
                'category': 'Conferences',
                'date': 'December 2024'
            }
        ]

        for g in gallery_seed:
            GalleryItem.objects.get_or_create(
                title=g['title'],
                defaults=g
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded TutorHub database with complete dataset!'))
