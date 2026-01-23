#!/bin/bash

################################################################################
# Oracle Cloud Instance Auto-Retry Script
# This script automatically retries creating an OCI instance until successful
################################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - EDIT THESE VALUES
COMPARTMENT_ID="your-compartment-ocid"
AVAILABILITY_DOMAIN="your-ad-name"  # e.g., "aBCD:AP-MUMBAI-1-AD-1"
SHAPE="VM.Standard.A1.Flex"  # or "VM.Standard.E2.1.Micro" for AMD
OCPUS=2  # For A1: 1-4, For AMD: 1
MEMORY_IN_GBS=12  # For A1: 6-24, For AMD: 1
IMAGE_ID="your-image-ocid"  # Ubuntu/Oracle Linux image OCID
SUBNET_ID="your-subnet-ocid"
DISPLAY_NAME="my-instance"
SSH_PUBLIC_KEY_PATH="$HOME/.ssh/id_rsa.pub"

# Retry configuration
MAX_RETRIES=1000  # Maximum number of attempts (0 = infinite)
RETRY_INTERVAL=60  # Seconds between retries
NOTIFY_SOUND=true  # Play sound on success (macOS only)

################################################################################
# DO NOT EDIT BELOW THIS LINE
################################################################################

attempt=0
start_time=$(date +%s)

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Oracle Cloud Instance Auto-Retry Script                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo -e "  Shape: ${GREEN}$SHAPE${NC}"
echo -e "  OCPUs: ${GREEN}$OCPUS${NC}"
echo -e "  Memory: ${GREEN}${MEMORY_IN_GBS}GB${NC}"
echo -e "  Availability Domain: ${GREEN}$AVAILABILITY_DOMAIN${NC}"
echo -e "  Retry Interval: ${GREEN}${RETRY_INTERVAL}s${NC}"
echo ""
echo -e "${YELLOW}Starting retry loop...${NC}"
echo ""

# Function to calculate elapsed time
elapsed_time() {
    current_time=$(date +%s)
    elapsed=$((current_time - start_time))
    hours=$((elapsed / 3600))
    minutes=$(((elapsed % 3600) / 60))
    seconds=$((elapsed % 60))
    printf "%02d:%02d:%02d" $hours $minutes $seconds
}

# Function to create instance
create_instance() {
    oci compute instance launch \
        --compartment-id "$COMPARTMENT_ID" \
        --availability-domain "$AVAILABILITY_DOMAIN" \
        --shape "$SHAPE" \
        --shape-config "{\"ocpus\":$OCPUS,\"memoryInGBs\":$MEMORY_IN_GBS}" \
        --image-id "$IMAGE_ID" \
        --subnet-id "$SUBNET_ID" \
        --display-name "$DISPLAY_NAME" \
        --assign-public-ip true \
        --ssh-authorized-keys-file "$SSH_PUBLIC_KEY_PATH" \
        --wait-for-state RUNNING \
        2>&1
}

# Main retry loop
while true; do
    attempt=$((attempt + 1))
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    if [ $MAX_RETRIES -gt 0 ] && [ $attempt -gt $MAX_RETRIES ]; then
        echo -e "${RED}✗ Maximum retries ($MAX_RETRIES) reached. Exiting.${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}[$(elapsed_time)]${NC} Attempt #${attempt} at ${timestamp}..."
    
    # Try to create instance
    result=$(create_instance)
    
    # Check if successful
    if echo "$result" | grep -q '"lifecycle-state": "RUNNING"'; then
        echo ""
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║              ✓ SUCCESS! Instance Created!                 ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}Instance Details:${NC}"
        echo "$result" | grep -E '"display-name"|"id"|"lifecycle-state"|"public-ip"' | sed 's/^/  /'
        echo ""
        echo -e "${GREEN}Total attempts: $attempt${NC}"
        echo -e "${GREEN}Total time: $(elapsed_time)${NC}"
        
        # Play success sound on macOS
        if [ "$NOTIFY_SOUND" = true ] && [ "$(uname)" = "Darwin" ]; then
            afplay /System/Library/Sounds/Glass.aiff
        fi
        
        exit 0
    fi
    
    # Check for capacity error
    if echo "$result" | grep -qi "out of host capacity\|out of capacity"; then
        echo -e "${YELLOW}  ⚠ Out of capacity - will retry in ${RETRY_INTERVAL}s${NC}"
    elif echo "$result" | grep -qi "error\|failed"; then
        echo -e "${RED}  ✗ Error occurred:${NC}"
        echo "$result" | grep -i "message\|error" | head -3 | sed 's/^/    /'
        echo -e "${YELLOW}  Will retry in ${RETRY_INTERVAL}s${NC}"
    else
        echo -e "${YELLOW}  ⚠ Unknown response - will retry in ${RETRY_INTERVAL}s${NC}"
    fi
    
    # Wait before next attempt
    sleep $RETRY_INTERVAL
done
