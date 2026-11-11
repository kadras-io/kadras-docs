# Kadras Docs

Documentation website for [Kadras](https://kadras-io.github.io/kadras-docs/), built with [Docusaurus](https://docusaurus.io/).

## Development

The development environment is managed with [devenv](https://devenv.sh), which provides Node.js, Yarn, and the rest of the tooling. Enter it with `devenv shell`, or automatically via [direnv](https://direnv.net) when entering the project directory.

The common tasks are defined in the [Taskfile](Taskfile.yml). Run `task --list` to see all of them.

| Command | Description |
|---|---|
| `task start` | Start a local development server with live reload. |
| `task build` | Build the static website into the `build` directory. |
| `task serve` | Serve the built website locally. |
| `task check` | Run all the checks, as done in CI. |

## Deployment

The website is built on every pull request and deployed to GitHub Pages on every push to the `main` branch by the [Build and Deploy](.github/workflows/deploy.yml) workflow.
