from django.urls import path, include, re_path
from rest_framework import routers

from core import views

router = routers.DefaultRouter()
router.register('posts', views.PostViewSet)
router.register('users', views.UserViewSet)
router.register('comments', views.CommentViewSet)
# router.register('likes', views.LikeViewSet)
# router.register('like_posts', views.LikePostViewSet)
# router.register('like_comments', views.LikeCommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]