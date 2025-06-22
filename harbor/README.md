# HARBOR DEPLOY

```
helm repo add harbor https://helm.goharbor.io
helm repo update

helm install my-harbor harbor/harbor \
  --namespace harbor --create-namespace \
  --set expose.type=ClusterIP \
  --set externalURL=http://my-harbor.local \
  --set harborAdminPassword=admin123
```


```
helm upgrade -i harbor harbor/harbor --create-namespace -n harbor -f values.yaml
```