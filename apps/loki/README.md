## INSTALL 

### HTPASSD -

create loki basic auth 

```bash
kubectl create secret generic loki-basic-auth --from-file=.htpasswd -n loki -oyaml > templates/loki-auth.yaml
```