# Auto-generated using compose2nix v0.3.2-pre.
{ pkgs, lib, ... }:

{
  # Runtime
  virtualisation.podman = {
    enable = true;
    autoPrune.enable = true;
    dockerCompat = true;
    defaultNetwork.settings = {
      # Required for container networking to be able to use names.
      dns_enabled = true;
    };
  };

  # Enable container name DNS for non-default Podman networks.
  # https://github.com/NixOS/nixpkgs/issues/226365
  networking.firewall.interfaces."podman+".allowedUDPPorts = [ 53 ];

  virtualisation.oci-containers.backend = "podman";

  # Containers
  virtualisation.oci-containers.containers."fastfoto-prod-db" = {
    image = "postgres:latest";
    environment = {
      "APP_URL" = "http://localhost:3000";
      "AUTH_SECRET" = "ybBVg/bQojeZoPmX25CpS65LG85YPPsOY2tEbiO4SfE";
      "AUTH_URL" = "http://localhost:3000";
      "DATABASE_URL" = "postgres://postgres:6dMEZZQCuF72U6MpxrJCGktxEMhWqNiZd9GhnVCWZ@db:5432/postgres";
      "DATABASE_URL_EXTERNAL" = "postgres://postgres:6dMEZZQCuF72U6MpxrJCGktxEMhWqNiZd9GhnVCWZ@localhost:5433/postgres";
      "POSTGRES_PASSWORD" = "6dMEZZQCuF72U6MpxrJCGktxEMhWqNiZd9GhnVCWZ";
      "RESEND_KEY" = "re_VEAcqmgc_6qpsyxdiazHw9h1pufBPWf1S";
      "UPLOADTHING_TOKEN" = "eyJhcGlLZXkiOiJza19saXZlX2Y0YWM4YTk2M2RmNmE4NjRjOWQ2ZDc0ZjZmMzA1ZjAzNmQ0ZDdiZDFiYWM1MTliMGM1NzdkYjg2NjRkODE5MGYiLCJhcHBJZCI6Imtrcnd1NXQwa24iLCJyZWdpb25zIjpbInNlYTEiXX0=";
    };
    volumes = [
      "fastfoto-prod_postgres_data:/var/lib/postgresql/data:rw"
    ];
    ports = [
      "5433:5432/tcp"
    ];
    log-driver = "journald";
    extraOptions = [
      "--health-cmd=pg_isready -U postgres -d postgres"
      "--health-interval=5s"
      "--health-retries=5"
      "--health-timeout=5s"
      "--network-alias=db"
      "--network=my_network"
    ];
  };
  systemd.services."podman-fastfoto-prod-db" = {
    serviceConfig = {
      Restart = lib.mkOverride 90 "no";
    };
    after = [
      "podman-network-my_network.service"
      "podman-volume-fastfoto-prod_postgres_data.service"
    ];
    requires = [
      "podman-network-my_network.service"
      "podman-volume-fastfoto-prod_postgres_data.service"
    ];
    partOf = [
      "podman-compose-fastfoto-prod-root.target"
    ];
    wantedBy = [
      "podman-compose-fastfoto-prod-root.target"
    ];
  };
  virtualisation.oci-containers.containers."fastfoto-prod-migrate" = {
    image = "localhost/compose2nix/fastfoto-prod-migrate";
    environment = {
      "APP_URL" = "http://localhost:3000";
      "AUTH_SECRET" = "ybBVg/bQojeZoPmX25CpS65LG85YPPsOY2tEbiO4SfE";
      "AUTH_URL" = "http://localhost:3000";
      "DATABASE_URL" = "postgres://postgres:6dMEZZQCuF72U6MpxrJCGktxEMhWqNiZd9GhnVCWZ@db:5432/postgres";
      "DATABASE_URL_EXTERNAL" = "postgres://postgres:6dMEZZQCuF72U6MpxrJCGktxEMhWqNiZd9GhnVCWZ@localhost:5433/postgres";
      "POSTGRES_PASSWORD" = "6dMEZZQCuF72U6MpxrJCGktxEMhWqNiZd9GhnVCWZ";
      "RESEND_KEY" = "re_VEAcqmgc_6qpsyxdiazHw9h1pufBPWf1S";
      "UPLOADTHING_TOKEN" = "eyJhcGlLZXkiOiJza19saXZlX2Y0YWM4YTk2M2RmNmE4NjRjOWQ2ZDc0ZjZmMzA1ZjAzNmQ0ZDdiZDFiYWM1MTliMGM1NzdkYjg2NjRkODE5MGYiLCJhcHBJZCI6Imtrcnd1NXQwa24iLCJyZWdpb25zIjpbInNlYTEiXX0=";
    };
    dependsOn = [
      "fastfoto-prod-db"
    ];
    log-driver = "journald";
    extraOptions = [
      "--network-alias=migrate"
      "--network=my_network"
    ];
  };
  systemd.services."podman-fastfoto-prod-migrate" = {
    serviceConfig = {
      Restart = lib.mkOverride 90 "no";
    };
    after = [
      "podman-network-my_network.service"
    ];
    requires = [
      "podman-network-my_network.service"
    ];
    partOf = [
      "podman-compose-fastfoto-prod-root.target"
    ];
    wantedBy = [
      "podman-compose-fastfoto-prod-root.target"
    ];
  };
  virtualisation.oci-containers.containers."fastfoto-prod-web" = {
    image = "localhost/compose2nix/fastfoto-prod-web";
    environment = {
      "APP_URL" = "http://localhost:3000";
      "AUTH_SECRET" = "ybBVg/bQojeZoPmX25CpS65LG85YPPsOY2tEbiO4SfE";
      "AUTH_URL" = "http://localhost:3000";
      "DATABASE_URL" = "postgres://postgres:6dMEZZQCuF72U6MpxrJCGktxEMhWqNiZd9GhnVCWZ@db:5432/postgres";
      "DATABASE_URL_EXTERNAL" = "postgres://postgres:6dMEZZQCuF72U6MpxrJCGktxEMhWqNiZd9GhnVCWZ@localhost:5433/postgres";
      "POSTGRES_PASSWORD" = "6dMEZZQCuF72U6MpxrJCGktxEMhWqNiZd9GhnVCWZ";
      "RESEND_KEY" = "re_VEAcqmgc_6qpsyxdiazHw9h1pufBPWf1S";
      "UPLOADTHING_TOKEN" = "eyJhcGlLZXkiOiJza19saXZlX2Y0YWM4YTk2M2RmNmE4NjRjOWQ2ZDc0ZjZmMzA1ZjAzNmQ0ZDdiZDFiYWM1MTliMGM1NzdkYjg2NjRkODE5MGYiLCJhcHBJZCI6Imtrcnd1NXQwa24iLCJyZWdpb25zIjpbInNlYTEiXX0=";
    };
    ports = [
      "3000:3000/tcp"
    ];
    dependsOn = [
      "fastfoto-prod-db"
    ];
    log-driver = "journald";
    extraOptions = [
      "--network-alias=web"
      "--network=my_network"
    ];
  };
  systemd.services."podman-fastfoto-prod-web" = {
    serviceConfig = {
      Restart = lib.mkOverride 90 "no";
    };
    after = [
      "podman-network-my_network.service"
    ];
    requires = [
      "podman-network-my_network.service"
    ];
    partOf = [
      "podman-compose-fastfoto-prod-root.target"
    ];
    wantedBy = [
      "podman-compose-fastfoto-prod-root.target"
    ];
  };

  # Networks
  systemd.services."podman-network-my_network" = {
    path = [ pkgs.podman ];
    serviceConfig = {
      Type = "oneshot";
      RemainAfterExit = true;
      ExecStop = "podman network rm -f my_network";
    };
    script = ''
      podman network inspect my_network || podman network create my_network --driver=bridge
    '';
    partOf = [ "podman-compose-fastfoto-prod-root.target" ];
    wantedBy = [ "podman-compose-fastfoto-prod-root.target" ];
  };

  # Volumes
  systemd.services."podman-volume-fastfoto-prod_postgres_data" = {
    path = [ pkgs.podman ];
    serviceConfig = {
      Type = "oneshot";
      RemainAfterExit = true;
    };
    script = ''
      podman volume inspect fastfoto-prod_postgres_data || podman volume create fastfoto-prod_postgres_data
    '';
    partOf = [ "podman-compose-fastfoto-prod-root.target" ];
    wantedBy = [ "podman-compose-fastfoto-prod-root.target" ];
  };

  # Builds
  systemd.services."podman-build-fastfoto-prod-migrate" = {
    path = [ pkgs.podman pkgs.git ];
    serviceConfig = {
      Type = "oneshot";
      TimeoutSec = 300;
    };
    script = ''
      cd /Users/casper/code/fastfoto
      podman build -t compose2nix/fastfoto-prod-migrate -f Dockerfile.migrate .
    '';
  };
  systemd.services."podman-build-fastfoto-prod-web" = {
    path = [ pkgs.podman pkgs.git ];
    serviceConfig = {
      Type = "oneshot";
      TimeoutSec = 300;
    };
    script = ''
      cd /Users/casper/code/fastfoto
      podman build -t compose2nix/fastfoto-prod-web .
    '';
  };

  # Root service
  # When started, this will automatically create all resources and start
  # the containers. When stopped, this will teardown all resources.
  systemd.targets."podman-compose-fastfoto-prod-root" = {
    unitConfig = {
      Description = "Root target generated by compose2nix.";
    };
    wantedBy = [ "multi-user.target" ];
  };
}
