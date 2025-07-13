# INSTALL 


## HELM CHART REPO

```
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

## INSTALL 

```
helm upgrade -i loki-stack grafana/loki-stack -n loki-stack --create-namespace --wait
```