---
sidebar_position: 1
---

# Introduction

Kadras Engineering Platform provides a foundation to support product teams in their activities to onboard, develop, deploy and operate application workloads on Kubernetes.

## How It Works

The platform is a curated set of open-source projects, each shipped as a [Carvel](https://carvel.dev) package from the [Kadras package repository](https://github.com/kadras-io/kadras-packages). You install it with a single command and a small configuration file: the platform installs the packages in the right order, and configures them consistently for the concerns they share, like ingress, observability, security, and the corporate proxy.

Product teams work in **workspaces**: namespaces where they deploy their applications, with access control, shared credentials, and a Pod Security Standard. Their applications are exposed over HTTPS on a subdomain of the workspace, like `https://hello.team-a.example.com`.

## Capabilities

The platform installs a default set of packages, and the optional ones on demand.

| Capability | Project | Installed |
|------------|---------|-----------|
| Serverless applications, with autoscaling down to zero | [Knative Serving](https://knative.dev) | By default |
| Ingress via the Kubernetes Gateway API | [Envoy Gateway](https://gateway.envoyproxy.io) | By default |
| TLS certificates, from a private CA or Let's Encrypt | [cert-manager](https://cert-manager.io) | By default |
| GitOps | [Flux](https://fluxcd.io) | By default |
| Secrets generation and sharing | [secretgen-controller](https://github.com/carvel-dev/secretgen-controller) | By default |
| Workspaces for product teams | [Workspace Provisioner](https://github.com/kadras-io/workspace-provisioner) | By default |
| Policies, like the verification of image signatures | [Kyverno](https://kyverno.io) | Optional |
| Progressive delivery | [Flagger](https://flagger.app) | Optional |
| PostgreSQL databases | [CloudNativePG](https://cloudnative-pg.io) | Optional |
| RabbitMQ message brokers | [RabbitMQ Cluster Operator](https://www.rabbitmq.com/kubernetes/operator/operator-overview) | Optional |
| Observability with OpenTelemetry | [OpenTelemetry Operator](https://opentelemetry.io/docs/platforms/kubernetes/operator) | Optional |
| Infrastructure provisioning via Kubernetes APIs | [Crossplane](https://www.crossplane.io) | Optional |
| Software supply chain security, via SBOM analysis | [OWASP Dependency-Track](https://dependencytrack.org) | Optional |

The complete list is in the [platform documentation](https://github.com/kadras-io/kadras-engineering-platform). All the packages are published as signed OCI artifacts, so they can be relocated to a private registry for air-gapped environments.

## Next Steps

* [Install the platform](/docs/getting-started/installation) on a local Kubernetes cluster, and [deploy your first workload](/docs/getting-started/workload).
* Learn how [workspaces and access](/docs/getting-started/workspaces) work.
* Install the platform on [Hetzner Cloud](/docs/hetzner/installation), with Let's Encrypt certificates.
* Explore the [configuration options](https://github.com/kadras-io/kadras-engineering-platform/blob/main/docs/configuration.md) of the platform.
