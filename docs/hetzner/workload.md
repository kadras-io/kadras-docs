---
sidebar_position: 2
description: Create and view an application workload
---

# Deploy a Workload

Kadras Engineering Platform provides capabilities to support application deployment workflows from image to URL based on Knative or plain Kubernetes.

First, ensure you have the [Knative CLI](https://knative.dev/docs/client/) installed.

Then, deploy an application from its OCI image.

```shell
kn service create helloworld --image ghcr.io/knative/helloworld-go
```

The application will be available through a public URL with a Let's Encrypt-issued certificate and autoscaling capabilities.

```shell
https helloworld.default.<your-domain>
```
