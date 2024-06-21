from django.db.models import Count
from .models import User


def count_post_by_user():
    return User.objects.annotate(c=Count('post__id')).values('id', 'username', 'c')
