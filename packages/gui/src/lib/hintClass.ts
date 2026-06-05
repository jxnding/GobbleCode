/** Stable class name for element hints / debugging (shown on hover when hints are on). */
export function hintClass(scope: string, name: string): string {
  const scopeSlug = scope
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase();
  const nameSlug = name.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  return `hint-${scopeSlug}-${nameSlug}`;
}
