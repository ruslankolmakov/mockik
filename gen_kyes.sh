# Generate a private key and a certificate

openssl genrsa -out private-key.pem 2048
openssl req -new -key private-key.pem -out certificate.csr
openssl x509 -req -days 365 -in certificate.csr -signkey private-key.pem -out certificate.pem

# Create a directory for the keys
mkdir -p keys

# Move the keys to the keys directory
mv private-key.pem certificate.csr certificate.pem keys/

# Clean up the certificate request
rm certificate.csr

# Print the keys
echo "Private key: keys/private-key.pem"
echo "Certificate: keys/certificate.pem"
