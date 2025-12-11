# Security Policy

## 🔒 Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 🚨 Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. **DO NOT** Create a Public Issue

Please do not create a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Send an email to: **alejandro.bravo@security.cofira.dev** (replace with your actual email)

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Expected Response Time

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Fix timeline**: Depends on severity

## 🛡️ Security Best Practices

### For Users

1. **Never commit secrets**

   - Use `.env` files (already in `.gitignore`)
   - Rotate credentials regularly
   - Use strong passwords

2. **Keep dependencies updated**

   - Run `npm audit fix` regularly
   - Monitor Dependabot alerts
   - Update dependencies weekly

3. **Enable 2FA**
   - On GitHub account
   - On production deployments

### For Developers

1. **Input Validation**

   - Validate all user inputs
   - Use Angular form validators
   - Sanitize data before database operations

2. **Authentication & Authorization**

   - Use JWT securely
   - Implement proper role-based access
   - Secure API endpoints

3. **Data Protection**

   - Hash passwords (bcrypt)
   - Use HTTPS in production
   - Encrypt sensitive data

4. **Code Review**
   - Review PRs for security issues
   - Use automated security scanning
   - Follow OWASP guidelines

## 🔍 Known Security Considerations

### JWT Secret

- **Issue**: JWT secret must be strong and unique
- **Mitigation**: Generate with `openssl rand -hex 64`
- **Location**: `.env` file (not committed)

### Database Credentials

- **Issue**: Default credentials in development
- **Mitigation**: Change for production
- **Location**: `.env` file

### CORS Configuration

- **Issue**: Must be properly configured for production
- **Mitigation**: Update allowed origins in backend config
- **File**: `backend/src/main/java/.../config/SecurityConfig.java`

### File Uploads

- **Issue**: Potential for malicious file uploads
- **Mitigation**: Implement file type validation
- **Status**: To be implemented

## 🔐 Security Features

### Implemented

- ✅ JWT Authentication
- ✅ Password hashing with bcrypt
- ✅ HTTPS support ready
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection prevention (JPA)
- ✅ XSS protection headers
- ✅ Rate limiting ready

### Planned

- ⏳ 2FA support
- ⏳ Account lockout after failed attempts
- ⏳ Password complexity requirements
- ⏳ Session management improvements
- ⏳ Audit logging

## 📋 Security Checklist

Before deploying to production:

- [ ] Change all default credentials
- [ ] Generate new JWT secret
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Review and update security headers
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerts
- [ ] Regular security audits
- [ ] Backup and disaster recovery plan
- [ ] Incident response plan

## 🚀 Automated Security

### GitHub Actions

We use automated security scanning:

- **Dependabot**: Automatic dependency updates
- **CodeQL**: Static code analysis
- **Snyk**: Vulnerability scanning
- **npm audit**: Package security check

### Local Testing

```bash
# Frontend security audit
cd cofira-app
npm audit

# Fix automatically
npm audit fix

# Check for outdated packages
npm outdated
```

```bash
# Backend dependency check
cd backend
./gradlew dependencyCheckAnalyze
```

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Angular Security Guide](https://angular.dev/best-practices/security)
- [Spring Security](https://spring.io/projects/spring-security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## 🏆 Hall of Fame

We recognize security researchers who responsibly disclose vulnerabilities:

| Researcher | Date | Vulnerability | Severity |
| ---------- | ---- | ------------- | -------- |
| -          | -    | -             | -        |

## 📞 Contact

For security concerns:

- **Email**: security@cofira.dev
- **PGP Key**: Available on request

Thank you for helping keep COFIRA secure! 🔒
