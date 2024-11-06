import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function VerifyRequestPage() {
  return (
    <div className="container flex h-screen w-full items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            A sign in link has been sent to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the link in the email to sign in. If you don't see the email,
            check your spam folder.
          </p>
          <p className="text-sm text-muted-foreground">
            The link will expire in 24 hours.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
