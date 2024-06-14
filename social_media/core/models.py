from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField
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
    avatar = CloudinaryField(null=False)
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
    image = CloudinaryField(null=False)
    tags = models.ManyToManyField(Tag, blank=True)

    def __str__(self):
        return f'{self.user_id} - {self.content[:50] + "..." if len(self.content) > 50 else self.content}'


class ItemBase(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)

    class Meta:
        abstract = True


class Interaction(BaseModel):
    user = models.ForeignKey(User, null=True, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, null=True, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class Comment(Interaction):
    content = models.CharField(max_length=255)

    def __str__(self):
        return f'{self.id} - {self.content[:50]}'


class LikeType(BaseModel):
    name = models.CharField(max_length=50)
    image = models.ImageField(upload_to='like_types/%Y/%m', null=True, blank=True)

    def __str__(self):
        return self.name


class Like(Interaction):
    active = models.BooleanField(default=True)
    like_type = models.ForeignKey(LikeType, on_delete=models.CASCADE, null=True)

    class Meta:
        abstract = True


class LikePost(Like):
    class Meta:
        unique_together = ('user', 'post', 'like_type')


class LikeComment(Like):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True)

    class Meta:
        unique_together = ('user', 'comment', 'like_type')


class Room(BaseModel):
    ROOM_TYPE_CHOICES = [
        ('individual', 'Individual'),
        ('group', 'Group'),
    ]
    title = models.CharField(max_length=50)
    room_type = models.CharField(max_length=15, choices=ROOM_TYPE_CHOICES, default='individual')

    def __str__(self):
        return self.title

    def add_user(self, user):
        if self.room_type == 'individual' and self.joinroom_set.count() >= 2:
            raise ValueError("Individual room can only have 2 users")
        JoinRoom.objects.create(room=self, user=user)


class Message(BaseModel):
    content = RichTextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user} - {self.room} - {self.content[:50]}"


class JoinRoom(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} in {self.room.title}"
