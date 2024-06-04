from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django.contrib import admin
from django.contrib.auth.models import Permission, Group
from django import forms
from django.db.models import Count
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.html import strip_tags
from django.utils.safestring import mark_safe

from core.models import User, Post, Tag, Comment, LikePost, LikeComment, Role


class PostForm(forms.ModelForm):
    content = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Post
        fields = '__all__'


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


class LikePostAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'post_id']
    list_filter = ['user_id', 'post_id']


class LikeCommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'comment_id']
    list_filter = ['user_id', 'comment_id']


class MySocialMediaAdminSite(admin.AdminSite):
    site_header = 'eSocialMedia'


admin_site = MySocialMediaAdminSite(name='iSocialMedia')

admin_site.register(Group)
admin_site.register(Permission)

admin_site.register(Role, RoleAdmin)
admin_site.register(User, UserAdmin)
admin_site.register(Post, PostAdmin)
admin_site.register(Tag)
admin_site.register(Comment, CommentAdmin)
admin_site.register(LikePost, LikePostAdmin)
admin_site.register(LikeComment, LikeCommentAdmin)


