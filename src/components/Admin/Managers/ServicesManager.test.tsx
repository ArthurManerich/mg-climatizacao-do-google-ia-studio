import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ServiceItem } from '../../../types';

const serviceMocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../../../services/servicesService', () => ({ servicesService: serviceMocks }));

import { ServicesManager } from './ServicesManager';

const existing: ServiceItem[] = [
  { id: 'instalacao', title: 'Instalação', description: 'Descrição atual', icon: 'Wind', bullet_points: ['Residencial'], order_index: 2 },
  { id: 'manutencao', title: 'Manutenção', description: 'Diagnóstico', icon: 'Wrench', bullet_points: [], order_index: 1 },
];

function renderManager(initial = existing) {
  function Wrapper() {
    const [services, setServices] = useState(initial);
    return <ServicesManager services={services} onServicesChange={setServices} />;
  }
  return render(<Wrapper />);
}

function openAndFillCreateForm() {
  fireEvent.click(screen.getByRole('button', { name: /Novo Serviço/i }));
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: '  Carga de gás  ' } });
  fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: ' Avaliação do equipamento. ' } });
  fireEvent.change(screen.getByLabelText('Ícone'), { target: { value: 'Gauge' } });
  fireEvent.change(screen.getByLabelText('Ordem'), { target: { value: '3' } });
  fireEvent.change(screen.getByLabelText('Tópicos'), { target: { value: ' Avaliação  técnica \n\nAvaliação técnica\nCarga quando necessária' } });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('gerenciamento administrativo de serviços', () => {
  it('cadastra com validação e tópicos sanitizados, atualizando a lista local', async () => {
    serviceMocks.create.mockImplementation(async (item: ServiceItem) => ({ ...item, id: 'novo' }));
    renderManager();
    openAndFillCreateForm();

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar serviço' }));

    await screen.findByText('Serviço cadastrado com sucesso.');
    expect(serviceMocks.create).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Carga de gás',
      description: 'Avaliação do equipamento.',
      icon: 'Gauge',
      order_index: 3,
      bullet_points: ['Avaliação técnica', 'Carga quando necessária'],
    }));
    expect(screen.getByText('Carga de gás')).toBeInTheDocument();
  });

  it('edita e reordena um serviço existente', async () => {
    serviceMocks.update.mockResolvedValue({ ...existing[0], title: 'Instalação atualizada', order_index: 0 });
    renderManager();
    fireEvent.click(screen.getByRole('button', { name: 'Editar Instalação' }));
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Instalação atualizada' } });
    fireEvent.change(screen.getByLabelText('Ordem'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await screen.findByText('Serviço atualizado com sucesso.');
    expect(serviceMocks.update).toHaveBeenCalledWith('instalacao', expect.objectContaining({ title: 'Instalação atualizada', order_index: 0 }));
    expect(within(screen.getAllByRole('article')[0]).getByText('Instalação atualizada')).toBeInTheDocument();
  });

  it('só exclui depois da confirmação', async () => {
    serviceMocks.delete.mockResolvedValue(undefined);
    renderManager();
    fireEvent.click(screen.getByRole('button', { name: 'Excluir Instalação' }));
    expect(serviceMocks.delete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Sim, excluir' }));

    await screen.findByText('Serviço excluído com sucesso.');
    expect(serviceMocks.delete).toHaveBeenCalledTimes(1);
    expect(serviceMocks.delete).toHaveBeenCalledWith('instalacao');
    expect(screen.queryByText('Instalação')).not.toBeInTheDocument();
  });

  it('cancela a confirmação sem excluir', () => {
    renderManager();
    fireEvent.click(screen.getByRole('button', { name: 'Excluir Instalação' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(serviceMocks.delete).not.toHaveBeenCalled();
    expect(screen.getByText('Instalação')).toBeInTheDocument();
  });

  it('mantém a lista e apresenta erro quando a operação falha', async () => {
    serviceMocks.delete.mockRejectedValue(new Error('Não foi possível excluir o serviço.'));
    renderManager();
    fireEvent.click(screen.getByRole('button', { name: 'Excluir Instalação' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sim, excluir' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível excluir o serviço.');
    expect(screen.getByText('Instalação')).toBeInTheDocument();
  });

  it('não contorna o bloqueio de um usuário não autorizado', async () => {
    serviceMocks.create.mockRejectedValue(new Error('Operação bloqueada pelas regras de acesso do Supabase.'));
    renderManager([]);
    openAndFillCreateForm();
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar serviço' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Operação bloqueada pelas regras de acesso do Supabase.');
    expect(screen.getByText('Nenhum serviço cadastrado')).toBeInTheDocument();
  });

  it('bloqueia título e descrição vazios e expõe limites nos campos', () => {
    renderManager([]);
    fireEvent.click(screen.getByRole('button', { name: /Novo Serviço/i }));
    const submit = screen.getByRole('button', { name: 'Cadastrar serviço' });
    fireEvent.submit(submit.closest('form')!);

    expect(screen.getByRole('alert')).toHaveTextContent('Preencha o título e a descrição do serviço.');
    expect(screen.getByLabelText('Título')).toHaveAttribute('maxlength', '100');
    expect(screen.getByLabelText('Descrição')).toHaveAttribute('maxlength', '500');
    expect(serviceMocks.create).not.toHaveBeenCalled();
  });

  it('impede submissões repetidas enquanto o salvamento está em andamento', async () => {
    let resolveCreate!: (service: ServiceItem) => void;
    serviceMocks.create.mockReturnValue(new Promise(resolve => { resolveCreate = resolve; }));
    renderManager([]);
    openAndFillCreateForm();
    const submit = screen.getByRole('button', { name: 'Cadastrar serviço' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(serviceMocks.create).toHaveBeenCalledTimes(1);

    resolveCreate({ id: 'novo', title: 'Carga de gás', description: 'Avaliação do equipamento.', icon: 'Gauge', bullet_points: [], order_index: 3 });
    await waitFor(() => expect(screen.getByText('Serviço cadastrado com sucesso.')).toBeInTheDocument());
  });
});
