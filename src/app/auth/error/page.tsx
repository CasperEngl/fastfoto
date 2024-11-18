import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

const searchParamsSchema = z.object({
  error: z.string().optional().default("Default"),
});

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<unknown>;
}) {
  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The sign in link is no longer valid.",
    Default: "An error occurred while trying to sign in.",
  };

  const validatedParams = searchParamsSchema.parse(await searchParams);
  const errorMessage =
    errorMessages[validatedParams.error] || errorMessages.Default;

  return (
    <div className="container flex h-screen w-full items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>

          <div className="flex justify-center">
            <Button asChild>
              <Link href="/auth/login">Back to Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
