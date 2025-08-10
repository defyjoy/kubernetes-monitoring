Got it — you want to run **Cloudflare Tunnel with Docker** instead of the bare CLI.

Here’s how you can do it:

---

## **1️⃣ Create a Tunnel & Credentials**

First, we still need to create the tunnel and get the credentials JSON from Cloudflare **on your host machine**.

```bash
# Authenticate
cloudflared tunnel login

# Create the tunnel
cloudflared tunnel create my-tunnel
```

This will create a file:

```
~/.cloudflared/<TUNNEL-UUID>.json
```

We’ll mount this into the container later.

---

## **2️⃣ Create the Config File**

`~/.cloudflared/config.yml`:

```yaml
tunnel: <TUNNEL-UUID>
credentials-file: /home/nonroot/.cloudflared/<TUNNEL-UUID>.json

ingress:
  - hostname: app.example.com
    service: http://host.docker.internal:3000
  - service: http_status:404
```

> **Note:**
>
> * Use `host.docker.internal` to connect from the container to a service running on your host.
> * Replace `app.example.com` with your actual domain.

---

## **3️⃣ Run with Docker**

```bash
docker run -d \
  --name cloudflared \
  --network host \
  -v ~/.cloudflared:/home/nonroot/.cloudflared \
  cloudflare/cloudflared:latest \
  tunnel run my-tunnel
```

Explanation:
V
* `--network host` → avoids NAT issues (or you can use `bridge` mode and adjust service URLs)
* Mounts your config and credentials into `/home/nonroot/.cloudflared` in the container
* Runs `cloudflared tunnel run my-tunnel`

---

## **4️⃣ Add DNS Route in Cloudflare**

If you didn’t already:

```bash
cloudflared tunnel route dns my-tunnel app.example.com
```

This will create the CNAME record to point to the tunnel.

---

## **5️⃣ Verify**

* Check logs:

```bash
docker logs -f cloudflared
```

* Visit:

```bash
https://app.example.com
```

---

If you want, I can give you a **Docker Compose version** so the tunnel runs automatically with the rest of your stack.
That’s much easier to maintain than a raw `docker run` command.
