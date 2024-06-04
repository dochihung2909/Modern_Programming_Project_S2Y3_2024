from rest_framework import serializers
from .models import Post, Tag, User, Comment, Like, LikePost, LikeComment


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class BaseSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField(source='image')
    tags = TagSerializer(many=True)

    def get_image(self, course):
        if course.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri('/static/%s' % course.image.name)
            return '/static/%s' % course.image.name


class PostSerializer(BaseSerializer):
    # image = serializers.SerializerMethodField(source='image')

    # def to_representation(self, instance):
    #     rep = super().to_representation(instance)
    #     rep['image'] = instance.image.url
    #
    #     return rep

    def get_image(self, post):
        if post.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri('/static/%s' % post.image.name)
            return '/static/%s' % post.image.name

    class Meta:
        model = Post
        fields = ['id', 'content', 'image', 'user']


class PostDetailsSerializer(PostSerializer):
    tags = TagSerializer(many=True)

    class Meta:
        model = PostSerializer.Meta.model
        fields = PostSerializer.Meta.fields + ['content', 'tags']


class AuthenticatedPostDetailsSerializer(PostDetailsSerializer):
    liked = serializers.SerializerMethodField()

    def get_liked(self, post):
        request = self.context.get('request')
        if request.user.is_authenticated:
            return post.likepost_set.filter(active=True).exists()
        # return post.likepost_set.filter(active=True).exists()

    class Meta:
        model = PostDetailsSerializer.Meta.model
        fields = PostDetailsSerializer.Meta.fields + ['liked']


class UserSerializer(serializers.ModelSerializer):
    # def to_representation(self, instance):
    #     rep = super().to_representation(instance)
    #     rep['avatar'] = instance.avatar.url
    #
    #     return rep

    def create(self, validated_data):
        data = validated_data.copy()

        user = User(**data)
        user.set_password(data["password"])
        user.save()

        return user

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'password', 'role', 'avatar']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Comment
        fields = ['id', 'content', 'user']
#
#
# class LikeSerializer(ItemSerializer):
#     class Meta:
#         model = Like
#         fields = ['id', 'name', 'image']
#
#
# class LikePostSerializer(LikeSerializer):
#
#     class Meta:
#         model = LikePost
#         fields = ['id', 'user', 'post', 'like']
#
#
# class LikeCommentSerializer(LikeSerializer):
#
#     class Meta:
#         model = LikeComment
#         fields = ['id', 'user', 'like', 'comment']
