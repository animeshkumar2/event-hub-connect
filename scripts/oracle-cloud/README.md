# Oracle Cloud Instance Auto-Retry Scripts

This directory contains scripts to automatically retry creating Oracle Cloud instances when you encounter "Out of host capacity" errors.

## 📁 Files

- **`setup-oci.sh`** - Interactive setup script (START HERE!)
- **`oci-instance-retry.py`** - Python retry script
- **`oci-setup-helper.sh`** - Helper to gather all required OCIDs
- **`OCI_RETRY_GUIDE.md`** - Complete documentation and guide

## 🚀 Quick Start (One Command!)

```bash
./scripts/oracle-cloud/setup-oci.sh
```

This interactive script will:
1. ✅ Install OCI CLI (if needed)
2. ✅ Guide you through OCI configuration
3. ✅ Create SSH keys
4. ✅ Auto-detect your VCN/Subnet
5. ✅ Configure the retry script
6. ✅ Start retrying for a free instance

## 📋 Prerequisites

1. **Oracle Cloud Account** - Sign up at https://cloud.oracle.com (free)
2. **VCN Created** - In Oracle Console: Search "VCN" → "Start VCN Wizard" → "Create VCN with Internet Connectivity"

## 🔧 Manual Setup (Alternative)

### 1. Install OCI CLI
```bash
brew install oci-cli
```

### 2. Configure OCI CLI
```bash
oci setup config
```

### 3. Upload API Key
- Go to Oracle Console → Profile → User Settings → API Keys
- Click "Add API Key" → "Paste Public Key"
- Paste contents of `~/.oci/oci_api_key_public.pem`

### 4. Run Setup
```bash
./scripts/oracle-cloud/setup-oci.sh
```

## ▶️ Running the Retry Script

**Foreground (see output):**
```bash
python3 scripts/oracle-cloud/oci-instance-retry.py
```

**Background (keeps running):**
```bash
nohup python3 -u scripts/oracle-cloud/oci-instance-retry.py > oci.log 2>&1 &
tail -f oci.log
```

**Keep Mac awake while running:**
```bash
caffeinate -i nohup python3 -u scripts/oracle-cloud/oci-instance-retry.py > oci.log 2>&1 &
```

## 📖 Full Documentation

See **`OCI_RETRY_GUIDE.md`** for complete documentation including:
- Detailed setup instructions
- How to get all required OCIDs
- Shape options and configurations
- Troubleshooting tips
- Best practices for success

## ⚠️ Note

Oracle Cloud Free Tier has limited capacity, especially for A1 (ARM) shapes. These scripts help automate the retry process, but success is not guaranteed. Consider alternative platforms like Railway, Render, or AWS if you need immediate deployment.

## 💡 Tips

- Try early morning hours (2-6 AM IST) for best results
- A1 shapes can take hours or days to get capacity
- AMD shapes (E2.1.Micro) usually have better availability
- Consider trying different regions (Hyderabad often has better capacity)
