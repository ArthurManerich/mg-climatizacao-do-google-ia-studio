import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { beforeAfterService } from '../../../services/beforeAfterService';
import { BeforeAfter } from '../../../types';
import { useUploads } from './useUploads';
import { uploadService } from '../../../services/uploadService';
import type { CleanupResult } from '../../../services/mutationResult';

export function useBeforeAfter() {
  const [beforeAfters, setBeforeAfters] = useState<BeforeAfter[]>([]);
  const [isBeforeAfterFormOpen, setIsBeforeAfterFormOpen] = useState(false);
  const [beforeAfterFormMode, setBeforeAfterFormMode] = useState<'create' | 'edit'>('create');
  const [editingBeforeAfterId, setEditingBeforeAfterId] = useState<number | null>(null);
  const [beforeAfterTitle, setBeforeAfterTitle] = useState('');
  const [beforeAfterDescription, setBeforeAfterDescription] = useState('');
  const [beforeAfterCategory, setBeforeAfterCategory] = useState('instalacao');
  const [beforeAfterBeforeImg, setBeforeAfterBeforeImg] = useState('');
  const [beforeAfterAfterImg, setBeforeAfterAfterImg] = useState('');
  const [pendingUploadedUrls, setPendingUploadedUrls] = useState<string[]>([]);
  const [originalImages, setOriginalImages] = useState({ before_img: '', after_img: '' });
  const [beforeAfterSaving, setBeforeAfterSaving] = useState(false);
  const [beforeAfterMessage, setBeforeAfterMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteBeforeAfterConfirmationId, setDeleteBeforeAfterConfirmationId] = useState<number | null>(null);
  const [deletingBeforeAfterId, setDeletingBeforeAfterId] = useState<number | null>(null);
  const deletingBeforeAfterRef = useRef<number | null>(null);

  const beforeUploader = useUploads();
  const afterUploader = useUploads();

  const cleanupPendingUrls = async (urls: string[], preservedUrls: string[] = []): Promise<CleanupResult> => {
    const uniqueUrls = [...new Set(urls)].filter(url => !preservedUrls.includes(url));
    const result: CleanupResult = { cleanedUrls: [], failedUrls: [], errors: [] };
    for (const url of uniqueUrls) {
      try {
        await uploadService.deleteImage(url);
        result.cleanedUrls.push(url);
      } catch (error) {
        result.failedUrls.push(url);
        result.errors.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    setPendingUploadedUrls(prev => prev.filter(url => !result.cleanedUrls.includes(url)));
    return result;
  };

  const loadBeforeAfters = async () => {
    const data = await beforeAfterService.getAll();
    setBeforeAfters(data);
  };

  const handleOpenBeforeAfterCreateForm = () => {
    setBeforeAfterFormMode('create');
    setEditingBeforeAfterId(null);
    setBeforeAfterTitle('');
    setBeforeAfterDescription('');
    setBeforeAfterCategory('instalacao');
    setBeforeAfterBeforeImg('');
    setBeforeAfterAfterImg('');
    setPendingUploadedUrls([]);
    setOriginalImages({ before_img: '', after_img: '' });
    setBeforeAfterMessage(null);
    setIsBeforeAfterFormOpen(true);
  };

  const handleStartBeforeAfterEdit = (item: BeforeAfter) => {
    setBeforeAfterFormMode('edit');
    setEditingBeforeAfterId(item.id);
    setBeforeAfterTitle(item.title);
    setBeforeAfterDescription(item.description || '');
    setBeforeAfterCategory(item.category || 'instalacao');
    setBeforeAfterBeforeImg(item.before_img);
    setBeforeAfterAfterImg(item.after_img);
    setPendingUploadedUrls([]);
    setOriginalImages({ before_img: item.before_img, after_img: item.after_img });
    setBeforeAfterMessage(null);
    setIsBeforeAfterFormOpen(true);
  };

  const handleBeforeImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBeforeAfterMessage(null);
      const publicUrl = await beforeUploader.uploadImage(file, 'before-after');
      setPendingUploadedUrls(prev => [...prev, publicUrl]);
      const replacedPendingUrl = pendingUploadedUrls.includes(beforeAfterBeforeImg) ? beforeAfterBeforeImg : null;
      setBeforeAfterBeforeImg(publicUrl);
      const cleanupResult = replacedPendingUrl ? await cleanupPendingUrls([replacedPendingUrl], [publicUrl]) : null;
      setBeforeAfterMessage(cleanupResult && cleanupResult.errors.length > 0
        ? { type: 'error', text: `Foto ANTES substituída, mas a pendente anterior pode ter permanecido órfã: ${cleanupResult.errors.join('; ')}` }
        : { type: 'success', text: 'Foto ANTES enviada com sucesso!' });
    } catch (err: any) {
      setBeforeAfterMessage({ type: 'error', text: err.message || 'Erro ao enviar foto ANTES.' });
    }
  };

  const handleAfterImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBeforeAfterMessage(null);
      const publicUrl = await afterUploader.uploadImage(file, 'before-after');
      setPendingUploadedUrls(prev => [...prev, publicUrl]);
      const replacedPendingUrl = pendingUploadedUrls.includes(beforeAfterAfterImg) ? beforeAfterAfterImg : null;
      setBeforeAfterAfterImg(publicUrl);
      const cleanupResult = replacedPendingUrl ? await cleanupPendingUrls([replacedPendingUrl], [publicUrl]) : null;
      setBeforeAfterMessage(cleanupResult && cleanupResult.errors.length > 0
        ? { type: 'error', text: `Foto DEPOIS substituída, mas a pendente anterior pode ter permanecido órfã: ${cleanupResult.errors.join('; ')}` }
        : { type: 'success', text: 'Foto DEPOIS enviada com sucesso!' });
    } catch (err: any) {
      setBeforeAfterMessage({ type: 'error', text: err.message || 'Erro ao enviar foto DEPOIS.' });
    }
  };

  const handleSaveBeforeAfter = async (e: FormEvent) => {
    e.preventDefault();
    if (!beforeAfterTitle.trim()) {
      setBeforeAfterMessage({ type: 'error', text: 'Por favor, preencha o título.' });
      return;
    }
    if (!beforeAfterBeforeImg || !beforeAfterAfterImg) {
      setBeforeAfterMessage({ type: 'error', text: 'Por favor, envie ambas as fotos (Antes e Depois).' });
      return;
    }

    try {
      setBeforeAfterSaving(true);
      setBeforeAfterMessage(null);

      const payload = {
        title: beforeAfterTitle.trim(),
        description: beforeAfterDescription.trim(),
        category: beforeAfterCategory,
        before_img: beforeAfterBeforeImg,
        after_img: beforeAfterAfterImg
      };

      if (beforeAfterFormMode === 'create') {
        const newItem = await beforeAfterService.create(payload);
        setPendingUploadedUrls([]);
        setBeforeAfters(prev => [newItem, ...prev]);
        setBeforeAfterMessage({ type: 'success', text: 'Comparativo salvo com sucesso!' });
        setBeforeAfterTitle('');
        setBeforeAfterDescription('');
        setBeforeAfterBeforeImg('');
        setBeforeAfterAfterImg('');
        setIsBeforeAfterFormOpen(false);
      } else {
        if (!editingBeforeAfterId) return;
        const result = await beforeAfterService.update(editingBeforeAfterId, payload, originalImages);
        const confirmedUrls = [result.data.before_img, result.data.after_img];
        const excessUrls = pendingUploadedUrls.filter(url => !confirmedUrls.includes(url));
        const excessCleanup = await cleanupPendingUrls(excessUrls, confirmedUrls);
        setPendingUploadedUrls(prev => prev.filter(url => !confirmedUrls.includes(url)));
        setBeforeAfters(prev => prev.map(b => b.id === editingBeforeAfterId ? result.data : b));
        const cleanupErrors = [...result.cleanupErrors, ...excessCleanup.errors];
        setBeforeAfterMessage(result.storageCleanupSucceeded && excessCleanup.errors.length === 0
          ? { type: 'success', text: 'Comparativo atualizado com sucesso!' }
          : { type: 'error', text: `Comparativo salvo, mas imagens podem ter permanecido órfãs no Storage: ${cleanupErrors.join('; ')}` });
        setIsBeforeAfterFormOpen(false);
        setEditingBeforeAfterId(null);
      }
    } catch (err: any) {
      const cleanupResult = await cleanupPendingUrls(pendingUploadedUrls);
      const cleanupWarning = cleanupResult.errors.length > 0
        ? ` As imagens novas podem ter permanecido órfãs no Storage: ${cleanupResult.errors.join('; ')}`
        : '';
      setBeforeAfterMessage({ type: 'error', text: 'Erro ao salvar comparativo: ' + (err.message || err) + cleanupWarning });
    } finally {
      setBeforeAfterSaving(false);
    }
  };

  const handleCancelBeforeAfterForm = async () => {
    const cleanupResult = await cleanupPendingUrls(pendingUploadedUrls);
    setIsBeforeAfterFormOpen(false);
    setEditingBeforeAfterId(null);
    setBeforeAfterBeforeImg('');
    setBeforeAfterAfterImg('');
    setOriginalImages({ before_img: '', after_img: '' });
    if (cleanupResult.errors.length > 0) {
      setBeforeAfterMessage({ type: 'error', text: `Formulário cancelado, mas algumas imagens podem ter permanecido órfãs no Storage: ${cleanupResult.errors.join('; ')}` });
    }
  };

  const handleDeleteBeforeAfter = async (id: number) => {
    if (deletingBeforeAfterRef.current !== null) return;
    deletingBeforeAfterRef.current = id;
    try {
      setDeletingBeforeAfterId(id);
      setBeforeAfterSaving(true);
      setBeforeAfterMessage(null);
      const result = await beforeAfterService.delete(id);
      setBeforeAfters(prev => prev.filter(b => b.id !== id));
      setDeleteBeforeAfterConfirmationId(null);

      if (result.storageCleanupSucceeded) {
        setBeforeAfterMessage({ type: 'success', text: 'Comparativo removido com sucesso!' });
      } else {
        setBeforeAfterMessage({
          type: 'error',
          text: `Comparativo removido do banco de dados, mas uma ou mais imagens podem ter permanecido órfãs no Storage: ${result.cleanupErrors.join('; ')}`,
        });
      }
    } catch (err: any) {
      setBeforeAfterMessage({ type: 'error', text: 'Erro ao excluir comparativo: ' + (err.message || err) });
    } finally {
      deletingBeforeAfterRef.current = null;
      setDeletingBeforeAfterId(null);
      setBeforeAfterSaving(false);
    }
  };

  return {
    beforeAfters,
    setBeforeAfters,
    loadBeforeAfters,
    isBeforeAfterFormOpen,
    setIsBeforeAfterFormOpen,
    beforeAfterFormMode,
    editingBeforeAfterId,
    setEditingBeforeAfterId,
    beforeAfterTitle,
    setBeforeAfterTitle,
    beforeAfterDescription,
    setBeforeAfterDescription,
    beforeAfterCategory,
    setBeforeAfterCategory,
    beforeAfterBeforeImg,
    setBeforeAfterBeforeImg,
    beforeAfterAfterImg,
    setBeforeAfterAfterImg,
    beforeAfterSaving,
    beforeAfterBeforeUploadLoading: beforeUploader.isUploading,
    beforeAfterBeforeProgress: beforeUploader.progress,
    beforeAfterAfterUploadLoading: afterUploader.isUploading,
    beforeAfterAfterProgress: afterUploader.progress,
    beforeAfterMessage,
    setBeforeAfterMessage,
    deleteBeforeAfterConfirmationId,
    deletingBeforeAfterId,
    setDeleteBeforeAfterConfirmationId,
    handleOpenBeforeAfterCreateForm,
    handleStartBeforeAfterEdit,
    handleBeforeImageUpload,
    handleAfterImageUpload,
    handleSaveBeforeAfter,
    handleCancelBeforeAfterForm,
    handleDeleteBeforeAfter
  };
}
