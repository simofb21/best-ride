import { prisma } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  await prisma.user.delete({ where: { id: userId } });

  // Cancella la sessione corrente, dato che l'utente non esiste più
  await clearUserSession(event);

  return { success: true };
});
