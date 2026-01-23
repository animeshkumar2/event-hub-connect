# Oracle Cloud Instance Auto-Retry Guide

This guide helps you automatically retry creating OCI instances when you get "Out of host capacity" errors.

## Prerequisites

### 1. Install OCI CLI

**macOS:**
```bash
brew install oci-cli
```

**Linux/macOS (alternative):**
```bash
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"
```

**Verify installation:**
```bash
oci --version
```

### 2. Configure OCI CLI

Run the setup wizard:
```bash
oci setup config
```

You'll need:
- **User OCID**: From OCI Console → Profile → User Settings
- **Tenancy OCID**: From OCI Console → Profile → Tenancy
- **Region**: e.g., `ap-mumbai-1`, `ap-hyderabad-1`
- **API Key**: Generate from User Settings → API Keys

## Getting Required OCIDs

### 1. Compartment OCID
```bash
# List all compartments
oci iam compartment list --all

# Or use root compartment (your tenancy OCID)
```

### 2. Availability Domain
```bash
# List availability domains
oci iam availability-domain list --compartment-id <your-compartment-ocid>
```

### 3. Image OCID
```bash
# List Ubuntu images
oci compute image list \
  --compartment-id <your-compartment-ocid> \
  --operating-system "Canonical Ubuntu" \
  --shape "VM.Standard.A1.Flex" \
  --limit 5

# List Oracle Linux images
oci compute image list \
  --compartment-id <your-compartment-ocid> \
  --operating-system "Oracle Linux" \
  --shape "VM.Standard.A1.Flex" \
  --limit 5
```

### 4. Subnet OCID
```bash
# List VCNs
oci network vcn list --compartment-id <your-compartment-ocid>

# List subnets in a VCN
oci network subnet list \
  --compartment-id <your-compartment-ocid> \
  --vcn-id <your-vcn-ocid>
```

## Configuration

### Option 1: Python Script (Recommended)

1. **Edit the configuration** in `oci-instance-retry.py`:

```python
CONFIG = {
    "compartment_id": "ocid1.compartment.oc1..aaaa...",
    "availability_domain": "aBCD:AP-MUMBAI-1-AD-1",
    "shape": "VM.Standard.A1.Flex",  # or "VM.Standard.E2.1.Micro"
    "ocpus": 2,
    "memory_in_gbs": 12,
    "image_id": "ocid1.image.oc1.ap-mumbai-1.aaaa...",
    "subnet_id": "ocid1.subnet.oc1.ap-mumbai-1.aaaa...",
    "display_name": "my-backend-server",
    "ssh_public_key_path": str(Path.home() / ".ssh" / "id_rsa.pub"),
    "max_retries": 1000,
    "retry_interval": 60,
    "try_multiple_ads": True,
}
```

2. **Make it executable:**
```bash
chmod +x scripts/oci-instance-retry.py
```

3. **Run it:**
```bash
python3 scripts/oci-instance-retry.py
```

### Option 2: Bash Script

1. **Edit the configuration** in `oci-instance-retry.sh`:

```bash
COMPARTMENT_ID="ocid1.compartment.oc1..aaaa..."
AVAILABILITY_DOMAIN="aBCD:AP-MUMBAI-1-AD-1"
SHAPE="VM.Standard.A1.Flex"
OCPUS=2
MEMORY_IN_GBS=12
IMAGE_ID="ocid1.image.oc1.ap-mumbai-1.aaaa..."
SUBNET_ID="ocid1.subnet.oc1.ap-mumbai-1.aaaa..."
DISPLAY_NAME="my-backend-server"
SSH_PUBLIC_KEY_PATH="$HOME/.ssh/id_rsa.pub"
```

2. **Make it executable:**
```bash
chmod +x scripts/oci-instance-retry.sh
```

3. **Run it:**
```bash
./scripts/oci-instance-retry.sh
```

## Shape Options

### Free Tier Shapes

**A1 (ARM/Ampere) - Most Popular:**
```python
"shape": "VM.Standard.A1.Flex"
"ocpus": 4  # Up to 4 OCPUs free
"memory_in_gbs": 24  # Up to 24GB free
```

**E2 (AMD) - Alternative:**
```python
"shape": "VM.Standard.E2.1.Micro"
"ocpus": 1
"memory_in_gbs": 1
```

## Tips for Success

### 1. Best Times to Try
- **Early morning**: 2-6 AM IST
- **Late night**: 11 PM - 2 AM IST
- **Weekdays** tend to have better availability than weekends

### 2. Region Selection
Try regions with better availability:
- `ap-hyderabad-1` (Hyderabad) - Newer, often has capacity
- `ap-mumbai-1` (Mumbai)
- `ap-singapore-1` (Singapore)
- `ap-seoul-1` (Seoul)

### 3. Multiple Strategies
Run multiple scripts simultaneously:
```bash
# Terminal 1: Try A1 shape
python3 scripts/oci-instance-retry.py

# Terminal 2: Try AMD shape (edit config first)
python3 scripts/oci-instance-retry.py
```

### 4. Run in Background
```bash
# Run in background and log output
nohup python3 scripts/oci-instance-retry.py > oci-retry.log 2>&1 &

# Check progress
tail -f oci-retry.log

# Stop it
pkill -f oci-instance-retry.py
```

## Troubleshooting

### "OCI CLI not found"
```bash
# Install OCI CLI
brew install oci-cli

# Or use pip
pip3 install oci-cli
```

### "Authentication failed"
```bash
# Reconfigure OCI CLI
oci setup config

# Test authentication
oci iam region list
```

### "Invalid parameter"
Double-check all OCIDs are correct:
```bash
# Verify compartment exists
oci iam compartment get --compartment-id <your-compartment-ocid>

# Verify subnet exists
oci network subnet get --subnet-id <your-subnet-ocid>
```

### "SSH key not found"
```bash
# Generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa

# Update the path in config
"ssh_public_key_path": "/path/to/your/key.pub"
```

## What Happens When Successful?

The script will:
1. ✅ Create the instance
2. ✅ Wait for it to reach RUNNING state
3. ✅ Display instance details (ID, IP address, etc.)
4. ✅ Exit automatically

You can then SSH into your instance:
```bash
ssh ubuntu@<public-ip>  # For Ubuntu
ssh opc@<public-ip>     # For Oracle Linux
```

## Alternative: Manual Quick Retry

If you prefer manual control:

```bash
# Quick retry loop (Ctrl+C to stop)
while true; do
  oci compute instance launch \
    --compartment-id <compartment-ocid> \
    --availability-domain <ad-name> \
    --shape VM.Standard.A1.Flex \
    --shape-config '{"ocpus":2,"memoryInGBs":12}' \
    --image-id <image-ocid> \
    --subnet-id <subnet-ocid> \
    --display-name my-instance \
    --assign-public-ip true \
    --ssh-authorized-keys-file ~/.ssh/id_rsa.pub \
    --wait-for-state RUNNING && break
  
  echo "Failed, retrying in 60s..."
  sleep 60
done
```

## Need Help?

1. Check OCI documentation: https://docs.oracle.com/en-us/iaas/Content/Compute/Tasks/launchinginstance.htm
2. Verify your free tier limits: https://www.oracle.com/cloud/free/
3. Try different regions if one consistently fails

## Success Rate

Based on community reports:
- **A1 shapes**: Can take hours to days (high demand)
- **AMD shapes**: Usually available within minutes to hours
- **Best success**: Early morning hours in your region's timezone
