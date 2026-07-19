import { z } from "zod";
import { prisma } from "../../utils/db";

const createCustomRecordSchema = z.object({
  label: z.string().min(1).max(100),
  unit: z.string().min(1).max(20),
  lowerIsBetter: z.boolean(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const body = await readBody(event);
  const parsed = createCustomRecordSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message:
        "Invalid input: " + JSON.stringify(parsed.error.flatten().fieldErrors),
    });
  }

  const { label, unit, lowerIsBetter } = parsed.data;
  const slug = slugify(label);

  const existing = await prisma.customRecord.findUnique({
    where: { userId_slug: { userId, slug } },
  });

  if (existing) {
    throw createError({
      statusCode: 409,
      message: "A record with this name already exists",
    });
  }

  const created = await prisma.customRecord.create({
    data: {
      userId,
      slug,
      label,
      unit,
      lowerIsBetter,
      entries: [],
    },
  });

  return created;
});
