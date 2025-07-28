# INSTALL

Ref - [https://medium.com/@alesson.viana/minio-in-a-kubernetes-cluster-316ed8f41a2d](https://medium.com/@alesson.viana/minio-in-a-kubernetes-cluster-316ed8f41a2d)


# MINIO OPERATOR (TODO)

## HELM REPO SETUP

Operator ( not using this for now )
```
helm repo add minio-operator https://operator.min.io
helm repo update
```

## INSTALL MINIO OPERATOR

```
helm upgrade -i minio-operator minio-operator/operator -n minio-operator --create-namespace -f values.yaml --wait
helm upgrade -i minio-tenant minio-operator/tenant -n minio-tenant --create-namespace
```


```
kubectl apply -f minio-resources.yaml
```

## INSTALL MINIO TENANT 

```
kubectl -n minio-tenant create secret generic minio-creds \
  --from-literal=accesskey=MINIOACCESSKEY \
  --from-literal=secretkey=MINIOSECRETKEY \ 
  - n minio-tenant
```

---
## MINIO STANDALONE

```
helm repo add minio https://charts.min.io/
helm repo update
```

## INSTALLATION MINIO STANDALONE


```
helm upgrade -i minio minio/minio -n minio --create-namespace -f standalone/values.yaml --wait
```






