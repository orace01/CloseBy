"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { TextField, Wordmark } from "@/components/ui/misc";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { TONES } from "@/lib/onboarding";
import { cn } from "@/lib/format";

const titleClass = "text-[40px] leading-[1.05] font-semibold tracking-[-0.03em]";

export function Onboarding() {
  const [state, action, pending] = useActionState(completeOnboarding, undefined);
  const [step, setStep] = useState(0);
  const [tone, setTone] = useState<string>(TONES[0]);
  const [accepted, setAccepted] = useState(false);
  const sections = useRef<Array<HTMLElement | null>>([]);

  // When the server rejects a field, jump back to the step that holds it.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.step !== undefined) setStep(state.step);
  }

  const isLast = step === 2;

  function next() {
    const fields = sections.current[step]?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea") ?? [];
    for (const field of fields) {
      if (!field.reportValidity()) return;
    }
    setStep(step + 1);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-18 items-center justify-between px-4 sm:px-14">
        <Link href="/" className="text-2xl" aria-label="CloseBy, page d’accueil">
          <Wordmark />
        </Link>
        <span className="font-mono text-[13px] text-graphite">Étape {step + 1} sur 3</span>
      </header>
      <div className="grid grid-cols-3 gap-1.5 px-4 sm:px-14" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn("h-1 rounded-sm transition-colors", i <= step ? "bg-ink" : "bg-rule")} />
        ))}
      </div>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <form action={action} className="flex w-full max-w-[520px] flex-col gap-9">
          {state?.error && (
            <p role="alert" className="rounded-[10px] bg-danger-soft px-4 py-3 text-[15px] text-danger">
              {state.error}
            </p>
          )}

          <section ref={(node) => { sections.current[0] = node; }} hidden={step !== 0} className="flex flex-col gap-7">
            <h1 className={titleClass}>Parlez-nous de vous</h1>
            <div className="flex flex-col gap-4">
              <TextField id="name" name="name" label="Votre nom" placeholder="Prénom Nom" autoComplete="name" maxLength={80} required />
              <TextField id="company" name="company" label="Votre entreprise" placeholder="Nom de votre entreprise" autoComplete="organization" maxLength={120} required />
            </div>
          </section>

          <section ref={(node) => { sections.current[1] = node; }} hidden={step !== 1} className="flex flex-col gap-7">
            <h1 className={titleClass}>Que proposez-vous ?</h1>
            <label htmlFor="offer" className="flex flex-col gap-2 text-sm font-semibold">
              Votre offre, en une phrase
              <textarea
                id="offer"
                name="offer"
                rows={3}
                minLength={10}
                maxLength={500}
                required
                placeholder="Ex. : je crée des sites web pour les restaurants."
                className="resize-none rounded-[10px] border-[1.5px] border-ink px-4 py-3.5 text-[17px] leading-normal font-normal placeholder:text-graphite-soft"
              />
            </label>
            <fieldset className="flex flex-col gap-2.5">
              <legend className="mb-2.5 text-sm font-semibold">Ton des e-mails</legend>
              <input type="hidden" name="tone" value={tone} />
              <div className="flex flex-wrap gap-2">
                {TONES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={tone === option}
                    onClick={() => setTone(option)}
                    className={cn(
                      "h-11 rounded-full border-[1.5px] px-4.5 text-[15px] font-semibold transition-colors",
                      tone === option ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink hover:border-ink",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
          </section>

          <section ref={(node) => { sections.current[2] = node; }} hidden={step !== 2} className="flex flex-col gap-6">
            <h1 className={titleClass}>Une seule règle</h1>
            <p className="text-[19px] leading-[1.55] text-graphite">
              L’agent prépare les e-mails. Vous les relisez et décidez de chaque envoi.
            </p>
            <label className="flex cursor-pointer items-center gap-3 text-base">
              <input
                type="checkbox"
                name="terms"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                className="peer sr-only"
              />
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-md border-[1.5px] border-ink bg-paper peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
                aria-hidden="true"
              >
                {accepted && <CheckIcon size={15} strokeWidth={3} className="text-paper" />}
              </span>
              J’accepte les règles d’utilisation
            </label>
          </section>

          <div className="flex items-center justify-between">
            {step > 0 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="text-base font-semibold">
                Retour
              </button>
            ) : (
              <span />
            )}
            {isLast ? (
              <Button type="submit" disabled={!accepted || pending} className="h-13 px-7">
                {pending ? "Enregistrement…" : "Terminer"}
              </Button>
            ) : (
              <Button onClick={next} className="h-13 px-7">
                Continuer
              </Button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
