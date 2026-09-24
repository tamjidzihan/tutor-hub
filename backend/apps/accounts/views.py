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
        'refresh': str(refresh),
        'access': str(refresh.access_token),
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
        return Response({
            'user': UserSerializer(user).data,
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'message': 'Account created successfully'
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role')

        if not email or not password:
            return Response({'error': 'Please provide both email and password'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, email=email, password=password)
        if not user:
            # Check if user exists but has test role
            try:
                user = User.objects.get(email=email)
                if not user.check_password(password):
                    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if role and user.role != role:
            user.role = role
            user.save(update_fields=['role'])

        tokens = get_tokens_for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'message': 'Login successful'
        })

class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class SwitchRoleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        new_role = request.data.get('role')
        if new_role not in [r.value for r in User.Role]:
            return Response({'error': 'Invalid role specified'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        user.role = new_role
        user.save(update_fields=['role'])
        return Response({
            'user': UserSerializer(user).data,
            'message': f'Role successfully switched to {new_role}'
        })
