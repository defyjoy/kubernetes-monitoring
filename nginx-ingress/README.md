# INSTALLATION 


## REPO CONFIGURE

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
```

## INSTALL 

```
helm upgrade -i ingress-nginx ingress-nginx/ingress-nginx -f values.yaml -n ingress-nginx --create-namespace --wait
```