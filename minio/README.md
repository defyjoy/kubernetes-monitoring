# INSTALL


## HELM REPO SETUP

```
helm repo add minio-operator https://operator.min.io
helm repo update
```

## INSTALLATION MINIO OPERATOR




```
helm upgrade -i minio-operator minio-operator/operator -n minio-operator --create-namespace -f values.yaml --wait
helm upgrade -i minio-tenant minio-operator/tenant -n minio-tenant --create-namespace
```

## INSTALL MINIO TENANT 

```
kubectl -n minio-tenant create secret generic minio-creds \
  --from-literal=accesskey=MINIOACCESSKEY \
  --from-literal=secretkey=MINIOSECRETKEY \ 
  - n minio-tenant
```

```
kubectl apply -f minio-resources.yaml
```

