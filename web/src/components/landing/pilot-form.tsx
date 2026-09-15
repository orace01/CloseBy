"use client";

// No backend yet: the sign-up is only acknowledged on screen.
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";

export function PilotForm() {
  const [joined, setJoined] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setJoined(true);
  }

  if (joined) {
    return (
      <p role="status" className="flex min-h-17 items-center gap-3 rounded-2xl bg-desk px-5.5 text-lg font-semibold">
        <CheckIcon size={20} strokeWidth={2.6} className="text-success" />
        C’est noté. Nous vous écrivons très bientôt.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2.5 rounded-2xl border-[1.5px] border-ink p-2 sm:flex-row sm:items-center sm:pl-5.5"
    >
      <label htmlFor="pilot-email" className="sr-only">
        Votre e-mail professionnel
      </label>
      <input
        id="pilot-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="vous@entreprise.fr"
        className="h-12.5 min-w-0 flex-1 bg-transparent px-3 text-lg text-ink placeholder:text-graphite-soft sm:px-0"
      />
      <Button type="submit" className="h-13">
        Rejoindre le pilote <ArrowRightIcon size={17} />
      </Button>
    </form>
  );
}
