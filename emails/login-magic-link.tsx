import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";
import dayjs from "dayjs";
import { buttonVariants } from "~/components/ui/button";
import { env } from "~/env";

interface LoginMagicLinkEmailProps {
  loginUrl: string;
  expiresAt: number;
}

export function LoginMagicLinkEmail({
  loginUrl,
  expiresAt,
}: LoginMagicLinkEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Magic link to sign in to Fast Foto</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto px-3">
            <Heading className="my-10 font-sans text-2xl font-bold text-gray-800">
              Sign in to Fast Foto
            </Heading>
            <Button
              href={loginUrl}
              target="_blank"
              className={buttonVariants({
                className: "w-full bg-[hsl(240_5.9%_10%)] text-[hsl(0_0%_98%)]",
              })}
            >
              Click here to sign in to your account
            </Button>

            <Text className="mb-4 mt-3.5 font-sans text-sm text-gray-400">
              If you didn't request this sign in, you can safely ignore this
              email.
            </Text>

            <Text className="mt-3.5 font-sans text-sm text-gray-400">
              This link will expire on{" "}
              {dayjs(expiresAt).format("MMMM D, YYYY h:mm A")}
            </Text>

            <Text className="mb-6 mt-3 font-sans text-xs leading-6 text-gray-500">
              <Link
                href={env.APP_URL}
                target="_blank"
                className="font-sans text-xs text-gray-500 underline"
              >
                Fast Foto
              </Link>
              {" - "}Your photography platform
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

LoginMagicLinkEmail.PreviewProps = {
  loginUrl: new URL("/login", env.APP_URL).toString(),
  expiresAt: Date.now(),
} as LoginMagicLinkEmailProps;

export default LoginMagicLinkEmail;
