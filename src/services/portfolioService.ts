import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { Portfolio } from '../types';
import { IMAGES } from '../config';
import { uploadService } from './uploadService';
import { DeleteResult } from './deleteResult';
import { BatchCreateResult, MutationResult } from './mutationResult';
import { createReadError } from './readError';

const LOCAL_STORAGE_KEY = 'mgclimatizacao_portfolio';

const initialItems: Portfolio[] = [];

function sanitizePortfolio(items: Portfolio[]): Portfolio[] {
  if (!Array.isArray(items)) return [];
  return items.filter(item => 
    item && 
    typeof item.title === 'string' && 
    item.title.trim() !== ''
  );
}

export const portfolioService = {
  /**
   * Busca todos os itens do portfólio
   */
  async getAll(): Promise<Portfolio[]> {
    if (!hasSupabaseConfig()) {
      return [];
    }

    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw createReadError('o portfólio');
    }

    return sanitizePortfolio(data || []);
  },

  /**
   * Adiciona um novo item ao portfólio
   */
  async create(item: Omit<Portfolio, 'id'>): Promise<Portfolio> {
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível salvar: Conexão com o Supabase não está configurada.');
    }

    if (item.img && item.img.startsWith('data:image/')) {
      throw new Error('A imagem precisa ser enviada para o Supabase Storage primeiro. URLs base64 não são salvas como URL definitiva no banco de dados.');
    }

    console.log("INSERT PORTFOLIO", item);

    const { data, error } = await supabase
      .from('portfolio')
      .insert([item])
      .select()
      .single();

    console.log("INSERT RESULT", { data, error });

    if (error) {
      console.error(error);
      if (error.code === '42703' || error.message?.includes('description')) {
        const { description, ...cleanItem } = item as any;
        const retry = await supabase
          .from('portfolio')
          .insert([cleanItem])
          .select()
          .single();
        console.log("INSERT RETRY RESULT", retry);
        if (retry.error) {
          console.error(retry.error);
          throw new Error(`Não foi possível salvar no banco de dados: ${retry.error.message}`);
        }
        return retry.data;
      }
      throw new Error(`Não foi possível salvar no banco de dados: ${error.message}`);
    }

    return data;
  },

  /**
   * Adiciona múltiplos itens ao portfólio em lote
   */
  async createBatch(items: Omit<Portfolio, 'id'>[]): Promise<BatchCreateResult<Portfolio>> {
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível salvar: Conexão com o Supabase não está configurada.');
    }

    const { data, error } = await supabase
      .from('portfolio')
      .insert(items)
      .select();

    if (error) {
      throw new Error(`Não foi possível salvar o lote no banco de dados: ${error.message}`);
    }

    const requestedUrls = items.map(item => item.img);
    const returnedItems = data || [];
    const remainingRequestedUrls = [...requestedUrls];
    const confirmedUrls: string[] = [];

    for (const returnedItem of returnedItems) {
      const matchIndex = remainingRequestedUrls.indexOf(returnedItem.img);
      if (matchIndex >= 0) {
        confirmedUrls.push(returnedItem.img);
        remainingRequestedUrls.splice(matchIndex, 1);
      }
    }

    const isConfirmed =
      returnedItems.length === items.length &&
      confirmedUrls.length === requestedUrls.length &&
      remainingRequestedUrls.length === 0;

    if (!isConfirmed) {
      return {
        status: 'uncertain',
        data: returnedItems,
        confirmedUrls,
        unconfirmedUrls: remainingRequestedUrls,
        message: 'A gravação do lote não pôde ser confirmada integralmente.',
      };
    }

    return { status: 'confirmed', data: returnedItems, confirmedUrls };
  },

  /**
   * Atualiza um item existente
   */
  async update(id: number, item: Partial<Portfolio>, previousImageUrl?: string): Promise<MutationResult<Portfolio>> {
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível atualizar: Conexão com o Supabase não está configurada.');
    }

    const { data, error } = await supabase
      .from('portfolio')
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '42703' || error.message?.includes('description')) {
        const { description, ...cleanItem } = item as any;
        const retry = await supabase
          .from('portfolio')
          .update(cleanItem)
          .eq('id', id)
          .select()
          .single();
        if (retry.error) {
          throw new Error(`Não foi possível atualizar no banco de dados: ${retry.error.message}`);
        }
        const cleanupErrors: string[] = [];
        if (previousImageUrl && retry.data.img && retry.data.img !== previousImageUrl) {
          try {
            await uploadService.deleteImage(previousImageUrl);
          } catch (cleanupError) {
            cleanupErrors.push(cleanupError instanceof Error ? cleanupError.message : String(cleanupError));
          }
        }
        return { data: retry.data, databaseSucceeded: true, storageCleanupSucceeded: cleanupErrors.length === 0, cleanupErrors };
      }
      throw new Error(`Não foi possível atualizar no banco de dados: ${error.message}`);
    }

    const cleanupErrors: string[] = [];
    if (previousImageUrl && data.img && data.img !== previousImageUrl) {
      try {
        await uploadService.deleteImage(previousImageUrl);
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError instanceof Error ? cleanupError.message : String(cleanupError));
      }
    }

    return { data, databaseSucceeded: true, storageCleanupSucceeded: cleanupErrors.length === 0, cleanupErrors };
  },

  /**
   * Remove um item do portfólio e, depois, limpa sua imagem do storage
   */
  async delete(id: number): Promise<DeleteResult> {
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível excluir: Conexão com o Supabase não está configurada.');
    }

    const { data: targetItem, error: fetchError } = await supabase
      .from('portfolio')
      .select('id, img')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Não foi possível buscar o registro antes da exclusão: ${fetchError.message}`);
    }

    if (!targetItem) {
      throw new Error('Não foi possível excluir: registro do portfólio não encontrado.');
    }

    const { data: deletedItems, error: deleteError } = await supabase
      .from('portfolio')
      .delete()
      .eq('id', id)
      .select('id');

    if (deleteError) {
      throw new Error(`Não foi possível excluir do banco de dados: ${deleteError.message}`);
    }

    if (!deletedItems?.some(item => item.id === id)) {
      throw new Error('Não foi possível confirmar a exclusão do registro no banco de dados.');
    }

    if (targetItem.img) {
      try {
        await uploadService.deleteImage(targetItem.img);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          databaseDeleted: true,
          storageCleanupSucceeded: false,
          cleanupErrors: [`Imagem do portfólio: ${message}`],
        };
      }
    }

    return {
      databaseDeleted: true,
      storageCleanupSucceeded: true,
      cleanupErrors: [],
    };
  }
};
