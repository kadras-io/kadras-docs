---
sidebar_position: 1
description: Basic installation of the platform
---

# Installation

Let's discover how to install Kadras Engineering Platform on a local Kubernetes cluster with [kind](https://kind.sigs.k8s.io).

## Prerequisites

Ensure you have the following tools installed in your local environment:

* Kubernetes [`kubectl`](https://kubectl.docs.kubernetes.io/installation/kubectl)
* Carvel [`kctrl`](https://carvel.dev/kapp-controller/docs/latest/install)
* Carvel [`kapp`](https://carvel.dev/kapp-controller/docs/latest/install/#installing-kapp-controller-cli-kctrl).

Then, create a local Kubernetes cluster with [kind](https://kind.sigs.k8s.io).

```shell
cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: kadras
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF
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
  kubectl create namespace kadras-packages
  kctrl package repository add -r kadras-packages \
    --url ghcr.io/kadras-io/kadras-packages:0.11.1 \
    -n kadras-packages
  ```

## Create a Secret for the OCI Registry

The platform will need to interact with a container registry. Create a Secret with the credentials to access your container registry with read/write permissions. It will be used by the platform to publish and consume OCI artifacts.

  ```shell
  export SUPPLY_CHAIN_REGISTRY_HOSTNAME=<hostname>
  export SUPPLY_CHAIN_REGISTRY_USERNAME=<username>
  export SUPPLY_CHAIN_REGISTRY_TOKEN=<token>
  ```

* `<hostname>` is the server hosting the OCI registry. For example, `ghcr.io`, `gcr.io`, `quay.io`, `index.docker.io`.
* `<username>` is the username to access the OCI registry. Use `_json_key` if the hostname is `gcr.io`.
* `<token>` is a token with read/write permissions to access the OCI registry. Use the contents of the service account key json if the hostname is `gcr.io`.

  ```shell
  kubectl create secret docker-registry supply-chain-registry-credentials \
    --docker-server="${SUPPLY_CHAIN_REGISTRY_HOSTNAME}" \
    --docker-username="${SUPPLY_CHAIN_REGISTRY_USERNAME}" \
    --docker-password="${SUPPLY_CHAIN_REGISTRY_TOKEN}" \
    --namespace=kadras-packages
  ```

## Configure the Platform

The installation of the Kadras Engineering Platform can be configured via YAML. Create a `values.yml` file with any configuration you need for the platform. The following is a minimal configuration example.

```yaml title="values.yml"
platform:
  ingress:
    domain: 127.0.0.1.sslip.io

  oci_registry:
    server: <oci-server>
    repository: <oci-repository>

contour:
  envoy:
    service:
      type: ClusterIP
    workload:
      hostPorts:
        enabled: true

workspace_provisioner:
  namespaces:
    - name: default
```

* `<oci-server>` is the server of the OCI registry where the platform will publish and consume OCI images. It must be the same used in the previous step when creating a Secret with the OCI registry credentials. For example, `ghcr.io`, `gcr.io`, `quay.io`, `index.docker.io`.
* `<oci-repository>` is the repository in the OCI registry where the platform will publish and consume OCI images. It must be the same used in the previous step when creating a Secret with the OCI registry credentials. For example, it might be your username or organization name depending on which OCI server you're using.

The Ingress is configured with the special domain `127.0.0.1.sslip.io` which will resolve to your localhost and be accessible via the kind cluster.

## Install the Platform

Reference the `values.yml` file you created in the previous step and install the Kadras Engineering Platform.

  ```shell
  kctrl package install -i engineering-platform \
    -p engineering-platform.packages.kadras.io \
    -v 0.9.2 \
    -n kadras-packages \
    --values-file values.yml
  ```

## Verify the Installation

Verify that all the platform components have been installed and properly reconciled.

  ```shell
  kctrl package installed list -n kadras-packages 
  ```
