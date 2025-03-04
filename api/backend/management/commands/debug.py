#!/usr/bin/env python
"""
Script to debug and analyze the Parlamento API response.
This file should be saved separately and run to examine the API structure.
"""

import requests
import json
import sys

def debug_api_response(legislature="XVI"):
    """Fetch and analyze the API response to understand its structure"""
    url = f"https://app.parlamento.pt/webutils/docs/doc.txt?path=IK8XlcmBKOX6xnhcFVPCXpEICixqGUkFgz9%2btevXoUXGDowQjN5BeHhk9MjVfm7DjoLOsgOeGnXDVQSIaSFWjDPiRf3pRiZYdOHYXUyHa5%2fQRXFH7yER5Vx18ur979A%2fK%2bVKw3fho5768TcQ4dcEtJ7iNutgbqLMzcMlbhoCYdMQqbBnOKSb1hWu0fib060aqVlyJqNX%2bEZNYIpVUSNUanqo8nst1Xavx9nOhX7OED%2bPb%2fCZKluzXtrNRFVaWyApKbKC8Qj%2bgdPKD9WbFDz9fpuyXXqKcjNT6dzt5a0h35Y%2bOtcEYG99OCCiHS%2fsnGf%2b%2bKemDRoC7MAO8HSN09Vp83Ed5ehNtDIauO1nGYPbdYs%3d&fich=IniciativasXVI_json.txt&Inline=true"

    try:
        print(f"Fetching data from: {url}")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        if not isinstance(data, list):
            print("ERROR: API response is not a list")
            print(f"Response type: {type(data)}")
            print("Preview of response:")
            print(json.dumps(data, indent=2)[:500])
            return
        
        # Analyze the first few items
        sample_size = min(5, len(data))
        print(f"API returned {len(data)} items. Analyzing first {sample_size}:")
        
        for i, item in enumerate(data[:sample_size]):
            print(f"\n--- Item {i} ---")
            print(f"Type: {type(item)}")
            
            if isinstance(item, dict):
                # Print all keys
                print(f"Keys: {', '.join(item.keys())}")
                
                # Print each key-value pair
                for key, value in item.items():
                    value_preview = str(value)[:100] + "..." if len(str(value)) > 100 else value
                    print(f"  {key}: {value_preview}")
            else:
                print(f"Value: {item}")
        
        # Generate recommendations
        print("\n=== RECOMMENDATIONS ===")
        
        if len(data) > 0 and isinstance(data[0], dict):
            # Look for potential ID fields
            potential_id_fields = [key for key in data[0].keys() 
                                  if 'id' in key.lower() or 
                                    'num' in key.lower() or 
                                    'cod' in key.lower() or
                                    'ref' in key.lower()]
            
            if potential_id_fields:
                print(f"Potential ID fields found: {', '.join(potential_id_fields)}")
                print("Update the importer to use one of these fields instead of 'id'")
            else:
                print("No obvious ID field found. Try using the index position or another unique field.")
                
            # Check for nested objects that might contain IDs
            nested_objects = [key for key, value in data[0].items() 
                             if isinstance(value, dict) or isinstance(value, list)]
            
            if nested_objects:
                print(f"\nNested objects found that might contain IDs: {', '.join(nested_objects)}")
                print("Check these nested objects for ID fields")
        
        # Print example command modifications
        print("\nExample modifications for the importer:")
        if potential_id_fields:
            for field in potential_id_fields:
                print(f"  initiative_id = initiative_basic.get('{field}')")
        else:
            print("  # Use item position as a fallback ID")
            print("  initiative_id = f'XVI-{idx}'  # Creating synthetic ID using legislature and index")
    
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
    except json.JSONDecodeError:
        print("Error decoding JSON response")
        print(f"Response text: {response.text[:500]}...")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    legislature = sys.argv[1] if len(sys.argv) > 1 else "XVI"
    debug_api_response(legislature)