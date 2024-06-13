# Generated by Django 5.0.4 on 2024-06-07 18:36

import random
from django.db import migrations


def create_initial_data(apps, schema_editor):
    user_ids = list(range(2, 12))
    Post = apps.get_model('core', 'Post')
    Post.objects.create(content='Post 1 content', user_id=random.choice(user_ids),
                        image='https://res.cloudinary.com/dhitdivyi/image/upload/v1718215437/ltymp5sa9awj4dbsnlcw.png')
    Post.objects.create(content='Post 2 content', user_id=random.choice(user_ids),
                        image='https://res.cloudinary.com/dhitdivyi/image/upload/v1718215437/ltymp5sa9awj4dbsnlcw.png')
    Post.objects.create(content='Post 3 content', user_id=random.choice(user_ids),
                        image='https://res.cloudinary.com/dhitdivyi/image/upload/v1718215437/ltymp5sa9awj4dbsnlcw.png')
    Post.objects.create(content='Post 4 content', user_id=random.choice(user_ids),
                        image='https://res.cloudinary.com/dhitdivyi/image/upload/v1718215437/ltymp5sa9awj4dbsnlcw.png')
    Post.objects.create(content='Post 5 content', user_id=random.choice(user_ids),
                        image='https://res.cloudinary.com/dhitdivyi/image/upload/v1718215437/ltymp5sa9awj4dbsnlcw.png')
    Post.objects.create(content='Post 6 content', user_id=random.choice(user_ids),
                        image='https://res.cloudinary.com/dhitdivyi/image/upload/v1718215437/ltymp5sa9awj4dbsnlcw.png')
    Post.objects.create(content='Post 7 content', user_id=random.choice(user_ids),
                        image='https://res.cloudinary.com/dhitdivyi/image/upload/v1718215437/ltymp5sa9awj4dbsnlcw.png')
    Post.objects.create(content='Post 8 content', user_id=random.choice(user_ids),
                        image='https://res.cloudinary.com/dhitdivyi/image/upload/v1718215437/ltymp5sa9awj4dbsnlcw.png')
    Post.objects.create(content='Post 9 content', user_id=random.choice(user_ids),
                        image='https://res.cloudinary.com/dhitdivyi/image/upload/v1718215437/ltymp5sa9awj4dbsnlcw.png')
    Post.objects.create(content='Post 10 content', user_id=random.choice(user_ids),
                        image='https://res.cloudinary.com/dhitdivyi/image/upload/v1718215437/ltymp5sa9awj4dbsnlcw.png')


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_user_data'),
    ]

    operations = [
        migrations.RunPython(create_initial_data),
    ]

