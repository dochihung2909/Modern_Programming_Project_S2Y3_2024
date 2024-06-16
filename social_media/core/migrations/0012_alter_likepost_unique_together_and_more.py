# Generated by Django 5.0.4 on 2024-06-16 18:58

import cloudinary.models
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0011_alter_joinroom_unique_together'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='likepost',
            unique_together={('user', 'post')},
        ),
        migrations.AlterUniqueTogether(
            name='likecomment',
            unique_together={('user', 'comment')},
        ),
        migrations.AlterField(
            model_name='likecomment',
            name='like_type',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.liketype'),
        ),
        migrations.AlterField(
            model_name='likepost',
            name='like_type',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.liketype'),
        ),
        migrations.AlterField(
            model_name='liketype',
            name='id',
            field=models.PositiveIntegerField(primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='liketype',
            name='image',
            field=cloudinary.models.CloudinaryField(max_length=255),
        ),
        migrations.AlterField(
            model_name='liketype',
            name='name',
            field=models.CharField(max_length=50, unique=True),
        ),
        migrations.RemoveField(
            model_name='likecomment',
            name='post',
        ),
    ]
