#!/usr/bin/env python3
"""
Oracle Cloud Instance Auto-Retry Script
Automatically retries creating an OCI instance until successful
"""

import subprocess
import time
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path

# ============================================================================
# CONFIGURATION - EDIT THESE VALUES
# ============================================================================

CONFIG = {
    # Required OCI parameters
    "compartment_id": "your-compartment-ocid",
    "availability_domain": "your-ad-name",  # e.g., "aBCD:AP-MUMBAI-1-AD-1"
    "shape": "VM.Standard.A1.Flex",  # or "VM.Standard.E2.1.Micro" for AMD
    "ocpus": 2,  # For A1: 1-4, For AMD: 1
    "memory_in_gbs": 12,  # For A1: 6-24, For AMD: 1
    "image_id": "your-image-ocid",  # Ubuntu/Oracle Linux image OCID
    "subnet_id": "your-subnet-ocid",
    "display_name": "my-instance",
    "ssh_public_key_path": str(Path.home() / ".ssh" / "id_rsa.pub"),
    
    # Retry settings
    "max_retries": 1000,  # 0 = infinite
    "retry_interval": 60,  # seconds
    "try_multiple_ads": True,  # Try all ADs in region if one fails
}

# ============================================================================
# DO NOT EDIT BELOW THIS LINE
# ============================================================================

class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    MAGENTA = '\033[0;35m'
    CYAN = '\033[0;36m'
    BOLD = '\033[1m'
    NC = '\033[0m'

def print_header():
    print(f"{Colors.BLUE}{'='*60}{Colors.NC}")
    print(f"{Colors.BLUE}{Colors.BOLD}  Oracle Cloud Instance Auto-Retry Script{Colors.NC}")
    print(f"{Colors.BLUE}{'='*60}{Colors.NC}\n")

def print_config():
    print(f"{Colors.YELLOW}Configuration:{Colors.NC}")
    print(f"  Shape: {Colors.GREEN}{CONFIG['shape']}{Colors.NC}")
    print(f"  OCPUs: {Colors.GREEN}{CONFIG['ocpus']}{Colors.NC}")
    print(f"  Memory: {Colors.GREEN}{CONFIG['memory_in_gbs']}GB{Colors.NC}")
    print(f"  Availability Domain: {Colors.GREEN}{CONFIG['availability_domain']}{Colors.NC}")
    print(f"  Retry Interval: {Colors.GREEN}{CONFIG['retry_interval']}s{Colors.NC}")
    print(f"  Max Retries: {Colors.GREEN}{CONFIG['max_retries'] if CONFIG['max_retries'] > 0 else 'Infinite'}{Colors.NC}\n")

def check_oci_cli():
    """Check if OCI CLI is installed"""
    try:
        result = subprocess.run(['oci', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"{Colors.GREEN}✓ OCI CLI found: {result.stdout.strip()}{Colors.NC}\n")
            return True
    except FileNotFoundError:
        pass
    
    print(f"{Colors.RED}✗ OCI CLI not found!{Colors.NC}")
    print(f"{Colors.YELLOW}Install it from: https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm{Colors.NC}\n")
    return False

def get_availability_domains():
    """Get all availability domains in the region"""
    try:
        cmd = [
            'oci', 'iam', 'availability-domain', 'list',
            '--compartment-id', CONFIG['compartment_id'],
            '--output', 'json'
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            data = json.loads(result.stdout)
            return [ad['name'] for ad in data.get('data', [])]
    except Exception as e:
        print(f"{Colors.YELLOW}⚠ Could not fetch ADs: {e}{Colors.NC}")
    return [CONFIG['availability_domain']]

def create_instance(ad_name):
    """Attempt to create an instance"""
    cmd = [
        'oci', 'compute', 'instance', 'launch',
        '--compartment-id', CONFIG['compartment_id'],
        '--availability-domain', ad_name,
        '--shape', CONFIG['shape'],
        '--shape-config', json.dumps({
            "ocpus": CONFIG['ocpus'],
            "memoryInGBs": CONFIG['memory_in_gbs']
        }),
        '--image-id', CONFIG['image_id'],
        '--subnet-id', CONFIG['subnet_id'],
        '--display-name', CONFIG['display_name'],
        '--assign-public-ip', 'true',
        '--ssh-authorized-keys-file', CONFIG['ssh_public_key_path'],
        '--wait-for-state', 'RUNNING',
        '--output', 'json'
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return -1, "", "Timeout waiting for instance"
    except Exception as e:
        return -1, "", str(e)

def format_elapsed(seconds):
    """Format elapsed time as HH:MM:SS"""
    return str(timedelta(seconds=int(seconds)))

def main():
    print_header()
    
    # Check OCI CLI
    if not check_oci_cli():
        sys.exit(1)
    
    print_config()
    
    # Get availability domains
    ads = get_availability_domains() if CONFIG['try_multiple_ads'] else [CONFIG['availability_domain']]
    print(f"{Colors.CYAN}Available ADs to try: {len(ads)}{Colors.NC}")
    for ad in ads:
        print(f"  • {ad}")
    print()
    
    print(f"{Colors.YELLOW}Starting retry loop... (Press Ctrl+C to stop){Colors.NC}\n")
    
    attempt = 0
    start_time = time.time()
    ad_index = 0
    
    try:
        while True:
            attempt += 1
            
            # Check max retries
            if CONFIG['max_retries'] > 0 and attempt > CONFIG['max_retries']:
                print(f"\n{Colors.RED}✗ Maximum retries ({CONFIG['max_retries']}) reached. Exiting.{Colors.NC}")
                sys.exit(1)
            
            # Rotate through ADs
            current_ad = ads[ad_index % len(ads)]
            elapsed = format_elapsed(time.time() - start_time)
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            print(f"{Colors.BLUE}[{elapsed}]{Colors.NC} Attempt #{attempt} at {timestamp}")
            print(f"  AD: {current_ad}")
            
            # Try to create instance
            returncode, stdout, stderr = create_instance(current_ad)
            
            # Check if successful
            if returncode == 0:
                try:
                    data = json.loads(stdout)
                    if data.get('data', {}).get('lifecycle-state') == 'RUNNING':
                        print(f"\n{Colors.GREEN}{'='*60}{Colors.NC}")
                        print(f"{Colors.GREEN}{Colors.BOLD}  ✓ SUCCESS! Instance Created!{Colors.NC}")
                        print(f"{Colors.GREEN}{'='*60}{Colors.NC}\n")
                        
                        instance = data['data']
                        print(f"{Colors.YELLOW}Instance Details:{Colors.NC}")
                        print(f"  ID: {instance.get('id', 'N/A')}")
                        print(f"  Name: {instance.get('display-name', 'N/A')}")
                        print(f"  State: {instance.get('lifecycle-state', 'N/A')}")
                        print(f"  Shape: {instance.get('shape', 'N/A')}")
                        print(f"  AD: {instance.get('availability-domain', 'N/A')}")
                        print(f"\n{Colors.GREEN}Total attempts: {attempt}{Colors.NC}")
                        print(f"{Colors.GREEN}Total time: {elapsed}{Colors.NC}\n")
                        
                        sys.exit(0)
                except json.JSONDecodeError:
                    pass
            
            # Check error type
            error_msg = stderr.lower()
            if 'out of host capacity' in error_msg or 'out of capacity' in error_msg:
                print(f"  {Colors.YELLOW}⚠ Out of capacity{Colors.NC}")
                ad_index += 1  # Try next AD
            elif 'error' in error_msg or 'failed' in error_msg:
                print(f"  {Colors.RED}✗ Error: {stderr[:200]}{Colors.NC}")
            else:
                print(f"  {Colors.YELLOW}⚠ Unknown response{Colors.NC}")
            
            print(f"  {Colors.CYAN}Waiting {CONFIG['retry_interval']}s before retry...{Colors.NC}\n")
            time.sleep(CONFIG['retry_interval'])
            
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}⚠ Interrupted by user{Colors.NC}")
        print(f"{Colors.CYAN}Total attempts: {attempt}{Colors.NC}")
        print(f"{Colors.CYAN}Total time: {format_elapsed(time.time() - start_time)}{Colors.NC}\n")
        sys.exit(0)

if __name__ == '__main__':
    main()
