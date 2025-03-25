{ pkgs }: {
    deps = [
        pkgs.bashInteractive
        pkgs.python311Packages.pynput
    ];
}