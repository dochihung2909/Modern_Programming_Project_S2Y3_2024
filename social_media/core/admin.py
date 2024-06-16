from cloudinary.templatetags import cloudinary
from django.contrib import admin
from django.contrib.auth.models import Permission, Group
from django.db.models import Count
from django.http import JsonResponse
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.html import strip_tags
from django.utils.safestring import mark_safe

from core.forms import PostForm, LikeCommentAdminForm
from core.models import User, Post, Tag, Comment, LikePost, LikeComment, Role, LikeType, Room, Message,JoinRoom


class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'created_date', 'short_content', 'user_id']
    list_filter = ['user_id']
    search_fields = ['content']
    readonly_fields = ['img']
    form = PostForm

    def img(self, post):
        if post.image:
            return mark_safe(f"<img width='120' height='120' src='{post.image.url}' />")
        return "No Image"

    class Media:
        css = {
            'all': ('/static/admin/css/style.css',)
        }

    def short_content(self, obj):
        content = strip_tags(obj.content)
        return content[:50] + '...' if len(content) > 50 else content

    short_content.short_description = 'Content'


class RoleAdmin(admin.ModelAdmin):
    list_display = ['id', 'created_date', 'name']
    list_filter = ['name']
    search_fields = ['name']


class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'username']
    list_filter = ['role_id']
    search_fields = ['username']

    readonly_fields = ['avt']

    def avt(self, user):
        if user.avatar:
            return mark_safe(f"<img width='120' height='120' src='{user.avatar.url}' />")
        return "No Image"


class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'post_id', 'short_content']
    list_filter = ['user_id']
    search_fields = ['content']

    def short_content(self, obj):
        content = strip_tags(obj.content)
        return content[:50] + '...' if len(content) > 50 else content

    short_content.short_description = 'Content'


class LikeTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    readonly_fields = ['img']

    def img(self, liketype):
        if liketype.image:
            return mark_safe(f"<img width='120' height='120' src='{liketype.image.url}' />")
        return "No Image"


class LikePostAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'post_id', 'like_type']
    list_filter = ['user_id']


class LikeCommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'comment_id']
    list_filter = ['user_id']

    form = LikeCommentAdminForm

    class Media:
        js = ('admin/js/filter_comments.js',)

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('get-comments/', self.admin_site.admin_view(self.get_comments), name='get-comments'),
        ]
        return custom_urls + urls

    def get_comments(self, request):
        post_id = request.GET.get('post_id')
        comments = Comment.objects.filter(post_id=post_id).values('id', 'content')
        return JsonResponse({'comments': list(comments)})


class TagAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']


class RoomAdmin(admin.ModelAdmin):
    list_display = ['id', 'title']
    search_fields = ['title']


class JoinRoomAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'room_id']
    list_filter = ['user_id', 'room_id']


class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'content', 'user_id', 'room_id']
    list_filter = ['user_id', 'room_id']
    search_fields = ['content']


class MySocialMediaAdminSite(admin.AdminSite):
    site_header = 'eSocialMedia'

    def get_urls(self):
        return [path('stats/', self.stats_view)] + super().get_urls()

    def stats_view(self, request):
        post_user_stats = User.objects.annotate(c=Count('post__id')).values('id', 'username', 'c')
        return TemplateResponse(request, 'admin/stats.html', {
            'post_user_stats': post_user_stats
        })


admin_site = MySocialMediaAdminSite(name='iSocialMedia')

admin_site.register(Group)
admin_site.register(Permission)

admin_site.register(Role, RoleAdmin)
admin_site.register(User, UserAdmin)
admin_site.register(Post, PostAdmin)
admin_site.register(Tag, TagAdmin)
admin_site.register(Comment, CommentAdmin)
admin_site.register(LikePost, LikePostAdmin)
admin_site.register(LikeComment, LikeCommentAdmin)
admin_site.register(LikeType, LikeTypeAdmin)
admin_site.register(Room, RoomAdmin)
admin_site.register(Message, MessageAdmin)
admin_site.register(JoinRoom, JoinRoomAdmin)
