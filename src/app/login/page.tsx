import { LoginForm } from "~/app/login-form";
import { signIn } from "~/auth";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Login</h2>
        </CardHeader>
        <CardContent>
          <LoginForm
            login={async (options) => {
              "use server";

              await signIn("resend", {
                ...options,
                redirectTo: "/",
              });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
