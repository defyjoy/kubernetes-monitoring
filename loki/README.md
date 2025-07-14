# INSTALLATION 

Ref - [https://grafana.com/docs/loki/latest/setup/install/helm/deployment-guides/aws/](https://grafana.com/docs/loki/latest/setup/install/helm/deployment-guides/aws/?src=yt&mdm=social&cnt=description)


## HELM

```bash
helm repo add grafana https://grafana.github.io/helm-charts

helm repo update
```


## COMMAND

create .htpasswd file. You'd be prompted for password
>> password: password
```
htpasswd -c .htpasswd loki
kubectl create secret generic loki-basic-auth --from-file=.htpasswd -n loki
```

```
kubectl create secret generic canary-basic-auth \
  --from-literal=username=loki \
  --from-literal=password=password \
  -n loki
```


```bash
helm upgrade -i loki grafana/loki -n loki --create-namespace --wait -f values.yaml
```


```
helm upgrade --install loki grafana/loki \
  --namespace=loki \
  --set isDefault=true \
  --set persistence.enabled=true \
  --set persistence.size=10Gi \
  --set persistence.storageClassName=standard
  --create-namespace
  ```