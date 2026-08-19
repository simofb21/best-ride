import Vue3Toastify, {
  toast,
  type CloseButtonProps,
  type ToastContainerOptions,
} from "vue3-toastify";
import { h } from "vue";

const GLOBAL_ERROR_TOAST_ID = "best-ride-global-vue-error";
const NOT_FOUND_TOAST_ID = "best-ride-page-not-found";

function errorStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;
  const item = error as Record<string, unknown>;
  const response =
    item.response && typeof item.response === "object"
      ? (item.response as Record<string, unknown>)
      : null;
  const value = item.statusCode ?? item.status ?? response?.status;
  const status = typeof value === "string" ? Number(value) : value;
  return typeof status === "number" && Number.isInteger(status) ? status : null;
}

function isCancelledError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const item = error as Record<string, unknown>;
  return item.name === "AbortError" || item.code === "ABORT_ERR";
}

export default defineNuxtPlugin((nuxtApp) => {
  const translate = (key: string, fallback: string): string => {
    const i18n = nuxtApp.$i18n as
      | { t?: (translationKey: string) => unknown }
      | undefined;
    const translated = i18n?.t?.(key);
    return typeof translated === "string" && translated.trim()
      ? translated
      : fallback;
  };

  const closeButton = (props: CloseButtonProps) =>
    h(
      "button",
      {
        type: "button",
        class: "Toastify__close-button best-ride-toast-close",
        "aria-label": translate("notifications.close", "Close notification"),
        onClick: props.closeToast,
      },
      [h("span", { "aria-hidden": "true" }, "\u00d7")],
    );

  const options = {
    autoClose: 4_500,
    position: toast.POSITION.TOP_RIGHT,
    theme: toast.THEME.COLORED,
    transition: toast.TRANSITIONS.SLIDE,
    newestOnTop: true,
    multiple: true,
    limit: 4,
    clearOnUrlChange: false,
    closeOnClick: true,
    closeButton,
    pauseOnHover: true,
    pauseOnFocusLoss: true,
    dangerouslyHTMLString: false,
    role: "status",
    containerClassName: "best-ride-toast-container",
    toastClassName: "best-ride-toast",
    bodyClassName: "best-ride-toast-body",
  } satisfies ToastContainerOptions;

  nuxtApp.vueApp.use(Vue3Toastify, options);

  // API errors are handled explicitly where the user action happens. This is
  // the final safety net for unexpected errors escaping a Vue component.
  const notifyUnexpectedError = (error: unknown) => {
    if (errorStatus(error) === 404) {
      if (!toast.isActive(NOT_FOUND_TOAST_ID)) {
        toast.warning(
          translate("notifications.pageNotFound", "Page not found"),
          {
            toastId: NOT_FOUND_TOAST_ID,
            autoClose: 7_000,
            dangerouslyHTMLString: false,
            role: "alert",
          },
        );
      }
      return;
    }

    if (!toast.isActive(GLOBAL_ERROR_TOAST_ID)) {
      toast.error(
        translate(
          "notifications.unexpectedError",
          "An unexpected error occurred. Please try again.",
        ),
        {
          toastId: GLOBAL_ERROR_TOAST_ID,
          autoClose: 8_000,
          dangerouslyHTMLString: false,
          role: "alert",
        },
      );
    }
  };

  nuxtApp.hook("vue:error", notifyUnexpectedError);
  nuxtApp.hook("app:error", notifyUnexpectedError);

  const onWindowError = (event: ErrorEvent) => {
    notifyUnexpectedError(event.error ?? event.message);
  };
  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (!isCancelledError(event.reason)) notifyUnexpectedError(event.reason);
  };

  window.addEventListener("error", onWindowError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      window.removeEventListener("error", onWindowError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    });
  }
});
