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


# CLOUD FLARE TUNNEL

Create cloudflare tunnel - 

- [https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-remote-tunnel/](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-remote-tunnel/)

NOTE : `--network kind` is important.

```
docker run -d --name cloudflared --network kind cloudflare/cloudflared:latest tunnel --no-autoupdate run --token <cloudflare tunnel token>
```

## CREATE KIND CLUSTER -

This step would create the kind cluster with network `172.18.0.0/24` network. Hence all targetted ingress/services are also in that range.
```
task create_cluster
```

## DEPLOY ARGOCD

This would deploy argocd on kind cluster and also add the argocd ingress option.
```
task deploy-argocd
```

## BOOTSTAP APPLCATIONS

```
task bootstrap-argocd
```
