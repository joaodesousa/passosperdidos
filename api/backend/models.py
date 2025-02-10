from django.db import models


class ProjetoLei(models.Model):
    title = models.CharField()
    type = models.CharField()
    legislature = models.CharField(max_length=10)
    date = models.DateField(null=True)
    phase = models.CharField(max_length=100, null=True)
    link = models.URLField()
    author = models.CharField(max_length=255, null=True)
    description = models.TextField(null=True)
    external_id = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.title
