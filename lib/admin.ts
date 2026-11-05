import "server-only";
import { timingSafeEqual } from "node:crypto";

export function isAdminKey(key: string): boolean {
  const secret = process.env.ADMIN_KEY;
  if (!secret || secret.length < 16) return false;
  const a = Buffer.from(key);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
