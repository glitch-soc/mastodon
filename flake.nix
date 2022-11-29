{
  description = "A glitchy but lovable microblogging server";

  outputs = { self, nixpkgs, flake-utils }: flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = nixpkgs.legacyPackages.${system};
    in
    rec {
      packages.glitch-soc = pkgs.callPackage ./nix/package.nix { };
      packages.default = packages.glitch-soc;
      apps.update = flake-utils.lib.mkApp {
        drv = pkgs.writeShellScriptBin "update.sh" ''
          set -eux
          echo 'Updating gemset.nix (index of gem hashes)'
          echo 'Ignore any warnings about sudo being needed.'
          ${pkgs.bundix}/bin/bundix --gemset=./nix/gemset.nix
          echo 'Updating yarn.nix (hash of Yarn dependencies)'
          echo '"sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="' > nix/yarn.nix
          git add nix/yarn.nix
          YARN_SHA256="$(nix build .#glitch-soc.passthru.yarnOfflineCache 2>&1 | tee nixupdate.log | grep -oP 'got:\s+\Ksha256-\S+')"
          echo '"'"$YARN_SHA256"'"' > nix/yarn.nix
        '';
      };
      devShells.default = pkgs.mkShell {
        buildInputs = [
          pkgs.nodejs-slim
          pkgs.yarn
          pkgs.ruby_3_0
          pkgs.bundix
          packages.glitch-soc.mastodon-gems
        ];
      };
    });
}
