By default, `minikube start --nodes N` creates **1 control-plane + N-1 workers** — you don’t get multiple control-plane nodes unless you explicitly request them with **`--control-plane`** flags for extra nodes.

Here’s the step-by-step.

---

## **1. Start the first control-plane**

```bash
minikube start --nodes=3 --driver=docker --memory=16g --cpus=8 --ha=true
```

This creates the primary control-plane node (`minikube`).

---

## **2. Add more control-planes**

```bash
minikube node add --control-plane
```

Repeat for as many control-plane nodes as you want. Example for 2 extra:

```bash
minikube node add --control-plane
minikube node add --control-plane
```

---

## **3. Add worker nodes**

```bash
minikube node add
minikube node add
```

(Without `--control-plane`, it defaults to worker role.)

---

## **4. Verify**

```bash
kubectl get nodes -o wide
```

Example output:

```
NAME             STATUS   ROLES           AGE   VERSION
minikube         Ready    control-plane   10m   v1.30.0
minikube-m02     Ready    control-plane   5m    v1.30.0
minikube-m03     Ready    control-plane   3m    v1.30.0
minikube-m04     Ready    <none>          2m    v1.30.0
minikube-m05     Ready    <none>          1m    v1.30.0
```

---

## **Tips**

* If you want them to all start in one command, you can script:

```bash
minikube start --nodes=1 --driver=docker
minikube node add --control-plane
minikube node add --control-plane
minikube node add
minikube node add
```

* You can adjust resources per node with:

```bash
minikube node add --memory=4096 --cpus=2
```

---

If you want, I can give you a **one-liner that creates a 3-control-plane + 2-worker Minikube cluster** so you don’t have to type the commands separately. Would that help?
