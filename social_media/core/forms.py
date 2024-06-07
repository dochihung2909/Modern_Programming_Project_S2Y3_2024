from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from core.models import Post, LikeComment, Comment


class PostForm(forms.ModelForm):
    content = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Post
        fields = '__all__'


class LikeCommentAdminForm(forms.ModelForm):
    class Meta:
        model = LikeComment
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['comment'].queryset = Comment.objects.none()

        if 'post' in self.data:
            try:
                post_id = int(self.data.get('post'))
                self.fields['comment'].queryset = Comment.objects.filter(post_id=post_id).order_by('content')
            except (ValueError, TypeError):
                pass  # invalid input from the client; ignore and fallback to empty comment queryset
        elif self.instance.pk and self.instance.post:
            self.fields['comment'].queryset = self.instance.post.comment_set.order_by('content')
