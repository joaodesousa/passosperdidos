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
    code = models.CharField(max_length=50, null=True, blank=True)
    observation = models.TextField(null=True, blank=True)
    oev_id = models.CharField(max_length=50, null=True, blank=True)
    oev_text_id = models.CharField(max_length=50, null=True, blank=True)
    evt_id = models.CharField(max_length=50, null=True, blank=True)
    act_id = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.name


class Attachment(models.Model):
    name = models.CharField(max_length=1000)
    file_url = models.URLField(max_length=1000)
    phase = models.ForeignKey(Phase, on_delete=models.CASCADE, null=True, blank=True, related_name="attachments")

    def __str__(self):
        return self.name


class Author(models.Model):
    name = models.CharField(max_length=255)
    party = models.CharField(max_length=100, null=True, blank=True)
    author_type = models.CharField(
        max_length=50,
        choices=[('Deputado', 'Deputado'), ('Grupo', 'Grupo'), ('Outro', 'Outro')]
    )
    id_cadastro = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.name


class Vote(models.Model):
    date = models.DateField(null=True)
    result = models.CharField(max_length=50)
    details = models.TextField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    votes = models.JSONField(default=dict)
    
    # Additional fields from JSON
    meeting = models.CharField(max_length=50, null=True, blank=True)
    meeting_type = models.CharField(max_length=50, null=True, blank=True)
    unanimous = models.CharField(max_length=50, null=True, blank=True)
    absences = models.JSONField(null=True, blank=True)
    vote_id = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.date} - {self.result}"


class Publication(models.Model):
    date = models.DateField(null=True, blank=True)
    legislature_code = models.CharField(max_length=50, null=True, blank=True)
    number = models.CharField(max_length=50, null=True, blank=True)
    session = models.CharField(max_length=50, null=True, blank=True)
    publication_type = models.CharField(max_length=100, null=True, blank=True)
    publication_tp = models.CharField(max_length=50, null=True, blank=True)
    supplement = models.CharField(max_length=50, null=True, blank=True)
    pages = models.JSONField(null=True, blank=True)
    url = models.URLField(max_length=500, null=True, blank=True)
    id_page = models.CharField(max_length=50, null=True, blank=True)
    observation = models.TextField(null=True, blank=True)
    
    # For debate publications
    id_debate = models.CharField(max_length=50, null=True, blank=True)
    id_intervention = models.CharField(max_length=50, null=True, blank=True)
    id_act = models.CharField(max_length=50, null=True, blank=True)
    final_diary_supplement = models.CharField(max_length=100, null=True, blank=True)
    
    # Link to phase or vote
    phase = models.ForeignKey(Phase, on_delete=models.CASCADE, null=True, blank=True, related_name="publications")
    vote = models.ForeignKey(Vote, on_delete=models.CASCADE, null=True, blank=True, related_name="publications")

    def __str__(self):
        return f"{self.date} - {self.publication_type} {self.number}"


class Commission(models.Model):
    name = models.CharField(max_length=500)
    number = models.CharField(max_length=50, null=True, blank=True)
    id_commission = models.CharField(max_length=50, null=True, blank=True)
    acc_id = models.CharField(max_length=50, null=True, blank=True)
    competent = models.CharField(max_length=10, null=True, blank=True)
    observation = models.TextField(null=True, blank=True)
    distribution_date = models.DateField(null=True, blank=True)
    
    # Many additional fields from the JSON structure
    subcommission_distribution = models.TextField(null=True, blank=True)
    subcommission_distribution_date = models.DateField(null=True, blank=True)
    entry_date = models.DateField(null=True, blank=True)
    public_appreciation_start_date = models.DateField(null=True, blank=True)
    public_appreciation_end_date = models.DateField(null=True, blank=True)
    no_opinion_reason_date = models.DateField(null=True, blank=True)
    report_date = models.DateField(null=True, blank=True)
    forwarding_date = models.DateField(null=True, blank=True)
    plenary_scheduling_request_date = models.DateField(null=True, blank=True)
    awaits_plenary_scheduling = models.CharField(max_length=50, null=True, blank=True)
    plenary_scheduling_date = models.DateField(null=True, blank=True)
    discussion_scheduling_date = models.DateField(null=True, blank=True)
    plenary_scheduling_gp = models.CharField(max_length=50, null=True, blank=True)
    no_opinion_reason = models.TextField(null=True, blank=True)
    extended = models.CharField(max_length=10, null=True, blank=True)
    sigla = models.CharField(max_length=50, null=True, blank=True)
    legislature_ref = models.CharField(max_length=50, null=True, blank=True)
    session_ref = models.CharField(max_length=50, null=True, blank=True)
    
    # Link to phase
    phase = models.ForeignKey(Phase, on_delete=models.CASCADE, null=True, blank=True, related_name="commissions")

    def __str__(self):
        return self.name


class CommissionDocument(models.Model):
    title = models.CharField(max_length=500)
    document_type = models.CharField(max_length=100)
    date = models.DateField(null=True, blank=True)
    url = models.URLField(max_length=1000, null=True, blank=True)
    commission = models.ForeignKey(Commission, on_delete=models.CASCADE, related_name="documents")

    def __str__(self):
        return f"{self.document_type} - {self.title}"


class Rapporteur(models.Model):
    name = models.CharField(max_length=255)
    party = models.CharField(max_length=100, null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    commission = models.ForeignKey(Commission, on_delete=models.CASCADE, related_name="rapporteurs")

    def __str__(self):
        return self.name


class Opinion(models.Model):
    entity = models.CharField(max_length=255)
    date = models.DateField(null=True, blank=True)
    url = models.URLField(max_length=1000, null=True, blank=True)
    document_type = models.CharField(max_length=100, null=True, blank=True)
    commission = models.ForeignKey(Commission, on_delete=models.CASCADE, related_name="received_opinions")

    def __str__(self):
        return f"Opinion from {self.entity}"


class OpinionRequest(models.Model):
    entity = models.CharField(max_length=255)
    date = models.DateField(null=True, blank=True)
    commission = models.ForeignKey(Commission, on_delete=models.CASCADE, related_name="opinion_requests")

    def __str__(self):
        return f"Opinion request to {self.entity}"


class Hearing(models.Model):
    entity = models.CharField(max_length=255)
    date = models.DateField(null=True, blank=True)
    commission = models.ForeignKey(Commission, on_delete=models.CASCADE, related_name="hearings")

    def __str__(self):
        return f"Hearing with {self.entity}"


class Audience(models.Model):
    entity = models.CharField(max_length=255)
    date = models.DateField(null=True, blank=True)
    commission = models.ForeignKey(Commission, on_delete=models.CASCADE, related_name="audiences")

    def __str__(self):
        return f"Audience with {self.entity}"


class CommissionVote(models.Model):
    date = models.DateField(null=True, blank=True)
    result = models.CharField(max_length=100, null=True, blank=True)
    favor = models.JSONField(null=True, blank=True)
    against = models.JSONField(null=True, blank=True)
    abstention = models.JSONField(null=True, blank=True)
    commission = models.ForeignKey(Commission, on_delete=models.CASCADE, related_name="votes")

    def __str__(self):
        return f"Vote on {self.date} - {self.result}"


class FinalDraftSubmission(models.Model):
    date = models.DateField(null=True, blank=True)
    text = models.TextField(null=True, blank=True)
    commission = models.ForeignKey(Commission, on_delete=models.CASCADE, related_name="final_draft_submissions")

    def __str__(self):
        return f"Final draft submission on {self.date}"


class Forwarding(models.Model):
    entity = models.CharField(max_length=255)
    date = models.DateField(null=True, blank=True)
    commission = models.ForeignKey(Commission, on_delete=models.CASCADE, related_name="forwardings")

    def __str__(self):
        return f"Forwarding to {self.entity} on {self.date}"


class Debate(models.Model):
    date = models.DateField(null=True, blank=True)
    phase = models.CharField(max_length=100, null=True, blank=True)
    session_phase = models.CharField(max_length=10, null=True, blank=True)
    start_time = models.CharField(max_length=10, null=True, blank=True)
    end_time = models.CharField(max_length=10, null=True, blank=True)
    summary = models.TextField(null=True, blank=True)
    content = models.TextField(null=True, blank=True)
    phase_link = models.ForeignKey(Phase, on_delete=models.CASCADE, null=True, blank=True, related_name="debates")

    def __str__(self):
        return f"Debate on {self.date}"


class VideoLink(models.Model):
    url = models.URLField(max_length=500)
    debate = models.ForeignKey(Debate, on_delete=models.CASCADE, related_name="video_links")

    def __str__(self):
        return self.url


class DeputyDebate(models.Model):
    debate = models.ForeignKey(Debate, on_delete=models.CASCADE, related_name="deputies")
    name = models.CharField(max_length=255)
    party = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.name


class GovernmentMemberDebate(models.Model):
    debate = models.ForeignKey(Debate, on_delete=models.CASCADE, related_name="government_members")
    name = models.CharField(max_length=255)
    position = models.CharField(max_length=255, null=True, blank=True)
    government = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.name


class GuestDebate(models.Model):
    debate = models.ForeignKey(Debate, on_delete=models.CASCADE, related_name="guests")
    name = models.CharField(max_length=255, null=True, blank=True)
    position = models.CharField(max_length=255, null=True, blank=True)
    honor = models.CharField(max_length=255, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.name if self.name else "Unnamed Guest"


class ApprovedText(models.Model):
    title = models.CharField(max_length=500)
    text_type = models.CharField(max_length=100)
    date = models.DateField(null=True, blank=True)
    url = models.URLField(max_length=1000, null=True, blank=True)
    phase = models.ForeignKey(Phase, on_delete=models.CASCADE, null=True, blank=True, related_name="approved_texts")

    def __str__(self):
        return self.title


class DeputyAppeal(models.Model):
    deputy_name = models.CharField(max_length=255)
    party = models.CharField(max_length=100, null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    phase = models.ForeignKey(Phase, on_delete=models.CASCADE, null=True, blank=True, related_name="deputy_appeals")

    def __str__(self):
        return f"Appeal by {self.deputy_name}"


class PartyAppeal(models.Model):
    party = models.CharField(max_length=100)
    date = models.DateField(null=True, blank=True)
    phase = models.ForeignKey(Phase, on_delete=models.CASCADE, null=True, blank=True, related_name="party_appeals")

    def __str__(self):
        return f"Appeal by {self.party}"


class RelatedInitiative(models.Model):
    initiative_id = models.CharField(max_length=50)
    initiative_type = models.CharField(max_length=100)
    initiative_number = models.CharField(max_length=50)
    legislature = models.CharField(max_length=50)
    title = models.TextField(null=True, blank=True)
    entry_date = models.DateField(null=True, blank=True)
    selection = models.CharField(max_length=10, null=True, blank=True)
    phase = models.ForeignKey(Phase, on_delete=models.CASCADE, null=True, blank=True, related_name="related_initiatives")

    def __str__(self):
        return f"{self.initiative_type} {self.initiative_number}"


class ProjetoLei(models.Model):
    title = models.TextField(db_index=True)
    type = models.CharField(max_length=255, db_index=True)
    legislature = models.ForeignKey(Legislature, on_delete=models.CASCADE, related_name="projetos_lei")
    date = models.DateField(null=True)
    link = models.URLField(max_length=1000, blank=True, null=True)
    description = models.TextField(null=True, blank=True)
    external_id = models.CharField(max_length=1000, unique=True, db_index=True)
    authors = models.ManyToManyField(Author, related_name="projetos_lei")
    phases = models.ManyToManyField(Phase, related_name="projetos_lei", blank=True, db_index=True)
    attachments = models.ManyToManyField(Attachment, related_name="projetos_lei", blank=True)
    votes = models.ManyToManyField(Vote, related_name="projetos_lei", blank=True)
    related_initiatives = models.ManyToManyField("self", symmetrical=False, related_name="related_to", blank=True)
    publication_url = models.URLField(max_length=1000, null=True, blank=True)
    publication_date = models.DateField(null=True, blank=True)

    # Additional fields from JSON
    initiative_id = models.CharField(max_length=50, null=True, blank=True)
    initiative_legislature = models.CharField(max_length=10, null=True, blank=True)
    initiative_number = models.CharField(max_length=20, null=True, blank=True)
    initiative_type_code = models.CharField(max_length=10, null=True, blank=True)
    initiative_selection = models.CharField(max_length=10, null=True, blank=True)
    substitute_text = models.CharField(max_length=10, null=True, blank=True)
    substitute_text_field = models.TextField(null=True, blank=True)
    observation = models.TextField(null=True, blank=True)
    epigraph = models.TextField(null=True, blank=True)
    text_link = models.URLField(max_length=1000, null=True, blank=True)
    
    # Special fields for European initiatives
    european_initiatives = models.JSONField(null=True, blank=True)
    
    # Special fields for related origin initiatives
    origin_initiatives = models.JSONField(null=True, blank=True)
    
    # Special fields for originated initiatives
    originated_initiatives = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.title