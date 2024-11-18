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

interface StudioClientInvitationEmailProps {
  studioName: string;
  inviterName: string;
  inviteUrl: string;
  collectionName: string | undefined;
}

export function StudioClientInvitationEmail({
  studioName,
  inviterName,
  inviteUrl,
  collectionName,
}: StudioClientInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {inviterName} invited you to view your photos on {studioName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>View your photos from {studioName}</Heading>

          <Text style={text}>
            {inviterName} has invited you to access{" "}
            {collectionName
              ? `your photo collection "${collectionName}"`
              : "your photos"}{" "}
            on {studioName}'s private gallery.
          </Text>

          <Text style={text}>As a client, you'll be able to:</Text>

          <ul style={list}>
            <li style={listItem}>View your photo collections</li>
            <li style={listItem}>Download high-resolution photos</li>
            <li style={listItem}>Share photos with friends and family</li>
            <li style={listItem}>Leave comments and feedback</li>
          </ul>

          <Link style={button} href={inviteUrl}>
            View Your Photos
          </Link>

          <Text style={footer}>
            This invitation will expire in 30 days. If you didn't expect this
            invitation from {studioName}, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const h1 = {
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "40px 0 20px",
};

const text = {
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#333",
  margin: "24px 0",
};

const list = {
  margin: "0",
  padding: "0",
  listStyle: "none",
};

const listItem = {
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#333",
  margin: "8px 0 8px 20px",
  position: "relative" as const,
  paddingLeft: "15px",
};

const button = {
  backgroundColor: "#000",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
  margin: "28px 0",
};

const footer = {
  fontSize: "13px",
  lineHeight: "1.4",
  color: "#666",
  margin: "24px 0",
};
