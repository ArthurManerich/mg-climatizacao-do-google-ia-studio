import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  notifyAdminAuthorizationFailure,
  subscribeAdminAuthorizationFailure,
} from './adminAuthEvents';

describe('adminAuthEvents', () => {
  const callback = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  it.each([401, 403])('notifica uma falha administrativa para status %s', (status) => {
    const unsubscribe = subscribeAdminAuthorizationFailure(callback);
    notifyAdminAuthorizationFailure(status);
    expect(callback).toHaveBeenCalledOnce();
    unsubscribe();
  });

  it('ignora outros status e remove o listener no unsubscribe', () => {
    const unsubscribe = subscribeAdminAuthorizationFailure(callback);
    notifyAdminAuthorizationFailure(500);
    unsubscribe();
    notifyAdminAuthorizationFailure(401);
    expect(callback).not.toHaveBeenCalled();
  });
});
