# Generated by Django 5.1.6 on 2025-02-12 14:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0010_alter_projetolei_link'),
    ]

    operations = [
        migrations.AlterField(
            model_name='attachment',
            name='name',
            field=models.CharField(max_length=500),
        ),
    ]
