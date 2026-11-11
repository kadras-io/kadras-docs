{ pkgs, lib, config, inputs, ... }:

{
  # https://devenv.sh/packages/
  packages = [
    # GitHub Actions
    pkgs.actionlint

    # Utilities
    pkgs.go-task
  ];

  # https://devenv.sh/languages/
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_26;
    yarn.enable = true;
  };

  # See full reference at https://devenv.sh/reference/options/
}
