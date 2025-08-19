# 🔧 ERP System Troubleshooting Guide

This guide helps resolve common issues when setting up and running the ERP system.

## 🍎 macOS-Specific Issues

### `timeout: command not found`

**Problem**: The `timeout` command is not available on macOS by default.

**Solution**: ✅ **FIXED!** All scripts have been updated to use macOS-compatible timeout functions.

### Docker Issues on macOS

**Problem**: Docker services fail to start or are slow.

**Solutions**:
1. **Increase Docker Resources**:
   - Open Docker Desktop
   - Go to Settings → Resources
   - Increase Memory to at least 4GB
   - Increase CPU to at least 2 cores
   - Restart Docker

2. **Check Docker is Running**:
   ```bash
   docker info
   # Should show Docker information without errors
   ```

3. **Reset Docker if needed**:
   - Docker Desktop → Troubleshoot → Reset to factory defaults

### Port Conflicts

**Problem**: Ports already in use (common on macOS).

**Solutions**:
1. **Check what's using the port**:
   ```bash
   lsof -i :3000  # Check port 3000
   lsof -i :8080  # Check port 8080
   ```

2. **Kill processes using the port**:
   ```bash
   sudo lsof -ti:3000 | xargs kill -9
   ```

3. **Alternative**: Change ports in docker-compose.yml

## 🐧 Linux-Specific Issues

### Permission Denied

**Problem**: Docker commands fail with permission denied.

**Solutions**:
1. **Add user to docker group**:
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. **Or run with sudo** (not recommended for production):
   ```bash
   sudo ./scripts/dev-start.sh
   ```

## 🪟 Windows-Specific Issues

### WSL2 Issues

**Problem**: Scripts fail on Windows.

**Solutions**:
1. **Use WSL2 with Ubuntu**:
   - Install WSL2 and Ubuntu
   - Run all commands in WSL2 terminal

2. **Install required tools in WSL2**:
   ```bash
   sudo apt update
   sudo apt install curl lsof netcat-openbsd
   ```

### Path Issues

**Problem**: Scripts can't find files.

**Solution**: Use WSL2 paths, not Windows paths.

## 🔍 Common Service Issues

### Keycloak Takes Too Long to Start

**Symptoms**:
- Script waits for 5+ minutes
- "Keycloak failed to start" error

**Solutions**:
1. **Check Keycloak logs**:
   ```bash
   docker-compose logs keycloak
   ```

2. **Wait longer** (first startup can take 5-10 minutes):
   ```bash
   # Manually wait for Keycloak
   curl -s -f http://localhost:8080/health/ready
   ```

3. **Increase memory** for Docker (recommended: 6GB+)

4. **Restart just Keycloak**:
   ```bash
   docker-compose restart keycloak
   ```

### PostgreSQL Connection Issues

**Symptoms**:
- "Connection refused" errors
- "Database not ready" messages

**Solutions**:
1. **Check PostgreSQL logs**:
   ```bash
   docker-compose logs postgres
   ```

2. **Restart PostgreSQL**:
   ```bash
   docker-compose restart postgres
   ```

3. **Check disk space**:
   ```bash
   df -h
   ```

### Node.js/npm Issues

**Symptoms**:
- Package installation fails
- "Module not found" errors

**Solutions**:
1. **Clear npm cache**:
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Use correct Node.js version** (18.0.0 or higher):
   ```bash
   node --version
   ```

4. **Install with legacy peer deps** (if needed):
   ```bash
   npm install --legacy-peer-deps
   ```

## 🌐 Frontend Issues

### White Screen / App Won't Load

**Solutions**:
1. **Check browser console** for errors (F12)

2. **Verify backend services** are running:
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3003/health
   ```

3. **Check .env file** exists:
   ```bash
   ls -la apps/web-app/.env
   ```

4. **Restart frontend**:
   ```bash
   # Stop (Ctrl+C) and restart
   npm run dev --workspace=apps/web-app
   ```

### Authentication Issues

**Problem**: Can't login, redirects don't work.

**Solutions**:
1. **Check Keycloak is accessible**:
   ```bash
   curl http://localhost:8080/health/ready
   ```

2. **Verify Keycloak client setup**:
   ```bash
   ./scripts/setup-keycloak-client.sh
   ```

3. **Check browser network tab** for failed requests

4. **Clear browser cache and cookies**

## 📊 Monitoring Issues

### Grafana Won't Start

**Solutions**:
1. **Check logs**:
   ```bash
   docker-compose logs grafana
   ```

2. **Reset Grafana data**:
   ```bash
   docker-compose down
   docker volume rm crm_grafana-data
   docker-compose up -d grafana
   ```

### Can't Access Admin Interfaces

**Problem**: Keycloak admin, Grafana, etc. return 404 or timeout.

**Solutions**:
1. **Wait for services to fully start** (can take 2-5 minutes)

2. **Check all containers are running**:
   ```bash
   docker-compose ps
   ```

3. **Restart specific service**:
   ```bash
   docker-compose restart [service-name]
   ```

## 🚀 Performance Issues

### System is Slow

**Solutions**:
1. **Increase Docker resources** (Memory: 8GB+, CPU: 4+ cores)

2. **Close unnecessary applications**

3. **Use SSD** instead of HDD if possible

4. **Monitor system resources**:
   ```bash
   # macOS
   top
   
   # Linux
   htop
   ```

### Database is Slow

**Solutions**:
1. **Check database connections**:
   ```bash
   docker-compose exec postgres psql -U erp_user -d erp_db -c "SELECT COUNT(*) FROM pg_stat_activity;"
   ```

2. **Restart PostgreSQL**:
   ```bash
   docker-compose restart postgres
   ```

## 🛠️ General Troubleshooting Steps

### 1. Check System Status
```bash
./scripts/show-system-status.sh
```

### 2. Restart Everything
```bash
./scripts/stop-erp.sh
./scripts/start-erp.sh
```

### 3. Clean Restart
```bash
docker-compose down -v  # ⚠️ This removes all data!
./scripts/dev-start.sh
```

### 4. Check Logs
```bash
# Docker services
docker-compose logs [service-name]

# Application services (if running)
tail -f logs/*.log
```

### 5. Verify Prerequisites
- Docker Desktop running
- Node.js 18+ installed
- At least 6GB RAM available
- At least 10GB disk space

## 🆘 Getting Help

### Collect Information
Before reporting issues, collect:

1. **System information**:
   ```bash
   uname -a                    # OS information
   docker --version           # Docker version
   node --version             # Node.js version
   npm --version              # npm version
   ```

2. **Service status**:
   ```bash
   ./scripts/show-system-status.sh
   docker-compose ps
   ```

3. **Error logs**:
   ```bash
   docker-compose logs > debug-logs.txt
   ```

4. **Browser console errors** (F12 → Console tab)

### Common Solutions Summary

| Issue | Quick Fix |
|-------|-----------|
| **timeout: command not found** | ✅ Fixed in all scripts |
| **Port already in use** | `sudo lsof -ti:PORT \| xargs kill -9` |
| **Docker not running** | Start Docker Desktop |
| **Services won't start** | Increase Docker memory to 6GB+ |
| **Keycloak slow startup** | Wait 5-10 minutes on first run |
| **Frontend white screen** | Check browser console, restart services |
| **Can't login** | Verify Keycloak setup and browser cache |
| **Database errors** | Restart PostgreSQL service |

---

## ✅ Verification Checklist

After fixing issues, verify:

- [ ] All Docker containers show "Up" status: `docker-compose ps`
- [ ] Web app loads: http://localhost:3000
- [ ] Can login with demo/demo123
- [ ] Dashboard shows data
- [ ] No console errors in browser
- [ ] API docs accessible: http://localhost:3001/docs
- [ ] System status shows healthy: `./scripts/show-system-status.sh`

**🎉 If all items are checked, your ERP system is working correctly!**
