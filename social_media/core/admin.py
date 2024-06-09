from django.contrib import admin
from django.contrib.auth.models import Permission, Group
from django.db.models import Count
from django.http import JsonResponse
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.html import strip_tags
from django.utils.safestring import mark_safe

from core.forms import PostForm, LikeCommentAdminForm
from core.models import User, Post, Tag, Comment, LikePost, LikeComment, Role, LikeType


class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'created_date', 'short_content', 'user_id']
    list_filter = ['user_id']
    search_fields = ['content']
    readonly_fields = ['img']
    form = PostForm

    def img(self, course):
        if course:
            return mark_safe(
                '<img src="/static/{url}" width="120" />' \
                    .format(url=course.image.name)
            )

    class Media:
        css = {
            'all': ('/static/css/style.css',)
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


class LikePostAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'post_id']
    list_filter = ['user_id', 'post_id']


class LikeCommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'comment_id']
    list_filter = ['user_id', 'comment_id']

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



