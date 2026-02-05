#!/bin/bash

################################################################################
# Oracle Cloud Free Tier Setup Script
# Interactive setup for OCI instance retry script
################################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BLUE}${BOLD}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Oracle Cloud Free Tier - Interactive Setup             ║"
echo "║     4 OCPUs + 24GB RAM - Forever Free!                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Step 1: Check OCI CLI
echo -e "${YELLOW}Step 1: Checking OCI CLI...${NC}"
if ! command -v oci &> /dev/null; then
    echo -e "${RED}✗ OCI CLI not installed${NC}"
    echo -e "${CYAN}Installing OCI CLI...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install oci-cli
    else
        bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"
    fi
    
    if ! command -v oci &> /dev/null; then
        echo -e "${RED}Failed to install OCI CLI. Please install manually:${NC}"
        echo -e "${CYAN}https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ OCI CLI installed${NC}\n"

# Step 2: Check OCI config
echo -e "${YELLOW}Step 2: Checking OCI configuration...${NC}"
if [ ! -f "$HOME/.oci/config" ]; then
    echo -e "${CYAN}OCI CLI not configured. Starting setup...${NC}"
    echo -e "${YELLOW}You'll need from Oracle Cloud Console:${NC}"
    echo "  1. User OCID: Profile → User Settings → OCID"
    echo "  2. Tenancy OCID: Profile → Tenancy → OCID"
    echo "  3. Region: e.g., ap-mumbai-1"
    echo ""
    read -p "Press Enter to start OCI setup..."
    oci setup config
fi

# Test OCI connection
echo -e "${CYAN}Testing OCI connection...${NC}"
if ! oci iam region list &> /dev/null; then
    echo -e "${RED}✗ OCI authentication failed${NC}"
    echo -e "${YELLOW}Make sure you've uploaded your API public key to Oracle Cloud Console:${NC}"
    echo "  1. Go to Profile → User Settings → API Keys"
    echo "  2. Click 'Add API Key' → 'Paste Public Key'"
    echo "  3. Paste contents of: ~/.oci/oci_api_key_public.pem"
    echo ""
    echo -e "${CYAN}To view your public key:${NC}"
    echo "  cat ~/.oci/oci_api_key_public.pem"
    exit 1
fi
echo -e "${GREEN}✓ OCI CLI configured and authenticated${NC}\n"

# Step 3: Check SSH key
echo -e "${YELLOW}Step 3: Checking SSH key...${NC}"
SSH_KEY_PATH="$HOME/.ssh/oci_key"
if [ ! -f "${SSH_KEY_PATH}.pub" ]; then
    echo -e "${CYAN}Creating SSH key for Oracle Cloud...${NC}"
    ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_PATH" -N ""
fi
echo -e "${GREEN}✓ SSH key ready: ${SSH_KEY_PATH}.pub${NC}\n"

# Step 4: Get Tenancy OCID
echo -e "${YELLOW}Step 4: Getting Tenancy OCID...${NC}"
TENANCY_OCID=$(grep tenancy ~/.oci/config | head -1 | cut -d'=' -f2)
echo -e "${GREEN}✓ Tenancy: ${TENANCY_OCID}${NC}\n"

# Step 5: Get Availability Domain
echo -e "${YELLOW}Step 5: Getting Availability Domain...${NC}"
AD_NAME=$(oci iam availability-domain list --query "data[0].name" --raw-output 2>/dev/null)
if [ -z "$AD_NAME" ]; then
    echo -e "${RED}✗ Failed to get availability domain${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AD: ${AD_NAME}${NC}\n"

# Step 6: Check/Create VCN and Subnet
echo -e "${YELLOW}Step 6: Checking network (VCN/Subnet)...${NC}"
SUBNET_OCID=$(oci network subnet list --compartment-id "$TENANCY_OCID" --query "data[?contains(\"display-name\", 'public') || contains(\"display-name\", 'Public')].id | [0]" --raw-output 2>/dev/null)

if [ -z "$SUBNET_OCID" ] || [ "$SUBNET_OCID" == "null" ]; then
    # Try to get any subnet
    SUBNET_OCID=$(oci network subnet list --compartment-id "$TENANCY_OCID" --query "data[0].id" --raw-output 2>/dev/null)
fi

if [ -z "$SUBNET_OCID" ] || [ "$SUBNET_OCID" == "null" ]; then
    echo -e "${RED}✗ No subnet found${NC}"
    echo -e "${YELLOW}Please create a VCN in Oracle Cloud Console:${NC}"
    echo "  1. Search 'VCN' in console"
    echo "  2. Click 'Start VCN Wizard' → 'Create VCN with Internet Connectivity'"
    echo "  3. Name it anything (e.g., 'my-vcn') and click Create"
    echo "  4. Re-run this script"
    exit 1
fi
echo -e "${GREEN}✓ Subnet: ${SUBNET_OCID}${NC}\n"

# Step 7: Get Ubuntu Image
echo -e "${YELLOW}Step 7: Getting Ubuntu image for ARM...${NC}"
IMAGE_OCID=$(oci compute image list --compartment-id "$TENANCY_OCID" --operating-system "Canonical Ubuntu" --operating-system-version "22.04" --shape "VM.Standard.A1.Flex" --limit 1 --query "data[0].id" --raw-output 2>/dev/null)

if [ -z "$IMAGE_OCID" ] || [ "$IMAGE_OCID" == "null" ]; then
    echo -e "${RED}✗ Failed to get Ubuntu image${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Image: ${IMAGE_OCID}${NC}\n"

# Step 8: Update the retry script
echo -e "${YELLOW}Step 8: Configuring retry script...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RETRY_SCRIPT="${SCRIPT_DIR}/oci-instance-retry.py"

# Create a backup
cp "$RETRY_SCRIPT" "${RETRY_SCRIPT}.bak"

# Update config using Python
python3 << EOF
import re

config = '''CONFIG = {
    # Required OCI parameters
    "compartment_id": "${TENANCY_OCID}",
    "availability_domain": "${AD_NAME}",
    "shape": "VM.Standard.A1.Flex",  # ARM - 4 OCPUs, 24GB free
    "ocpus": 4,  # Max free tier
    "memory_in_gbs": 24,  # Max free tier
    "image_id": "${IMAGE_OCID}",
    "subnet_id": "${SUBNET_OCID}",
    "display_name": "free-tier-instance",
    "ssh_public_key_path": "${SSH_KEY_PATH}.pub",
    
    # Retry settings
    "max_retries": 0,  # 0 = infinite retries
    "retry_interval": 60,  # seconds between retries
    "try_multiple_ads": True,  # Try all ADs in region if one fails
}'''

with open("${RETRY_SCRIPT}", 'r') as f:
    content = f.read()

# Replace CONFIG block
pattern = r'CONFIG = \{[^}]+# Retry settings[^}]+\}'
content = re.sub(pattern, config, content, flags=re.DOTALL)

with open("${RETRY_SCRIPT}", 'w') as f:
    f.write(content)

print("Config updated successfully")
EOF

echo -e "${GREEN}✓ Retry script configured${NC}\n"

# Summary
echo -e "${BLUE}${BOLD}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete!                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Tenancy:    $TENANCY_OCID"
echo "  AD:         $AD_NAME"
echo "  Subnet:     $SUBNET_OCID"
echo "  Image:      $IMAGE_OCID"
echo "  SSH Key:    ${SSH_KEY_PATH}.pub"
echo ""

echo -e "${YELLOW}To start the retry script:${NC}"
echo -e "  ${CYAN}python3 ${RETRY_SCRIPT}${NC}"
echo ""
echo -e "${YELLOW}To run in background:${NC}"
echo -e "  ${CYAN}nohup python3 -u ${RETRY_SCRIPT} > oci.log 2>&1 &${NC}"
echo ""
echo -e "${YELLOW}To check progress:${NC}"
echo -e "  ${CYAN}tail -f oci.log${NC}"
echo ""
echo -e "${YELLOW}Tips:${NC}"
echo "  • Best times: 2-6 AM IST (early morning)"
echo "  • A1 ARM instances are in high demand - may take hours/days"
echo "  • Keep your computer awake for best results"
echo ""

read -p "Start the retry script now? (y/n): " START_NOW
if [[ "$START_NOW" =~ ^[Yy]$ ]]; then
    echo -e "\n${CYAN}Starting retry script...${NC}\n"
    python3 "$RETRY_SCRIPT"
fi
