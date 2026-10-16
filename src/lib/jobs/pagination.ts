export type PageItem = number | "gap";

/** Page buttons for a long list: the ends, a window around the current page, and gaps. */
export function paginationItems(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = [1, current - 2, current - 1, current, current + 1, current + 2, total].filter(
    (page) => page >= 1 && page <= total,
  );
  const unique = [...new Set(pages)].sort((left, right) => left - right);
  const items: PageItem[] = [];

  for (let index = 0; index < unique.length; index++) {
    const page = unique[index];
    if (index > 0 && page - unique[index - 1] > 1) items.push("gap");
    items.push(page);
  }

  return items;
}
