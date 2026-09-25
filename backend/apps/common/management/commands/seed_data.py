import random
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.affiliates.models import AffiliatePartner
from apps.applications.models import JobApplication
from apps.categories.models import ServiceCategory, SubCategory
from apps.content.models import BlogPost, FAQItem, TeamMember, Career, GalleryItem
from apps.locations.models import City, Area
from apps.requirements.models import TutorRequirement
from apps.reviews.models import Review
from apps.testimonials.models import Testimonial
from apps.tuition_jobs.models import TuitionJob
from apps.tutors.models import TutorProfile, TutorEducation, TutorExperience

User = get_user_model()


class Command(BaseCommand):
    help = "Populate the TutorHub database with realistic data across all main business sectors."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear", action="store_true", help="Clear existing rows before seeding."
        )

    def handle(self, *args, **options):
        if options["clear"]:
            self.stdout.write(self.style.WARNING("Flushing current database..."))
            call_command("flush", interactive=False)

        self.stdout.write(self.style.NOTICE("Starting bulk seed generation..."))

        call_command("migrate", interactive=False)

        city_list = [
            {
                "name": "Dhaka",
                "areas": [
                    "Mirpur",
                    "Uttara",
                    "Dhanmondi",
                    "Banani",
                    "Gulshan",
                    "Mohammadpur",
                    "Bashundhara R/A",
                    "Farmgate",
                    "Rampura",
                    "Badda",
                ],
            },
            {
                "name": "Chittagong",
                "areas": [
                    "GEC Circle",
                    "Agrabad",
                    "Nasirabad",
                    "Khulshi",
                    "Panchlaish",
                    "Muradpur",
                    "Bakalia",
                    "Halishahar",
                ],
            },
            {
                "name": "Sylhet",
                "areas": [
                    "Zindabazar",
                    "Amberkhana",
                    "Uposhohor",
                    "Mirabazar",
                    "Subidbazar",
                    "Jalalabad",
                ],
            },
            {
                "name": "Rajshahi",
                "areas": [
                    "Shaheb Bazar",
                    "Motihar",
                    "Kazla",
                    "Upashahar",
                    "Boalia",
                    "Laxmipur",
                ],
            },
            {
                "name": "Khulna",
                "areas": ["Sonadanga", "Shib Bari", "Khalishpur", "Boyra", "Dakbangla"],
            },
            {
                "name": "Bogura",
                "areas": ["Nawapara", "Kachari", "Railway Station", "Sariakandi"],
            },
            {
                "name": "Cumilla",
                "areas": ["Lalmai", "Mainamati", "Muradnagar", "Cumilla Sadar"],
            },
            {
                "name": "Barisal",
                "areas": ["Saheberhat", "Natun Bazar", "Lakutia", "Bazar Road"],
            },
        ]

        cities_by_name = {}
        for city_data in city_list:
            city_obj, _ = City.objects.get_or_create(
                name=city_data["name"], defaults={"slug": slugify(city_data["name"])}
            )
            cities_by_name[city_data["name"]] = city_obj
            for area_name in city_data["areas"]:
                Area.objects.get_or_create(
                    city=city_obj,
                    name=area_name,
                    defaults={"slug": slugify(f"{city_data['name']}-{area_name}")},
                )

        category_specs = [
            {
                "name": "Bangla Medium",
                "slug": "bangla-medium",
                "icon_name": "BookOpen",
                "description": "Bangla medium academic support for school, college, and board exam learners.",
                "hero_image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
                "features": ["Board exam prep", "Concept clarity", "Home tuition"],
                "tutor_count": 14000,
                "is_popular": True,
                "display_order": 1,
                "subs": ["Class 1-5", "Class 6-8", "SSC Science", "HSC Science"],
            },
            {
                "name": "English Version",
                "slug": "english-version",
                "icon_name": "Globe",
                "description": "English version classroom coaching and concept support for daily academic growth.",
                "hero_image": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
                "features": ["English curriculum", "Exam drills", "Mock tests"],
                "tutor_count": 12000,
                "is_popular": True,
                "display_order": 2,
                "subs": ["EV Class 6-8", "EV SSC", "EV HSC", "Grammar Support"],
            },
            {
                "name": "English Medium (Cambridge / Edexcel)",
                "slug": "english-medium",
                "icon_name": "GraduationCap",
                "description": "International program support with concept building and paper practice.",
                "hero_image": "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
                "features": ["O Level", "A Level", "Past papers"],
                "tutor_count": 9800,
                "is_popular": True,
                "display_order": 3,
                "subs": ["IGCSE", "O Level", "A Level", "Business Studies"],
            },
            {
                "name": "Admission Test Coaching",
                "slug": "admission-test",
                "icon_name": "Award",
                "description": "Admission prep for BUET, DU, IBA, medical, and entry-based exam tracks.",
                "hero_image": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
                "features": ["Admission coaching", "Model tests", "Shortcuts"],
                "tutor_count": 6500,
                "is_popular": True,
                "display_order": 4,
                "subs": ["BUET Prep", "DU Admission", "Medical Prep", "IBA Prep"],
            },
            {
                "name": "Religious & Quran Studies",
                "slug": "religious-studies",
                "icon_name": "Languages",
                "description": "Quran, Tajweed, and Islamic studies coaching with verified teachers.",
                "hero_image": "https://images.unsplash.com/photo-1585036156171-384164a8c675",
                "features": ["Hifz", "Tajweed", "Arabic basics"],
                "tutor_count": 3500,
                "is_popular": False,
                "display_order": 5,
                "subs": ["Quran Reading", "Tajweed", "Hifz", "Islamic Studies"],
            },
            {
                "name": "Arts, Music & Extracurricular",
                "slug": "arts-and-music",
                "icon_name": "Palette",
                "description": "Creative learning experiences for arts, music, speaking, and performance.",
                "hero_image": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
                "features": ["Drawing", "Music", "Public speaking"],
                "tutor_count": 2200,
                "is_popular": False,
                "display_order": 6,
                "subs": ["Drawing", "Guitar", "Keyboard", "Debate"],
            },
            {
                "name": "Language Learning (IELTS, Spoken)",
                "slug": "language-learning",
                "icon_name": "Languages",
                "description": "IELTS, spoken English, and foreign language training for communication skills.",
                "hero_image": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d",
                "features": ["IELTS", "Conversation", "Pronunciation"],
                "tutor_count": 4700,
                "is_popular": False,
                "display_order": 7,
                "subs": ["IELTS", "Spoken English", "French", "German"],
            },
            {
                "name": "Special Skill Development (Coding, Robotics)",
                "slug": "special-skills",
                "icon_name": "Cpu",
                "description": "Coding, robotics, and digital learning experiences for modern students.",
                "hero_image": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
                "features": ["Python", "Robotics", "Frontend"],
                "tutor_count": 2900,
                "is_popular": False,
                "display_order": 8,
                "subs": ["Scratch", "Python", "Robotics", "Web Development"],
            },
        ]

        for category_spec in category_specs:
            subs = category_spec.pop("subs")
            category, _ = ServiceCategory.objects.get_or_create(
                slug=category_spec["slug"], defaults=category_spec
            )
            for sub_name in subs:
                SubCategory.objects.get_or_create(
                    category=category,
                    slug=slugify(sub_name),
                    defaults={"name": sub_name},
                )

        admin_email = "admin@tutorhub.com.bd"
        admin_user, _ = User.objects.get_or_create(
            email=admin_email,
            defaults={
                "first_name": "Super",
                "last_name": "Admin",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "is_verified": True,
            },
        )
        admin_user.set_password("Admin123!")
        admin_user.save()

        first_names = [
            "Arif",
            "Nadia",
            "Reza",
            "Sadia",
            "Shahriar",
            "Farzana",
            "Mahmud",
            "Jannat",
            "Imran",
            "Mitu",
            "Rafi",
            "Nabila",
            "Rashid",
            "Tasnim",
            "Ayon",
            "Mariam",
            "Mahir",
            "Tisha",
            "Sakib",
            "Fariha",
            "Ayesha",
            "Rakib",
            "Tanvir",
            "Salma",
            "Hasan",
            "Mina",
            "Shuvo",
            "Zarin",
            "Nabil",
            "Afsana",
            "Saba",
            "Nafis",
            "Aisha",
            "Hridoy",
            "Rupam",
            "Shreya",
            "Rayan",
            "Priya",
            "Tahmid",
            "Sharmila",
            "Jahid",
            "Naim",
            "Ishrat",
            "Rafiq",
            "Samiha",
            "Iftekhar",
            "Sanjida",
            "Morshed",
            "Labiba",
        ]
        last_names = [
            "Rahman",
            "Khan",
            "Sultana",
            "Ahmed",
            "Hossain",
            "Islam",
            "Akter",
            "Karim",
            "Chowdhury",
            "Ali",
            "Uddin",
            "Nahar",
            "Hasan",
            "Mia",
            "Rashid",
            "Amin",
            "Mollah",
            "Talukder",
            "Jahan",
            "Ferdous",
        ]
        universities = [
            "BUET",
            "Dhaka University",
            "Chittagong University",
            "Jahangirnagar University",
            "Khulna University",
            "Rajshahi University",
            "BRAC University",
            "NSU",
            "IUB",
            "DMC",
            "IBA",
            "AIUB",
        ]
        departments = [
            "CSE",
            "EEE",
            "Mechanical",
            "Civil",
            "Economics",
            "English",
            "Mathematics",
            "Physics",
            "Biology",
            "Business Administration",
            "Finance",
            "Pharmacy",
        ]
        subjects_pool = [
            "Mathematics",
            "Physics",
            "Chemistry",
            "Biology",
            "Higher Mathematics",
            "English",
            "Economics",
            "Accounting",
            "ICT",
            "Business Studies",
            "Psychology",
            "Bangla",
            "Social Science",
            "Programming",
            "Robotics",
            "History",
            "Geography",
        ]
        class_levels = [
            "Class 1 to 5",
            "Class 6 to 8",
            "Class 9",
            "Class 10 (SSC)",
            "HSC 1st Year",
            "HSC 2nd Year",
            "O Level",
            "A Level",
            "Admission Prep",
        ]

        password_hash = make_password("Password123!")
        tutor_users = []
        for i in range(250):
            first = random.choice(first_names)
            last = random.choice(last_names)
            tutor_users.append(
                User(
                    email=f"tutor{i + 1}@tutorhub.local",
                    password=password_hash,
                    first_name=first,
                    last_name=last,
                    phone=f"017{random.randint(1000000, 9999999)}",
                    role=User.Role.TUTOR,
                    is_verified=True,
                )
            )
        User.objects.bulk_create(tutor_users)

        parent_users = []
        for i in range(180):
            first = random.choice(first_names)
            last = random.choice(last_names)
            parent_users.append(
                User(
                    email=f"parent{i + 1}@tutorhub.local",
                    password=password_hash,
                    first_name=first,
                    last_name=last,
                    phone=f"018{random.randint(1000000, 9999999)}",
                    role=User.Role.PARENT,
                    is_verified=True,
                )
            )
        User.objects.bulk_create(parent_users)

        student_users = []
        for i in range(80):
            student_users.append(
                User(
                    email=f"student{i + 1}@tutorhub.local",
                    password=password_hash,
                    first_name=random.choice(first_names),
                    last_name=random.choice(last_names),
                    phone=f"016{random.randint(1000000, 9999999)}",
                    role=User.Role.STUDENT,
                    is_verified=random.choice([True, False]),
                )
            )
        User.objects.bulk_create(student_users)

        tutor_profiles = []
        for index, user in enumerate(tutor_users, start=1):
            city_name = random.choice(list(cities_by_name.keys()))
            area_names = list(
                Area.objects.filter(city=cities_by_name[city_name]).values_list(
                    "name", flat=True
                )
            )
            area_name = random.choice(area_names) if area_names else "Mirpur"
            selected_subjects = random.sample(subjects_pool, k=random.randint(3, 6))
            tutor_profiles.append(
                TutorProfile(
                    user=user,
                    tutor_id=f"TT-T-{100000 + index}",
                    headline=f"{random.choice(universities)} {random.choice(departments)} mentor | {random.choice(['Top tutor', 'Academic mentor', 'Board exam coach', 'Admission coach'])}",
                    bio=f"{user.first_name} helps learners build subject confidence through clear explanations and structured revision across {', '.join(selected_subjects[:3])}.",
                    gender=random.choice(["MALE", "FEMALE"]),
                    university=random.choice(universities),
                    department=random.choice(departments),
                    degree_title=random.choice(
                        [
                            "B.Sc Engineering",
                            "BBA",
                            "MBBS",
                            "BSS",
                            "B.A Honors",
                            "M.Sc",
                            "B.Com",
                        ]
                    ),
                    passing_year=str(random.randint(2023, 2027)),
                    cgpa=random.choice(
                        [
                            "3.60 / 4.00",
                            "3.80 / 4.00",
                            "3.90 / 4.00",
                            "4.00 / 4.00",
                            "3.75 / 4.00",
                        ]
                    ),
                    city=city_name,
                    area=area_name,
                    expected_salary=random.randint(6000, 18000),
                    experience_years=random.randint(1, 6),
                    subjects=selected_subjects,
                    classes=random.sample(class_levels, k=random.randint(3, 5)),
                    curriculums=random.sample(
                        [
                            "Bangla Medium",
                            "English Version",
                            "English Medium (Cambridge / Edexcel)",
                        ],
                        k=random.randint(1, 3),
                    ),
                    preferred_locations=random.sample(
                        [
                            area_name,
                            "Mirpur",
                            "Uttara",
                            "Dhanmondi",
                            "Gulshan",
                            "Banani",
                            "Bashundhara R/A",
                            "Old Dhaka",
                        ],
                        k=random.randint(2, 4),
                    ),
                    tutoring_types=random.sample(
                        ["Home Tutoring", "Online Tutoring", "Group Tutoring"],
                        k=random.randint(1, 3),
                    ),
                    rating=Decimal(str(round(random.uniform(4.1, 5.0), 1))),
                    total_reviews=random.randint(4, 38),
                    total_tuitions_completed=random.randint(5, 120),
                    is_verified=True,
                    verification_status="VERIFIED",
                    profile_photo_url=f'https://images.unsplash.com/photo-{random.choice(["1500648767791-00dcc994a43e", "1494790108377-be9c29b29330", "1506794778202-cad84cf45f1d", "1534528741775-53994a69daeb", "1507003211169-0a1dd7228f2d"])}?auto=format&fit=crop&q=80&w=500',
                    profile_completion_score=random.randint(82, 100),
                    is_available=True,
                    is_featured=random.choice([True, False]),
                )
            )

        TutorProfile.objects.bulk_create(tutor_profiles)

        for tutor in TutorProfile.objects.all():
            for record_number in range(2):
                TutorEducation.objects.create(
                    tutor=tutor,
                    degree=tutor.degree_title,
                    institution=tutor.university,
                    department=tutor.department,
                    passing_year=str(int(tutor.passing_year) - record_number),
                    result=tutor.cgpa,
                )
                TutorExperience.objects.create(
                    tutor=tutor,
                    title=f"Academic Mentor {record_number + 1}",
                    institution_or_platform=random.choice(
                        [
                            "TutorHub",
                            "Private Academy",
                            "School Club",
                            "Online Coaching",
                            "College Mentor Panel",
                        ]
                    ),
                    duration=f"{random.randint(1, 5)}+ years",
                    description="Guided students through concept reinforcement and exam drills.",
                )

        for tutor in TutorProfile.objects.all():
            for _ in range(random.randint(2, 3)):
                Review.objects.create(
                    tutor=tutor,
                    guardian=None,
                    guardian_name=f"{random.choice(first_names)} {random.choice(last_names)}",
                    student_class=random.choice(
                        [
                            "Class 9",
                            "Class 10 (SSC)",
                            "HSC 1st Year",
                            "HSC 2nd Year",
                            "O Level",
                            "A Level",
                        ]
                    ),
                    rating=random.randint(4, 5),
                    comment=random.choice(
                        [
                            "Very supportive and easy to understand. My child became more confident in class.",
                            "Excellent communication and very punctual. Helpful notes and practice tests.",
                            "High-quality teaching, especially in difficult topics and exam preparation.",
                            "My son felt comfortable immediately. The tutor was patient and professional.",
                        ]
                    ),
                    is_verified_guardian=True,
                )

        job_templates = [
            (
                "Need a reliable tutor for Class 9 Mathematics and Physics",
                "Home Tutoring",
                "Bangla Medium",
                "Class 9",
                ["Mathematics", "Physics", "English"],
                "Dhaka",
                "Mirpur",
            ),
            (
                "O-Level Chemistry and Biology help needed for exam prep",
                "Home Tutoring",
                "English Medium (Cambridge / Edexcel)",
                "O Level",
                ["Chemistry", "Biology", "English"],
                "Chittagong",
                "GEC Circle",
            ),
            (
                "Upper secondary science tutor for HSC Physics and ICT",
                "Online Tutoring",
                "English Version",
                "HSC 1st Year",
                ["Physics", "ICT", "Higher Mathematics"],
                "Sylhet",
                "Zindabazar",
            ),
            (
                "Urgent tuition for Class 10 English and Bangla",
                "Home Tutoring",
                "Bangla Medium",
                "Class 10 (SSC)",
                ["Bangla", "English", "General Science"],
                "Rajshahi",
                "Shaheb Bazar",
            ),
            (
                "A-Level Economics and Business Studies tutor required",
                "Home Tutoring",
                "English Medium (Cambridge / Edexcel)",
                "A Level",
                ["Economics", "Business Studies", "Accounting"],
                "Dhaka",
                "Uttara",
            ),
            (
                "Need a female tutor for Class 6-8 English and Math",
                "Home Tutoring",
                "English Version",
                "Class 6 to 8",
                ["Mathematics", "English", "Science"],
                "Khulna",
                "Sonadanga",
            ),
            (
                "University admission mentor for DU and BUET prep",
                "Online Tutoring",
                "Bangla Medium",
                "Admission Prep",
                ["Higher Mathematics", "Physics", "Chemistry"],
                "Barisal",
                "Saheberhat",
            ),
            (
                "Need a tutor for IELTS speaking and writing",
                "Online Tutoring",
                "English Version",
                "O Level",
                ["IELTS", "English", "Speaking"],
                "Cumilla",
                "Lalmai",
            ),
        ]

        tuition_jobs = []
        for i in range(500):
            (
                title,
                tuition_type,
                curriculum,
                class_level,
                subjects,
                city_name,
                area_name,
            ) = random.choice(job_templates)
            parent = random.choice(parent_users)
            tuition_jobs.append(
                TuitionJob(
                    parent=parent,
                    job_id=f"TT-J-{100000 + i}",
                    title=f"{title} {i + 1}",
                    city=city_name,
                    area=area_name,
                    student_gender=random.choice(["Male", "Female"]),
                    preferred_tutor_gender=random.choice(["Any", "Male", "Female"]),
                    curriculum=curriculum,
                    class_level=class_level,
                    subjects=subjects,
                    days_per_week=random.randint(2, 6),
                    tutoring_time=f"{random.randint(4, 8)}:{random.choice(['00', '30'])} PM - {random.randint(8, 10)}:{random.choice(['00', '30'])} PM",
                    salary=random.randint(5000, 22000),
                    tuition_type=tuition_type,
                    status=random.choice(
                        ["AVAILABLE", "SHORTLISTED", "APPOINTED", "CANCELLED"]
                    ),
                    requirements_text="Student needs consistent guidance with concept-building, revision, and exam practice.",
                    views_count=random.randint(12, 350),
                    applications_count=random.randint(0, 12),
                    is_urgent=random.choice([True, False]),
                    is_verified=True,
                )
            )

        TuitionJob.objects.bulk_create(tuition_jobs)

        requirement_objects = []
        for i in range(500):
            parent = random.choice(parent_users)
            city_name = random.choice(list(cities_by_name.keys()))
            area_values = list(
                Area.objects.filter(city=cities_by_name[city_name]).values_list(
                    "name", flat=True
                )
            )
            area_name = random.choice(area_values) if area_values else "Mirpur"
            requirement_objects.append(
                TutorRequirement(
                    user=parent,
                    requirement_id=f"TT-R-{100000 + i}",
                    parent_name=f"{parent.first_name} {parent.last_name}",
                    phone=parent.phone,
                    email=parent.email,
                    student_name=f"{random.choice(first_names)} {random.choice(last_names)}",
                    student_gender=random.choice(["Female", "Male"]),
                    city=city_name,
                    area=area_name,
                    address=f"{random.randint(1, 120)} {random.choice(['Road', 'Lane', 'Street', 'Avenue'])}",
                    curriculum=random.choice(
                        [
                            "Bangla Medium",
                            "English Version",
                            "English Medium (Cambridge / Edexcel)",
                        ]
                    ),
                    class_level=random.choice(class_levels),
                    subjects=random.sample(subjects_pool, k=random.randint(2, 4)),
                    preferred_tutor_gender=random.choice(["Any", "Male", "Female"]),
                    days_per_week=random.randint(2, 5),
                    preferred_time=f"{random.randint(4, 7)}:{random.choice(['00', '30'])} PM - {random.randint(7, 9)}:{random.choice(['00', '30'])} PM",
                    budget=random.randint(5000, 22000),
                    additional_requirements="Prefer punctual, patient and communicative tutors with a good teaching record.",
                    status=random.choice(
                        ["PENDING", "MATCHED", "TUTOR_SELECTED", "COMPLETED"]
                    ),
                    selected_tutor_id="",
                    matched_tutors=[],
                )
            )

        TutorRequirement.objects.bulk_create(requirement_objects)

        AffiliatePartner.objects.bulk_create(
            [
                AffiliatePartner(
                    user=random.choice(tutor_users + parent_users),
                    name=f"{random.choice(first_names)} {random.choice(last_names)}",
                    phone=f"019{random.randint(1000000, 9999999)}",
                    email=f"affiliate{i + 1}@tutorhub.local",
                    occupation=random.choice(
                        [
                            "Student Ambassador",
                            "School Counselor",
                            "Campus Rep",
                            "Community Leader",
                        ]
                    ),
                    institution=random.choice(universities),
                    referral_code=f"TH-{random.randint(100000, 999999)}",
                    total_referrals=random.randint(5, 80),
                    successful_matches=random.randint(2, 35),
                    commission_rate=random.randint(5, 15),
                    total_earnings=random.randint(1500, 25000),
                    pending_payout=random.randint(300, 9000),
                    payout_method=random.choice(["bKash", "Nagad", "Bank Transfer"]),
                    payout_account_number=str(random.randint(100000000, 999999999)),
                    is_approved=True,
                )
                for i in range(500)
            ]
        )

        job_applications = []
        all_jobs = list(TuitionJob.objects.all())
        for i in range(600):
            job = random.choice(all_jobs)
            tutor_user = random.choice(tutor_users)
            job_applications.append(
                JobApplication(
                    job=job,
                    tutor_user=tutor_user,
                    cover_message="I can help with strong subject knowledge, lesson planning, and regular progress tracking.",
                    expected_salary=random.randint(6000, 18000),
                    status=random.choice(
                        ["APPLIED", "SHORTLISTED", "SELECTED", "REJECTED"]
                    ),
                    admin_notes="",
                    guardian_feedback="",
                )
            )

        JobApplication.objects.bulk_create(job_applications, ignore_conflicts=True)

        Testimonial.objects.bulk_create(
            [
                Testimonial(
                    name=f"{random.choice(first_names)} {random.choice(last_names)}",
                    role=random.choice(
                        ["Parent", "Tutor", "Student", "School Counselor"]
                    ),
                    institution_or_location=random.choice(
                        ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna"]
                    ),
                    type=random.choice(["PARENT", "TUTOR", "STAKEHOLDER"]),
                    avatar=f'https://images.unsplash.com/photo-{random.choice(["1494790108377-be9c29b29330", "1500648767791-00dcc994a43e", "1534528741775-53994a69daeb", "1507003211169-0a1dd7228f2d"])}?auto=format&fit=crop&q=80&w=200',
                    quote=random.choice(
                        [
                            "The matching experience was surprisingly smooth and reliable.",
                            "The tutor quality was strong and the communication was excellent.",
                            "We found a tutor who genuinely cared about learning outcomes.",
                            "A professional platform that makes tuition hiring easier and safer.",
                        ]
                    ),
                    rating=random.randint(4, 5),
                    is_featured=random.choice([True, False]),
                )
                for _ in range(500)
            ]
        )

        BlogPost.objects.bulk_create(
            [
                BlogPost(
                    title=f"{random.choice(['Board Exam', 'Academic Strategy', 'Study Hacks', 'O Level', 'HSC', 'Tuition Tips', 'Career Planning'])} Guide {i + 1}",
                    slug=f"blog-guide-{i + 1}",
                    author=random.choice(
                        ["TutorHub Team", "Mina Rahman", "Tamzid Ahmed", "Rafsan Ali"]
                    ),
                    author_role=random.choice(
                        ["Academic Advisor", "Senior Mentor", "Education Specialist"]
                    ),
                    category=random.choice(
                        [
                            "Board Exam Strategy",
                            "Curriculum Guide",
                            "Tuition Tips",
                            "Student Growth",
                        ]
                    ),
                    read_time=f"{random.randint(4, 9)} min read",
                    cover_image="https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
                    summary="Practical advice for students and parents focused on consistency and confident learning.",
                    content="This article explores the importance of strong study habits, targeted practice, and teacher alignment to unlock better academic outcomes for students.",
                    is_featured=random.choice([True, False]),
                )
                for i in range(500)
            ]
        )

        faq_questions = [
            "How quickly can we get matched with a tutor?",
            "Do you offer online tuition?",
            "Can we choose tutors by location?",
            "Are all tutors verified?",
            "What is the average trial class process?",
            "Is there support for parents during admission coaching?",
            "How are class schedules arranged?",
            "Can I post a requirement without paying any fee?",
            "Do you support English medium students?",
            "Do tutors get access to live jobs?",
            "Can guardians review tutor feedback?",
            "What happens if a tutor is not suitable?",
        ]
        FAQItem.objects.bulk_create(
            [
                FAQItem(
                    question=f"{faq_questions[index % len(faq_questions)]} ({index + 1})",
                    answer="TutorHub provides a secure and guided onboarding process for both parents and tutors, with verification, location fit, and subject alignment to improve match quality.",
                    category=random.choice(["PARENTS", "TUTORS", "GENERAL"]),
                    display_order=index + 1,
                )
                for index in range(500)
            ]
        )

        TeamMember.objects.bulk_create(
            [
                TeamMember(
                    name=f"{random.choice(first_names)} {random.choice(last_names)}",
                    role=random.choice(
                        [
                            "Academic Ops Lead",
                            "Tutor Success Manager",
                            "Verification Manager",
                            "Partnership Specialist",
                            "Community Lead",
                        ]
                    ),
                    bio="Supports families and tutors with a strong education-first approach and consistent quality standards.",
                    image="https://images.unsplash.com/photo-1494790108377-be9c29b29330",
                    linkedin="https://www.linkedin.com",
                    display_order=index + 1,
                )
                for index in range(500)
            ]
        )

        Career.objects.bulk_create(
            [
                Career(
                    title=f"{random.choice(['Academic Coach', 'Operations Associate', 'Tutor Support Specialist', 'Verification Officer', 'Sales & Growth Executive'])} {i + 1}",
                    department=random.choice(
                        [
                            "Operations",
                            "Academics",
                            "Marketing",
                            "Partnerships",
                            "Support",
                        ]
                    ),
                    location=random.choice(["Dhaka", "Chittagong", "Sylhet", "Remote"]),
                    type=random.choice(["Full-time", "Part-time", "Contract"]),
                    experience=f"{random.randint(1, 4)}+ years",
                    deadline="Open until filled",
                    description="Support the platform with high-quality service operations, tutor onboarding, and family communication.",
                    responsibilities=[
                        "Maintain tutor quality workflow",
                        "Coordinate with guardians",
                        "Support onboarding and advisory tasks",
                    ],
                    requirements=[
                        "Strong communication skills",
                        "Comfortable with digital tools",
                        "Education-first mindset",
                    ],
                    is_active=True,
                )
                for i in range(500)
            ]
        )

        GalleryItem.objects.bulk_create(
            [
                GalleryItem(
                    title=f"{random.choice(['Campus Meetup', 'Annual Mentorship Event', 'Tutor Recognition Day', 'Academic Workshop', 'Student Success Event'])} {i + 1}",
                    caption="Community-driven education experiences built around confidence, quality learning, and better academic outcomes.",
                    image_url="https://images.unsplash.com/photo-1523240795612-9a054b0db644",
                    category=random.choice(
                        [
                            "Campus Drives",
                            "Workshops",
                            "Conferences",
                            "Community Events",
                        ]
                    ),
                    date=str(random.randint(2023, 2026)),
                )
                for i in range(500)
            ]
        )

        counts = {
            "users": User.objects.count(),
            "tutors": TutorProfile.objects.count(),
            "jobs": TuitionJob.objects.count(),
            "requirements": TutorRequirement.objects.count(),
            "reviews": Review.objects.count(),
            "applications": JobApplication.objects.count(),
            "testimonials": Testimonial.objects.count(),
            "blogs": BlogPost.objects.count(),
            "faq": FAQItem.objects.count(),
            "team": TeamMember.objects.count(),
            "careers": Career.objects.count(),
            "gallery": GalleryItem.objects.count(),
            "affiliates": AffiliatePartner.objects.count(),
        }

        self.stdout.write(self.style.SUCCESS(f"Seeding complete: {counts}"))
