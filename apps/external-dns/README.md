
# EXTERNAL DNS 



## CREATE CLOUDFLARE KEY 

```
kubectl create ns external-dns
kubectl create secret generic cloudflare-api-token-secret --from-literal=CF_API_KEY=<token> -n external-dns
kubectl create secret generic  cloudflare-api-key --from-literal=CF_API_KEY=<token> -n external-dns
kubectl create secret generic  cloudflare-api-key --from-literal=apiKey=S3SLA8BXr8-49sKBhMJwqOTnzCj76q1VL18QdMIc -n external-dns
```

### REF - 

- [https://github.com/kubernetes-sigs/external-dns/issues/4263](https://github.com/kubernetes-sigs/external-dns/issues/4263)