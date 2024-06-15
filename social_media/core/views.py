from django.contrib import messages
from django.core.files.storage import default_storage
from django.http import Http404
from django.shortcuts import render, redirect
from firebase_admin import auth
from pyrebase import pyrebase
from rest_framework import viewsets, permissions, generics, serializers, status, parsers
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from core import serializers, paginators, perms
from social_media.authentication import FirebaseAuthentication
from .models import Post, User, Comment, LikePost, LikeComment, Room, Message, JoinRoom


class PostViewSet(viewsets.ViewSet,
                  generics.ListAPIView,
                  generics.RetrieveAPIView,
                  generics.UpdateAPIView):
    queryset = Post.objects.filter(active=True)
    serializer_class = serializers.PostSerializer
    permission_classes = [perms.OwnerAuthenticated | perms.IsSuperUser]

    def get_queryset(self):
        queryset = self.queryset

        if self.action.__eq__('list'):
            q = self.request.query_params.get('q')
            if q:
                queryset = queryset.filter(content__icontains=q)

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

    @action(methods=['get'], url_path='current-user', detail=False)
    def get_posts(self, request):
        p = request.user.post_set.filter(active=True)

        return Response(serializers.PostDetailsSerializer(p, many=True).data)


class UserViewSet(viewsets.ViewSet,
                  generics.CreateAPIView,
                  generics.RetrieveAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [MultiPartParser, ]

    # def get_queryset(self):
    #     queryset = self.queryset
    #
    #     if self.action.__eq__('list'):
    #         id = self.request.query_params.get('id')
    #         if id:
    #             queryset = queryset.filter(pk=id)
    #             queryset = queryset.filter(pk=id)
    #     return queryset

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


class CommentViewSet(viewsets.ViewSet,
                     generics.UpdateAPIView,
                     generics.RetrieveAPIView,
                     generics.ListAPIView):
    queryset = Comment.objects.filter(active=True)
    serializer_class = serializers.CommentSerializer
    permission_classes = [perms.OwnerAuthenticated | perms.IsSuperUser]

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


class RoomViewSet(viewsets.ViewSet,
                  generics.ListAPIView,
                  generics.UpdateAPIView,
                  generics.RetrieveAPIView):
    queryset = Room.objects.filter(active=True)
    serializer_class = serializers.RoomSerializer
    permission_classes = [perms.OwnerAuthenticated | perms.IsSuperUser]

    def get_permissions(self):
        if self.action in ['add_message', 'add_room', 'get_messages']:
            return [permissions.IsAuthenticated()]

        return [permission() for permission in self.permission_classes]

    def get_object(self):
        return Room.objects.get(pk=self.kwargs['pk'])

    @action(methods=['get', 'post'], detail=True, url_path='messages')
    def get_messages(self, request, pk):
        room = self.get_object()

        if request.method == 'GET':
            m = room.message_set.filter(active=True)
            return Response(serializers.MessageSerializer(m, many=True).data)

        elif request.method == 'POST':
            m = self.get_object().message_set.create(content=request.data.get('content'),
                                                     user=request.user)
            return Response(serializers.MessageSerializer(m).data,
                            status=status.HTTP_201_CREATED)

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

# class JoinRoomViewSet(viewsets.ViewSet,
#                       generics.ListAPIView):
#     queryset = JoinRoom.objects.filter(active=True)
#     serializer_class =  = JoinRoomSerializer



def index(request):
    return render(request, 'social_media.html', {})


# Web app's Firebase configuration
config = {
    "apiKey": "AIzaSyDRly06IjCgkL0lcEP3hWpIecUyym1YbZE",
    "authDomain": "social-media-b2def.firebaseapp.com",
    "databaseURL": "https://social-media-b2def-default-rtdb.firebaseio.com",
    "projectId": "social-media-b2def",
    "storageBucket": "social-media-b2def.appspot.com",
    "messagingSenderId": "634240436590",
    "appId": "1:634240436590:web:691f9e91008112a012197f",
    "measurementId": "G-85V1MXGXQF"
}

# Initialise the Firebase connection and storage
firebase = pyrebase.initialize_app(config)
storage = firebase.storage()

# Configure file upload to Firebase Cloud Storage
# storage = firebase.storage()
# storage.child(PATH/DIRECTORY_ON_CLOUD).put(PATH_TO_LOCAL_IMAGE  )


# def main(request):
#     if request.method == 'POST':
#         file = request.FILES['file']
#         file_save = default_storage.save(file.name, file)
#         storage.child("files/" + file.name).put("media/" + file.name)
#         delete = default_storage.delete(file.name)
#         messages.success(request, "File upload in Firebase Storage successful")
#         return redirect('main')
#     else:
#         return render(request, 'main.html')


class ProtectedView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        content = {'message': 'This is a protected view'}
        return Response(content)


class FirebaseLoginView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        jwt_token = self.get_jwt_token_for_user(user)
        firebase_token = self.get_firebase_token(jwt_token)

        return Response({'firebase_token': firebase_token})

    def get_jwt_token_for_user(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def get_firebase_token(self, jwt_token):
        try:
            decoded_token = auth.verify_id_token(jwt_token)
            uid = decoded_token['uid']
            custom_token = auth.create_custom_token(uid)
            return custom_token.decode('utf-8')
        except Exception as e:
            return str(e)