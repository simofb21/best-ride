export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const metricKey = getRouterParam(event, "metricKey")!;
  const rank = Number(getRouterParam(event, "rank"));

  const model = getModel(metricKey);

  await model.delete({ where: { userId_rank: { userId, rank } } }).catch(() => {
    // se non esisteva già, non è un errore bloccante
  });

  // Richiudi il "buco": tutte le righe con rank maggiore scalano di una posizione
  const remaining = await model.findMany({
    where: { userId, rank: { gt: rank } },
    orderBy: { rank: "asc" },
  });

  for (const entry of remaining) {
    await model.update({
      where: { userId_rank: { userId, rank: entry.rank } },
      data: { rank: entry.rank - 1 },
    });
    await model
      .delete({ where: { userId_rank: { userId, rank: entry.rank } } })
      .catch(() => {});
  }

  return { success: true };
});
