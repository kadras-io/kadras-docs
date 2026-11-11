---
sidebar_position: 1
---

# Introduction

Kadras Engineering Platform provides a foundation to support product teams in their activities to onboard, develop, deploy and operate application workloads.

The platform provides several capabilities based on open-source projects, including:

* Serverless deployments with Knative
* Ingress via the Kubernetes Gateway API with Envoy Gateway
* Certificate management with cert-manager
* Secrets management with secretgen-controller
* GitOps support with Flux
* Workspaces for product teams, with access control and Pod Security Standards
* Observability with OpenTelemetry
* Policy management with Kyverno
* Air-gapped support with Carvel.

Each capability is shipped as a Carvel package from the [Kadras package repository](https://github.com/kadras-io/kadras-packages). The platform installs a default set of them, and the others on demand, with a common configuration for the concerns they share, like ingress, observability, and security.

Get started with Kadras by [installing the platform](/docs/getting-started/installation) and [creating your first workload](/docs/getting-started/workload) on a local environment.
