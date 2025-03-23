export * from './query-keys';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DEFAULT_LOCALE } from '..';

export function toReadableDate(
  date: Date,
  locales: Intl.LocalesArgument = DEFAULT_LOCALE,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
) {
  return new Intl.DateTimeFormat(locales, options).format(date);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fetcher<T>(url: string | URL | Request, init?: RequestInit): Promise<T> {
  const getUrl =
    typeof url === 'string' && !url.startsWith('http') && !url.startsWith('/api')
      ? `${process.env.API_BASE_URL}${url}`
      : url;

  return fetch(getUrl, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...init
  }).then((res) => res.json());
}
