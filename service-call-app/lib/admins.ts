import type { User } from "firebase/auth";

export const ADMIN_DISPLAY_NAMES = ["Joe Hinderer", "Eric Hinderer"];

export function isAdmin(
  user: Pick<User, "displayName"> | null | undefined
): boolean {
  if (!user?.displayName) return false;
  return ADMIN_DISPLAY_NAMES.includes(user.displayName);
}
