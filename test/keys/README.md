# SSL RSA key and x509 certificate

Generated using openssl, e.g.

```bash
/usr/local/opt/openssl/bin/openssl genrsa -out localhost.key 2048
/usr/local/opt/openssl/bin/openssl req -new -x509 -days 365 -key localhost.key -out localhost.crt -config localhost.cnf
```