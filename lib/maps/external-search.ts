const NAVER_MAP_SEARCH_BASE = "https://map.naver.com/p/search/";

export function createExternalMapSearchUrl(destination: string, place: string) {
  return `${NAVER_MAP_SEARCH_BASE}${encodeURIComponent(`${destination} ${place}`)}`;
}
