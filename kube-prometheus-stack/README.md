# INSTALLATION


## REPO 
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

helm repo update
```

## INSTALL

```
helm upgrade -i grafana-prom-stack prometheus-community/kube-prometheus-stack -f values.yaml -n kube-prometheus-stack --create-namespace --wait
```

