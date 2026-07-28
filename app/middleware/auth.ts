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
    // In caso di errore imprevisto, non blocchiamo la navigazione:
    // meglio lasciar passare che rompere l'intera app
  }
});
