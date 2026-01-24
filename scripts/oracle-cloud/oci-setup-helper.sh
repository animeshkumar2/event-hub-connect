#!/bin/bash

################################################################################
# OCI Setup Helper Script
# Helps you gather all the OCIDs needed for the retry script
################################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BLUE}${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}║         OCI Setup Helper - Gather Required OCIDs           ║${NC}"
echo -e "${BLUE}${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if OCI CLI is installed
if ! command -v oci &> /dev/null; then
    echo -e "${RED}✗ OCI CLI not found!${NC}"
    echo -e "${YELLOW}Install it with:${NC}"
    echo -e "  ${CYAN}brew install oci-cli${NC}  (macOS)"
    echo -e "  ${CYAN}Or visit: https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm${NC}"
    exit 1
fi

echo -e "${GREEN}✓ OCI CLI found${NC}"
echo ""

# Check if configured
if [ ! -f "$HOME/.oci/config" ]; then
    echo -e "${YELLOW}⚠ OCI CLI not configured${NC}"
    echo -e "${CYAN}Run: oci setup config${NC}"
    exit 1
fi

echo -e "${GREEN}✓ OCI CLI configured${NC}"
echo ""

# Get compartment ID
echo -e "${YELLOW}${BOLD}1. Getting Compartment Information...${NC}"
echo ""
COMPARTMENTS=$(oci iam compartment list --all 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "$COMPARTMENTS" | jq -r '.data[] | "  • \(.name) → \(.id)"' 2>/dev/null || echo "$COMPARTMENTS"
    ROOT_COMPARTMENT=$(echo "$COMPARTMENTS" | jq -r '.data[0].id' 2>/dev/null)
    echo ""
    echo -e "${CYAN}Use your root compartment OCID or a specific compartment${NC}"
    echo -e "${GREEN}Root Compartment: $ROOT_COMPARTMENT${NC}"
else
    echo -e "${RED}✗ Failed to fetch compartments${NC}"
fi
echo ""

# Prompt for compartment
read -p "Enter Compartment OCID (or press Enter for root): " COMPARTMENT_ID
if [ -z "$COMPARTMENT_ID" ]; then
    COMPARTMENT_ID=$ROOT_COMPARTMENT
fi
echo ""

# Get availability domains
echo -e "${YELLOW}${BOLD}2. Getting Availability Domains...${NC}"
echo ""
ADS=$(oci iam availability-domain list --compartment-id "$COMPARTMENT_ID" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "$ADS" | jq -r '.data[] | "  • \(.name)"' 2>/dev/null || echo "$ADS"
    FIRST_AD=$(echo "$ADS" | jq -r '.data[0].name' 2>/dev/null)
    echo ""
    echo -e "${GREEN}First AD: $FIRST_AD${NC}"
else
    echo -e "${RED}✗ Failed to fetch availability domains${NC}"
fi
echo ""

# Get VCN and Subnet
echo -e "${YELLOW}${BOLD}3. Getting Network Information...${NC}"
echo ""
VCNS=$(oci network vcn list --compartment-id "$COMPARTMENT_ID" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${CYAN}VCNs:${NC}"
    echo "$VCNS" | jq -r '.data[] | "  • \(.["display-name"]) → \(.id)"' 2>/dev/null || echo "$VCNS"
    FIRST_VCN=$(echo "$VCNS" | jq -r '.data[0].id' 2>/dev/null)
    echo ""
    
    if [ ! -z "$FIRST_VCN" ]; then
        echo -e "${CYAN}Subnets in first VCN:${NC}"
        SUBNETS=$(oci network subnet list --compartment-id "$COMPARTMENT_ID" --vcn-id "$FIRST_VCN" 2>/dev/null)
        echo "$SUBNETS" | jq -r '.data[] | "  • \(.["display-name"]) → \(.id)"' 2>/dev/null || echo "$SUBNETS"
        FIRST_SUBNET=$(echo "$SUBNETS" | jq -r '.data[0].id' 2>/dev/null)
        echo ""
        echo -e "${GREEN}First Subnet: $FIRST_SUBNET${NC}"
    fi
else
    echo -e "${RED}✗ Failed to fetch network information${NC}"
fi
echo ""

# Get images
echo -e "${YELLOW}${BOLD}4. Getting Available Images...${NC}"
echo ""
echo -e "${CYAN}Ubuntu Images (A1 compatible):${NC}"
UBUNTU_IMAGES=$(oci compute image list \
    --compartment-id "$COMPARTMENT_ID" \
    --operating-system "Canonical Ubuntu" \
    --shape "VM.Standard.A1.Flex" \
    --limit 3 \
    --sort-by TIMECREATED \
    --sort-order DESC 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "$UBUNTU_IMAGES" | jq -r '.data[] | "  • \(.["display-name"]) → \(.id)"' 2>/dev/null || echo "$UBUNTU_IMAGES"
    UBUNTU_IMAGE=$(echo "$UBUNTU_IMAGES" | jq -r '.data[0].id' 2>/dev/null)
else
    echo -e "${RED}✗ Failed to fetch Ubuntu images${NC}"
fi
echo ""

echo -e "${CYAN}Oracle Linux Images (A1 compatible):${NC}"
OL_IMAGES=$(oci compute image list \
    --compartment-id "$COMPARTMENT_ID" \
    --operating-system "Oracle Linux" \
    --shape "VM.Standard.A1.Flex" \
    --limit 3 \
    --sort-by TIMECREATED \
    --sort-order DESC 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "$OL_IMAGES" | jq -r '.data[] | "  • \(.["display-name"]) → \(.id)"' 2>/dev/null || echo "$OL_IMAGES"
    OL_IMAGE=$(echo "$OL_IMAGES" | jq -r '.data[0].id' 2>/dev/null)
fi
echo ""

# Check SSH key
echo -e "${YELLOW}${BOLD}5. Checking SSH Key...${NC}"
echo ""
if [ -f "$HOME/.ssh/id_rsa.pub" ]; then
    echo -e "${GREEN}✓ SSH public key found: $HOME/.ssh/id_rsa.pub${NC}"
    SSH_KEY_PATH="$HOME/.ssh/id_rsa.pub"
else
    echo -e "${YELLOW}⚠ No SSH key found at $HOME/.ssh/id_rsa.pub${NC}"
    echo -e "${CYAN}Generate one with: ssh-keygen -t rsa -b 4096${NC}"
    SSH_KEY_PATH="$HOME/.ssh/id_rsa.pub"
fi
echo ""

# Generate configuration
echo -e "${BLUE}${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}║                  Configuration Summary                     ║${NC}"
echo -e "${BLUE}${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

cat << EOF
${YELLOW}Copy this configuration to your retry script:${NC}

${CYAN}For Python script (oci-instance-retry.py):${NC}
${GREEN}
CONFIG = {
    "compartment_id": "$COMPARTMENT_ID",
    "availability_domain": "$FIRST_AD",
    "shape": "VM.Standard.A1.Flex",  # or "VM.Standard.E2.1.Micro"
    "ocpus": 2,
    "memory_in_gbs": 12,
    "image_id": "$UBUNTU_IMAGE",
    "subnet_id": "$FIRST_SUBNET",
    "display_name": "my-backend-server",
    "ssh_public_key_path": "$SSH_KEY_PATH",
    "max_retries": 1000,
    "retry_interval": 60,
    "try_multiple_ads": True,
}
${NC}

${CYAN}For Bash script (oci-instance-retry.sh):${NC}
${GREEN}
COMPARTMENT_ID="$COMPARTMENT_ID"
AVAILABILITY_DOMAIN="$FIRST_AD"
SHAPE="VM.Standard.A1.Flex"
OCPUS=2
MEMORY_IN_GBS=12
IMAGE_ID="$UBUNTU_IMAGE"
SUBNET_ID="$FIRST_SUBNET"
DISPLAY_NAME="my-backend-server"
SSH_PUBLIC_KEY_PATH="$SSH_KEY_PATH"
${NC}

${YELLOW}Shape Options:${NC}
  ${CYAN}A1 (ARM):${NC} VM.Standard.A1.Flex (up to 4 OCPUs, 24GB RAM free)
  ${CYAN}AMD:${NC} VM.Standard.E2.1.Micro (1 OCPU, 1GB RAM)

${YELLOW}Next Steps:${NC}
  1. Edit the retry script with the configuration above
  2. Run: ${CYAN}python3 scripts/oci-instance-retry.py${NC}
  3. Wait for capacity to become available

${YELLOW}Tips:${NC}
  • Try early morning (2-6 AM) for best results
  • A1 shapes are in high demand, may take hours/days
  • Consider trying AMD shapes as alternative
  • Run in background: ${CYAN}nohup python3 scripts/oci-instance-retry.py > oci.log 2>&1 &${NC}

EOF

# Save to file
CONFIG_FILE="scripts/oci-config.txt"
cat > "$CONFIG_FILE" << EOF
# OCI Configuration - Generated $(date)

COMPARTMENT_ID="$COMPARTMENT_ID"
AVAILABILITY_DOMAIN="$FIRST_AD"
SHAPE="VM.Standard.A1.Flex"
OCPUS=2
MEMORY_IN_GBS=12
IMAGE_ID="$UBUNTU_IMAGE"
SUBNET_ID="$FIRST_SUBNET"
DISPLAY_NAME="my-backend-server"
SSH_PUBLIC_KEY_PATH="$SSH_KEY_PATH"
EOF

echo -e "${GREEN}✓ Configuration saved to: $CONFIG_FILE${NC}"
echo ""
