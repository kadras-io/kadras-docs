---
sidebar_position: 3
description: Give teams access to their workspaces
---

# Workspaces and Access

Product teams deploy their applications in **workspaces**: namespaces configured by the platform with access control, a Pod Security Standard, shared credentials, and an HTTPS hostname for their applications. In the [installation guide](/docs/getting-started/installation), you created the `apps` workspace.

## Grant Access to a Team

The access to a workspace is granted via the Kubernetes [default roles](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#user-facing-roles), bound in its namespace. The platform packages extend them with the permissions on their own resources, like Knative Services, HTTPRoutes, and PostgreSQL databases.

| Role | Permissions in the workspace |
|------|------------------------------|
| `admin` | Manage the applications and the platform resources, and the access to the workspace. |
| `edit` | Manage the applications and the platform resources. |
| `view` | Read the applications and the platform resources, except Secrets. |

Add the members of the workspace to the `values.yml` file of the platform. They're the users and groups authenticated by the Kubernetes API server, for example via an OIDC identity provider.

```yaml title="values.yml"
profile: local
workspaces:
  - name: apps
    members:
      - kind: Group
        name: team-a
        role: edit
      - kind: User
        name: jane@example.com
        role: view
```

Update the platform installation with the new configuration.

```shell
kctrl package installed update -i engineering-platform \
  -n kadras-system \
  --values-file values.yml
```

Check the permissions of the members by impersonating them. A member of the `team-a` group can deploy Knative Services and HTTPRoutes in the workspace, but can't create Gateways, which are managed by the platform.

```shell
kubectl auth can-i create services.serving.knative.dev -n apps --as=john --as-group=team-a
kubectl auth can-i create httproutes.gateway.networking.k8s.io -n apps --as=john --as-group=team-a
kubectl auth can-i create gateways.gateway.networking.k8s.io -n apps --as=john --as-group=team-a
```

The first two commands answer `yes`, the last one `no`. The `jane@example.com` user can only read the applications.

```shell
kubectl auth can-i list services.serving.knative.dev -n apps --as=jane@example.com
kubectl auth can-i create services.serving.knative.dev -n apps --as=jane@example.com
```

## Pod Security

The workspaces enforce the `restricted` [Pod Security Standard](https://kubernetes.io/docs/concepts/security/pod-security-standards/): the applications run as non-root users, without privilege escalation, and with all the Linux capabilities dropped. Pods violating it are rejected.

```shell
kubectl run privileged -n apps --image=busybox --dry-run=server \
  --overrides='{"spec":{"containers":[{"name":"privileged","image":"busybox","securityContext":{"privileged":true}}]}}'
```

Knative Serving sets the secure defaults on the Knative Services that don't set them, except for the user: images that run as root by default need a non-root user, like the sample application of the [workload guide](/docs/getting-started/workload). The standard can be relaxed for a single workspace, if needed.

```yaml title="values.yml"
workspaces:
  - name: legacy
    pod_security: baseline
```

## Deploy via GitOps

Each workspace includes a `gitops-reconciler` ServiceAccount, bound to the `admin` role. The [Flux](https://fluxcd.io) resources in the workspace use it to deploy the applications from a Git repository or an OCI artifact, with the permissions of the workspace and nothing more.

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: my-app
  namespace: apps
spec:
  serviceAccountName: gitops-reconciler
  interval: 10m
  sourceRef:
    kind: GitRepository
    name: my-app
  path: ./deploy
  prune: true
```

For more information, check the documentation of the [workspaces](https://github.com/kadras-io/workspace-provisioner/blob/main/docs/workspaces.md) and of the [platform configuration](https://github.com/kadras-io/kadras-engineering-platform/blob/main/docs/configuration.md#workspaces).
