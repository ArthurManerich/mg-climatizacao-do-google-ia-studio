import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getCurrentAdmin: vi.fn(),
  onAuthStateChange: vi.fn(),
  onAdminAuthorizationFailure: vi.fn(),
  unsubscribeAuth: vi.fn(),
  unsubscribeAuthorizationFailure: vi.fn(),
}));

let authStateCallback: (event: string, session: unknown) => void;
let authorizationFailureCallback: () => void;

vi.mock('../../services/authService', () => ({
  authService: {
    getCurrentAdmin: mocks.getCurrentAdmin,
    onAuthStateChange: mocks.onAuthStateChange,
    onAdminAuthorizationFailure: mocks.onAdminAuthorizationFailure,
  },
}));

import ProtectedRoute from './ProtectedRoute';

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/login" element={<div>Login seguro</div>} />
        <Route path="/admin" element={<ProtectedRoute><div>Conteúdo administrativo</div></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.onAuthStateChange.mockImplementation((callback) => {
    authStateCallback = callback;
    return { data: { subscription: { unsubscribe: mocks.unsubscribeAuth } } };
  });
  mocks.onAdminAuthorizationFailure.mockImplementation((callback) => {
    authorizationFailureCallback = callback;
    return mocks.unsubscribeAuthorizationFailure;
  });
});

describe('ProtectedRoute', () => {
  it('não exibe conteúdo antes da confirmação administrativa', async () => {
    let resolveCheck: (value: unknown) => void = () => undefined;
    mocks.getCurrentAdmin.mockReturnValue(new Promise(resolve => { resolveCheck = resolve; }));
    renderRoute();

    expect(screen.getByText(/Verificando permissões/i)).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo administrativo')).not.toBeInTheDocument();

    resolveCheck({ data: { user: { id: 'admin' }, isAdmin: true }, error: null });
    await waitFor(() => expect(screen.getByText('Conteúdo administrativo')).toBeInTheDocument());
  });

  it('redireciona para login quando não existe sessão', async () => {
    mocks.getCurrentAdmin.mockResolvedValue({ data: { user: null, isAdmin: false }, error: null });
    renderRoute();
    await waitFor(() => expect(screen.getByText('Login seguro')).toBeInTheDocument());
  });

  it('nega acesso a uma sessão autenticada sem vínculo administrativo', async () => {
    mocks.getCurrentAdmin.mockResolvedValue({ data: { user: { id: 'comum' }, isAdmin: false }, error: null });
    renderRoute();
    await waitFor(() => expect(screen.getByText('Login seguro')).toBeInTheDocument());
  });

  it('permite acesso somente após confirmar a sessão administrativa', async () => {
    mocks.getCurrentAdmin.mockResolvedValue({ data: { user: { id: 'admin' }, isAdmin: true }, error: null });
    renderRoute();
    await waitFor(() => expect(screen.getByText('Conteúdo administrativo')).toBeInTheDocument());
  });

  it('fecha o painel imediatamente ao receber SIGNED_OUT de outra aba', async () => {
    mocks.getCurrentAdmin.mockResolvedValue({ data: { user: { id: 'admin' }, isAdmin: true }, error: null });
    renderRoute();
    await screen.findByText('Conteúdo administrativo');

    act(() => authStateCallback('SIGNED_OUT', null));

    await waitFor(() => expect(screen.getByText('Login seguro')).toBeInTheDocument());
    expect(screen.queryByText('Conteúdo administrativo')).not.toBeInTheDocument();
  });

  it('não restaura conteúdo com uma validação antiga concluída após SIGNED_OUT', async () => {
    let resolveCheck: (value: unknown) => void = () => undefined;
    mocks.getCurrentAdmin.mockReturnValue(new Promise(resolve => { resolveCheck = resolve; }));
    renderRoute();

    act(() => authStateCallback('SIGNED_OUT', null));
    await screen.findByText('Login seguro');

    await act(async () => {
      resolveCheck({ data: { user: { id: 'admin' }, isAdmin: true }, error: null });
    });

    expect(screen.getByText('Login seguro')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo administrativo')).not.toBeInTheDocument();
  });

  it('revalida e revoga o acesso quando o vínculo em admin_users deixa de existir', async () => {
    mocks.getCurrentAdmin
      .mockResolvedValueOnce({ data: { user: { id: 'admin' }, isAdmin: true }, error: null })
      .mockResolvedValueOnce({ data: { user: { id: 'admin' }, isAdmin: false }, error: null });
    renderRoute();
    await screen.findByText('Conteúdo administrativo');

    act(() => window.dispatchEvent(new Event('focus')));

    expect(screen.queryByText('Conteúdo administrativo')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Login seguro')).toBeInTheDocument());
  });

  it.each([401, 403])('revalida e bloqueia o painel após uma resposta %s', async () => {
    mocks.getCurrentAdmin
      .mockResolvedValueOnce({ data: { user: { id: 'admin' }, isAdmin: true }, error: null })
      .mockResolvedValueOnce({ data: { user: null, isAdmin: false }, error: new Error('Acesso encerrado') });
    renderRoute();
    await screen.findByText('Conteúdo administrativo');

    act(() => authorizationFailureCallback());

    expect(screen.queryByText('Conteúdo administrativo')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Login seguro')).toBeInTheDocument());
  });

  it('cancela as duas subscriptions ao desmontar', () => {
    mocks.getCurrentAdmin.mockReturnValue(new Promise(() => undefined));
    const { unmount } = renderRoute();
    unmount();
    expect(mocks.unsubscribeAuth).toHaveBeenCalledOnce();
    expect(mocks.unsubscribeAuthorizationFailure).toHaveBeenCalledOnce();
  });

  it('redireciona com segurança quando a validação lança erro', async () => {
    mocks.getCurrentAdmin.mockRejectedValue(new Error('network failure'));
    renderRoute();
    await waitFor(() => expect(screen.getByText('Login seguro')).toBeInTheDocument());
    expect(screen.queryByText('Conteúdo administrativo')).not.toBeInTheDocument();
  });
});
