import { Testimonial } from '../types';
import { createReadError } from './readError';
import { waitForCriticalRender } from '../utils/criticalRender';

export const testimonialsService = {
  /**
   * Busca todos os depoimentos
   */
  async getAll(): Promise<Testimonial[]> {
    await waitForCriticalRender();
    const { supabase, hasSupabaseConfig } = await import('../lib/supabase');
    if (!hasSupabaseConfig()) {
      return [];
    }

    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      throw createReadError('os depoimentos');
    }

    return data || [];
  },

  /**
   * Cria um novo depoimento
   */
  async create(item: Omit<Testimonial, 'id'>): Promise<Testimonial> {
    const { supabase, hasSupabaseConfig } = await import('../lib/supabase');
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível salvar: Conexão com o Supabase não está configurada.');
    }

    const { data, error } = await supabase
      .from('testimonials')
      .insert([item])
      .select()
      .single();

    if (error) {
      throw new Error(`Não foi possível salvar depoimento no banco de dados: ${error.message}`);
    }

    return data;
  },

  /**
   * Atualiza um depoimento existente
   */
  async update(id: number, item: Partial<Testimonial>): Promise<Testimonial> {
    const { supabase, hasSupabaseConfig } = await import('../lib/supabase');
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível atualizar: Conexão com o Supabase não está configurada.');
    }

    const { data, error } = await supabase
      .from('testimonials')
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Não foi possível atualizar depoimento no banco de dados: ${error.message}`);
    }

    return data;
  },

  /**
   * Remove um depoimento
   */
  async delete(id: number): Promise<void> {
    const { supabase, hasSupabaseConfig } = await import('../lib/supabase');
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível excluir: Conexão com o Supabase não está configurada.');
    }

    const { data, error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      throw new Error(`Não foi possível excluir depoimento do banco de dados: ${error.message}`);
    }
    if (!Array.isArray(data) || data.length !== 1 || data[0]?.id !== id) {
      throw new Error('Não foi possível confirmar a exclusão. Atualize a lista e tente novamente.');
    }
  }
};
