import re
from datetime import datetime

from django.conf import settings
from django.contrib.auth.decorators import user_passes_test
from django.core.mail import send_mail
from django.shortcuts import render, redirect
from django.utils import timezone
from rest_framework import viewsets, permissions, generics, serializers, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from core import serializers, paginators, perms
from .models import Post, User, Comment, LikePost, LikeComment, Room, JoinRoom, LikeType, Role, Alumni, Group, \
    JoinGroup, Notification


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
        if self.action in ['add_post', 'add_comment', 'like', 'manage_comments', 'get_like', 'retrieve',
                           'get_users_likes']:
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
            if not post.block_comment:
                content = request.data.get('content')
                print(content)
                if not content:
                    return Response({"detail": "Content is required."},
                                    status=status.HTTP_400_BAD_REQUEST)

                c = Comment.objects.create(post=post,
                                           content=content,
                                           user=request.user)
                return Response(serializers.CommentSerializer(c).data,
                                status=status.HTTP_201_CREATED)
            return Response({'error': 'Post has block comment'}, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == 'GET':
            c = post.comment_set.filter(active=True).order_by('-created_date')
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
        p = request.user.post_set.filter(active=True).order_by('-created_date')

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
    serializer_class = serializers.UserDetailSerializer
    parser_classes = [MultiPartParser, ]

    def get_permissions(self):
        if self.action in ['current-user', 'list', 'retrieve', 'get_posts', 'get_posts_liked']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        return serializers.UserDetailSerializer

    def get_queryset(self):
        if self.request.user.is_superuser:
            return User.objects.all()
        return User.objects.filter(is_active=True)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        if request.user.is_superuser:
            serializer = self.get_serializer(queryset, many=True)
        else:
            serializer = serializers.UserDetailSerializer(queryset, many=True)

        return Response(serializer.data)

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                setattr(user, k, v)
            user.save()

        return Response(serializers.UserDetailSerializer(user).data)

    @action(methods=['get'], url_path='current-user/rooms', detail=False)
    def get_rooms(self, request):
        user = request.user
        rooms = JoinRoom.objects.filter(user=user)
        serializer = serializers.JoinRoomSerializer(rooms, many=True)
        return Response(serializer.data)

    @action(methods=['get'], url_path='current-user/groups', detail=False)
    def get_groups(self, request):
        user = request.user
        groups = JoinGroup.objects.filter(user=user)
        serializer = serializers.JoinGroupSerializer(groups, many=True)
        return Response(serializer.data)

    @action(methods=['get'], url_path='current-user/notifications', detail=False)
    # def get_notification(self, request):
    #     user = request.user
    #     groups = [Group.objects.get(id=join.group.id) for join in JoinGroup.objects.filter(user=user)]
    #     notifications = [Notification.objects.filter(group=group) for group in groups]
    #     notifications.append(Notification.objects.filter(group__isnull=True))
    #     serializerss = [serializers.NotificationSerializer(noti, many=True) for noti in notifications]
    #     return Response([serializer.data for serializer in serializerss][0])

    def get_notification(self, request):
        user = request.user
        groups = [Group.objects.get(id=join.group.id) for join in JoinGroup.objects.filter(user=user)]
        notifis = []
        for group in groups:
            serialize = serializers.NotificationSerializer(Notification.objects.filter(group=group), many=True).data
            print(serialize)
            if serialize:
                for noti in serialize:
                    notifis.append(noti)

        serialize = serializers.NotificationSerializer(Notification.objects.filter(group__isnull=True), many=True).data
        for noti in serialize:
            notifis.append(noti)

        print(notifis)
        # serializerss = [serializers.NotificationSerializer(noti, many=True) for noti in notifications]
        return Response(notifis)

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

    @action(methods=['patch'], url_path='current-user/change_password', detail=False)
    def change_password(self, request):
        user = request.user

        required_fields = ['current_password', 'new_password']
        missing_fields = [field for field in required_fields if not request.data.get(field)]
        if missing_fields:
            return Response({'error': f"{', '.join(missing_fields)} required"},
                            status=status.HTTP_400_BAD_REQUEST)
        new_password = request.data.get('new_password')
        current_password = request.data.get('current_password')
        if not user.check_password(current_password):
            return Response({'error': 'Wrong password'}, status=status.HTTP_400_BAD_REQUEST)
        if current_password == new_password:
            return Response({'message': 'New password must different old password'}, status=status.HTTP_400_BAD_REQUEST)

        # if len(new_password) < 8:
        #     return Response({'error': 'Password must be at least 8 characters long.'})
        # if sum(c.isdigit() for c in new_password) < 1:
        #     return Response({'error': 'Password must contain at least 1 number.'})
        # if not any(c.isupper() for c in new_password):
        #     return Response({'error': 'Password must contain at least 1 uppercase letter.'})
        # if not any(c.islower() for c in new_password):
        #     return Response({'error': 'Password must contain at least 1 lowercase letter.'})

        regex = re.compile(r'^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$')
        if not regex.match(new_password):
            return Response({
                'error': 'Password must be at least 8 characters long, '
                         'contain at least 1 number, 1 uppercase letter, and 1 lowercase letter.'
            }, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response(serializers.UserSerializer(user).data, status=status.HTTP_200_OK)


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
        # try:
        #     comment = self.get_object()
        #     comment.active = False
        #     comment.save()
        #     return Response({'status': 'Comment deactivated'})
        # except Comment.DoesNotExist:
        #     return Response(
        #         {'error': 'Comment not found'},
        #         status=status.HTTP_404_NOT_FOUND
        #     )
        try:
            comment = self.get_object()
            author_comment = comment.user()
            author_post = comment.post.user()
            if request.user == author_comment or request.user == author_post:
                comment.active = False
                comment.save()
                return Response({'status': 'Comment deactivate'})
        except Comment.DoesNotExist:
            return Response(
                {'error': 'Comment not found'},
                status=status.HTTP_400_BAD_REQUEST
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
        if self.action in ['add_message', 'add_room', 'get_messages', 'retrieve']:
            return [permissions.IsAuthenticated()]

        return [permission() for permission in self.permission_classes]

    def get_object(self):
        return Room.objects.get(pk=self.kwargs['pk'])

    def retrieve(self, request, pk=None):
        room = self.get_object()
        join_rooms = JoinRoom.objects.filter(room=room)
        users = [join_room.user for join_room in join_rooms]
        serializer = serializers.RoomSerializer(room)
        return Response({
            'room': serializer.data,
            'participants': serializers.UserSerializer(users, many=True).data
        })

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
                room = self.get_object()
                join_rooms = JoinRoom.objects.filter(room=room)
                users = [join_room.user for join_room in join_rooms]
                serializer = serializers.RoomSerializer(room)
                return Response({
                    'room': serializer.data,
                    'participants': serializers.UserSerializer(users, many=True).data
                })
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
    permission_classes = [permissions.AllowAny]


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
        avatar = request.FILES.get('avatar')
        role = Role.objects.get(pk=2)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        # if User.objects.filter(email=email).exists():
        #     return Response({'error': 'email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if first_name == last_name:
            return Response({'error': 'first name and last name must be different'})

        subject = 'Chào mừng tới Mạng Xã Hội Cựu Sinh Viên by HungTS and ngHung'
        message = (f'Chào mứng {first_name} {last_name} có {email} đến với Mạng Xã Hội Cựu Sinh Viên\n'
                   f'mật khẩu của bạn là @ou123\n'
                   f'Hãy đổi mật khẩu trong vòng 24 giờ.\n'
                   f'Nếu sau khoảng thời gian này bạn cần liên hệ với admin thông qua email này.\n'
                   f'Cảm ơn.')
        from_email = settings.EMAIL_HOST_USER
        recipient_list = [email]
        send_mail(subject, message, from_email, recipient_list, fail_silently=False)

        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email,
            avatar=avatar,
            role=role,
        )
        serializer = serializers.UserSerializer(user)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AlumniRegister(viewsets.ViewSet, generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
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
        avatar = request.FILES.get('avatar')
        cover_photo = None
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
            cover_photo=cover_photo,
            role=role,
            is_active=False
        )
        serializer = serializers.AlumniSerializer(alumni)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LoginViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def create(self, request):
        required_fields = ['username', 'password', 'role_id']
        missing_fields = [field for field in required_fields if not request.data.get(field)]

        if missing_fields:
            return Response({'error': f"{', '.join(missing_fields)} required"},
                            status=status.HTTP_400_BAD_REQUEST)

        username = request.data.get('username')
        password = request.data.get('password')
        role_id = request.data.get('role_id')

        try:
            user = User.objects.get(username=username)
            threshold_time = timezone.now() - timezone.timedelta(hours=24)
            if user:
                print(user)
                if not user.check_password(password):
                    return Response({'error': 'Sai mat khau'}, status=status.HTTP_400_BAD_REQUEST)

                if (int(role_id) == 1 and user.role.id == 1) or (int(role_id) == 0 and user.role.id == 0):
                    return Response(serializers.UserSerializer(user).data, status=status.HTTP_200_OK)
                elif (int(role_id) == 2 and user.role.id == 2):
                    if User.objects.filter(last_login__isnull=True, date_joined__lte=threshold_time,
                                           username=username, role=2, is_active=True).first():
                        user.is_active = False
                        user.save()
                        return Response({'error': 'Tai khoan da bi khoa'}, status=status.HTTP_400_BAD_REQUEST)
                    elif User.objects.filter(last_login__isnull=True, date_joined__lte=threshold_time,
                                             username=username, role=2, is_active=False).first():
                        return Response({'error': 'Bi khoa tai khoan roi'}, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        return Response(serializers.UserSerializer(user).data, status=status.HTTP_200_OK)
                else:
                    return Response({'error': 'Can not log in'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Bi khoa tai khoan roi'}, status=status.HTTP_400_BAD_REQUEST)


@user_passes_test(lambda u: u.is_superuser)
def pending_alumnis(request):
    pending_users = Alumni.objects.filter(is_active=False)
    return render(request, 'admin/pending_alumnis.html', {'pending_users': pending_users})


@user_passes_test(lambda u: u.is_superuser)
def approve_user(request, user_id):
    user = Alumni.objects.get(id=user_id)
    subject = 'Chấp nhận yêu cầu tham gia Mạng Xã Hội Cựu Sinh Viên by HungTS and ngHung'
    message = (
        f'Chào mứng {user.first_name} {user.last_name} có {user.email} và Mã số sinh viên {user.code} đến với Mạng Xã Hội Cựu Sinh Viên\n'
        f'Bạn đã được chấp nhận để truy cập vào hệ thống với username và password bạn đã tạo.\n'
        f'Cảm ơn.')
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [user.email]
    send_mail(subject, message, from_email, recipient_list, fail_silently=False)
    user.is_active = True
    user.save()
    return redirect('pending_alumnis')


@user_passes_test(lambda u: u.is_superuser)
def reject_user(request, user_id):
    user = Alumni.objects.get(id=user_id)
    user.delete()
    return redirect('pending_alumnis')


class GroupViewSet(viewsets.ViewSet,
                   generics.ListAPIView,
                   generics.UpdateAPIView,
                   generics.RetrieveAPIView):
    queryset = Group.objects.filter(active=True)
    serializer_class = serializers.GroupSerializer
    permission_classes = [perms.OwnerAuthenticated | perms.IsSuperUser]

    # pagination_class = paginators.RoomPaginator

    def get_permissions(self):
        if self.action in ['add_user', 'add_user_to_group', 'retrieve']:
            return [permissions.IsAuthenticated()]

        return [permission() for permission in self.permission_classes]

    def get_object(self):
        return Group.objects.get(pk=self.kwargs['pk'])

    def retrieve(self, request, pk=None):
        group = self.get_object()
        join_groups = JoinGroup.objects.filter(group=group)
        users = [join_group.user for join_group in join_groups]
        serializer = serializers.GroupSerializer(group)
        return Response({
            'group': serializer.data,
            'participants': serializers.UserSerializer(users, many=True).data
        })

    @action(methods=['post'], detail=False, url_path='create_group')
    def create_group(self, request):
        try:
            name = request.data.get('name')
            group = Group.objects.create(name=request.data.get('name'))
            list_user_id = request.data.get('list_user_id')
            print(type(list_user_id))
            if not name:
                return Response(
                    {'error': 'name is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not list_user_id:
                return Response(
                    {'error': 'list_user_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            for user_id in list_user_id:
                user = User.objects.get(id=user_id)
                if user:
                    group.add_user(user=user)
            return Response(
                {serializers.GroupSerializer(group).data},
                status=status.HTTP_200_OK
            )
        except Group.DoesNotExist:
            return Response(
                {'error': 'Group not found'},
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

    @action(methods=['post'], detail=True, url_path='create_chat_room')
    def add_chat_room(self, request, pk):
        group = self.get_object()

        if group.room:
            return Response(serializers.RoomSerializer(group.room).data, status=status.HTTP_200_OK)

        joins = JoinGroup.objects.filter(group=group)
        title_room = 'Room of group ' + group.name
        room = Room.objects.create(title=title_room, room_type='group')
        room.add_user(request.user)
        for join in joins:
            room.add_user(join.user)

        group.room = room
        group.save()

        return Response({
            'group': serializers.GroupSerializer(group).data,
            'room': serializers.RoomSerializer(room).data,
        }, status=status.HTTP_201_CREATED)


class NotificationViewSet(viewsets.ViewSet,
                          generics.ListAPIView,
                          generics.UpdateAPIView,
                          generics.RetrieveAPIView):
    queryset = Notification.objects.filter(active=True)
    serializer_class = serializers.NotificationSerializer
    permission_classes = [perms.OwnerAuthenticated | perms.IsSuperUser]

    def get_permissions(self):
        if self.action in ['retrieve']:
            return [permissions.IsAuthenticated()]
        if self.action in ['add_notification']:
            return [permissions.AllowAny()]

        return [permission() for permission in self.permission_classes]

    def get_object(self):
        return Notification.objects.get()

    def retrieve(self, request, pk=None):
        notification = self.get_object()
        serializer = serializers.NotificationSerializer(notification)
        return Response({serializer.data})

    @action(methods=['post'], detail=False, url_path='add_notification')
    def add_notification(self, request):
        required_fields = ['title', 'content', 'type']
        missing_fields = [field for field in required_fields if not request.data.get(field)]
        if missing_fields:
            return Response({'error': f"{', '.join(missing_fields)} required"},
                            status=status.HTTP_400_BAD_REQUEST)

        title = request.data.get('title')
        content = request.data.get('content')
        type = request.data.get('type')

        try:
            if type == 'group':
                group_id = request.data.get('group_id')
                if group_id:
                    group = Group.objects.get(id=group_id)
                    print(group)
                    n = Notification.objects.create(title=title, content=content, group=group)

                    emails = [User.objects.get(id=user.id).email for user in JoinGroup.objects.filter(group=group)]

                    subject = title
                    message = (f'{title}\n'
                               f'{content}\n'
                               f'Cảm ơn.')
                    from_email = settings.EMAIL_HOST_USER
                    recipient_list = emails
                    send_mail(subject, message, from_email, recipient_list, fail_silently=False)
                else:
                    n = Notification.objects.create(title=title, content=content)
                return Response(serializers.NotificationSerializer(n).data,
                                status=status.HTTP_201_CREATED)
            elif type == 'global':
                n = Notification.objects.create(title=title, content=content)

                emails = [User.objects.get(id=user.id).email for user in User.objects.all()]

                subject = title
                message = (f'{title}\n'
                           f'{content}\n'
                           f'Cảm ơn.')
                from_email = settings.EMAIL_HOST_USER
                recipient_list = emails
                send_mail(subject, message, from_email, recipient_list, fail_silently=False)
            elif type == 'individual':
                user_id = request.data.get('user_id')
                if user_id:
                    userr = User.objects.get(pk=user_id)
                    n = Notification.objects.create(title=title, content=content, user=userr)

                    email = User.objects.get(pk=user_id).email

                    subject = title
                    message = (f'{title}\n'
                               f'{content}\n'
                               f'Cảm ơn.')
                    from_email = settings.EMAIL_HOST_USER
                    recipient_list = [email]
                    send_mail(subject, message, from_email, recipient_list, fail_silently=False)
            # else:
            #     n = Notification.objects.create(title=title, content=content)
            return Response(serializers.NotificationSerializer(n).data,
                            status=status.HTTP_201_CREATED)
        except Group.DoesNotExist:
            return Response(
                {'error': 'Input invalid'},
                status=status.HTTP_404_NOT_FOUND
            )


@user_passes_test(lambda u: u.is_superuser)
def pending_lecturers(request):
    pending_lectures = User.objects.filter(is_active=False, role=2)
    print(pending_lectures)
    return render(request, 'admin/pending_lecturers.html', {'pending_lectures': pending_lectures})


@user_passes_test(lambda u: u.is_superuser)
def approve_lecturers(request, user_id):
    user = User.objects.get(id=user_id)
    subject = 'Khởi tạo mật khẩu tham gia Mạng Xã Hội Cựu Sinh Viên by HungTS and ngHung'
    message = (f'Chào mứng {user.first_name} {user.last_name} có {user.email} đến với Mạng Xã Hội Cựu Sinh Viên\n'
               f'mật khẩu của bạn là @ou123\n'
               f'Hãy đổi mật khẩu trong vòng 24 giờ.\n'
               f'Nếu sau khoảng thời gian này bạn cần liên hệ với admin thông qua email này.\n'
               f'Cảm ơn.')
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [user.email]
    send_mail(subject, message, from_email, recipient_list, fail_silently=False)
    user.is_active = True
    user.date_joined = datetime.now()
    user.save()
    return redirect('pending_lecturers')


@user_passes_test(lambda u: u.is_superuser)
def reject_lecturers(request, user_id):
    user = User.objects.get(id=user_id)
    user.delete()
    return redirect('pending_lecturers')