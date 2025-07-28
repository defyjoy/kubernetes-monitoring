# INSTALL

## CONFIGURE HELM CHART

```bash
helm repo add metallb https://metallb.github.io/metallb
helm repo update
```

## INSTALLATION

```bash
helm upgrade -i metallb metallb/metallb -n metallb-system --create-namespace --wait
```