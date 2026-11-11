---
sidebar_position: 2
description: Create and view an application workload
---

# Deploy a Workload

Kadras Engineering Platform provides capabilities to support application deployment workflows from image to URL based on Knative or plain Kubernetes.

First, ensure you have the [Knative CLI](https://knative.dev/docs/client/) installed.

Then, deploy an application from its OCI image in the `apps` workspace.

```shell
kn service create helloworld --image ghcr.io/knative/helloworld-go --user 1001 -n apps
```

The `apps` workspace enforces the `restricted` Pod Security Standard, so the application runs with a non-root user (`--user`), since the sample image runs as root by default.

The application will be available through a public URL with a Let's Encrypt-issued certificate and autoscaling capabilities. The URL follows the `<name>.<workspace>.<domain>` pattern.

```shell
https helloworld.apps.<your-domain>
```

When you're done, you can delete the application.

```shell
kn service delete helloworld -n apps
```
