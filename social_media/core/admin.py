from django.contrib import admin
from core.models import User, Post, Tag, Comment

# Register your models here.
admin.site.register(User)
admin.site.register(Post)
admin.site.register(Tag)
# admin.site.register(LikePost)
# admin.site.register(LikeComment)
admin.site.register(Comment)
