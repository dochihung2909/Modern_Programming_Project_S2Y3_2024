from ckeditor.fields import RichTextField
from django.contrib.auth.models import AbstractUser
from django.db import models


class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True, null=True)
    active = models.BooleanField(default=False)

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

    def __str__(self):
        return self.username


class Alumni(User):
    code = models.CharField(max_length=50)

    def __str__(self):
        return f'{self.code} - {self.username}'


class Tag(BaseModel):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Post(BaseModel):
    content = RichTextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    image = models.ImageField(upload_to='images/%Y/%m', null=True)
    tags = models.ManyToManyField(Tag)

    def __str__(self):
        return f'{self.user_id} - {self.content[:50] + '...' if len(self.content) > 50 else self.content}'


class ItemBase(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)

    class Meta:
        abstract = True


class Comment(ItemBase):
    content = models.CharField(max_length=255)

    def __str__(self):
        return f'{self.user_id} - {self.content[:50]}'


class Interaction(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, null=True, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class Comment(Interaction):
    content = models.CharField(max_length=255, null=True)


class LikeType(BaseModel):
    name = models.CharField(max_length=50)
    image = models.ImageField(upload_to='like_types/%Y/%m', null=True)

    def __str__(self):
        return self.name


class Like(Interaction):
    active = models.BooleanField(default=True)
    like_type = models.ForeignKey(LikeType, on_delete=models.CASCADE, null=True)

    # class Meta:
    #     abstract = True


class LikePost(Like):
    class Meta:
        unique_together = ('user', 'post', 'like_type')


class LikeComment(Like):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True)

    class Meta:
        unique_together = ('user', 'comment', 'like_type')
