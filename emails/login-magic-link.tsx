import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import { env } from "~/env";

interface LoginMagicLinkEmailProps {
  loginUrl: string;
}

export const LoginMagicLinkEmail = ({ loginUrl }: LoginMagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Sign in to Fast Foto</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Sign in to Fast Foto</Heading>
        <Link
          href={loginUrl}
          target="_blank"
          style={{
            ...link,
            display: "block",
            marginBottom: "16px",
          }}
        >
          Click here to sign in to your account
        </Link>
        <Text
          style={{
            ...text,
            color: "#ababab",
            marginTop: "14px",
            marginBottom: "16px",
          }}
        >
          If you didn't request this sign in, you can safely ignore this email.
        </Text>
        <Text style={footer}>
          <Link
            href={env.APP_URL}
            target="_blank"
            style={{ ...link, color: "#898989" }}
          >
            Fast Foto
          </Link>
          {" - "}Your photography platform
        </Text>
      </Container>
    </Body>
  </Html>
);

LoginMagicLinkEmail.PreviewProps = {
  loginUrl: "https://login.example.com/verify?code=1234-5678-9012",
} as LoginMagicLinkEmailProps;

export default LoginMagicLinkEmail;

const main = {
  backgroundColor: "#ffffff",
};

const container = {
  paddingLeft: "12px",
  paddingRight: "12px",
  margin: "0 auto",
};

const h1 = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const link = {
  color: "#2754C5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  textDecoration: "underline",
};

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  margin: "24px 0",
};

const footer = {
  color: "#898989",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "12px",
  lineHeight: "22px",
  marginTop: "12px",
  marginBottom: "24px",
};
