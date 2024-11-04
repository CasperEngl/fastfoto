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

interface VerifyEmailChangeProps {
  verificationLink: string;
}

export const VerifyEmailChangeEmail = ({
  verificationLink,
}: VerifyEmailChangeProps) => (
  <Html>
    <Head />
    <Preview>Verify Your Email Change</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Verify Your Email Change</Heading>
        <Link
          href={verificationLink}
          target="_blank"
          style={{
            ...link,
            display: "block",
            marginBottom: "16px",
          }}
        >
          Click here to verify your new email address
        </Link>
        <Text
          style={{
            ...text,
            color: "#ababab",
            marginTop: "14px",
            marginBottom: "16px",
          }}
        >
          If you didn't request this change, please ignore this email or contact
          support.
        </Text>
        <Text style={footer}>
          <Link
            href={env.COOLIFY_URL}
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

VerifyEmailChangeEmail.PreviewProps = {
  verificationLink: "https://example.com/verify",
} as VerifyEmailChangeProps;

export default VerifyEmailChangeEmail;

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
