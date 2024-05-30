from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django.contrib import admin
from django import forms
from django.db.models import Count
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.html import strip_tags
from core.models import User, Post, Tag, Comment, Like, LikePost, LikeComment, Role


class PostForm(forms.ModelForm):
    content = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Post
        fields = '__all__'


class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'created_date', 'short_content', 'user_id']
    list_filter = ['user_id']
    search_fields = ['content']
    form = PostForm

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


class LikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']


class LikePostAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'post_id']
    list_filter = ['user_id', 'post_id']


class LikeCommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'comment_id']
    list_filter = ['user_id', 'comment_id']


class SocialMediaAppAdminSite(admin.AdminSite):
    site_header = 'HỆ THỐNG MẠNG XÃ HỘI CHO CỰU SINH VIÊN'

    def get_urls(self):
        return [path('post-stats/', self.stats_view)] + super().get_urls()

    def stats_view(self, request):
        c = Post.objects.filter(active=True).count()
        stats = Post.objects \
            .annotate(user_count=Count('id')) \
            .values('id', 'content', 'user_count')
        post_stats = User.objects.annotate(c=Count('post__id')).values('id', 'username', 'c')
        return TemplateResponse(request, 'admin/stats.html', {
            "post_stats": post_stats
        })


admin_site = SocialMediaAppAdminSite(name='socialMedia')

admin_site.register(User, UserAdmin)
admin_site.register(Post, PostAdmin)
admin_site.register(Tag)
admin_site.register(LikePost, LikePostAdmin)
admin_site.register(LikeComment, LikeCommentAdmin)
admin_site.register(Comment, CommentAdmin)
admin_site.register(Role, RoleAdmin)
admin_site.register(Like, LikeAdmin)
