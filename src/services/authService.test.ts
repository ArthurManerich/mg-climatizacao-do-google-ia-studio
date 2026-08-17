import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  configured: true,
  signInWithPassword: vi.fn(),
  getUser: vi.fn(),
  signOut: vi.fn(),
  maybeSingle: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  hasSupabaseConfig: () => mocks.configured,
  supabase: {
    auth: {
      signInWithPassword: mocks.signInWithPassword,
      getUser: mocks.getUser,
      signOut: mocks.signOut,
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: mocks.maybeSingle })),
      })),
    })),
  },
}));

import { authService } from './authService';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.configured = true;
});

describe('authService', () => {
  it('propaga credenciais inválidas sem conceder sessão', async () => {
    const invalidError = new Error('Invalid login credentials');
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: invalidError,
    });

    await expect(authService.signIn('user@example.com', 'wrong')).resolves.toEqual({
      data: { user: null, session: null },
      error: invalidError,
    });
  });

  it('não considera administrador um usuário autenticado sem vínculo', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });

    await expect(authService.getCurrentAdmin()).resolves.toEqual({
      data: { user: { id: 'user-1' }, isAdmin: false },
      error: null,
    });
  });

  it('mantém acesso negado e devolve mensagem segura quando a consulta administrativa falha', async () => {
    const networkError = new Error('network failure');
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    mocks.maybeSingle.mockResolvedValue({ data: null, error: networkError });

    const result = await authService.getCurrentAdmin();

    expect(result.data).toEqual({ user: { id: 'user-1' }, isAdmin: false });
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toContain('Não foi possível confirmar a permissão administrativa');
    expect(result.error?.message).not.toContain('network failure');
  });

  it('não concede administração se uma resposta inconsistente trouxer dados junto com erro', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    mocks.maybeSingle.mockResolvedValue({
      data: { user_id: 'user-1' },
      error: new Error('network failure'),
    });

    const result = await authService.getCurrentAdmin();

    expect(result.data.isAdmin).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });
});
