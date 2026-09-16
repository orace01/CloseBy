// Transactional emails (verification, password reset).
// No provider is configured yet: emails are printed to the server console so
// their links can be opened during local development.

export interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail(email: OutgoingEmail) {
  console.info(
    ["", "────────── e-mail (dev) ──────────", `À : ${email.to}`, `Objet : ${email.subject}`, "", email.text, "──────────────────────────────────", ""].join("\n"),
  );
}
