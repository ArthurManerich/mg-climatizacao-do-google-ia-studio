import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DeferredSection from './DeferredSection';

describe('DeferredSection', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('preserva a ancora sem renderizar o conteudo distante', () => {
    class MockIntersectionObserver {
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = '900px 0px';
      thresholds = [0];
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    const { container } = render(
      <DeferredSection anchorId="portfolio" placeholderClassName="min-h-[48rem]">
        <section>Portfólio carregado</section>
      </DeferredSection>,
    );

    expect(container.querySelector('#portfolio')).toBeInTheDocument();
    expect(screen.queryByText('Portfólio carregado')).not.toBeInTheDocument();
  });

  it('renderiza a secao quando ela se aproxima do viewport', () => {
    let notifyIntersection: IntersectionObserverCallback | undefined;

    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        notifyIntersection = callback;
      }
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = '900px 0px';
      thresholds = [0];
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    render(
      <DeferredSection anchorId="faq" placeholderClassName="min-h-[40rem]">
        <section id="faq">Dúvidas carregadas</section>
      </DeferredSection>,
    );

    act(() => {
      notifyIntersection?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(screen.getByText('Dúvidas carregadas')).toBeInTheDocument();
    expect(document.querySelectorAll('#faq')).toHaveLength(1);
  });

  it('carrega imediatamente quando IntersectionObserver nao existe', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(
      <DeferredSection anchorId="antes-depois" placeholderClassName="min-h-[44rem]">
        <section>Antes e depois carregado</section>
      </DeferredSection>,
    );

    expect(screen.getByText('Antes e depois carregado')).toBeInTheDocument();
  });
});
