from ckeditor.fields import RichTextField
from django.contrib.auth.models import AbstractUser
from django.db import models


class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True, null=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class Role(BaseModel):
    id = models.PositiveIntegerField(primary_key=True)
    name = models.CharField(max_length=50)

    def __str__(self):
        return f'{self.id} - {self.name}'


class User(AbstractUser):
    avatar = models.ImageField(upload_to='users/%Y/%m', null=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)


class Tag(BaseModel):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class ItemBase(BaseModel):
    tags = models.ManyToManyField(Tag, blank=True)

    class Meta:
        abstract = True


class Post(ItemBase):
    content = RichTextField()
    image = models.ImageField(upload_to='posts/%Y/%m', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.user_id} - {self.content[:50] + '...' if len(self.content) > 50 else self.content}'


class ItemBase(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True)

    class Meta:
        abstract = True


class Comment(ItemBase):
    content = models.CharField(max_length=255)

    def __str__(self):
        return f'{self.user_id} - {self.content[:50]}'


class Like(BaseModel):
    name = models.CharField(max_length=50, null=True)
    image = models.ImageField(upload_to='likes/%Y/%m', null=True, blank=True)


class Interaction(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    like = models.ForeignKey(Like, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class LikePost(Interaction):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'post')


class LikeComment(Interaction):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'comment')





