If `cert.pem` **exists on the host** but `cloudflared` in Docker keeps saying it can’t find it, then it’s not actually seeing it inside the container.
That means it’s either:

1. **Not being mounted to the correct path inside the container**
2. **Not readable by the container’s user**
3. **Being mounted to the wrong place and `cloudflared` is looking somewhere else**

---

### **Why it’s happening**

The official `cloudflare/cloudflared` image runs as user **`nonroot`**.
`cloudflared` defaults to looking for `cert.pem` in these inside-container paths:

```
/home/nonroot/.cloudflared
~/.cloudflared
/etc/cloudflared
/usr/local/etc/cloudflared
```

So, if your `docker-compose.yml` says:

```yaml
volumes:
  - ~/.cloudflared:/home/nonroot/.cloudflared
```

but `~` doesn’t expand, or the file isn’t in the exact location inside the container, `cloudflared` won’t see it.

---

### **How to confirm**

Run this from the same directory as `docker-compose.yml`:

```bash
docker run --rm \
  -v /home/youruser/.cloudflared:/home/nonroot/.cloudflared \
  cloudflare/cloudflared:latest \
  ls -l /home/nonroot/.cloudflared
```

If you **don’t see `cert.pem`** listed, the mount path or expansion is wrong.

---

### **Guaranteed fix**

Explicitly mount with the full absolute path and tell `cloudflared` exactly where the cert is:

```yaml
version: "3.8"
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    restart: unless-stopped
    network_mode: host
    volumes:
      - /home/youruser/.cloudflared:/home/nonroot/.cloudflared
    command: tunnel --origincert /home/nonroot/.cloudflared/cert.pem run my-tunnel
```

Replace `/home/youruser` with your actual username.

---

### **If you want to avoid `cert.pem` entirely**

You can instead run with only the `<TUNNEL-UUID>.json` credentials file:

```yaml
command: tunnel --credentials-file /home/nonroot/.cloudflared/<TUNNEL-UUID>.json run
```

This is the **production-recommended** approach and works even if `cert.pem` is missing.

---

Do you want me to rewrite your Compose **without `cert.pem`** so this stops being an issue completely? That way, it’ll run anywhere without needing a login step.
---


Gotcha — that message means `cloudflared` **isn’t picking up your cert.pem automatically**, so we have to explicitly tell it where it is.

Since you’re running in Docker, the safest fix is either:

---

## **Option 1 — Add `origincert` to config.yml**

Inside your mounted `~/.cloudflared/config.yml`, add:

```yaml
tunnel: <TUNNEL-UUID>
credentials-file: /home/nonroot/.cloudflared/<TUNNEL-UUID>.json
origincert: /home/nonroot/.cloudflared/cert.pem

ingress:
  - hostname: app.example.com
    service: http://host.docker.internal:3000
  - service: http_status:404
```

> The key part is `origincert:` — this forces `cloudflared` to use that exact file.

---

## **Option 2 — Pass it via Docker Compose environment variable**

```yaml
version: "3.8"
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    restart: unless-stopped
    network_mode: host
    environment:
      - TUNNEL_ORIGIN_CERT=/home/nonroot/.cloudflared/cert.pem
    volumes:
      - /home/youruser/.cloudflared:/home/nonroot/.cloudflared
    command: tunnel run my-tunnel
```

> Replace `/home/youruser` with your actual username path.

---

## **Option 3 — Pass as CLI flag**

```yaml
command: tunnel --origincert /home/nonroot/.cloudflared/cert.pem run my-tunnel
```

---

If your goal is to run this in **production without `cert.pem`**, I’d skip all of this and run the tunnel using **only the JSON credentials file** from Cloudflare, which doesn’t require an origin cert at all.
That would also make the container portable and work even if `cert.pem` isn’t present.

Do you want me to rewrite your Compose to the JSON-only method so it works without `cert.pem`? That’s the cleaner long-term fix.
