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

interface StudioMemberInvitationEmailProps {
  studioName: string;
  inviterName: string;
  inviteUrl: string;
  role: "admin" | "member" | "owner";
}

export function StudioMemberInvitationEmail({
  studioName,
  inviterName,
  inviteUrl,
  role,
}: StudioMemberInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {inviterName} invited you to join {studioName} on PhotoStudio
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            Join {studioName} as a {role}
          </Heading>
          <Text style={text}>
            {inviterName} has invited you to join {studioName} as a studio{" "}
            {role}. As a {role}, you'll be able to:
          </Text>

          {role === "admin" ? (
            <ul style={list}>
              <li style={listItem}>Manage studio settings and members</li>
              <li style={listItem}>Upload and organize photos</li>
              <li style={listItem}>Create and manage photo collections</li>
              <li style={listItem}>Invite new members</li>
            </ul>
          ) : (
            <ul style={list}>
              <li style={listItem}>Access studio photos and collections</li>
              <li style={listItem}>Upload photos to assigned collections</li>
              <li style={listItem}>Collaborate with other studio members</li>
            </ul>
          )}

          <Link style={button} href={inviteUrl}>
            Accept Invitation
          </Link>

          <Text style={footer}>
            This invitation will expire in 7 days. If you didn't expect this
            invitation from {inviterName}, you can safely ignore this email.
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
