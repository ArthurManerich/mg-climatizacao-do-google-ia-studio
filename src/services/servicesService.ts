import { Service } from '../types';
import { createReadError } from './readError';
import { waitForCriticalRender } from '../utils/criticalRender';
import { assertSafeServiceContent } from '../utils/serviceContent';

import { isFurnitureText } from '../utils/legacyFurniture';

export const servicesService = {
  /**
   * Busca todos os serviços
   */
  async getAll(): Promise<Service[]> {
    await waitForCriticalRender();
    const { supabase, hasSupabaseConfig } = await import('../lib/supabase');
    if (!hasSupabaseConfig()) {
      return [];
    }

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      throw createReadError('os serviços');
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Filter out obsolete furniture assembly services if present in database
    const validData = data.filter(item => {
      const textToTest = `${item.title || ''} ${item.description || ''}`;
      return !isFurnitureText(textToTest);
    });

    return validData.map(item => ({
      ...item,
      bullet_points: item.bullet_points || []
    }));
  },

  /**
   * Cria um novo serviço
   */
  async create(item: Service): Promise<Service> {
    assertSafeServiceContent(item);
    const { supabase, hasSupabaseConfig } = await import('../lib/supabase');
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível salvar: Conexão com o Supabase não está configurada.');
    }

    const { data, error } = await supabase
      .from('services')
      .insert([item])
      .select()
      .single();

    if (error) {
      throw new Error(`Não foi possível salvar serviço no banco de dados: ${error.message}`);
    }

    return data;
  },

  /**
   * Atualiza um serviço existente
   */
  async update(id: string, item: Partial<Service>): Promise<Service> {
    assertSafeServiceContent(item);
    const { supabase, hasSupabaseConfig } = await import('../lib/supabase');
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível atualizar: Conexão com o Supabase não está configurada.');
    }

    const { data, error } = await supabase
      .from('services')
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Não foi possível atualizar serviço no banco de dados: ${error.message}`);
    }

    return data;
  },

  /**
   * Remove um serviço
   */
  async delete(id: string): Promise<void> {
    const { supabase, hasSupabaseConfig } = await import('../lib/supabase');
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível excluir: Conexão com o Supabase não está configurada.');
    }

    const { data, error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      throw new Error(`Não foi possível excluir serviço do banco de dados: ${error.message}`);
    }
    if (!Array.isArray(data) || data.length !== 1 || data[0]?.id !== id) {
      throw new Error('Não foi possível confirmar a exclusão do serviço. Atualize a lista e tente novamente.');
    }
  }
};
