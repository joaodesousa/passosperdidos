import json
import logging
import re
from django.core.management.base import BaseCommand
from django.db import transaction
from backend.models import Vote

# Set up logging
logger = logging.getLogger(__name__)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

class Command(BaseCommand):
    help = 'Parse existing vote details and update the votes field with structured data'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--batch-size',
            type=int,
            default=2000,
            help='Number of votes to process in each batch'
        )
        
    def handle(self, *args, **options):
        batch_size = options['batch_size']
        
        # Get total count of votes
        total_votes = Vote.objects.count()
        logger.info(f"Found {total_votes} votes to process")
        
        # Process in batches to avoid memory issues
        processed = 0
        updated = 0
        errors = 0
        
        # Get all vote IDs to process them in batches
        vote_ids = list(Vote.objects.values_list('id', flat=True))
        
        for i in range(0, len(vote_ids), batch_size):
            batch_ids = vote_ids[i:i+batch_size]
            votes_batch = Vote.objects.filter(id__in=batch_ids)
            
            with transaction.atomic():
                for vote in votes_batch:
                    try:
                        # Only process votes with details
                        if vote.details:
                            # Parse vote details
                            parsed_votes = self.parse_vote_details(vote.details)
                            
                            # Update votes field with parsed data
                            vote.votes = parsed_votes
                            vote.save(update_fields=['votes'])
                            updated += 1
                        
                        processed += 1
                        
                        # Log progress
                        if processed % 100 == 0:
                            logger.info(f"Processed {processed}/{total_votes} votes, Updated: {updated}, Errors: {errors}")
                            
                    except Exception as e:
                        errors += 1
                        logger.error(f"Error processing vote {vote.id}: {str(e)}")
        
        logger.info(f"Completed. Processed: {processed}, Updated: {updated}, Errors: {errors}")
    
    def parse_vote_details(self, details):
        """
        Parse HTML-like vote details into a structured format.
        
        Example input:
        "A Favor: <I>PSD</I>, <I> PS</I>, <I> CH</I><BR>Contra:<I>PCP</I>"
        
        Example output:
        {
            "a_favor": ["PSD", "PS", "CH"],
            "contra": ["PCP"],
            "abstencao": []
        }
        """
        if not details:
            return {"a_favor": [], "contra": [], "abstencao": []}
        
        result = {"a_favor": [], "contra": [], "abstencao": []}
        
        # Split by <BR> to separate different vote types
        vote_sections = details.split("<BR>")
        
        for section in vote_sections:
            # Skip empty sections
            if not section.strip():
                continue
                
            # Extract vote type and parties
            parts = section.split(":")
            if len(parts) < 2:
                continue
                
            vote_type = parts[0].strip().lower()
            parties_html = ":".join(parts[1:])  # Rejoin in case there were colons in the party names
            
            # Map the vote type to our standardized keys
            if "favor" in vote_type:
                key = "a_favor"
            elif "contra" in vote_type:
                key = "contra"
            elif "absten" in vote_type:
                key = "abstencao"
            else:
                continue
            
            # Extract parties from <I> tags
            parties = re.findall(r'<I>(.*?)<\/I>', parties_html)
            
            # Clean whitespace and add to result
            result[key] = [party.strip() for party in parties]
        
        return result