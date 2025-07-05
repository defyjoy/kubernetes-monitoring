# INSTALLATION 



## HELM

```bash
helm repo add grafana https://grafana.github.io/helm-charts

helm repo update
```


## COMMAND

```bash
helm upgrade -i loki grafana/loki -n loki --create-namespace --wait -f values.yaml
```

