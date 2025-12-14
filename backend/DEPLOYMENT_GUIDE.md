# Backend Deployment Guide

This guide covers multiple deployment options for the EventHub Spring Boot backend.

## Prerequisites

- Spring Boot application (Java 21)
- Supabase PostgreSQL database (already configured)
- Docker (optional, for containerized deployment)

---

## Option 1: Railway (Recommended for Quick Deployment)

**Railway** is the easiest option - it auto-detects Spring Boot and deploys automatically.

### Steps:

1. **Sign up at [railway.app](https://railway.app)**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo" (connect your GitHub)
   - Or use "Empty Project" and deploy via CLI

3. **Configure Deployment**
   - **Root Directory**: Set to `backend`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/*.jar`

4. **Set Environment Variables**
   ```
   SPRING_DATASOURCE_URL=jdbc:postgresql://db.vwhxzxayzpdfmpnnzslq.supabase.co:5432/postgres
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=event@9060dbpassword
   SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
   SPRING_JPA_HIBERNATE_DDL_AUTO=none
   SERVER_PORT=8080
   JWT_SECRET=your-secret-key-change-this-in-production-min-256-bits-required
   JWT_EXPIRATION=86400000
   ```

5. **Deploy**
   - Railway will automatically build and deploy
   - Your API will be available at: `https://your-app-name.railway.app`

**Cost**: Free tier available, then ~$5/month

---

## Option 2: Render

**Render** offers free tier with automatic deployments from GitHub.

### Steps:

1. **Sign up at [render.com](https://render.com)**

2. **Create New Web Service**
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**
   - **Name**: `eventhub-backend`
   - **Environment**: `Docker`
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Docker Build Context**: `backend`

4. **Set Environment Variables** (same as Railway above)

5. **Deploy**
   - Render will build and deploy automatically
   - Your API: `https://eventhub-backend.onrender.com`

**Cost**: Free tier (spins down after inactivity), $7/month for always-on

---

## Option 3: Fly.io

**Fly.io** offers global deployment with great performance.

### Steps:

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Initialize Fly App** (from backend directory)
   ```bash
   cd backend
   fly launch
   ```

4. **Create `fly.toml`** (if not auto-generated)
   ```toml
   app = "eventhub-backend"
   primary_region = "bom"  # Mumbai

   [build]
     dockerfile = "Dockerfile"

   [env]
     SPRING_DATASOURCE_URL = "jdbc:postgresql://db.vwhxzxayzpdfmpnnzslq.supabase.co:5432/postgres"
     SPRING_DATASOURCE_USERNAME = "postgres"
     SPRING_DATASOURCE_PASSWORD = "event@9060dbpassword"
     SPRING_DATASOURCE_DRIVER_CLASS_NAME = "org.postgresql.Driver"
     SPRING_JPA_HIBERNATE_DDL_AUTO = "none"
     SERVER_PORT = "8080"

   [[services]]
     internal_port = 8080
     protocol = "tcp"
   ```

5. **Deploy**
   ```bash
   fly deploy
   ```

**Cost**: Free tier available, pay-as-you-go

---

## Option 4: AWS (EC2 or Elastic Beanstalk)

### Option 4A: AWS Elastic Beanstalk (Easiest)

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize** (from backend directory)
   ```bash
   cd backend
   eb init -p "Java 21" eventhub-backend
   ```

3. **Create Environment**
   ```bash
   eb create eventhub-backend-env
   ```

4. **Set Environment Variables**
   ```bash
   eb setenv SPRING_DATASOURCE_URL="jdbc:postgresql://db.vwhxzxayzpdfmpnnzslq.supabase.co:5432/postgres" \
            SPRING_DATASOURCE_USERNAME="postgres" \
            SPRING_DATASOURCE_PASSWORD="event@9060dbpassword"
   ```

5. **Deploy**
   ```bash
   eb deploy
   ```

### Option 4B: AWS EC2 (More Control)

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro (free tier) or t3.small
   - Open ports: 22 (SSH), 8080 (HTTP)

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Java 21**
   ```bash
   sudo apt update
   sudo apt install openjdk-21-jdk -y
   ```

4. **Install Maven**
   ```bash
   sudo apt install maven -y
   ```

5. **Clone and Build**
   ```bash
   git clone your-repo-url
   cd event-hub-connect/backend
   mvn clean package -DskipTests
   ```

6. **Create Systemd Service**
   ```bash
   sudo nano /etc/systemd/system/eventhub-backend.service
   ```
   
   Content:
   ```ini
   [Unit]
   Description=EventHub Backend
   After=network.target

   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu/event-hub-connect/backend
   ExecStart=/usr/bin/java -jar /home/ubuntu/event-hub-connect/backend/target/*.jar
   Environment="SPRING_DATASOURCE_URL=jdbc:postgresql://db.vwhxzxayzpdfmpnnzslq.supabase.co:5432/postgres"
   Environment="SPRING_DATASOURCE_USERNAME=postgres"
   Environment="SPING_DATASOURCE_PASSWORD=event@9060dbpassword"
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

7. **Start Service**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable eventhub-backend
   sudo systemctl start eventhub-backend
   ```

**Cost**: EC2 free tier (750 hours/month), then ~$10-20/month

---

## Option 5: Google Cloud Platform (Cloud Run)

**Cloud Run** is serverless and scales automatically.

### Steps:

1. **Install Google Cloud SDK**
   ```bash
   # macOS
   brew install google-cloud-sdk
   ```

2. **Login and Set Project**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Build and Deploy** (from backend directory)
   ```bash
   cd backend
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/eventhub-backend
   gcloud run deploy eventhub-backend \
     --image gcr.io/YOUR_PROJECT_ID/eventhub-backend \
     --platform managed \
     --region asia-south1 \
     --allow-unauthenticated \
     --set-env-vars SPRING_DATASOURCE_URL="jdbc:postgresql://db.vwhxzxayzpdfmpnnzslq.supabase.co:5432/postgres",SPRING_DATASOURCE_USERNAME="postgres",SPRING_DATASOURCE_PASSWORD="event@9060dbpassword"
   ```

**Cost**: Free tier (2 million requests/month), then pay-per-use

---

## Option 6: DigitalOcean App Platform

### Steps:

1. **Sign up at [digitalocean.com](https://digitalocean.com)**

2. **Create App**
   - Connect GitHub
   - Select repository
   - Choose "Docker" as source type

3. **Configure**
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `backend/Dockerfile`
   - Set environment variables

4. **Deploy**

**Cost**: $5/month minimum

---

## Option 7: Docker on VPS (Hetzner, Linode, etc.)

### Steps:

1. **Get VPS** (Hetzner, Linode, DigitalOcean Droplet)
   - Ubuntu 22.04
   - 2GB RAM minimum
   - $5-10/month

2. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

3. **Clone and Deploy**
   ```bash
   git clone your-repo-url
   cd event-hub-connect/backend
   
   # Create .env file
   nano .env
   ```
   
   `.env` content:
   ```
   SPRING_DATASOURCE_URL=jdbc:postgresql://db.vwhxzxayzpdfmpnnzslq.supabase.co:5432/postgres
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=event@9060dbpassword
   SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
   SPRING_JPA_HIBERNATE_DDL_AUTO=none
   SERVER_PORT=8080
   ```

4. **Run with Docker**
   ```bash
   docker build -t eventhub-backend .
   docker run -d \
     --name eventhub-backend \
     --env-file .env \
     -p 8080:8080 \
     --restart unless-stopped \
     eventhub-backend
   ```

5. **Set up Nginx Reverse Proxy** (optional, for HTTPS)
   ```bash
   sudo apt install nginx certbot python3-certbot-nginx
   ```

---

## Environment Variables Checklist

Make sure to set these in your deployment platform:

```bash
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://db.vwhxzxayzpdfmpnnzslq.supabase.co:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=event@9060dbpassword
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver

# JPA
SPRING_JPA_HIBERNATE_DDL_AUTO=none
SPRING_JPA_SHOW_SQL=false  # Set to false in production

# Server
SERVER_PORT=8080

# JWT (IMPORTANT: Change in production!)
JWT_SECRET=your-secret-key-change-this-in-production-min-256-bits-required-for-hmac-sha256-algorithm
JWT_EXPIRATION=86400000

# CORS (Update with your frontend URL)
# Add to application.properties or set as env var
```

---

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Use strong JWT secret** - Generate with: `openssl rand -base64 32`
3. **Enable HTTPS** - Use Let's Encrypt or platform SSL
4. **Set up firewall** - Only allow necessary ports
5. **Regular updates** - Keep dependencies updated
6. **Database connection** - Use connection pooling (already configured)

---

## Recommended: Railway or Render

For quick deployment, I recommend:
- **Railway**: Easiest setup, auto-detects Spring Boot
- **Render**: Free tier, good for development
- **Fly.io**: Best performance, global CDN

For production with high traffic:
- **AWS Elastic Beanstalk** or **Google Cloud Run**

---

## Update Frontend API URL

After deployment, update your frontend `.env`:

```env
VITE_API_BASE_URL=https://your-backend-url.com/api
```

---

## Monitoring & Logs

Most platforms provide:
- Application logs
- Error tracking
- Performance metrics
- Health checks

Set up monitoring to track:
- API response times
- Error rates
- Database connection health
- Memory/CPU usage

---

## Need Help?

If you encounter issues:
1. Check platform logs
2. Verify environment variables
3. Test database connectivity
4. Check port configuration
5. Review CORS settings



