/// <reference path="./.sst/platform/config.d.ts" />
import { Postgres } from "./.sst/platform/src/components/aws/postgres-v1";
export default $config({
  app(input) {
    return {
      name: "fastfoto",
      removal: input.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "eu-central-1",
        },
        cloudflare: {
          version: "5.42.0",
        },
        "@pulumi/docker": "4.5.7",
      },
    };
  },
  async run() {
    const authSecret = new sst.Secret("AuthSecret");
    const axiomToken = new sst.Secret("AxiomToken");
    const resendKey = new sst.Secret("ResendKey");
    const uploadThingToken = new sst.Secret("UploadThingToken");
    let vpc: sst.aws.Vpc;
    let rds: Postgres;
    let local: sst.Linkable<{
      host: string;
      port: number;
      username: string;
      password: string;
      database: string;
    }>;
    if ($dev) {
      const localProperties = {
        host: "localhost",
        port: 5432,
        username: "postgres",
        password: "postgres",
        database: "postgres",
      };
      new docker.Container("LocalPostgres", {
        // Unique container name
        name: `postgres-${$app.name}`,
        restart: "always",
        image: "postgres:17.0",
        ports: [
          {
            internal: 5432,
            external: localProperties.port,
          },
        ],
        envs: [
          `POSTGRES_PASSWORD=${localProperties.password}`,
          `POSTGRES_USER=${localProperties.username}`,
          `POSTGRES_DB=${localProperties.database}`,
        ],
        volumes: [
          {
            // Where to store the data locally
            hostPath: "/tmp/postgres-data",
            containerPath: "/var/lib/postgresql/data",
          },
        ],
      });
      local = new sst.Linkable("MyPostgres", {
        properties: localProperties,
      });
    } else {
      vpc = new sst.aws.Vpc("MyVpc", { bastion: true, nat: "ec2" });
      rds = new sst.aws.Postgres.v1("MyPostgres", { vpc });
    }
    new sst.aws.Nextjs("MyWeb", {
      link: [
        $dev ? local : rds,
        authSecret,
        resendKey,
        axiomToken,
        uploadThingToken,
      ],
      vpc: $dev ? undefined : vpc,
      domain: {
        name: "fastfoto.casperengelmann.com",
        dns: sst.cloudflare.dns({
          zone: "6a521705d65dcf31822ab4b3053269c7",
        }),
      },
    });
  },
});
