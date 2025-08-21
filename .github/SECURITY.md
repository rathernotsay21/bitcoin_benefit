# Security Policy

## Supported Versions

We actively support and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Bitcoin Benefit seriously. If you discover a security vulnerability, please follow these guidelines:

### 🔒 Private Disclosure

**DO NOT** create a public GitHub issue for security vulnerabilities.

### 📧 Contact Information

Please report security vulnerabilities through one of the following channels:

1. **GitHub Security Advisory** (preferred): 
   - Go to the Security tab of this repository
   - Click "Report a vulnerability"
   - Fill out the private vulnerability report

2. **Email**: If GitHub Security Advisory is not available, email us at:
   - security@bitcoinbenefit.com (primary)
   - development team contact (see repository maintainers)

### 📋 What to Include

Please include the following information in your report:

- **Type of vulnerability** (e.g., XSS, CSRF, injection, etc.)
- **Affected component(s)** and version(s)
- **Steps to reproduce** the vulnerability
- **Potential impact** and attack scenarios
- **Suggested fix** (if you have one)
- **Proof of concept** (if applicable)

### ⏱️ Response Timeline

We are committed to addressing security vulnerabilities promptly:

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 7 days
- **Status updates**: Weekly until resolved
- **Resolution**: Target 30-90 days (depending on complexity)

### 🛡️ Security Measures

Our security approach includes:

#### Automated Security
- **Dependency scanning**: Automated vulnerability detection
- **Code analysis**: Static security analysis
- **Supply chain protection**: SBOM generation and monitoring
- **License compliance**: Automated license checking

#### Development Security
- **Type safety**: Full TypeScript coverage
- **Input validation**: Comprehensive validation with Zod
- **Secure coding practices**: Security-focused code reviews
- **Security testing**: Automated security tests in CI/CD

#### Infrastructure Security
- **HTTPS everywhere**: All communications encrypted
- **Security headers**: Comprehensive security header configuration
- **Content Security Policy**: XSS and injection protection
- **Secure build pipeline**: Isolated and verified builds

### 🏆 Recognition

We appreciate security researchers who help keep Bitcoin Benefit secure:

- **Public acknowledgment** in our security advisories (with your permission)
- **Hall of fame** recognition for significant contributions
- **Priority support** for future security questions

### 📜 Disclosure Process

Our coordinated disclosure process:

1. **Receipt**: We acknowledge receipt within 48 hours
2. **Verification**: We verify and assess the vulnerability
3. **Development**: We develop and test a fix
4. **Testing**: We thoroughly test the fix
5. **Release**: We release the fix and notify the reporter
6. **Disclosure**: We coordinate public disclosure with the reporter

### 🔐 Encryption

For highly sensitive reports, you may encrypt your communication:

```
-----BEGIN PGP PUBLIC KEY BLOCK-----
[PGP key would be provided here if needed]
-----END PGP PUBLIC KEY BLOCK-----
```

### 📚 Security Resources

- [Security Runbook](docs/security/SECURITY_RUNBOOK.md)
- [Security Best Practices](docs/security/)
- [Dependency Management](docs/security/SECURITY_RUNBOOK.md#handling-security-updates)

### ⚖️ Legal

This disclosure process is covered under responsible disclosure guidelines. We will not pursue legal action against security researchers who:

- Make a good faith effort to avoid privacy violations and data destruction
- Only interact with accounts they own or with explicit permission
- Do not intentionally access or download data beyond what is necessary to demonstrate the vulnerability
- Do not publicly disclose the vulnerability until we've had time to address it

---

Thank you for helping keep Bitcoin Benefit and our users safe! 🛡️

*Last updated: 2025-01-22*