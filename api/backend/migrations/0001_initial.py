# Generated by Django 5.1.6 on 2025-02-09 16:33

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ProjetoLei',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('type', models.CharField(max_length=100)),
                ('legislature', models.CharField(max_length=100)),
                ('date', models.DateField(null=True)),
                ('phase', models.CharField(max_length=100, null=True)),
                ('link', models.URLField()),
                ('author', models.CharField(max_length=255, null=True)),
                ('description', models.TextField(null=True)),
                ('external_id', models.CharField(max_length=255, unique=True)),
            ],
        ),
    ]
