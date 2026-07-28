import { prisma } from "../../utils/db";

async function findOrCreateUserFromOAuth(params: {
  provider: string;
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
}) {
  const { provider, providerId, email, firstName, lastName } = params;

  const existingAccount = await prisma.account.findUnique({
    where: { provider_providerId: { provider, providerId } },
    include: { user: true },
  });

  if (existingAccount) {
    return existingAccount.user;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    await prisma.account.create({
      data: { userId: existingUser.id, provider, providerId },
    });
    return existingUser;
  }

  return prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      accounts: {
        create: { provider, providerId },
      },
    },
  });
}

export default defineOAuthGoogleEventHandler({
  config: {
    scope: ["email", "profile"],
  },
  async onSuccess(event, { user: googleUser }) {
    const user = await findOrCreateUserFromOAuth({
      provider: "google",
      providerId: googleUser.sub,
      email: googleUser.email,
      firstName: googleUser.given_name ?? "User",
      lastName: googleUser.family_name ?? "",
    });

    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

    // Ricontrolla lo stato AGGIORNATO dell'utente (non quello di findOrCreateUserFromOAuth,
    // che potrebbe non avere il campo fresco se l'utente esisteva già)
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { privacyAcceptedAt: true },
    });

    if (!freshUser?.privacyAcceptedAt) {
      return sendRedirect(event, "/complete-profile");
    }

    return sendRedirect(event, "/");
  },
  onError(event, error) {
    console.error("Google OAuth error:", error);
    return sendRedirect(event, "/login?error=google_auth_failed");
  },
});