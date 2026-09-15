"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { TextField, Wordmark } from "@/components/ui/misc";
import { cn } from "@/lib/format";

const tones = ["Professionnel", "Direct", "Chaleureux"];
const titleClass = "text-[40px] leading-[1.05] font-semibold tracking-[-0.03em]";

export function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [tone, setTone] = useState(tones[0]);
  const [accepted, setAccepted] = useState(false);
  const isLast = step === 2;
  const canContinue = !isLast || accepted;

  function next() {
    if (!isLast) setStep(step + 1);
    else if (accepted) router.push("/tableau-de-bord");
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
          <span key={i} className={cn("h-1 rounded-sm", i <= step ? "bg-ink" : "bg-rule")} />
        ))}
      </div>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="flex w-full max-w-[520px] flex-col gap-9">
          {step === 0 && (
            <div className="flex flex-col gap-7">
              <h1 className={titleClass}>Parlez-nous de vous</h1>
              <div className="flex flex-col gap-4">
                <TextField id="name" name="name" label="Votre nom" placeholder="Camille Roux" autoComplete="name" />
                <TextField id="company" name="company" label="Votre entreprise" placeholder="Studio Roux" autoComplete="organization" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-7">
              <h1 className={titleClass}>Que proposez-vous ?</h1>
              <label htmlFor="offer" className="sr-only">
                Votre offre
              </label>
              <textarea
                id="offer"
                name="offer"
                rows={3}
                placeholder="Ex. : je crée des sites web pour les restaurants."
                className="resize-none rounded-[10px] border-[1.5px] border-ink px-4 py-3.5 text-[17px] leading-normal placeholder:text-graphite-soft"
              />
              <fieldset className="flex flex-col gap-2.5">
                <legend className="mb-2.5 text-sm font-semibold">Ton des e-mails</legend>
                <div className="flex flex-wrap gap-2">
                  {tones.map((option) => (
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
            </div>
          )}

          {isLast && (
            <div className="flex flex-col gap-6">
              <h1 className={titleClass}>Une seule règle</h1>
              <p className="text-[19px] leading-[1.55] text-graphite">
                L’agent prépare les e-mails. Vous les relisez et décidez de chaque envoi.
              </p>
              <label className="flex cursor-pointer items-center gap-3 text-base">
                <input
                  type="checkbox"
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
            </div>
          )}

          <div className="flex items-center justify-between">
            {step > 0 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="text-base font-semibold">
                Retour
              </button>
            ) : (
              <span />
            )}
            <Button onClick={next} disabled={!canContinue} className="h-13 px-7">
              {isLast ? "Terminer" : "Continuer"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
