# INSTALL

## HELM REPO 

```
helm repo add openebs https://openebs.github.io/openebs
helm repo update
```


## INSTALLATION 

```
helm upgrade -i openebs openebs/openebs -n openebs --create-namespace -f values.yaml --wait
```