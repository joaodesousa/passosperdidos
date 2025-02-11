# Generated by Django 5.1.6 on 2025-02-11 03:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0005_alter_phase_date_alter_phase_name_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='phase',
            name='name',
            field=models.CharField(db_index=True, max_length=1000),
        ),
        migrations.AlterField(
            model_name='projetolei',
            name='author',
            field=models.CharField(max_length=1000, null=True),
        ),
        migrations.AlterField(
            model_name='projetolei',
            name='external_id',
            field=models.CharField(max_length=1000, unique=True),
        ),
        migrations.AlterField(
            model_name='projetolei',
            name='legislature',
            field=models.CharField(max_length=1000),
        ),
        migrations.AlterField(
            model_name='projetolei',
            name='phase',
            field=models.CharField(max_length=1000, null=True),
        ),
    ]
