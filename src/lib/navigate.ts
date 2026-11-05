/**
 * Client-side navigation callable from inside the WebGL canvas, where Next's router hooks aren't available.
 * <RouterBridge /> registers the real router on mount.
 */
let push: ((href: string) => void) | null = null;

export function setNavigator(fn: ((href: string) => void) | null) {
  push = fn;
}

export function navigate(href: string) {
  if (push) push(href);
  else window.location.assign(href);
}
