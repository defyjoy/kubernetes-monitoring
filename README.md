## NGINX INGRESS

```
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
```


## METALLB

```
helm repo add metallb https://metallb.github.io/metallb
```


```
helm install my-metallb metallb/metallb --create-namespace -n metallb-system
```

