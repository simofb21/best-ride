import { toast, type Id, type ToastOptions } from "vue3-toastify";

type AppToastOptions = Omit<
  ToastOptions,
  | "type"
  | "dangerouslyHTMLString"
  | "role"
  | "containerClassName"
  | "toastClassName"
  | "bodyClassName"
>;
type UnknownRecord = Record<string, unknown>;

function isObject(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizedMessage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const message = value.replace(/\s+/g, " ").trim();
  if (!message) return null;
  return Array.from(message).slice(0, 360).join("");
}

/**
 * Error objects can contain URLs, stack traces or ORM details. Only explicit
 * strings supplied by a caller are considered user-facing; objects always use
 * the localized contextual fallback.
 */
export function getAppErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (typeof error === "string") {
    return normalizedMessage(error) ?? fallback;
  }

  return fallback;
}

export function isCancelledAction(error: unknown): boolean {
  return (
    isObject(error) &&
    (error.name === "AbortError" || error.code === "ABORT_ERR")
  );
}

export function useAppToast() {
  const { t } = useI18n();

  function success(message: string, options: AppToastOptions = {}): Id | null {
    if (!import.meta.client) return null;
    return toast.success(message, {
      autoClose: 3_500,
      ...options,
      dangerouslyHTMLString: false,
      role: "status",
    });
  }

  function info(message: string, options: AppToastOptions = {}): Id | null {
    if (!import.meta.client) return null;
    return toast.info(message, {
      autoClose: 5_000,
      ...options,
      dangerouslyHTMLString: false,
      role: "status",
    });
  }

  function warning(message: string, options: AppToastOptions = {}): Id | null {
    if (!import.meta.client) return null;
    return toast.warning(message, {
      autoClose: 7_000,
      ...options,
      dangerouslyHTMLString: false,
      role: "alert",
    });
  }

  function error(
    cause: unknown,
    fallback = t("notifications.genericError"),
    options: AppToastOptions = {},
  ): Id | null {
    if (!import.meta.client) return null;
    return toast.error(getAppErrorMessage(cause, fallback), {
      autoClose: 8_000,
      ...options,
      dangerouslyHTMLString: false,
      role: "alert",
    });
  }

  function dismiss(id?: Id): void {
    if (import.meta.client) toast.remove(id);
  }

  return { success, info, warning, error, dismiss };
}
