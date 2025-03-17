import { fetcher, getOrigin } from '@/shared';
import type { NewsItem } from '@/entities/news';
import { useQuery } from '@tanstack/react-query';

export async function fetchNews(): Promise<NewsItem[]> {
  return await fetcher<NewsItem[]>(`${await getOrigin()}/api/news`);
}

export function useNews() {
  return useQuery<NewsItem[]>({
    queryKey: ['news'],
    queryFn: fetchNews,
    staleTime: 1000 * 60 * 15
  });
}
