'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { locales } from '@/@types';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { getLanguageFullName } from '@/lib/utils';

export default function Locales() {
  const { locale } = useParams<{ locale: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const params = new URLSearchParams(location.search);

  const [value, setValue] = useState(params.get('translatedVersion') || locale);

  const handleChange = (locale: string) => {
    params.set('translatedVersion', locale);
    window.history.pushState(null, '', `${pathname}?${params.toString()}`);
    setValue(locale);
  };

  const translations = [...locales, 'ja'];

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        {translations.map((translation) => (
          <SelectItem value={translation} key={translation}>
            {getLanguageFullName(translation, locale)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
