
# EXTERNAL DNS 



## CREATE CLOUDFLARE KEY 

```
kubectl create ns external-dns
kubectl create secret generic cloudflare-api-token-secret --from-literal=CF_API_TOKEN=<token> -n external-dns
```