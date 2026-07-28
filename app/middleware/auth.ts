export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useUserSession();

  if (!loggedIn.value) {
    return navigateTo("/login");
  }

  if (to.path === "/complete-profile") return;

  const { hasAccepted } = await $fetch("/api/profile/consent-status");

  if (!hasAccepted) {
    return navigateTo("/complete-profile");
  }
});
