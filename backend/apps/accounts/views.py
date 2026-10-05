from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response(
            {
                "user": UserSerializer(user, context={"request": request}).data,
                "access": tokens["access"],
                "refresh": tokens["refresh"],
                "message": "Account created successfully",
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        role = request.data.get("role")

        if not email or not password:
            return Response(
                {"error": "Please provide both email and password"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, email=email, password=password)
        if not user:
            # Check if user exists but has test role
            try:
                user = User.objects.get(email=email)
                if not user.check_password(password):
                    return Response(
                        {"error": "Invalid credentials"},
                        status=status.HTTP_401_UNAUTHORIZED,
                    )
            except User.DoesNotExist:
                return Response(
                    {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
                )

        if role and user.role != role:
            return Response(
                {"error": "The requested role does not match this account."},
                status=status.HTTP_403_FORBIDDEN,
            )

        tokens = get_tokens_for_user(user)
        return Response(
            {
                "user": UserSerializer(user, context={"request": request}).data,
                "access": tokens["access"],
                "refresh": tokens["refresh"],
                "message": "Login successful",
            }
        )


from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from apps.common.image_utils import optimize_profile_image


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user


class AvatarUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = (
            request.FILES.get("profile_image")
            or request.FILES.get("file")
            or request.FILES.get("image")
            or request.FILES.get("avatar")
        )
        if not file:
            return Response(
                {"error": "No image file provided in request."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        optimized = optimize_profile_image(file)
        user = request.user

        if user.profile_image:
            try:
                user.profile_image.delete(save=False)
            except Exception:
                pass

        user.profile_image = optimized
        user.save(update_fields=["profile_image"])

        if user.role == User.Role.TUTOR:
            from apps.tutors.models import TutorProfile

            tutor_profile = TutorProfile.objects.filter(user=user).first()
            if tutor_profile:
                tutor_profile.profile_photo_url = (
                    user.profile_image.url if user.profile_image else ""
                )
                tutor_profile.save(update_fields=["profile_photo_url"])

        return Response(
            {
                "message": "Profile photo uploaded and optimized successfully.",
                "user": UserSerializer(user, context={"request": request}).data,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request):
        user = request.user
        if user.profile_image:
            try:
                user.profile_image.delete(save=False)
            except Exception:
                pass
            user.profile_image = None
            user.save(update_fields=["profile_image"])

        if user.role == User.Role.TUTOR:
            from apps.tutors.models import TutorProfile

            tutor_profile = TutorProfile.objects.filter(user=user).first()
            if tutor_profile:
                tutor_profile.profile_photo_url = ""
                tutor_profile.save(update_fields=["profile_photo_url"])

        return Response(
            {
                "message": "Profile photo removed.",
                "user": UserSerializer(user, context={"request": request}).data,
            },
            status=status.HTTP_200_OK,
        )


class SwitchRoleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response(
            {"error": "Role changes are managed by administrators."},
            status=status.HTTP_403_FORBIDDEN,
        )
