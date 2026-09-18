export const PORTARIA_EMAILS = ['porteiros@solemar.com']

export function isPortariaEmail(email: string | undefined) {
  return !!email && PORTARIA_EMAILS.includes(email.trim().toLowerCase())
}