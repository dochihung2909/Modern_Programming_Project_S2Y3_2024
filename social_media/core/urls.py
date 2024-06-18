from django.urls import path, include
from rest_framework import routers
from core import views
from core.views import RestrictedView

router = routers.DefaultRouter()
router.register('posts', views.PostViewSet, basename='posts')
router.register('users', views.UserViewSet, basename='users')
router.register('comments', views.CommentViewSet, basename='comments')
router.register('rooms', views.RoomViewSet, basename='rooms')
router.register('like_types', views.LikeTypeViewSet, basename='like_types')
router.register('register_lecturer', views.LecturerRegister, basename='register_lecturer')
router.register('register_alumni', views.AlumniRegister, basename='register_alumni')
router.register('login', views.LoginViewSet, basename='login')

urlpatterns = [
    path('', include(router.urls)),
    path('api/restricted/', RestrictedView.as_view(), name='restricted'),
]