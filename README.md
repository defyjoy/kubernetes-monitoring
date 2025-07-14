## INSTALLATION

This repo deploys various components across kind cluster on your localhost.
- kind cluster (3 nodes)
- kube-prometheus-stack
- loki (standalone for now)
- metallb ( manifests applied separately )
- minio ( backed by openebs storage)
- ingress-nginx controller ( load balancer IP allocated from metallb IPAddressPool )
- openebs ( storage system )
- vector ( log agent )
- victoria-metrics-operator ( not part of taskfile yet )


## PREREQUISITES 

You would need taskfile for deployment- [https://taskfile.dev/](https://taskfile.dev/). You would need to run the below commands from the root of the directory ( location of taskfile.yaml in root)


## Create KinD cluster -

```
task create_cluster
```

## DEPLOY APPLICATIONS

```
task deploy
```