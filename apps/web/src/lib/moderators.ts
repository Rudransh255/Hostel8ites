// Moderator emails — these accounts can delete any listing or request.
// Edit this list to grant/revoke moderator access.
export const MODERATOR_EMAILS = [
  'rudranshsingh57112@gmail.com',
  'aegentfocks@gmail.com',
];

export function isModerator(email: string | null | undefined): boolean {
  if (!email) return false;
  return MODERATOR_EMAILS.includes(email.toLowerCase());
}
