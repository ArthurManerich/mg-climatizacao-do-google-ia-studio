import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { Faq } from '../types';
import { createReadError } from './readError';

const LOCAL_STORAGE_KEY = 'mgclimatizacao_faq';

const initialItems: Faq[] = [];

function isFurnitureText(text: string): boolean {
  if (!text) return false;
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  
  const furnitureKeywords = [
    'movel', 'moveis', 'montagem', 'montar', 'desmontagem', 'desmontar',
    'guarda-roupa', 'guardaroupa', 'cozinha', 'painel', 'paineis', 'tv',
    'rack', 'estante', 'armario', 'armarios', 'cama', 'mesa', 'sofa',
    'cabeceira', 'escritorio', 'prateleira'
  ];

  return furnitureKeywords.some(keyword => normalized.includes(keyword));
}

export const faqService = {
  /**
   * Busca todas as perguntas do FAQ
   */
  async getAll(): Promise<Faq[]> {
    if (!hasSupabaseConfig()) {
      return [];
    }

    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      throw createReadError('as perguntas frequentes');
    }

    if (!data) {
      return [];
    }

    const validData = data.filter(item => {
      const textToTest = `${item.q || ''} ${item.a || ''}`;
      return !isFurnitureText(textToTest);
    });

    return validData;
  },

  /**
   * Cria uma nova pergunta no FAQ
   */
  async create(item: Omit<Faq, 'id'>): Promise<Faq> {
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível salvar: Conexão com o Supabase não está configurada.');
    }

    const { data, error } = await supabase
      .from('faq')
      .insert([item])
      .select()
      .single();

    if (error) {
      throw new Error(`Não foi possível salvar pergunta no banco de dados: ${error.message}`);
    }

    return data;
  },

  /**
   * Atualiza uma pergunta existente
   */
  async update(id: number, item: Partial<Faq>): Promise<Faq> {
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível atualizar: Conexão com o Supabase não está configurada.');
    }

    const { data, error } = await supabase
      .from('faq')
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Não foi possível atualizar pergunta no banco de dados: ${error.message}`);
    }

    return data;
  },

  /**
   * Remove uma pergunta do FAQ
   */
  async delete(id: number): Promise<void> {
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível excluir: Conexão com o Supabase não está configurada.');
    }

    const { error } = await supabase
      .from('faq')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Não foi possível excluir pergunta do banco de dados: ${error.message}`);
    }
  }
};
