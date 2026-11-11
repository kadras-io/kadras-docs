---
sidebar_position: 2
description: Create and view an application workload
---

# Deploy a Workload

Kadras Engineering Platform provides capabilities to support application deployment workflows from image to URL based on Knative or plain Kubernetes.

First, ensure you have the [Knative CLI](https://knative.dev/docs/client/) installed.

Then, deploy an application from its OCI image in the `apps` workspace.

```shell
kn service create hello --image ghcr.io/knative/helloworld-go --user 1001 -n apps
```

The workspace enforces the `restricted` Pod Security Standard. Knative sets most of the required security settings on the application containers for you, like dropping all capabilities, and requires them to run as a non-root user. The sample image runs as root by default, so it's run with a non-root user via `--user`.

The application will be available through a local URL with a self-signed certificate and autoscaling capabilities. The URL follows the `<name>.<workspace>.<domain>` pattern.

```shell
https hello.apps.127.0.0.1.sslip.io --verify no
```

When you're done, you can delete the application.

```shell
kn service delete hello -n apps
```
