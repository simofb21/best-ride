export const useLanguage = () => {
  const { locale, setLocale } = useI18n();

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
    await setLocale(code);
  };

  return {
    locale,
    languages,
    currentLanguage,
    changeLanguage,
  };
};
