// server/middleware/rateLimit.ts
const uploadAttempts = new Map<number, { count: number; resetAt: number }>();

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);

  if (!url.pathname.startsWith("/api/upload")) return;

  try {
    const session = await getUserSession(event);
    if (!session?.user?.id) return;

    const userId = session.user.id;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minuto
    const maxRequests = 10;

    const entry = uploadAttempts.get(userId);

    if (!entry || now > entry.resetAt) {
      uploadAttempts.set(userId, { count: 1, resetAt: now + windowMs });
      return;
    }

    if (entry.count >= maxRequests) {
      throw createError({
        statusCode: 429,
        message:
          "Too many upload attempts. Please wait a minute before trying again.",
      });
    }

    entry.count++;
  } catch (err: any) {
    if (err.statusCode === 429) throw err;
    // Ignora altri errori (utente non loggato ecc.)
  }
});
