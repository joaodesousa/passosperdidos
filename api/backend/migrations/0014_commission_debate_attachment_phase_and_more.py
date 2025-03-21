# Generated by Django 4.2.19 on 2025-03-03 21:34

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0013_vote_description'),
    ]

    operations = [
        migrations.CreateModel(
            name='Commission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=500)),
                ('number', models.CharField(blank=True, max_length=50, null=True)),
                ('id_commission', models.CharField(blank=True, max_length=50, null=True)),
                ('acc_id', models.CharField(blank=True, max_length=50, null=True)),
                ('competent', models.CharField(blank=True, max_length=10, null=True)),
                ('observation', models.TextField(blank=True, null=True)),
                ('distribution_date', models.DateField(blank=True, null=True)),
                ('subcommission_distribution', models.TextField(blank=True, null=True)),
                ('subcommission_distribution_date', models.DateField(blank=True, null=True)),
                ('entry_date', models.DateField(blank=True, null=True)),
                ('public_appreciation_start_date', models.DateField(blank=True, null=True)),
                ('public_appreciation_end_date', models.DateField(blank=True, null=True)),
                ('no_opinion_reason_date', models.DateField(blank=True, null=True)),
                ('report_date', models.DateField(blank=True, null=True)),
                ('forwarding_date', models.DateField(blank=True, null=True)),
                ('plenary_scheduling_request_date', models.DateField(blank=True, null=True)),
                ('awaits_plenary_scheduling', models.CharField(blank=True, max_length=50, null=True)),
                ('plenary_scheduling_date', models.DateField(blank=True, null=True)),
                ('discussion_scheduling_date', models.DateField(blank=True, null=True)),
                ('plenary_scheduling_gp', models.CharField(blank=True, max_length=50, null=True)),
                ('no_opinion_reason', models.TextField(blank=True, null=True)),
                ('extended', models.CharField(blank=True, max_length=10, null=True)),
                ('sigla', models.CharField(blank=True, max_length=50, null=True)),
                ('legislature_ref', models.CharField(blank=True, max_length=50, null=True)),
                ('session_ref', models.CharField(blank=True, max_length=50, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Debate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(blank=True, null=True)),
                ('phase', models.CharField(blank=True, max_length=100, null=True)),
                ('session_phase', models.CharField(blank=True, max_length=10, null=True)),
                ('start_time', models.CharField(blank=True, max_length=10, null=True)),
                ('end_time', models.CharField(blank=True, max_length=10, null=True)),
                ('summary', models.TextField(blank=True, null=True)),
                ('content', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.AddField(
            model_name='attachment',
            name='phase',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='attachments', to='backend.phase'),
        ),
        migrations.AddField(
            model_name='author',
            name='id_cadastro',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='phase',
            name='act_id',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='phase',
            name='code',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='phase',
            name='evt_id',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='phase',
            name='observation',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='phase',
            name='oev_id',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='phase',
            name='oev_text_id',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='projetolei',
            name='epigraph',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='projetolei',
            name='european_initiatives',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='projetolei',
            name='initiative_id',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='projetolei',
            name='initiative_legislature',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name='projetolei',
            name='initiative_number',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='projetolei',
            name='initiative_selection',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name='projetolei',
            name='initiative_type_code',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name='projetolei',
            name='observation',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='projetolei',
            name='origin_initiatives',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='projetolei',
            name='originated_initiatives',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='projetolei',
            name='substitute_text',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name='projetolei',
            name='substitute_text_field',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='projetolei',
            name='text_link',
            field=models.URLField(blank=True, max_length=500, null=True),
        ),
        migrations.AddField(
            model_name='vote',
            name='absences',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='vote',
            name='meeting',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='vote',
            name='meeting_type',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='vote',
            name='unanimous',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='vote',
            name='vote_id',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='projetolei',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.CreateModel(
            name='VideoLink',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('url', models.URLField(max_length=500)),
                ('debate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='video_links', to='backend.debate')),
            ],
        ),
        migrations.CreateModel(
            name='RelatedInitiative',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('initiative_id', models.CharField(max_length=50)),
                ('initiative_type', models.CharField(max_length=100)),
                ('initiative_number', models.CharField(max_length=50)),
                ('legislature', models.CharField(max_length=50)),
                ('title', models.TextField(blank=True, null=True)),
                ('entry_date', models.DateField(blank=True, null=True)),
                ('selection', models.CharField(blank=True, max_length=10, null=True)),
                ('phase', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='related_initiatives', to='backend.phase')),
            ],
        ),
        migrations.CreateModel(
            name='Rapporteur',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('party', models.CharField(blank=True, max_length=100, null=True)),
                ('date', models.DateField(blank=True, null=True)),
                ('commission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rapporteurs', to='backend.commission')),
            ],
        ),
        migrations.CreateModel(
            name='Publication',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(blank=True, null=True)),
                ('legislature_code', models.CharField(blank=True, max_length=50, null=True)),
                ('number', models.CharField(blank=True, max_length=50, null=True)),
                ('session', models.CharField(blank=True, max_length=50, null=True)),
                ('publication_type', models.CharField(blank=True, max_length=100, null=True)),
                ('publication_tp', models.CharField(blank=True, max_length=50, null=True)),
                ('supplement', models.CharField(blank=True, max_length=50, null=True)),
                ('pages', models.JSONField(blank=True, null=True)),
                ('url', models.URLField(blank=True, max_length=500, null=True)),
                ('id_page', models.CharField(blank=True, max_length=50, null=True)),
                ('observation', models.TextField(blank=True, null=True)),
                ('id_debate', models.CharField(blank=True, max_length=50, null=True)),
                ('id_intervention', models.CharField(blank=True, max_length=50, null=True)),
                ('id_act', models.CharField(blank=True, max_length=50, null=True)),
                ('final_diary_supplement', models.CharField(blank=True, max_length=100, null=True)),
                ('phase', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='publications', to='backend.phase')),
                ('vote', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='publications', to='backend.vote')),
            ],
        ),
        migrations.CreateModel(
            name='PartyAppeal',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('party', models.CharField(max_length=100)),
                ('date', models.DateField(blank=True, null=True)),
                ('phase', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='party_appeals', to='backend.phase')),
            ],
        ),
        migrations.CreateModel(
            name='OpinionRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('entity', models.CharField(max_length=255)),
                ('date', models.DateField(blank=True, null=True)),
                ('commission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='opinion_requests', to='backend.commission')),
            ],
        ),
        migrations.CreateModel(
            name='Opinion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('entity', models.CharField(max_length=255)),
                ('date', models.DateField(blank=True, null=True)),
                ('url', models.URLField(blank=True, max_length=500, null=True)),
                ('document_type', models.CharField(blank=True, max_length=100, null=True)),
                ('commission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_opinions', to='backend.commission')),
            ],
        ),
        migrations.CreateModel(
            name='Hearing',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('entity', models.CharField(max_length=255)),
                ('date', models.DateField(blank=True, null=True)),
                ('commission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='hearings', to='backend.commission')),
            ],
        ),
        migrations.CreateModel(
            name='GuestDebate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=255, null=True)),
                ('position', models.CharField(blank=True, max_length=255, null=True)),
                ('honor', models.CharField(blank=True, max_length=255, null=True)),
                ('country', models.CharField(blank=True, max_length=100, null=True)),
                ('debate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='guests', to='backend.debate')),
            ],
        ),
        migrations.CreateModel(
            name='GovernmentMemberDebate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('position', models.CharField(blank=True, max_length=255, null=True)),
                ('government', models.CharField(blank=True, max_length=255, null=True)),
                ('debate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='government_members', to='backend.debate')),
            ],
        ),
        migrations.CreateModel(
            name='Forwarding',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('entity', models.CharField(max_length=255)),
                ('date', models.DateField(blank=True, null=True)),
                ('commission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='forwardings', to='backend.commission')),
            ],
        ),
        migrations.CreateModel(
            name='FinalDraftSubmission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(blank=True, null=True)),
                ('text', models.TextField(blank=True, null=True)),
                ('commission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='final_draft_submissions', to='backend.commission')),
            ],
        ),
        migrations.CreateModel(
            name='DeputyDebate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('party', models.CharField(blank=True, max_length=100, null=True)),
                ('debate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='deputies', to='backend.debate')),
            ],
        ),
        migrations.CreateModel(
            name='DeputyAppeal',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('deputy_name', models.CharField(max_length=255)),
                ('party', models.CharField(blank=True, max_length=100, null=True)),
                ('date', models.DateField(blank=True, null=True)),
                ('phase', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='deputy_appeals', to='backend.phase')),
            ],
        ),
        migrations.AddField(
            model_name='debate',
            name='phase_link',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='debates', to='backend.phase'),
        ),
        migrations.CreateModel(
            name='CommissionVote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(blank=True, null=True)),
                ('result', models.CharField(blank=True, max_length=100, null=True)),
                ('favor', models.JSONField(blank=True, null=True)),
                ('against', models.JSONField(blank=True, null=True)),
                ('abstention', models.JSONField(blank=True, null=True)),
                ('commission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='votes', to='backend.commission')),
            ],
        ),
        migrations.CreateModel(
            name='CommissionDocument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=500)),
                ('document_type', models.CharField(max_length=100)),
                ('date', models.DateField(blank=True, null=True)),
                ('url', models.URLField(blank=True, max_length=500, null=True)),
                ('commission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='backend.commission')),
            ],
        ),
        migrations.AddField(
            model_name='commission',
            name='phase',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='commissions', to='backend.phase'),
        ),
        migrations.CreateModel(
            name='Audience',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('entity', models.CharField(max_length=255)),
                ('date', models.DateField(blank=True, null=True)),
                ('commission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='audiences', to='backend.commission')),
            ],
        ),
        migrations.CreateModel(
            name='ApprovedText',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=500)),
                ('text_type', models.CharField(max_length=100)),
                ('date', models.DateField(blank=True, null=True)),
                ('url', models.URLField(blank=True, max_length=500, null=True)),
                ('phase', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='approved_texts', to='backend.phase')),
            ],
        ),
    ]
