export const nextSlugToWpSlug = (nextSlug?: string[] | string) => {
  if (!nextSlug) return "/";
  if (Array.isArray(nextSlug)) return nextSlug.join("/");
  return nextSlug;
};
