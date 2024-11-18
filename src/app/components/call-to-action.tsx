import Image from "next/image";

import Link from "next/link";
import { Container } from "~/app/components/container";
import { Button } from "~/components/ui/button";

export function CallToAction() {
  return (
    <section
      id="get-started-today"
      className="relative overflow-hidden bg-blue-600 py-32"
    >
      <Image
        className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        src="/images/background-call-to-action.jpg"
        alt=""
        width={2347}
        height={1244}
        unoptimized
      />
      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
            Start sharing your work today
          </h2>
          <p className="mt-4 text-lg tracking-tight text-white">
            Join photographers worldwide who trust Fast Foto to showcase their
            work and delight their clients. Start your free trial today.
          </p>
          <Button asChild className="mt-10">
            <Link href="/auth/login">Start free trial</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
