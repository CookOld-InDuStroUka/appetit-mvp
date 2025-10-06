export function normalizeKazakhPhone(input: string): string | null {
  if (typeof input !== "string") return null;
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.length === 11) {
    if (digits.startsWith("7")) {
      return `+${digits}`;
    }
    if (digits.startsWith("8")) {
      return `+7${digits.slice(1)}`;
    }
  }

  if (digits.length === 10) {
    return `+7${digits}`;
  }

  return null;
}

export function isValidKazakhPhone(phone: string | null | undefined): phone is string {
  return typeof phone === "string" && /^\+7\d{10}$/.test(phone);
}
