---
sidebar_position: 1
description: Installation of the platform on Hetzner Cloud
---

# Installation

Let's discover how to install Kadras Engineering Platform on a Kubernetes cluster running on Hetzner Cloud.

## Prerequisites

Ensure you have the following tools installed in your local environment:

* Kubernetes [`kubectl`](https://kubectl.docs.kubernetes.io/installation/kubectl)
* Carvel [`kctrl`](https://carvel.dev/kapp-controller/docs/latest/install/#installing-kapp-controller-cli-kctrl)
* Carvel [`kapp`](https://carvel.dev/kapp/docs/latest/install/)
* [`hetzner-k3s`](https://vitobotta.github.io/hetzner-k3s/Installation/)

If you're on macOS or Linux, you can install the tools with Homebrew.

```shell
brew install kubernetes-cli
brew install carvel-dev/carvel/kapp
brew install carvel-dev/carvel/kctrl
brew install vitobotta/tap/hetzner_k3s
```

You will also need to have a Hetzner Cloud account and API token to create and manage resources on Hetzner Cloud. You can create an API token from the [Hetzner Cloud Console](https://console.hetzner.com/projects). The token should have read and write permissions. For more details, check out the [Hetzner documentation on generating an API token](https://docs.hetzner.com/cloud/api/getting-started/generating-api-token/).

In the following steps, we assume you have set the `HCLOUD_TOKEN` environment variable with your Hetzner Cloud API token.

```shell
export HCLOUD_TOKEN=<your-hetzner-cloud-api-token>
```

The platform needs a domain name to expose the workloads over HTTPS. Each workload is served on a subdomain of the workspace it's deployed to, like `hello.apps.example.com`, with wildcard TLS certificates issued by [Let's Encrypt](https://letsencrypt.org) via cert-manager. Let's Encrypt issues wildcard certificates only via the DNS-01 challenge, which requires the platform to manage the DNS records of your domain. In this guide, we assume the DNS zone of your domain is hosted on Hetzner. For other DNS providers, like Cloudflare, or any provider with a cert-manager webhook, check out the [Kadras cert-manager documentation](https://github.com/kadras-io/package-for-cert-manager/blob/main/docs/issuers.md).

NOTE: If you don't have a domain name, you can use the `nip.io` service, which provides wildcard DNS for any IP address. For example, if your cluster is accessible through the IP address `10.1.2.3`, you can use the domain `10-1-2-3.nip.io`. Since you don't manage its DNS records, use the default private certificate authority of the platform instead of Let's Encrypt, by removing the `ingress.issuer` and `cert_manager` sections from the configuration below. Keep in mind that using `nip.io` is not recommended for production environments.

## Create a Kubernetes Cluster on Hetzner Cloud

We'll create a Kubernetes cluster on Hetzner Cloud with [hetzner-k3s](https://vitobotta.github.io/hetzner-k3s/Installation/), a CLI tool to manage production-ready Kubernetes clusters on Hetzner Cloud based on the lightweight Kubernetes distribution [k3s](https://k3s.io).

In this guide, we'll configure a cluster for a development environment with 1 control-plane node and 3 worker nodes. For a full production-ready configuration, please refer to the [hetzner-k3s documentation](https://vitobotta.github.io/hetzner-k3s/Installation/).

Create a `cluster.yml` file with the following content. Make sure to adjust the configuration to your needs, including the cluster name, node instance types and locations.

```yaml title="cluster.yml"
cluster_name: cloud
kubeconfig_path: "./kubeconfig"
k3s_version: v1.35.2+k3s1
protect_against_deletion: false

networking:
  ssh:
    port: 22
    use_agent: false
    public_key_path: "~/.ssh/id_ed25519_hzc.pub"
    private_key_path: "~/.ssh/id_ed25519_hzc"
  allowed_networks:
    ssh:
      - 0.0.0.0/0
    api:
      - 0.0.0.0/0

masters_pool:
  instance_type: cx23
  instance_count: 1
  locations:
  - nbg1

worker_node_pools:
- name: static
  instance_type: cx33
  instance_count: 3
  location: nbg1
```

The SSH keys for the cluster nodes are expected to be located in the `~/.ssh` directory with the name `id_ed25519_hzc` and `id_ed25519_hzc.pub`. Update the values to match your SSH key pair if needed, or generate a new SSH key pair with the following command.

```shell
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_hzc -C "hetzner-k3s cluster SSH key" -N ""
```

Then, create the cluster with the following command.

```shell
hetzner-k3s create cluster --config cluster.yml
```

It should take less than 2 minutes to create the cluster. Once the cluster is created, a kubeconfig file will be generated at the path specified in the `kubeconfig_path` field of the cluster configuration file (e.g. `./kubeconfig`). You can use this kubeconfig file to access the cluster with `kubectl`.

```shell
export KUBECONFIG=./kubeconfig
kubectl get nodes
```

In the next step, we assume you run the commands from the same directory where the kubeconfig file is located and the `KUBECONFIG` environment variable is set accordingly.

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

## Configure the Secrets

### Configure the Hetzner API Token Secret for ACME Challenges

The platform requires a Secret with a Hetzner API token to solve the ACME DNS-01 challenges for the TLS certificates issued by Let's Encrypt.

Generate a new Hetzner API token from the [Hetzner Cloud Console](https://console.hetzner.com/projects), for the project hosting the DNS zone of your domain. Make sure to grant the token read and write permissions. For more details, check out the [Hetzner documentation on generating an API token](https://docs.hetzner.com/cloud/api/getting-started/generating-api-token/).

Then, create a Kubernetes Secret named `hetzner-dns` in the `kadras-system` namespace containing your Hetzner API token:

```shell
kubectl create secret generic hetzner-dns \
  --from-literal=api-token=<your-hetzner-api-token> \
  -n kadras-system
```

### Configure the OCI Pull Secret

If you're planning to use private OCI images to deploy your workloads, you need to create a Kubernetes Secret with the credentials to pull the images from your container registry. The platform shares it with all the workspaces. If you don't need to pull private OCI images for your workloads, you can skip this step as it is not required for the platform installation.

For example, for GitHub Container Registry, you can create a Personal Access Token (PAT) with the `read:packages` scope from your GitHub account and create a Kubernetes Secret named `oci-pull-secret` in the `kadras-system` namespace with the following command:

```shell
kubectl create secret docker-registry oci-pull-secret \
  --docker-server=ghcr.io \
  --docker-username=<your-github-username> \
  --docker-password=<your-github-personal-access-token> \
  -n kadras-system
```

## Configure the Platform

The installation of the Kadras Engineering Platform can be configured via YAML. Create a `values.yml` file with any configuration you need for the platform. The following is a configuration example for a development cloud environment. Make sure to update the domain and the email address to your own values.

```yaml title="values.yml"
packages:
  include:
    - cert-manager-webhook-hetzner
    - crossplane
    - dependency-track
    - gitops-configurer
    - kyverno
    - metrics-server
    - postgresql-operator

ingress:
  domain: <your-domain> # e.g. cloud.example.com
  issuer: letsencrypt-prod-issuer

workspaces:
  - name: apps

# Let's Encrypt issues the wildcard certificates via DNS-01 challenges solved with the Hetzner API
cert_manager:
  issuers:
    letsencrypt:
      enabled: true
      environment: production
      email: changeme@example.com # Email address for ACME registration and recovery contact
      solver: dns01
      dns01:
        provider: hetzner
        credentials:
          secret: hetzner-dns
          key: api-token
          namespace: kadras-system

envoy_gateway:
  envoy:
    service:
      annotations:
        load-balancer.hetzner.cloud/location: nbg1 # change to your cluster location, if needed
        load-balancer.hetzner.cloud/name: kadras-cloud-lb
        load-balancer.hetzner.cloud/use-private-ip: "true"

dependency_track:
  api_server:
    storage:
      size: 5Gi
  postgresql:
    storage:
      size: 10Gi

gitops_configurer:
  git:
    url: https://github.com/kadras-labs/kadras-gitops # you can change this to your own Git repository to store the GitOps configuration for your cluster
    path: clusters/cloud

workspace_provisioner: # Remove this section if you don't need to pull private OCI images for your workloads
  oci:
    pull_secret:
      name: oci-pull-secret
      namespace: kadras-system
```

Let's Encrypt enforces strict rate limits on its `production` environment. While trying things out, consider using the `staging` environment instead, with the `letsencrypt-staging-issuer` issuer. Its certificates aren't trusted by browsers.

## Install the Platform

Reference the `values.yml` file you created in the previous step and install the Kadras Engineering Platform.

```shell
kctrl package install -i engineering-platform \
  -p engineering-platform.packages.kadras.io \
  -v 0.33.0 \
  -n kadras-system \
  --values-file values.yml
```

The platform exposes the workloads via the external Gateway of Envoy Gateway. The installation process will create a Load Balancer on Hetzner Cloud for it. This may take a few minutes to be provisioned and become active. Once the load balancer is active, you can retrieve its IP address with the following command.

```shell
kubectl get service envoy-external -n envoy-gateway-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

Then, you need to update the DNS records for your domain to point to the Load Balancer IP address. You can do that from the provider where your domain is registered. If your domain is hosted on Hetzner, you can manage the DNS records from the Hetzner Cloud Console and navigate to the DNS settings for your domain. Either way, you need to create the following DNS records:

* An A record for the root domain (e.g. `cloud.example.com`) pointing to the Load Balancer IP address.
* A CNAME record for the wildcard subdomain (e.g. `*.cloud.example.com`) pointing to the root domain (e.g. `cloud.example.com`). It also covers the workspace subdomains, like `hello.apps.cloud.example.com`.

## Verify the Installation

Verify that all the platform components have been installed and properly reconciled.

```shell
kctrl package installed list -n kadras-system 
```

You should see something like this:

```shell
Name                          Package Name                                     Package Version  Status  
cert-manager                  cert-manager.packages.kadras.io                  1.21.3+kadras.1  Reconcile succeeded  
cert-manager-webhook-hetzner  cert-manager-webhook-hetzner.packages.kadras.io  0.9.1            Reconcile succeeded  
crossplane                    crossplane.packages.kadras.io                    2.4.3            Reconcile succeeded  
dependency-track              dependency-track.packages.kadras.io              5.2.1+kadras.1   Reconcile succeeded  
engineering-platform          engineering-platform.packages.kadras.io          0.33.0           Reconcile succeeded  
envoy-gateway                 envoy-gateway.packages.kadras.io                 1.10.0+kadras.1  Reconcile succeeded  
flux                          flux.packages.kadras.io                          2.10.0           Reconcile succeeded  
gateway-api                   gateway-api.packages.kadras.io                   1.6.1            Reconcile succeeded  
gitops-configurer             gitops-configurer.packages.kadras.io             0.4.0            Reconcile succeeded  
knative-serving               knative-serving.packages.kadras.io               1.24.0           Reconcile succeeded  
kyverno                       kyverno.packages.kadras.io                       1.19.2+kadras.1  Reconcile succeeded  
metrics-server                metrics-server.packages.kadras.io                0.9.1+kadras.1   Reconcile succeeded  
postgresql-operator           postgresql-operator.packages.kadras.io           1.30.1+kadras.1  Reconcile succeeded  
secretgen-controller          secretgen-controller.packages.kadras.io          0.21.4           Reconcile succeeded  
workspace-provisioner         workspace-provisioner.packages.kadras.io         0.6.0            Reconcile succeeded
```

Dependency Track is available at `https://dependency-track.<your-domain>`.
