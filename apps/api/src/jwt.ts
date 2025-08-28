import crypto from "node:crypto";

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function parseTimespan(str: string): number {
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return parseInt(str, 10);
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 60 * 60 * 24;
    default:
      return value;
  }
}

export function signJwt(
  payload: Record<string, unknown>,
  secret: string,
  options: { expiresIn?: string | number } = {}
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body: Record<string, unknown> = { ...payload };
  if (options.expiresIn) {
    const seconds =
      typeof options.expiresIn === "number"
        ? options.expiresIn
        : parseTimespan(options.expiresIn);
    body.exp = now + seconds;
  }
  const headerEncoded = base64url(JSON.stringify(header));
  const payloadEncoded = base64url(JSON.stringify(body));
  const data = `${headerEncoded}.${payloadEncoded}`;
  const signature = base64url(
    crypto.createHmac("sha256", secret).update(data).digest()
  );
  return `${data}.${signature}`;
}
