
# EXTERNAL DNS 



## CREATE CLOUDFLARE KEY 

```
kubectl create ns external-dns
kubectl create secret generic  cloudflare-api-key --from-literal=apiKey=<cloudflare api key> -n external-dns
```

### REF - 

- [https://github.com/kubernetes-sigs/external-dns/issues/4263](https://github.com/kubernetes-sigs/external-dns/issues/4263)