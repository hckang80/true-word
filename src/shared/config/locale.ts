export const isSupportedLocale = (locale: string): locale is 'en' | 'ko' => {
  return ['en', 'ko'].includes(locale);
};

export const locales = ['en', 'ko'] as const;

export type Locale = (typeof locales)[number];

export const DEFAULT_LOCALE: Locale = 'ko';

export const supportedTranslations = locales.map((locale) => getLocaleDisplayName(locale));

function getLocaleDisplayName(locale: Locale, targetLocale: string = 'en') {
  const displayNames = new Intl.DisplayNames([targetLocale], { type: 'language' });
  return displayNames.of(locale) || locale;
}
