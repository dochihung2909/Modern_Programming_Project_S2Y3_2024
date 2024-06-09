from rest_framework import viewsets, permissions, generics, serializers, status, parsers
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from core import serializers, paginators, perms
from .models import Post, User, Comment, LikePost, LikeComment


class PostViewSet(viewsets.ViewSet,
                  generics.ListAPIView,
                  generics.RetrieveAPIView,
                  generics.UpdateAPIView,
                  generics.DestroyAPIView):
    queryset = Post.objects.filter(active=True)
    serializer_class = serializers.PostSerializer
    permission_classes = [perms.OwnerAuthenticated]

    def get_queryset(self):
        queryset = self.queryset

        if self.action.__eq__('list'):
            q = self.request.query_params.get('q')
            if q:
                queryset = queryset.filter(content__icontains=q)

            id = self.request.query_params.get('id')
            if id:
                queryset = queryset.filter(pk=id)
                queryset = queryset.filter(pk=id)
        return queryset

    def get_permissions(self):
        if self.action in ['add_post', 'add_comment']:
            return [permissions.IsAuthenticated()]

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

    @action(methods=['post'], url_path='comments', detail=True)
    def add_comment(self, request, pk):
        c = self.get_object().comment_set.create(content=request.data.get('content'),
                                                 user=request.user)
        return Response(serializers.CommentSerializer(c).data,
                        status=status.HTTP_201_CREATED)

    @action(methods=['post'], url_path='like', detail=True)
    def like(self, request, pk):
        like, created = LikePost.objects.get_or_create(user=request.user,
                                                       post=self.get_object())
        if not created:
            like.active = not like.active
            like.save()
        return Response(serializers.AuthenticatedPostDetailsSerializer(self.get_object(), context={'request': request}).data,
                        status=status.HTTP_200_OK)


class UserViewSet(viewsets.ViewSet,
                  generics.CreateAPIView,):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [MultiPartParser, ]

    def get_permissions(self):
        if self.action.__eq__('current-user'):
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                setattr(user, k, v)
            user.save()

        return Response(serializers.UserSerializer(user).data)


class CommentViewSet(viewsets.ViewSet,
                     generics.DestroyAPIView,
                     generics.UpdateAPIView,
                     generics.RetrieveAPIView):
    queryset = Comment.objects.all()
    serializer_class = serializers.CommentSerializer
    permission_classes = [perms.OwnerAuthenticated]

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
        c = request.user.post_set.filter(active=True)

        return Response(serializers.CommentSerializer(c, many=True).data)

