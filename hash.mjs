// hash.mjs — file temporaneo, cancellalo dopo l'uso
import { hashPassword } from "#auth-utils/server";

const hash = await hashPassword("password123");
console.log(hash);
