import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import RouteRobotsMeta from './RouteRobotsMeta';

const renderAt = (pathname: string) =>
  render(
    <MemoryRouter initialEntries={[pathname]}>
      <RouteRobotsMeta />
    </MemoryRouter>,
  );

describe('RouteRobotsMeta', () => {
  afterEach(() => {
    document.head.querySelector('meta[name="robots"]')?.remove();
  });

  it.each(['/login', '/admin', '/admin/configuracoes'])(
    'impede indexação da rota privada %s',
    async (pathname) => {
      renderAt(pathname);

      await waitFor(() => {
        expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
          'content',
          'noindex, nofollow',
        );
      });
    },
  );

  it('mantém a página pública indexável', async () => {
    renderAt('/');

    await waitFor(() => {
      expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
        'content',
        'index, follow',
      );
    });
  });
});
