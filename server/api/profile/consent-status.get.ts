import { prisma } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { privacyAcceptedAt: true },
  });

  return { hasAccepted: user?.privacyAcceptedAt != null };
});
