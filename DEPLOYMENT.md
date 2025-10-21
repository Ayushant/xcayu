# Production Deployment Guide

This guide will help you deploy the Quiz Management System to a production environment.

## Pre-Deployment Checklist

### Backend

- [ ] Set `NODE_ENV=production` in environment variables
- [ ] Configure production MongoDB connection string
- [ ] Set a strong, random `JWT_SECRET` (use `openssl rand -base64 32`)
- [ ] Update `CORS_ORIGINS` with your production frontend URL(s)
- [ ] Update `SOCKET_ORIGINS` with your production frontend URL(s)
- [ ] Enable MongoDB authentication
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up process manager (PM2, systemd)
- [ ] Configure reverse proxy (Nginx, Apache)
- [ ] Set up logging and monitoring
- [ ] Configure automated backups

### Frontend

- [ ] Set `VITE_API_URL` to your production backend URL
- [ ] Build the production bundle (`npm run build`)
- [ ] Configure web server (Nginx, Apache, or CDN)
- [ ] Enable HTTPS
- [ ] Configure caching headers
- [ ] Set up CDN (optional but recommended)
- [ ] Remove development dependencies from production

### Security

- [ ] Change all default passwords
- [ ] Remove test accounts
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Configure CSP headers
- [ ] Enable HSTS
- [ ] Regular security updates

## Environment Variables

### Backend (.env)

```env
# Environment
NODE_ENV=production

# Server
PORT=5000

# Database (use strong authentication)
MONGO_URI=mongodb://username:password@your-mongo-host:27017/quiz-app?authSource=admin

# JWT (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# CORS (your production domains)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Socket.IO
SOCKET_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Frontend (.env.production)

```env
VITE_API_URL=https://api.yourdomain.com
```

## Deployment Options

### Option 1: Traditional VPS/VM Deployment

#### Backend Setup

1. **Connect to your server:**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js and MongoDB:**
   ```bash
   # Install Node.js (v18 LTS recommended)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install MongoDB
   # Follow official MongoDB installation guide for your OS
   ```

3. **Clone and setup the application:**
   ```bash
   cd /var/www
   git clone <your-repo-url> quiz-app
   cd quiz-app/Backend
   npm install --production
   ```

4. **Configure environment:**
   ```bash
   nano .env
   # Add your production environment variables
   ```

5. **Setup PM2 for process management:**
   ```bash
   sudo npm install -g pm2
   pm2 start Server.js --name quiz-backend
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx as reverse proxy:**
   ```nginx
   # /etc/nginx/sites-available/quiz-api
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # Socket.IO support
       location /socket.io/ {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Enable site and setup SSL:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/quiz-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx

   # Install Certbot and get SSL certificate
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

#### Frontend Setup

1. **Build the frontend:**
   ```bash
   cd /var/www/quiz-app/Frontend
   npm install
   npm run build
   ```

2. **Configure Nginx for frontend:**
   ```nginx
   # /etc/nginx/sites-available/quiz-frontend
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       root /var/www/quiz-app/Frontend/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

3. **Enable and secure:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/quiz-frontend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

### Option 2: Docker Deployment

#### Backend Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "Server.js"]
```

#### Frontend Dockerfile

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongo-data:/data/db
    networks:
      - quiz-network

  backend:
    build: ./Backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      MONGO_URI: mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/quiz-app?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGINS: ${CORS_ORIGINS}
      SOCKET_ORIGINS: ${SOCKET_ORIGINS}
    depends_on:
      - mongodb
    networks:
      - quiz-network

  frontend:
    build: ./Frontend
    restart: always
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - quiz-network

networks:
  quiz-network:
    driver: bridge

volumes:
  mongo-data:
```

### Option 3: Cloud Platform Deployment

#### Heroku

**Backend:**
```bash
cd Backend
heroku create your-app-name-api
heroku addons:create mongolab:sandbox
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set CORS_ORIGINS=https://your-app.herokuapp.com
heroku git:remote -a your-app-name-api
git push heroku main
```

**Frontend:**
```bash
cd Frontend
heroku create your-app-name
heroku config:set VITE_API_URL=https://your-app-name-api.herokuapp.com
heroku git:remote -a your-app-name
git push heroku main
```

#### AWS/Azure/GCP

Follow the platform-specific guides for deploying Node.js applications and React applications.

## Post-Deployment

### 1. Create Super Admin

```bash
cd Backend
node createSuperAdmin.js
```

### 2. Test the Application

- [ ] Test user login
- [ ] Test quiz creation
- [ ] Test student enrollment
- [ ] Test socket connections
- [ ] Test API endpoints
- [ ] Check error handling

### 3. Monitoring Setup

Install monitoring tools:
```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Application monitoring (optional)
# - New Relic
# - Datadog
# - Sentry for error tracking
```

### 4. Backup Configuration

Setup automated MongoDB backups:
```bash
# Create backup script
#!/bin/bash
TIMESTAMP=$(date +%F_%T)
mongodump --uri="your-mongo-uri" --out="/backups/mongo-$TIMESTAMP"
# Upload to S3 or other storage
```

Setup cron job:
```bash
crontab -e
# Add daily backup at 2 AM
0 2 * * * /path/to/backup-script.sh
```

## Troubleshooting

### Issue: Cannot connect to MongoDB
- Check MongoDB is running
- Verify connection string
- Check firewall rules
- Ensure MongoDB authentication is configured correctly

### Issue: CORS errors
- Verify CORS_ORIGINS in backend .env
- Check frontend is using correct API URL
- Ensure protocol (http/https) matches

### Issue: Socket.IO not connecting
- Check SOCKET_ORIGINS configuration
- Verify WebSocket support in reverse proxy
- Check firewall allows WebSocket connections

### Issue: 502 Bad Gateway
- Check backend is running (pm2 status)
- Verify Nginx configuration
- Check backend logs for errors

## Security Best Practices

1. **Use HTTPS everywhere**
2. **Keep dependencies updated**: `npm audit fix`
3. **Implement rate limiting** (use express-rate-limit)
4. **Enable helmet.js** for security headers
5. **Regular security audits**
6. **Monitor application logs**
7. **Use environment variables for secrets**
8. **Implement proper authentication**
9. **Regular backups**
10. **Keep MongoDB updated**

## Performance Optimization

1. **Enable Gzip compression** in Nginx
2. **Use CDN** for static assets
3. **Implement caching** headers
4. **Database indexing** for frequent queries
5. **Connection pooling** for MongoDB
6. **Load balancing** for high traffic

## Maintenance

### Regular Tasks
- Weekly: Review application logs
- Monthly: Update dependencies
- Quarterly: Security audit
- As needed: Database cleanup and optimization

### Updating the Application

```bash
# Backend
cd /var/www/quiz-app/Backend
git pull
npm install --production
pm2 restart quiz-backend

# Frontend
cd /var/www/quiz-app/Frontend
git pull
npm install
npm run build
# Nginx will serve the updated files
```

## Support

For issues or questions:
- Check logs: `pm2 logs quiz-backend`
- Review MongoDB logs
- Check Nginx error logs: `/var/log/nginx/error.log`
- Application logs in the Backend

Remember to test thoroughly in a staging environment before deploying to production!

