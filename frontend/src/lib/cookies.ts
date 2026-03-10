export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

export function setCookie(name: string, value: string, maxAge?: number) {
  if (typeof document === 'undefined') return;
  let cookie = `${name}=${value}; path=/`;
  if (maxAge) {
    cookie += `; max-age=${maxAge}`;
  }
  document.cookie = cookie;
}

export function removeCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0`;
}
