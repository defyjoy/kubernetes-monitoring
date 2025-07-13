# INSTALL


## HELM REPO SETUP

```
helm repo add vector https://helm.vector.dev
helm repo update
```

## HELM CHART INSTALLATION

```
helm upgrade -i vector vector/vector -n vector --create-namespace -f values.yaml

```