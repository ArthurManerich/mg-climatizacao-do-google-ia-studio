import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { BeforeAfter } from '../types';
import { IMAGES } from '../config';
import { uploadService } from './uploadService';
import { DeleteResult } from './deleteResult';
import { MutationResult } from './mutationResult';
import { createReadError } from './readError';

const LOCAL_STORAGE_KEY = 'mgclimatizacao_before_after';

const initialItems: BeforeAfter[] = [];

async function cleanupReplacedImages(
  previousImages: Pick<BeforeAfter, 'before_img' | 'after_img'> | undefined,
  updated: BeforeAfter
): Promise<string[]> {
  if (!previousImages) return [];

  const cleanupErrors: string[] = [];
  const replacements = [
    { label: 'Antes', previous: previousImages.before_img, current: updated.before_img },
    { label: 'Depois', previous: previousImages.after_img, current: updated.after_img },
  ];

  for (const image of replacements) {
    if (!image.previous || image.previous === image.current) continue;
    try {
      await uploadService.deleteImage(image.previous);
    } catch (error) {
      cleanupErrors.push(`${image.label}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return cleanupErrors;
}

export const beforeAfterService = {
  /**
   * Busca todos os registros de antes e depois
   */
  async getAll(): Promise<BeforeAfter[]> {
    if (!hasSupabaseConfig()) {
      return [];
    }

    const { data, error } = await supabase
      .from('before_after')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw createReadError('os comparativos de Antes & Depois');
    }

    return data || [];
  },

  /**
   * Cria um novo registro de antes e depois
   */
  async create(item: Omit<BeforeAfter, 'id'>): Promise<BeforeAfter> {
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível salvar: Conexão com o Supabase não está configurada.');
    }

    const { data, error } = await supabase
      .from('before_after')
      .insert([item])
      .select()
      .single();

    if (error) {
      if (error.code === '42703' || error.message?.includes('category')) {
        const { category, ...cleanItem } = item as any;
        const retry = await supabase
          .from('before_after')
          .insert([cleanItem])
          .select()
          .single();
        if (retry.error) {
          throw new Error(`Não foi possível salvar no banco de dados: ${retry.error.message}`);
        }
        return { ...retry.data, category };
      }
      throw new Error(`Não foi possível salvar no banco de dados: ${error.message}`);
    }

    return data;
  },

  /**
   * Atualiza um registro existente
   */
  async update(
    id: number,
    item: Partial<BeforeAfter>,
    previousImages?: Pick<BeforeAfter, 'before_img' | 'after_img'>
  ): Promise<MutationResult<BeforeAfter>> {
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível atualizar: Conexão com o Supabase não está configurada.');
    }

    const { data, error } = await supabase
      .from('before_after')
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '42703' || error.message?.includes('category')) {
        const { category, ...cleanItem } = item as any;
        const retry = await supabase
          .from('before_after')
          .update(cleanItem)
          .eq('id', id)
          .select()
          .single();
        if (retry.error) {
          throw new Error(`Não foi possível atualizar no banco de dados: ${retry.error.message}`);
        }
        const updated = { ...retry.data, category };
        const cleanupErrors = await cleanupReplacedImages(previousImages, updated);
        return { data: updated, databaseSucceeded: true, storageCleanupSucceeded: cleanupErrors.length === 0, cleanupErrors };
      }
      throw new Error(`Não foi possível atualizar no banco de dados: ${error.message}`);
    }

    const cleanupErrors = await cleanupReplacedImages(previousImages, data);
    return { data, databaseSucceeded: true, storageCleanupSucceeded: cleanupErrors.length === 0, cleanupErrors };
  },

  /**
   * Remove um registro e, depois, limpa suas fotos do storage
   */
  async delete(id: number): Promise<DeleteResult> {
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível excluir: Conexão com o Supabase não está configurada.');
    }

    const { data: targetItem, error: fetchError } = await supabase
      .from('before_after')
      .select('id, before_img, after_img')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Não foi possível buscar o registro antes da exclusão: ${fetchError.message}`);
    }

    if (!targetItem) {
      throw new Error('Não foi possível excluir: registro de Antes & Depois não encontrado.');
    }

    const { data: deletedItems, error: deleteError } = await supabase
      .from('before_after')
      .delete()
      .eq('id', id)
      .select('id');

    if (deleteError) {
      throw new Error(`Não foi possível excluir do banco de dados: ${deleteError.message}`);
    }

    if (!deletedItems?.some(item => item.id === id)) {
      throw new Error('Não foi possível confirmar a exclusão do registro no banco de dados.');
    }

    const cleanupErrors: string[] = [];
    const images = [
      { label: 'Antes', url: targetItem.before_img },
      { label: 'Depois', url: targetItem.after_img },
    ];

    for (const image of images) {
      if (!image.url) continue;

      try {
        await uploadService.deleteImage(image.url);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        cleanupErrors.push(`${image.label}: ${message}`);
      }
    }

    return {
      databaseDeleted: true,
      storageCleanupSucceeded: cleanupErrors.length === 0,
      cleanupErrors,
    };
  }
};
