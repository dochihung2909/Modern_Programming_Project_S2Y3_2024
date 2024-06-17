from django.urls import path, include
from rest_framework import routers
from core import views

router = routers.DefaultRouter()
router.register('posts', views.PostViewSet, basename='posts')
router.register('users', views.UserViewSet, basename='users')
router.register('comments', views.CommentViewSet, basename='comments')
router.register('rooms', views.RoomViewSet, basename='rooms')
router.register('like_types', views.LikeTypeViewSet, basename='like_types')


urlpatterns = [
    path('', include(router.urls)),
]