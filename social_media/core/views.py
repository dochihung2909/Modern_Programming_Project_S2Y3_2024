from rest_framework import viewsets, permissions, generics, serializers, status, parsers
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from core import serializers, paginators, perms
from .models import Post, User, Comment, LikePost, LikeComment, Room, JoinRoom, LikeType


class PostViewSet(viewsets.ViewSet,
                  generics.ListAPIView,
                  generics.RetrieveAPIView):
    queryset = Post.objects.filter(active=True)
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
        if self.action in ['add_post', 'add_comment', 'like', 'manage_comments', 'get_like']:
            return [permissions.IsAuthenticated()]
        if self.action in ['delete_post']:
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
            c = post.comment_set.all()
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

        like, created = LikePost.objects.get_or_create(user=user, post=post, like_type=like_type)
        if not created:
            like.active = not like.active
            like.save()
            if not like.active:
                like.delete()

        response_data = serializers.AuthenticatedPostDetailsSerializer(self.get_object(), context={'request': request}).data

        return Response(response_data, status=status.HTTP_200_OK)

    @action(methods=['get'], url_path='current-user', detail=False)
    def get_posts(self, request):
        p = request.user.post_set.filter(active=True)

        return Response(serializers.PostDetailsSerializer(p, many=True).data)

    @action(methods=['get'], url_path='likes', detail=True)
    def get_like(self, request, pk):
        l = self.get_object().likepost_set.filter(active=True)
        return Response(serializers.LikePostSerializer(l, many=True).data)

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
        if self.action in ['current-user', 'list', 'retrieve']:
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


class CommentViewSet(viewsets.ViewSet,
                     generics.UpdateAPIView,
                     generics.RetrieveAPIView,
                     generics.ListAPIView):
    queryset = Comment.objects.filter(active=True)
    serializer_class = serializers.CommentSerializer
    permission_classes = [perms.OwnerAuthenticated | perms.IsSuperUser]
    pagination_class = paginators.CommentPaginator

    def get_permissions(self):
        if self.action in ['like']:
            return [permissions.IsAuthenticated()]

        return [permission() for permission in self.permission_classes]

    @action(methods=['post'], url_path='like', detail=True)
    def like(self, request, pk):
        c = self.get_object()
        like, created = LikeComment.objects.get_or_create(user=request.user,
                                                          comment=c)
        if not created:
            like.active = not like.active
            like.save()
        return Response(
            serializers.AuthenticatedCommentSerializer(c, context={'request': request}).data,
            status=status.HTTP_200_OK)

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


