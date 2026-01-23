# Oracle Cloud Instance Auto-Retry Scripts

This directory contains scripts to automatically retry creating Oracle Cloud instances when you encounter "Out of host capacity" errors.

## 📁 Files

- **`oci-instance-retry.py`** - Python retry script (recommended)
- **`oci-instance-retry.sh`** - Bash retry script (alternative)
- **`oci-setup-helper.sh`** - Helper to gather all required OCIDs
- **`OCI_RETRY_GUIDE.md`** - Complete documentation and guide

## 🚀 Quick Start

### 1. Install OCI CLI
```bash
brew install oci-cli
```

### 2. Configure OCI CLI
```bash
oci setup config
```

### 3. Gather Your OCIDs
```bash
./oci-setup-helper.sh
```

### 4. Edit Configuration
Open `oci-instance-retry.py` and update the CONFIG section with your OCIDs.

### 5. Run the Script
```bash
python3 oci-instance-retry.py
```

Or run in background:
```bash
nohup python3 oci-instance-retry.py > oci-retry.log 2>&1 &
tail -f oci-retry.log
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
