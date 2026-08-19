export const useLanguage = () => {
  const { locale, setLocale, t } = useI18n();
  const appToast = useAppToast();

  const languages = [
    {
      code: "en",
      name: "English",
      flag: "🇬🇧",
    },
    {
      code: "it",
      name: "Italiano",
      flag: "🇮🇹",
    },
  ] as const;

  const currentLanguage = computed(() => {
    return (
      languages.find((language) => language.code === locale.value) ??
      languages[0]
    );
  });

  const changeLanguage = async (code: "en" | "it") => {
    try {
      await setLocale(code);
    } catch (error) {
      appToast.error(error, t("notifications.languageChangeFailed"), {
        toastId: "language-change-failed",
      });
    }
  };

  return {
    locale,
    languages,
    currentLanguage,
    changeLanguage,
  };
};
