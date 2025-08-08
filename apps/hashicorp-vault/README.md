# DEPLOYMENT 

Folliow the url -  [https://developer.hashicorp.com/vault/tutorials/kubernetes/kubernetes-minikube-tls](https://developer.hashicorp.com/vault/tutorials/kubernetes/kubernetes-minikube-tls)

## GENERATE TLS CERTS

To generate TLS certificates for **HashiCorp Vault** (including a CA cert and Vault server certs), you can use **OpenSSL** or **cfssl**. Here's a complete **step-by-step using OpenSSL**, with support for TLS on `vault.mydomain.com`.

---

## ✅ What You’ll Generate

* A **self-signed Root CA**
* A **server certificate** for Vault (signed by the CA)
* A **private key** for Vault
* Optionally, a **CA bundle** if you want to add intermediate certs later

---

## 📁 Folder Structure

Let’s use:

```bash
mkdir -p vault-tls && cd vault-tls
```

---

## 🧾 Step 1: Generate Root CA

```bash
openssl genrsa -out ca.key 4096

openssl req -x509 -new -nodes -key ca.key -sha256 -days 3650 \
  -out ca.crt \
  -subj "/C=IN/ST=WB/L=Kolkata/O=Workquark/CN=Vault-Root-CA"
```

---

## 🧾 Step 2: Create Vault Server Key and CSR

```bash
openssl genrsa -out vault.key 2048

openssl req -new -key vault.key -out vault.csr \
  -subj "/C=IN/ST=WB/L=Kolkata/O=Workquark/CN=vault.myorg.local"
```

---

## 🧾 Step 3: Create OpenSSL Config for SANs

Create `vault.cnf` with this content:

```ini
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = IN
ST = WB
L = Kolkata
O = Workquark
CN = vault.myorg.local

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = vault
DNS.2 = vault.default.svc
DNS.3 = vault.default.svc.cluster.local
DNS.4 = vault.myorg.local
IP.1 = 127.0.0.1
```

---

## 🧾 Step 4: Sign Vault Server Cert

```bash
openssl x509 -req -in vault.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out vault.crt -days 365 -sha256 -extfile vault.cnf -extensions v3_req
```

---

## 📦 Final Output

You now have:

```bash
ca.crt          # Root CA
ca.key          # Root CA key
vault.crt       # Vault TLS cert (signed by CA)
vault.key       # Vault private key
```

---

## 🔐 Step 5: Create Kubernetes TLS Secret

```bash
kubectl create secret generic vault-tls \
  --namespace vault \
  --from-file=ca.crt=ca.crt \
  --from-file=tls.crt=vault.crt \
  --from-file=tls.key=vault.key
```

---

## 🧩 Step 6: Reference in Helm (Optional)

In your Vault Helm `values.yaml`:

```yaml
server:
  extraVolumeMounts:
    - name: vault-tls
      mountPath: /vault/userconfig/tls
      readOnly: true
  extraVolumes:
    - name: vault-tls
      secret:
        secretName: vault-tls
  tls:
    cert: /vault/userconfig/tls/tls.crt
    key: /vault/userconfig/tls/tls.key
    caCert: /vault/userconfig/tls/ca.crt
```

---

Would you like me to generate these certs and give you a downloadable zip?
