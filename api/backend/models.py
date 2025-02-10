from django.db import models


class Phase(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    date = models.DateField(null=True, db_index=True)


class ProjetoLei(models.Model):
    title = models.CharField(db_index=True)
    type = models.CharField(db_index=True)
    legislature = models.CharField(max_length=10)
    date = models.DateField(null=True)
    phase = models.CharField(max_length=100, null=True)
    link = models.URLField()
    author = models.CharField(max_length=255, null=True)
    description = models.TextField(null=True)
    external_id = models.CharField(max_length=255, unique=True)
    phases = models.ManyToManyField(Phase, related_name='projetos_lei', blank=True, db_index=True)

    def __str__(self):
        return self.title
