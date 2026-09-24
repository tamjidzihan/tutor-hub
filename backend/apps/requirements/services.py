from apps.tutors.models import TutorProfile

def calculate_tutor_matches(requirement):
    """
    Automated Matching Algorithm:
    Evaluates verified tutors against parent requirement specifications.
    Returns ranked list of tutors with percentage scores and explanation breakdown.
    """
    tutors = TutorProfile.objects.filter(is_available=True).select_related('user')
    scored_tutors = []

    req_subjects = [s.lower().strip() for s in (requirement.subjects or [])]
    req_city = (requirement.city or '').lower().strip()
    req_area = (requirement.area or '').lower().strip()
    req_gender = (requirement.preferred_tutor_gender or 'Any').strip()

    for tutor in tutors:
        score = 0
        reasons = []

        # 1. Subject Mastery Overlap (Max 35 points)
        tutor_subjects = [s.lower().strip() for s in (tutor.subjects or [])]
        matched_subjects = [s for s in req_subjects if any(s in ts or ts in s for ts in tutor_subjects)]
        if req_subjects and matched_subjects:
            subject_score = (len(matched_subjects) / len(req_subjects)) * 35
            score += subject_score
            reasons.append(f"Expertise in {', '.join([s.title() for s in matched_subjects])}")
        elif not req_subjects:
            score += 25

        # 2. Location Proximity (Max 25 points)
        tutor_city = (tutor.city or '').lower().strip()
        tutor_area = (tutor.area or '').lower().strip()
        tutor_pref_areas = [a.lower().strip() for a in (tutor.preferred_locations or [])]

        if req_city == tutor_city:
            score += 10
            if req_area == tutor_area or any(req_area in pa or pa in req_area for pa in tutor_pref_areas):
                score += 15
                reasons.append(f"Direct Location Match in {requirement.area or requirement.city}")
            else:
                score += 5
                reasons.append(f"Available in {requirement.city}")

        # 3. Gender Preference (Max 15 points)
        if req_gender in ['Any', '']:
            score += 15
        elif req_gender.lower() == tutor.gender.lower():
            score += 15
            reasons.append(f"Matches preferred {req_gender} tutor criteria")

        # 4. University Prestige / Academic Track Record (Max 15 points)
        uni = (tutor.university or '').upper()
        if any(top in uni for top in ['BUET', 'DMC', 'DU', 'DHAKA UNIVERSITY', 'IBA', 'NSU', 'SUST', 'CUET', 'RUET', 'KUET']):
            score += 15
            reasons.append(f"Top tier graduate: {tutor.university} ({tutor.department})")
        else:
            score += 10
            reasons.append(f"Graduated from {tutor.university}")

        # 5. Rating & Verification (Max 10 points)
        if tutor.is_verified:
            score += 5
            reasons.append("TutorHub ID & Degree Verified")
        
        rating_score = (float(tutor.rating) / 5.0) * 5
        score += rating_score

        final_score = min(int(round(score)), 99)

        if final_score >= 50:
            scored_tutors.append({
                'tutor_id': tutor.tutor_id,
                'name': tutor.user.full_name,
                'university': tutor.university,
                'department': tutor.department,
                'profile_photo': tutor.profile_photo_url or (tutor.user.profile_image.url if tutor.user.profile_image else 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'),
                'rating': float(tutor.rating),
                'score': final_score,
                'matching_reasons': reasons[:3]
            })

    scored_tutors.sort(key=lambda x: x['score'], reverse=True)
    return scored_tutors[:6]
