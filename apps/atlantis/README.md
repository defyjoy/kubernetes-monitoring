Here's a step-by-step guide to set up a Cloudflare Tunnel to your PC, make GitHub Actions reachable via this tunnel, and configure Atlantis to use it:

## 1. Create Cloudflare Tunnel to Your PC

### Prerequisites:
- Cloudflare account with a domain
- Docker installed on your PC

### Steps:

```bash
# 1. Install cloudflared (Cloudflare Tunnel client)
# On Linux:
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# On macOS:
brew install cloudflared

# 2. Authenticate with Cloudflare
cloudflared tunnel login
# This will open a browser window to authenticate

# 3. Create a tunnel
cloudflared tunnel create atlantis-tunnel
# Note the tunnel ID shown in output

# 4. Create a configuration file
mkdir -p ~/.cloudflared
cat <<EOF > ~/.cloudflared/config.yaml
tunnel: <YOUR_TUNNEL_ID>
credentials-file: ~/.cloudflared/<YOUR_TUNNEL_ID>.json

ingress:
  - hostname: atlantis.yourdomain.com
    service: http://localhost:80
  - service: http_status:404
EOF

# 5. Create DNS record for your tunnel
cloudflared tunnel route dns atlantis-tunnel atlantis.yourdomain.com

# 6. Run the tunnel (test first)
cloudflared tunnel --config ~/.cloudflared/config.yaml run atlantis-tunnel

# 7. For production, set up as a service
cloudflared service install
systemctl start cloudflared
```

## 2. Configure GitHub Actions to Reach Your PC via Tunnel

### In your GitHub repository:

1. Create a webhook in your GitHub repository:
   - Settings → Webhooks → Add webhook
   - Payload URL: `https://atlantis.yourdomain.com`
   - Content type: `application/json`
   - Secret: (create a secret and note it for Atlantis config)
   - Events: Select "Pull requests" and "Pushes"

2. For GitHub Actions to reach your Atlantis:
   - No special configuration needed since the tunnel provides public HTTPS access
   - GitHub's servers will be able to reach your tunnel endpoint

## 3. Configure Atlantis to Use the Cloudflare Tunnel

### Update your Atlantis Helm values (`atlantis-values.yaml`):

```yaml
ingress:
  enabled: false  # Disable local ingress since we're using Cloudflare Tunnel

service:
  type: ClusterIP
  port: 80

atlantis:
  config: |
    repos:
    - id: /.*/
      apply_requirements: [mergeable]
      workflow: default
      allowed_overrides: [apply_requirements, workflow]
    workflows:
      default:
        plan:
          steps:
          - init
          - plan
        apply:
          steps:
          - apply
    # GitHub configuration
    github:
      user: your-github-username
      token: $GITHUB_TOKEN
      secret: $WEBHOOK_SECRET
      webhook_secret: $WEBHOOK_SECRET
```

### Deploy with Helm:

```bash
# Create secrets for GitHub credentials
kubectl create secret generic atlantis-secrets \
  --from-literal=GITHUB_TOKEN='your-github-token' \
  --from-literal=WEBHOOK_SECRET='your-webhook-secret'

# Upgrade Atlantis installation
helm upgrade atlantis runatlantis/atlantis -f atlantis-values.yaml
```

## 4. Verify the Setup

1. Make a change in your Terraform repository and create a PR
2. Atlantis should:
   - Receive the webhook via your Cloudflare Tunnel
   - Post comments back to GitHub
   - Show up in the Atlantis UI at `https://atlantis.yourdomain.com`

## Important Security Considerations:

1. **Access Control**:
   - Restrict who can access your Atlantis UI
   - Consider adding Cloudflare Access rules

2. **Secrets Management**:
   - Never hardcode credentials
   - Use Kubernetes secrets or external secret managers

3. **Tunnel Security**:
   - Regularly rotate tunnel credentials
   - Monitor tunnel connections

4. **Rate Limiting**:
   - Configure Cloudflare rate limiting to prevent abuse

## Troubleshooting:

1. If webhooks aren't reaching Atlantis:
   - Check tunnel logs: `journalctl -u cloudflared -f`
   - Verify DNS resolution for your subdomain
   - Check Atlantis logs: `kubectl logs -f <atlantis-pod>`

2. If GitHub can't verify the webhook:
   - Ensure the webhook secret matches in both GitHub and Atlantis config
   - Verify the tunnel is serving HTTPS properly

Would you like me to elaborate on any specific part of this setup?