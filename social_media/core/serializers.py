from rest_framework import serializers
from .models import Post, Tag, User, Comment, Room, Message, JoinRoom, Like, LikeType, LikePost


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class PostSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['image'] = instance.image.url

        return rep

    def get_image(self, post):
        if post.image:
            request = self.context.get('request')
            rep = super().to_representation(post)
            rep['image'] = post.image.url
            if request:
                return request.build_absolute_uri(rep)
            return rep

    class Meta:
        model = Post
        fields = ['id', 'content', 'image', 'user', 'created_date']


class PostDetailsSerializer(PostSerializer):
    tags = TagSerializer(many=True)

    class Meta:
        model = PostSerializer.Meta.model
        fields = PostSerializer.Meta.fields + ['tags']


class LikeSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['image'] = instance.avatar.url

        return rep

    def get_avatar(self, user):
        if user.avatar:
            request = self.context.get('request')
            rep = super().to_representation(user)
            rep['image'] = user.avatar.url
            if request:
                return request.build_absolute_uri(rep)
            return rep

    class Meta:
        model = Like
        fields = ['id', 'like_type', 'post']


class LikeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LikeType
        fields = ['id', 'name', 'image']


class UserCustomSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'avatar', 'role']


class LikePostSerializer(serializers.ModelSerializer):
    user = UserCustomSerializer()
    post = PostSerializer()

    class Meta:
        model = LikePost
        fields = ['id', 'user', 'post', 'like_type']


class AuthenticatedPostDetailsSerializer(PostDetailsSerializer):
    liked = serializers.SerializerMethodField()
    like_type = serializers.SerializerMethodField()

    def get_liked(self, post):
        request = self.context.get('request')
        if request.user.is_authenticated:
            return post.likepost_set.filter(user=request.user, active=True).exists()

    def get_like_type(self, post):
        request = self.context.get('request')
        if request.user.is_authenticated:
            like = post.likepost_set.filter(user=request.user, active=True).first()
            if like:
                return LikeTypeSerializer(like.like_type).data
        return None

    class Meta:
        model = PostDetailsSerializer.Meta.model
        fields = PostDetailsSerializer.Meta.fields + ['liked', 'like_type']


class UserSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['avatar'] = instance.avatar.url

        return rep

    def get_avatar(self, user):
        if user.avatar:
            request = self.context.get('request')
            rep = super().to_representation(user)
            rep['avatar'] = user.avatar.url
            if request:
                return request.build_absolute_uri(rep)
            return rep

    def create(self, validated_data):
        data = validated_data.copy()

        user = User(**data)
        user.set_password(data["password"])
        user.save()

        return user

    def validate(self, data):
        if data.get('first_name') == data.get('last_name'):
            raise serializers.ValidationError("First and last names must be different.")
        password = data.get('password')
        if password and len(password) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        username = data.get('username')
        if (password and username) and (username in password):
            raise serializers.ValidationError("Password cannot contain the username.")
        return data

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'password', 'role', 'avatar']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }


# class AlumniSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Alumni

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Comment
        fields = ['id', 'content', 'post_id', 'user', 'created_date']


class AuthenticatedCommentSerializer(CommentSerializer):
    liked = serializers.SerializerMethodField()

    def get_liked(self, comment):
        request = self.context.get('request')
        if request.user.is_authenticated:
            return comment.likecomment_set.filter(active=True).exists()

    class Meta:
        model = CommentSerializer.Meta.model
        fields = CommentSerializer.Meta.fields + ['liked']


class LikeType(serializers.ModelSerializer):
    class Meta:
        model = LikeType
        fields = ['id', 'name', 'image']


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'title', 'room_type']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'content', 'user_id', 'room_id']


class JoinRoomSerializer(serializers.ModelSerializer):
    user = UserCustomSerializer()
    room = RoomSerializer()

    class Meta:
        model = JoinRoom
        fields = ['id', 'user', 'room']


