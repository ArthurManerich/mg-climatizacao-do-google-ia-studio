const ADMIN_AUTHORIZATION_INVALIDATED_EVENT = 'mg:admin-authorization-invalidated';

export function notifyAdminAuthorizationFailure(status: number): void {
  if ((status === 401 || status === 403) && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ADMIN_AUTHORIZATION_INVALIDATED_EVENT, { detail: { status } }));
  }
}

export function subscribeAdminAuthorizationFailure(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  window.addEventListener(ADMIN_AUTHORIZATION_INVALIDATED_EVENT, callback);
  return () => window.removeEventListener(ADMIN_AUTHORIZATION_INVALIDATED_EVENT, callback);
}
