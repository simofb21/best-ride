export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useUserSession();

  if (!loggedIn.value) {
    return navigateTo("/login");
  }

  if (to.path === "/complete-profile") return;

  try {
    const { hasAccepted } = await $fetch("/api/profile/consent-status", {
      headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
    });

    if (!hasAccepted) {
      return navigateTo("/complete-profile");
    }
  } catch (err) {
    console.error("Errore nel controllo consenso privacy:", err);
    // Non apriamo pagine protette senza aver verificato il consenso. La pagina
    // di completamento gestisce il retry e mostra l'errore anche con un toast.
    return navigateTo("/complete-profile");
  }
});
