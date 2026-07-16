export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: "Email and password are required",
    });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw createError({ statusCode: 401, message: "Invalid credentials" });
  }

  // TEMPORANEO: confronto diretto, niente hashing per ora
  if (user.passwordHash !== password) {
    throw createError({ statusCode: 401, message: "Invalid credentials" });
  }

  // Crea la sessione (cookie httpOnly gestito da nuxt-auth-utils)
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });

  return { success: true };
});
