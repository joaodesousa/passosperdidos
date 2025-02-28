from django.db import models


class Legislature(models.Model):
    number = models.CharField(max_length=50, unique=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Legislature {self.number}"


class Phase(models.Model):
    name = models.CharField(max_length=1000, db_index=True)
    date = models.DateField(null=True, db_index=True)

    def __str__(self):
        return self.name


class Attachment(models.Model):
    name = models.CharField(max_length=500)
    file_url = models.URLField()

    def __str__(self):
        return self.name


class Author(models.Model):
    name = models.CharField(max_length=255)
    party = models.CharField(max_length=100, null=True, blank=True)
    author_type = models.CharField(
        max_length=50,
        choices=[('Deputado', 'Deputado'), ('Grupo', 'Grupo'), ('Outro', 'Outro')]
    )

    def __str__(self):
        return self.name


class Vote(models.Model):
    date = models.DateField(null=True)
    result = models.CharField(max_length=50)
    details = models.TextField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    votes = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.date} - {self.result}"


class ProjetoLei(models.Model):
    title = models.TextField(db_index=True)
    type = models.CharField(max_length=255, db_index=True)
    legislature = models.ForeignKey(Legislature, on_delete=models.CASCADE, related_name="projetos_lei")
    date = models.DateField(null=True)
    link = models.URLField(max_length=500)
    description = models.TextField(null=True)
    external_id = models.CharField(max_length=1000, unique=True)
    authors = models.ManyToManyField(Author, related_name="projetos_lei")
    phases = models.ManyToManyField(Phase, related_name="projetos_lei", blank=True, db_index=True)
    attachments = models.ManyToManyField(Attachment, related_name="projetos_lei", blank=True)
    votes = models.ManyToManyField(Vote, related_name="projetos_lei", blank=True)
    related_initiatives = models.ManyToManyField("self", symmetrical=False, related_name="related_to", blank=True)
    publication_url = models.URLField(null=True, blank=True)
    publication_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.title
