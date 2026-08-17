import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getCurrentAdmin: vi.fn() }));

vi.mock('../../services/authService', () => ({
  authService: { getCurrentAdmin: mocks.getCurrentAdmin },
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

beforeEach(() => vi.clearAllMocks());

describe('ProtectedRoute', () => {
  it('não exibe conteúdo antes da confirmação administrativa', async () => {
    let resolveCheck: (value: unknown) => void = () => {};
    mocks.getCurrentAdmin.mockReturnValue(new Promise(resolve => { resolveCheck = resolve; }));
    renderRoute();

    expect(screen.getByText(/Verificando permissões/i)).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo administrativo')).not.toBeInTheDocument();

    resolveCheck({ data: { isAdmin: true } });
    await waitFor(() => expect(screen.getByText('Conteúdo administrativo')).toBeInTheDocument());
  });

  it('redireciona com segurança quando a consulta falha', async () => {
    mocks.getCurrentAdmin.mockRejectedValue(new Error('network failure'));
    renderRoute();
    await waitFor(() => expect(screen.getByText('Login seguro')).toBeInTheDocument());
    expect(screen.queryByText('Conteúdo administrativo')).not.toBeInTheDocument();
  });
});
