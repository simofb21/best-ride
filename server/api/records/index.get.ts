export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event); // fornito da nuxt-auth-utils, blocca se non loggato
  const userId = session.user.id;

  const result: Record<string, any[]> = {};

  for (const metricKey of Object.keys(METRIC_MODEL_MAP)) {
    const model = getModel(metricKey);
    const entries = await model.findMany({
      where: { userId },
      orderBy: { rank: "asc" },
    });
    result[metricKey] = entries;
  }

  return result;
});
