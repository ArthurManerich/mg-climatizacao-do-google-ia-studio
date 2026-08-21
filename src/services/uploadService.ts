import { supabase, hasSupabaseConfig, getSupabasePublicUrl } from '../lib/supabase';

const IMAGE_BUCKET = 'images';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_INPUT_WIDTH = 8000;
const MAX_INPUT_HEIGHT = 8000;
const MAX_INPUT_PIXELS = 40_000_000;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
type AllowedImageType = typeof ALLOWED_IMAGE_TYPES[number];
type UploadFolder = 'portfolio' | 'before-after' | 'company-logo';
const ALLOWED_UPLOAD_FOLDERS = new Set<UploadFolder>(['portfolio', 'before-after', 'company-logo']);

const EXTENSIONS_BY_TYPE: Record<AllowedImageType, readonly string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
};

function readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsArrayBuffer(blob);
  });
}

export function detectImageType(bytes: Uint8Array): AllowedImageType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte)) return 'image/png';
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
  return null;
}

export async function validateImageFile(file: File): Promise<AllowedImageType> {
  const declaredType = file.type.toLowerCase() as AllowedImageType;
  if (!ALLOWED_IMAGE_TYPES.includes(declaredType)) throw new Error('Formato de imagem inválido. Envie apenas arquivos JPG, PNG ou WebP.');
  if (file.size > MAX_FILE_SIZE) throw new Error('Tamanho da imagem excede o limite de 5 MB.');
  const extension = file.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (!extension || !EXTENSIONS_BY_TYPE[declaredType].includes(extension)) throw new Error('A extensão do arquivo não corresponde ao formato declarado.');
  const header = new Uint8Array(await readBlobAsArrayBuffer(file.slice(0, 12)));
  const detectedType = detectImageType(header);
  if (!detectedType || detectedType !== declaredType) throw new Error('O conteúdo do arquivo não corresponde a uma imagem válida do formato declarado.');
  return detectedType;
}

function validateDimensions(width: number, height: number): void {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) throw new Error('Não foi possível determinar as dimensões da imagem.');
  if (width > 8000 || height > 8000 || width * height > 40_000_000) throw new Error('As dimensões da imagem excedem o limite permitido.');
}

async function compressImageToWebP(file: File): Promise<File> {
  await validateImageFile(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    const cleanup = () => URL.revokeObjectURL(objectUrl);
    img.onload = () => {
      try {
        const sourceWidth = img.naturalWidth || img.width;
        const sourceHeight = img.naturalHeight || img.height;
        validateDimensions(sourceWidth, sourceHeight);
        const scale = Math.min(1, 1920 / sourceWidth, 1080 / sourceHeight);
        const width = Math.max(1, Math.round(sourceWidth * scale));
        const height = Math.max(1, Math.round(sourceHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Não foi possível processar a imagem com segurança.');
        context.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          cleanup();
          if (!blob || blob.type !== 'image/webp') {
            reject(new Error('Não foi possível converter a imagem para WebP.'));
            return;
          }
          resolve(new File([blob], 'upload.webp', { type: 'image/webp' }));
        }, 'image/webp', 0.82);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };
    img.onerror = () => {
      cleanup();
      reject(new Error('O arquivo não pôde ser decodificado como imagem.'));
    };
    img.src = objectUrl;
  });
}

function getStoragePathFromPublicUrl(imageUrl: string): string {
  const configuredUrl = getSupabasePublicUrl();
  if (!configuredUrl) throw new Error('URL pública do Supabase não está configurada.');
  const expectedUrl = new URL(configuredUrl);
  const parsedUrl = new URL(imageUrl);
  if (parsedUrl.protocol !== 'https:' || parsedUrl.origin !== expectedUrl.origin) throw new Error('Origem inválida.');
  const storagePrefix = `${expectedUrl.pathname.replace(/\/+$/, '')}/storage/v1/object/public/${IMAGE_BUCKET}/`;
  const rawPath = imageUrl.split(/[?#]/, 1)[0].replace(/^[a-z][a-z\d+.-]*:\/\/[^/]+/i, '');
  if (decodeURIComponent(rawPath).split('/').some(segment => segment === '..')) throw new Error('Travessia de caminho.');
  const decodedPathname = decodeURIComponent(parsedUrl.pathname);
  if (!decodedPathname.startsWith(storagePrefix)) throw new Error('Bucket inválido.');
  const filePath = decodedPathname.slice(storagePrefix.length);
  if (!filePath || filePath.startsWith('/') || filePath.split('/').some(segment => !segment || segment === '..')) throw new Error('Caminho inválido.');
  const [folder] = filePath.split('/');
  if (!ALLOWED_UPLOAD_FOLDERS.has(folder as UploadFolder)) throw new Error('Diretório inválido.');
  return filePath;
}

export const uploadService = {
  async uploadImage(file: File, folder: UploadFolder = 'portfolio'): Promise<string> {
    if (!hasSupabaseConfig()) throw new Error('Não foi possível fazer upload: Conexão com o Supabase não está configurada.');
    if (!ALLOWED_UPLOAD_FOLDERS.has(folder)) throw new Error('Diretório de upload inválido.');
    const compressedFile = await compressImageToWebP(file);
    const fileName = `${folder}/${crypto.randomUUID()}.webp`;
    const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(fileName, compressedFile, {
      cacheControl: '3600', upsert: false, contentType: 'image/webp',
    });
    if (error) {
      const storageError = error as unknown as { statusCode?: string; code?: string };
      if (error.message?.includes('Bucket not found') || storageError.statusCode === '404' || storageError.code === 'NoSuchBucket') throw new Error('O bucket de imagens não foi encontrado no Supabase Storage.');
      if (error.message?.includes('row-level security') || error.message?.includes('RLS') || error.statusCode === '403') throw new Error('O upload foi bloqueado pelas regras de acesso do Supabase Storage.');
      throw new Error('Falha no upload da imagem para o Supabase Storage.');
    }
    const { data: { publicUrl } } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(fileName);
    try {
      if (!publicUrl || getStoragePathFromPublicUrl(publicUrl) !== fileName) throw new Error();
    } catch {
      throw new Error('Não foi possível obter uma URL pública válida da imagem no Supabase Storage.');
    }
    return publicUrl;
  },

  async deleteImage(imageUrl: string): Promise<boolean> {
    if (!hasSupabaseConfig()) throw new Error('Não foi possível remover a imagem: Conexão com o Supabase não está configurada.');
    if (!imageUrl) throw new Error('Não foi possível remover a imagem: URL vazia.');
    let filePath: string;
    try { filePath = getStoragePathFromPublicUrl(imageUrl); } catch { throw new Error('Não foi possível identificar uma imagem válida no bucket de imagens.'); }
    const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([filePath]);
    if (error) throw new Error('Falha ao remover a imagem do Supabase Storage.');
    return true;
  },
};
