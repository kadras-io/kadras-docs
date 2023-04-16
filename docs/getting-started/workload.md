---
sidebar_position: 2
description: Create and view an application workload
---

# Create a Workload

Kadras Engineering Platform provides out-of-the-box capabilities to support application development workflows from source code to URL.

First, check out the sample Band Service application.

```shell
git clone https://github.com/thomasvitale/band-service
```

## Deploy a workload

The platform exposes a Workload API based on [Cartographer](https://cartographer.sh) that developers use to trigger the supply chain for a given application.

Deploy the Band Service application by creating a workload based on the configuration available in `config/workload.yml`.

```shell
carto apps workload create --file config/workload.yml
```

Alternatively, you can create a workload using the Kubernetes CLI.

```shell
kubectl apply -f config/workload.yml
```

The platform will check out the application source code and run it through a pre-configured supply chain that will package it as a container image, configure it and finally deploy it.

## View a workload

Using the Cartographer CLI, you can inspect the status of a workload and its supply chain.

```shell
carto apps workload get band-service
```

The application will be available at `https://band-service.default.<your-domain-name>`, where `<your-domain-name>` is the base domain used during the platform installation.
