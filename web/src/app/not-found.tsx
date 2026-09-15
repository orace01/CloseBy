import { ButtonLink } from "@/components/ui/button";
import { Wordmark } from "@/components/ui/misc";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-start justify-center gap-6 px-4 sm:px-14">
      <Wordmark className="text-2xl" />
      <h1 className="text-5xl leading-none font-semibold tracking-[-0.04em]">Page introuvable</h1>
      <p className="max-w-md text-lg text-graphite">Cette adresse ne mène nulle part. Elle a peut-être changé.</p>
      <ButtonLink href="/">Retour à l’accueil</ButtonLink>
    </main>
  );
}
