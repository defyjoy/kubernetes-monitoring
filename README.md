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

## VECTOR

```
helm repo add vector https://helm.vector.dev
helm repo update
```

```
helm install vector/vector-agent -n vector --create-namespace -f vector-values.yaml
helm upgrade -i vector vector/vector -n vector --create-namespace -f vector-values.yaml

```