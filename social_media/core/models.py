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
    cover_photo = CloudinaryField(null=True)
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
    block_comment = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.id} - {self.content[:50]}'


class Comment(BaseModel):
    content = models.CharField(max_length=255)
    user = models.ForeignKey(User, null=True, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, null=True, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.id} - {self.content[:50]}'

    def get_sub_comments(self):
        return self.comment_set.all()


class LikeType(BaseModel):
    id = models.PositiveIntegerField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)
    image = CloudinaryField(null=False)

    def __str__(self):
        return self.name


class Like(BaseModel):
    like_type = models.ForeignKey(LikeType, on_delete=models.CASCADE, null=False)
    user = models.ForeignKey(User, null=True, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class LikePost(Like):
    post = models.ForeignKey(Post, null=True, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'post')


class LikeComment(Like):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True)

    class Meta:
        unique_together = ('user', 'comment')


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

    class Meta:
        unique_together = ('user', 'room')


class Survey(BaseModel):
    title = models.CharField(max_length=50)
    description = models.TextField()

    def __str__(self):
        return self.title


class Question(BaseModel):
    text = models.CharField(max_length=255)

    def __str__(self):
        return self.text[:50]


class UserResponse(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.user.username} - {self.survey.title}'


class Answer(BaseModel):
    CHOICES = [
        (0, 'Agree'),
        (1, 'Neutral'),
        (2, 'Disagree')
    ]
    user_response = models.ForeignKey(UserResponse, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    choice = models.IntegerField(choices=CHOICES)


class Group(BaseModel):
    name = models.CharField(max_length=50, null=False)

    # def __str__(self):
    #     return self.name

    def add_user(self, user):
        if JoinGroup.objects.filter(user=user).exists():
            raise ValueError("User is already in this group")
        JoinGroup.objects.create(group=self, user=user)


class JoinGroup(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} in {self.group.name}"

    class Meta:
        unique_together = ('user', 'group')


class Notification(BaseModel):
    title = models.CharField(max_length=255, null=False)
    content = RichTextField()
    group = models.ForeignKey(Group, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.title

