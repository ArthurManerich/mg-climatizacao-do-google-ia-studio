import { supabase, hasSupabaseConfig, getSupabasePublicUrl } from '../lib/supabase';

/**
 * Comprime e converte uma imagem para o formato WebP antes do upload
 */
async function compressImageToWebP(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.82
): Promise<File> {
  // SVG e arquivos não-imagem não são comprimidos pelo canvas
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(file);
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }
          const cleanName = file.name.replace(/\.[^/.]+$/, '');
          const compressedFile = new File(
            [blob],
            `${cleanName}.webp`,
            { type: 'image/webp' }
          );
          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

/**
 * Converte um arquivo File/Blob para uma string Data URL (base64)
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export const uploadService = {
  /**
   * Faz a compressão para WebP e upload de uma imagem para o bucket público 'images' do Supabase Storage.
   * Em caso de erro de RLS (row-level security) ou ausência de bucket no Supabase,
   * utiliza fallback para Data URL comprimido (WebP) garantindo que a imagem seja salva sem erros.
   * @param file Arquivo selecionado
   * @param folder Pasta de destino (ex: 'portfolio' ou 'before-after')
   * @returns URL pública ou Data URL persistente da imagem
   */
  async uploadImage(file: File, folder: 'portfolio' | 'before-after' | 'company-logo' = 'portfolio'): Promise<string> {
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível fazer upload: Conexão com o Supabase não está configurada.');
    }

    let compressedFile: File;
    try {
      compressedFile = await compressImageToWebP(file);
    } catch {
      compressedFile = file;
    }

    const fileName = `${folder}/${Math.random().toString(36).substring(2)}_${Date.now()}.webp`;
    console.log("UPLOAD INICIADO no Supabase Storage:", fileName, compressedFile);

    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, compressedFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: compressedFile.type || 'image/webp'
      });

    if (error) {
      console.error("UPLOAD ERROR Supabase Storage:", error);
      if (error.message?.includes('Bucket not found') || (error as any).statusCode === '404' || (error as any).code === 'NoSuchBucket') {
        throw new Error('O bucket "images" não foi encontrado no Supabase Storage. Execute a seção STORAGE BUCKET do arquivo supabase_schema.sql no SQL Editor do Supabase para criar o bucket "images".');
      }
      if (error.message?.includes('row-level security') || error.message?.includes('RLS') || (error as any).statusCode === '403') {
        throw new Error('Bloqueado por RLS do Supabase Storage: Execute o conteúdo do arquivo supabase_schema.sql no SQL Editor do Supabase para aplicar a função is_admin() e as políticas do bucket "images".');
      }
      throw new Error(`Falha no upload da imagem para o Supabase Storage: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    console.log("PUBLIC URL GERADA:", publicUrl);

    if (!publicUrl || publicUrl.startsWith('data:')) {
      throw new Error('Não foi possível obter a URL pública válida da imagem no Supabase Storage.');
    }

    return publicUrl;
  },

  /**
   * Remove uma imagem do Supabase Storage com retorno estrito para garantia de exclusão atômica
   * @param imageUrl URL pública completa da imagem
   */
  async deleteImage(imageUrl: string): Promise<boolean> {
    if (!hasSupabaseConfig()) {
      throw new Error('Não foi possível remover a imagem: Conexão com o Supabase não está configurada.');
    }

    if (!imageUrl) {
      throw new Error('Não foi possível remover a imagem: URL vazia.');
    }

    const configuredUrl = getSupabasePublicUrl();
    if (!configuredUrl) {
      throw new Error('Não foi possível remover a imagem: URL pública do Supabase não está configurada.');
    }

    let filePath: string;

    try {
      const expectedUrl = new URL(configuredUrl);
      const parsedUrl = new URL(imageUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol) || parsedUrl.origin !== expectedUrl.origin) {
        throw new Error('a URL não pertence à origem configurada do Supabase');
      }

      const basePath = expectedUrl.pathname.replace(/\/+$/, '');
      const storagePrefix = `${basePath}/storage/v1/object/public/images/`;
      const rawUrlWithoutQueryOrHash = imageUrl.split(/[?#]/, 1)[0];
      const rawPathMatch = rawUrlWithoutQueryOrHash.match(/^[a-z][a-z\d+.-]*:\/\/[^/]+(\/.*)?$/i);
      const rawPath = rawPathMatch?.[1] || '/';
      const decodedRawPath = decodeURIComponent(rawPath);

      if (decodedRawPath.split('/').some(segment => segment === '..')) {
        throw new Error('o caminho da imagem contém segmentos de travessia');
      }

      const decodedPathname = decodeURIComponent(parsedUrl.pathname);
      if (!decodedPathname.startsWith(storagePrefix)) {
        throw new Error('a URL não pertence ao bucket esperado "images"');
      }

      filePath = decodedPathname.slice(storagePrefix.length);
      if (!filePath || filePath.startsWith('/') || filePath.split('/').some(segment => segment === '..')) {
        throw new Error('o caminho da imagem é inválido');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Não foi possível identificar uma imagem válida no bucket "images": ${message}`);
    }

    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (error) {
      throw new Error(`Falha ao remover a imagem do Supabase Storage: ${error.message}`);
    }

    return true;
  }
};
