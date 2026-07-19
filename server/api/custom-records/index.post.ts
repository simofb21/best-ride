import { z } from "zod";
import { prisma } from "../../utils/db";

const createCustomRecordSchema = z
  .object({
    label: z.string().min(1).max(100),
    unitType: z.enum(["time", "speed", "power", "distance", "other"]),
    customUnit: z.string().max(20).optional(),
    lowerIsBetter: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.unitType === "other" && !data.customUnit?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customUnit"],
        message: 'Custom unit is required when type is "Other"',
      });
    }
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

  const { label, unitType, customUnit, lowerIsBetter } = parsed.data;
  const slug = slugify(label);

  const typeConfig = UNIT_TYPE_OPTIONS.find((t) => t.value === unitType)!;

  // Se è "other", uso quello che ha scritto l'utente (trimmato, max 20 char già garantito da Zod).
  // Altrimenti uso la stringa fissa della categoria scelta (es. "km/h", "W", o "h:m:s" per il tempo).
  const unit =
    unitType === "other" ? customUnit!.trim() : typeConfig.fixedUnit!;

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
    data: { userId, slug, label, unit, lowerIsBetter, entries: [] },
  });

  return created;
});
