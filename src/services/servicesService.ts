import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { Service } from '../types';
import { createReadError } from './readError';

const LOCAL_STORAGE_KEY = 'mgclimatizacao_services';

const initialItems: Service[] = [];

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

export const servicesService = {
  /**
   * Busca todos os serviços
   */
  async getAll(): Promise<Service[]> {
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
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível excluir: Conexão com o Supabase não está configurada.');
    }

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Não foi possível excluir serviço do banco de dados: ${error.message}`);
    }
  }
};
