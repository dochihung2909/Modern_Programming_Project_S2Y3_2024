from django.db.models import Q
from rest_framework import viewsets, permissions, generics, serializers, status, parsers
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken

from core import serializers, paginators, perms
from .models import Post, User, Comment, LikePost, LikeComment, Room, JoinRoom, LikeType, Role, Alumni


class PostViewSet(viewsets.ViewSet,
                  generics.ListAPIView,
                  generics.RetrieveAPIView,
                  generics.UpdateAPIView):
    queryset = Post.objects.filter(active=True).order_by('-created_date')
    serializer_class = serializers.PostSerializer
    permission_classes = [perms.OwnerAuthenticated | perms.IsSuperUser]
    pagination_class = paginators.PostPaginator

    def get_queryset(self):
        queryset = self.queryset

        if self.action.__eq__('list'):
            q = self.request.query_params.get('q')
            if q:
                queryset = queryset.filter(content__icontains=q)

        return queryset

    def get_permissions(self):
        if self.action in ['add_post', 'add_comment', 'like', 'manage_comments', 'get_like', 'retrieve', 'get_users_likes']:
            return [permissions.IsAuthenticated()]
        if self.action in ['delete_post', 'update']:
            return [perms.OwnerAuthenticated()]

        return [permission() for permission in self.permission_classes]

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return serializers.AuthenticatedPostDetailsSerializer
        return self.serializer_class

    @action(methods=['post'], url_path='add_post', detail=False)
    def add_post(self, request):
        p = Post.objects.create(user=request.user,
                                content=request.data.get('content'),
                                image=request.data.get('image'))
        return Response(serializers.PostSerializer(p).data,
                        status=status.HTTP_201_CREATED)

    @action(methods=['post', 'get'], detail=True, url_path='comments')
    def manage_comments(self, request, pk):
        post = self.get_object()

        if request.method == 'POST':
            content = request.data.get('content')
            if not content:
                return Response({"detail": "Content is required."},
                                status=status.HTTP_400_BAD_REQUEST)

            c = Comment.objects.create(post=post,
                                       content=content,
                                       user=request.user)
            return Response(serializers.CommentSerializer(c).data,
                            status=status.HTTP_201_CREATED)

        elif request.method == 'GET':
            c = post.comment_set.filter(active=True)
            serializer = serializers.CommentSerializer(c, many=True)
            return Response(serializer.data,
                            status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='like', detail=True)
    def like(self, request, pk=None):
        user = request.user
        post = self.get_object()
        like_type_id = request.data.get('like_type_id')

        if not like_type_id:
            return Response({'error': 'like_type_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            like_type = LikeType.objects.get(id=like_type_id)
        except LikeType.DoesNotExist:
            return Response({'error': 'Invalid like_type_id.'}, status=status.HTTP_400_BAD_REQUEST)

        liked = LikePost.objects.filter(user=user, post=post).first()

        if liked:
            if liked.like_type == like_type:
                liked.active = not liked.active
                if not liked.active:
                    liked.delete()
                else:
                    liked.save()
            else:
                liked.like_type = like_type
                liked.active = True
                liked.save()
        else:
            LikePost.objects.create(user=user, post=post, like_type=like_type, active=True)

        response_data = serializers.AuthenticatedPostDetailsSerializer(self.get_object(),
                                                                       context={'request': request}).data
        return Response(response_data, status=status.HTTP_200_OK)

    @action(methods=['get'], url_path='current-user', detail=False)
    def get_posts(self, request):
        p = request.user.post_set.filter(active=True)

        return Response(serializers.PostDetailsSerializer(p, many=True).data)

    @action(detail=True, methods=['get'], url_path='likes')
    def get_users_likes(self, request, pk=None):
        post = self.get_object()
        likes = LikePost.objects.filter(post=post)
        users = [like.user for like in likes]
        serializer = serializers.UserSerializer(users, many=True)
        return Response({
            'post': serializers.PostSerializer(post).data,
            'users': serializer.data
        }, status=status.HTTP_200_OK)

    @action(methods=['patch'], detail=True, permission_classes=[perms.OwnerAuthenticated])
    def delete(self, request, pk):
        try:
            post = self.get_object()
            post.active = False
            post.save()
            return Response({'status': 'Post deactivated'})
        except Post.DoesNotExist:
            return Response(
                {'error': 'Post not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class UserViewSet(viewsets.ViewSet,
                  generics.CreateAPIView,
                  generics.RetrieveAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [MultiPartParser, ]

    def get_permissions(self):
        if self.action in ['current-user', 'list', 'retrieve', 'get_posts', 'get_posts_liked']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.user.is_superuser:
            return serializers.UserSerializer
        return serializers.UserCustomSerializer

    def get_queryset(self):
        if self.request.user.is_superuser:
            return User.objects.all()
        return User.objects.filter(is_active=True)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        if request.user.is_superuser:
            serializer = self.get_serializer(queryset, many=True)
        else:
            serializer = serializers.UserCustomSerializer(queryset, many=True)

        return Response(serializer.data)

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                setattr(user, k, v)
            user.save()

        return Response(serializers.UserSerializer(user).data)

    @action(methods=['get'], url_path='current-user/rooms', detail=False)
    def get_rooms(self, request):
        user = request.user
        rooms = JoinRoom.objects.filter(user=user)
        serializer = serializers.JoinRoomSerializer(rooms, many=True)
        return Response(serializer.data)

    @action(methods=['get'], url_path='posts', detail=True)
    def get_posts(self, request, pk):
        user = self.get_object()
        p = Post.objects.filter(user=user)
        serializer = serializers.PostSerializer(p, many=True)
        return Response(serializer.data)

    @action(methods=['post'], url_path='current-user/add_room', detail=False)
    def create_room(self, request):
        user = request.user
        target_user_id = request.data.get('target_user_id')
        if not target_user_id:
            return Response({'error': 'target_user_id required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.get(pk=target_user_id)
        except User.DoesNotExist:
            return Response({'error': 'Target user does not exist.'}, status=status.HTTP_400_BAD_REQUEST)

        if user == target_user:
            return Response({'error': 'You cannot create a room with yourself'}, status=status.HTTP_400_BAD_REQUEST)

        common_rooms = JoinRoom.objects.filter(
            room_id__in=JoinRoom.objects.filter(user=user).values('room_id')
        ).filter(user=target_user)

        if common_rooms.exists():
            room = common_rooms.first().room
            room_serializer = serializers.RoomSerializer(room)
            users_serializer = serializers.UserSerializer([user, target_user], many=True)
            return Response({
                'room': room_serializer.data,
                'users': users_serializer.data
            }, status=status.HTTP_200_OK)

        room_name = f"{user.username}_{target_user.username}"
        room = Room.objects.create(title=room_name)

        JoinRoom.objects.create(user=user, room=room)
        JoinRoom.objects.create(user=target_user, room=room)

        return Response({'message': 'Room created successfully'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='posts_liked')
    def get_posts_liked(self, request, pk):
        user = self.get_object()
        liked_posts = Post.objects.filter(likepost__user=user, likepost__active=True)
        serializer = serializers.AuthenticatedPostDetailsSerializer(liked_posts, many=True,
                                                                    context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class CommentViewSet(viewsets.ViewSet,
                     generics.UpdateAPIView,
                     generics.RetrieveAPIView,
                     generics.ListAPIView):
    queryset = Comment.objects.filter(active=True).order_by('-created_date')
    serializer_class = serializers.CommentSerializer
    permission_classes = [perms.OwnerAuthenticated | perms.IsSuperUser]
    pagination_class = paginators.CommentPaginator

    def get_permissions(self):
        if self.action in ['like', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permission() for permission in self.permission_classes]

    @action(methods=['post'], url_path='like', detail=True)
    def like(self, request, pk=None):
        user = request.user
        c = self.get_object()
        like_type_id = request.data.get('like_type_id')

        if not like_type_id:
            return Response({'error': 'like_type_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            like_type = LikeType.objects.get(id=like_type_id)
        except LikeType.DoesNotExist:
            return Response({'error': 'Invalid like_type_id.'}, status=status.HTTP_400_BAD_REQUEST)

        liked = LikeComment.objects.filter(user=user, comment=c).first()

        if liked:
            if liked.like_type == like_type:
                liked.active = not liked.active
                if not liked.active:
                    liked.delete()
                else:
                    liked.save()
            else:
                liked.like_type = like_type
                liked.active = True
                liked.save()
        else:
            LikeComment.objects.create(user=user, comment=c, like_type=like_type, active=True)

        response_data = serializers.AuthenticatedCommentSerializer(self.get_object(),
                                                                   context={'request': request}).data
        return Response(response_data, status=status.HTTP_200_OK)

    @action(methods=['get'], url_path='current-user', detail=False)
    def get_comments(self, request):
        c = request.user.comment_set.filter(active=True)

        return Response(serializers.CommentSerializer(c, many=True).data)

    @action(methods=['patch'], detail=True, permission_classes=[perms.OwnerAuthenticated])
    def delete(self, request, pk):
        try:
            comment = self.get_object()
            comment.active = False
            comment.save()
            return Response({'status': 'Comment deactivated'})
        except Comment.DoesNotExist:
            return Response(
                {'error': 'Comment not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class RoomViewSet(viewsets.ViewSet,
                  generics.ListAPIView,
                  generics.UpdateAPIView,
                  generics.RetrieveAPIView):
    queryset = Room.objects.filter(active=True)
    serializer_class = serializers.RoomSerializer
    permission_classes = [perms.OwnerAuthenticated | perms.IsSuperUser]
    pagination_class = paginators.RoomPaginator

    def get_permissions(self):
        if self.action in ['add_message', 'add_room', 'get_messages']:
            return [permissions.IsAuthenticated()]

        return [permission() for permission in self.permission_classes]

    def get_object(self):
        return Room.objects.get(pk=self.kwargs['pk'])

    @action(methods=['post'], detail=False, url_path='add_room')
    def add_room(self, request):
        r = Room.objects.create(title=request.data.get('title'))
        return Response(serializers.RoomSerializer(r).data,
                        status=status.HTTP_201_CREATED)

    @action(methods=['post'], detail=True, url_path='add_user')
    def add_user_to_room(self, request, pk):
        try:
            room = self.get_object()
            user_id = request.data.get('user_id')
            if not user_id:
                return Response(
                    {'error': 'user_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user = User.objects.get(id=user_id)
            if JoinRoom.objects.filter(user=user, room=room).exists():
                return Response(
                    {'error': 'User is already in the room'}
                )
            room.add_user(user)
            return Response(
                {'message': 'User added to room successfully'},
                status=status.HTTP_200_OK
            )
        except Room.DoesNotExist:
            return Response(
                {'error': 'Room not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {'error': {str(e)}},
                status=status.HTTP_400_BAD_REQUEST
            )


class LikeTypeViewSet(viewsets.ViewSet,
                      generics.ListAPIView):
    queryset = LikeType.objects.filter(active=True)
    serializer_class = serializers.LikeTypeSerializer


class RestrictedView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(data={"message": "You have access to this restricted content."})


class LecturerRegister(viewsets.ViewSet, generics.CreateAPIView):
    permission_classes = [perms.IsSuperUser]
    serializer_class = serializers.UserSerializer

    def create(self, request):
        required_fields = ['username', 'first_name', 'last_name', 'email', 'avatar']
        missing_fields = [field for field in required_fields if not request.data.get(field)]

        if missing_fields:
            return Response({'error': f"{', '.join(missing_fields)} required"},
                            status=status.HTTP_400_BAD_REQUEST)

        username = request.data.get('username')
        password = 'ou@123'
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        email = request.data.get('email')
        avatar = request.data.get('avatar')
        role = Role.objects.get(pk=2)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if first_name == last_name:
            return Response({'error': 'first name and last name must be different'})

        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email,
            avatar=avatar,
            role=role
        )
        serializer = serializers.UserSerializer(user)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AlumniRegister(viewsets.ViewSet, generics.CreateAPIView):
    permission_classes = [perms.IsSuperUser]
    serializer_class = serializers.AlumniSerializer

    def create(self, request):
        required_fields = ['username', 'password', 'first_name', 'last_name', 'email', 'code', 'avatar']
        missing_fields = [field for field in required_fields if not request.data.get(field)]

        if missing_fields:
            return Response({'error': f"{', '.join(missing_fields)} required"},
                            status=status.HTTP_400_BAD_REQUEST)

        username = request.data.get('username')
        password = request.data.get('password')
        code = request.data.get('code')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        email = request.data.get('email')
        avatar = request.data.get('avatar')
        role = Role.objects.get(pk=1)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if Alumni.objects.filter(code=code).exists():
            return Response({'error': 'code already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if first_name == last_name:
            return Response({'error': 'first name and last name must be different'})
        if len(password) < 8:
            return Response({'error': 'Password must be at least 8 characters long.'})
        if sum(c.isdigit() for c in password) < 1:
            return Response({'error': 'Password must contain at least 1 number.'})
        if not any(c.isupper() for c in password):
            return Response({'error': 'Password must contain at least 1 uppercase letter.'})
        if not any(c.islower() for c in password):
            return Response({'error': 'Password must contain at least 1 lowercase letter.'})
        if (password and username) and (username in password):
            raise serializers.ValidationError("Password cannot contain the username.")

        alumni = Alumni.objects.create_user(
            username=username,
            password=password,
            code=code,
            first_name=first_name,
            last_name=last_name,
            email=email,
            avatar=avatar,
            role=role
        )
        serializer = serializers.AlumniSerializer(alumni)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LoginViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def create(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        role_id = request.data.get('role_id')

        if not username:
            return Response({'error': 'username required'}, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return Response({'error': 'password required'}, status=status.HTTP_400_BAD_REQUEST)
        if not role_id:
            return Response({'error': 'role_id required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(password):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

        if user.role is None or user.role.id != int(role_id):
            return Response({'error': 'Role does not match user'}, status=status.HTTP_400_BAD_REQUEST)

        if int(role_id) == 1:
            alumni = Alumni.objects.get(pk=user.id)
            serializer = serializers.AlumniSerializer(alumni)
        elif int(role_id) == 2:
            serializer = serializers.UserSerializer(user)
        else:
            return Response({'error': 'Invalid role_id'}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': serializer.data
        }, status=status.HTTP_200_OK)

