---
sidebar_position: 2
description: Create and view an application workload
---

# Deploy a Workload

Kadras Engineering Platform provides capabilities to support application deployment workflows from image to URL based on Knative or plain Kubernetes.

First, ensure you have the [Knative CLI](https://knative.dev/docs/client/) installed.

Then, deploy an application from its OCI image.

```shell
kn service create band-service --image ghcr.io/thomasvitale/band-service
```

The application will be available through a local URL with a self-signed certificate and autoscaling capabilities.

```shell
https band-service.default.127.0.0.1.sslip.io --verify no
```
