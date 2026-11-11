---
sidebar_position: 1
description: Basic installation of the platform
---

# Installation

Let's discover how to install Kadras Engineering Platform on a local Kubernetes cluster with [kind](https://kind.sigs.k8s.io).

## Prerequisites

Ensure you have the following tools installed in your local environment:

* Kubernetes [`kubectl`](https://kubectl.docs.kubernetes.io/installation/kubectl)
* Carvel [`kctrl`](https://carvel.dev/kapp-controller/docs/latest/install/#installing-kapp-controller-cli-kctrl)
* Carvel [`kapp`](https://carvel.dev/kapp/docs/latest/install).

Then, create a local Kubernetes cluster with [kind](https://kind.sigs.k8s.io). The platform exposes the workloads via the node ports 30080 (HTTP) and 30443 (HTTPS), which the cluster maps to the ports 80 and 443 of your machine.

```shell
cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: kadras
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 30080
    hostPort: 80
    protocol: TCP
  - containerPort: 30443
    hostPort: 443
    protocol: TCP
EOF
```

Alternatively, you can use [k3d](https://k3d.io) to create a local Kubernetes cluster.

```shell
k3d cluster create kadras-local \
  --image rancher/k3s:v1.37.2-k3s1 \
  --k3s-arg "--disable=traefik@server:0" \
  -p "80:30080@server:0" \
  -p "443:30443@server:0"
```

## Deploy Carvel kapp-controller

The platform relies on the Kubernetes-native package management capabilities offered by Carvel [kapp-controller](https://carvel.dev/kapp-controller). You can install it with Carvel [`kapp`](https://carvel.dev/kapp/docs/latest/install) (recommended choice) or `kubectl`.

```shell
kapp deploy -a kapp-controller -y \
  -f https://github.com/carvel-dev/kapp-controller/releases/latest/download/release.yml
```

## Add the Kadras Repository

Add the Kadras repository to make the platform packages available to the cluster.

```shell
kctrl package repository add -r kadras-packages \
  --url ghcr.io/kadras-io/kadras-packages:0.33.0 \
  -n kadras-system --create-namespace
```

## Configure the Platform

The installation of the Kadras Engineering Platform can be configured via YAML. Create a `values.yml` file with any configuration you need for the platform. The following is a minimal configuration example for a local environment.

```yaml title="values.yml"
profile: local
workspaces:
  - name: apps
```

The `local` profile adapts the platform to a local cluster. The workloads are served over HTTPS on the special domain `127.0.0.1.sslip.io`, which resolves to your localhost, with certificates issued by a private certificate authority.

The `apps` workspace is the namespace where you'll deploy your workloads. The platform creates it, and enforces the `restricted` [Pod Security Standard](https://kubernetes.io/docs/concepts/security/pod-security-standards/) on it.

## Install the Platform

Reference the `values.yml` file you created in the previous step and install the Kadras Engineering Platform.

```shell
kctrl package install -i engineering-platform \
  -p engineering-platform.packages.kadras.io \
  -v 0.33.0 \
  -n kadras-system \
  --values-file values.yml
```

## Verify the Installation

Verify that all the platform components have been installed and properly reconciled.

```shell
kctrl package installed list -n kadras-system
```

You should see something like this:

```shell
Name                   Package Name                              Package Version  Status  
cert-manager           cert-manager.packages.kadras.io           1.21.3+kadras.1  Reconcile succeeded  
engineering-platform   engineering-platform.packages.kadras.io   0.33.0           Reconcile succeeded  
envoy-gateway          envoy-gateway.packages.kadras.io          1.10.0+kadras.1  Reconcile succeeded  
flux                   flux.packages.kadras.io                   2.10.0           Reconcile succeeded  
gateway-api            gateway-api.packages.kadras.io            1.6.1            Reconcile succeeded  
knative-serving        knative-serving.packages.kadras.io        1.24.0           Reconcile succeeded  
secretgen-controller   secretgen-controller.packages.kadras.io   0.21.4           Reconcile succeeded  
workspace-provisioner  workspace-provisioner.packages.kadras.io  0.6.0            Reconcile succeeded
```

For more configuration options, check out the [platform documentation](https://github.com/kadras-io/kadras-engineering-platform/tree/main/docs).
