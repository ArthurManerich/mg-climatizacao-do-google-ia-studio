import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { portfolioService } from '../../../services/portfolioService';
import { Portfolio } from '../../../types';
import { useUploads } from './useUploads';
import { uploadService } from '../../../services/uploadService';
import type { CleanupResult } from '../../../services/mutationResult';

export function usePortfolio() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isPortfolioFormOpen, setIsPortfolioFormOpen] = useState(false);
  const [portfolioFormMode, setPortfolioFormMode] = useState<'create' | 'edit'>('create');
  const [editingPortfolioId, setEditingPortfolioId] = useState<number | null>(null);
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioDescription, setPortfolioDescription] = useState('');
  const [portfolioCategory, setPortfolioCategory] = useState('instalacao');
  const [portfolioImg, setPortfolioImg] = useState('');
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [pendingUploadedUrls, setPendingUploadedUrls] = useState<string[]>([]);
  const [originalPortfolioImg, setOriginalPortfolioImg] = useState('');
  const [portfolioSaving, setPortfolioSaving] = useState(false);
  const [portfolioMessage, setPortfolioMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);
  const [deletingPortfolioId, setDeletingPortfolioId] = useState<number | null>(null);
  const deletingPortfolioRef = useRef<number | null>(null);

  const { isUploading, progress, uploadImage, error: uploadError } = useUploads();

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

  const loadPortfolios = async () => {
    const data = await portfolioService.getAll();
    setPortfolios(data);
  };

  const handleOpenCreateForm = () => {
    setPortfolioFormMode('create');
    setEditingPortfolioId(null);
    setPortfolioTitle('');
    setPortfolioDescription('');
    setPortfolioCategory('instalacao');
    setPortfolioImg('');
    setPortfolioImages([]);
    setPendingUploadedUrls([]);
    setOriginalPortfolioImg('');
    setPortfolioMessage(null);
    setIsPortfolioFormOpen(true);
  };

  const handleStartEdit = (item: Portfolio) => {
    setPortfolioFormMode('edit');
    setEditingPortfolioId(item.id);
    setPortfolioTitle(item.title);
    setPortfolioDescription(item.description || '');
    setPortfolioCategory(item.category);
    setPortfolioImg(item.img);
    setPortfolioImages(item.img ? [item.img] : []);
    setPendingUploadedUrls([]);
    setOriginalPortfolioImg(item.img);
    setPortfolioMessage(null);
    setIsPortfolioFormOpen(true);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.currentTarget.files ?? []);
    if (files.length === 0) return;

    try {
      setPortfolioMessage(null);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const publicUrl = await uploadImage(file, 'portfolio');
        uploadedUrls.push(publicUrl);
        setPendingUploadedUrls(prev => [...prev, publicUrl]);
      }

      setPortfolioImages(prev => {
        const next = [...prev, ...uploadedUrls];
        if (next.length > 0) {
          setPortfolioImg(next[0]);
        }
        return next;
      });

      if (files.length === 1) {
        setPortfolioMessage({ type: 'success', text: '1 foto enviada com sucesso!' });
      } else {
        setPortfolioMessage({ 
          type: 'success', 
          text: `${files.length} fotos enviadas com sucesso! Preencha o título e clique em salvar.` 
        });
      }
    } catch (err: any) {
      console.error(err);
      setPortfolioMessage({ type: 'error', text: err.message || 'Erro ao enviar fotos.' });
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveImage = async (indexToRemove: number) => {
    const urlToRemove = portfolioImages[indexToRemove];
    setPortfolioImages(prev => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      setPortfolioImg(next[0] || '');
      return next;
    });

    if (urlToRemove && pendingUploadedUrls.includes(urlToRemove)) {
      const cleanupResult = await cleanupPendingUrls([urlToRemove]);
      if (cleanupResult.errors.length > 0) {
        setPortfolioMessage({ type: 'error', text: `A foto saiu da prévia, mas pode ter permanecido órfã no Storage: ${cleanupResult.errors.join('; ')}` });
      }
    }
  };

  const handleCancelPortfolioForm = async () => {
    const cleanupResult = await cleanupPendingUrls(pendingUploadedUrls);
    setIsPortfolioFormOpen(false);
    setEditingPortfolioId(null);
    setPortfolioImages([]);
    setPortfolioImg('');
    setOriginalPortfolioImg('');
    if (cleanupResult.errors.length > 0) {
      setPortfolioMessage({ type: 'error', text: `Formulário cancelado, mas algumas imagens podem ter permanecido órfãs no Storage: ${cleanupResult.errors.join('; ')}` });
    }
  };

  const handleSavePortfolio = async (e: FormEvent) => {
    e.preventDefault();

    if (!portfolioTitle.trim()) {
      setPortfolioMessage({ type: 'error', text: 'Por favor, preencha o título do serviço.' });
      return;
    }

    const imagesToSave = portfolioImages.length > 0 ? portfolioImages : (portfolioImg ? [portfolioImg] : []);

    if (imagesToSave.length === 0) {
      setPortfolioMessage({ type: 'error', text: 'Por favor, envie ao menos uma foto do serviço.' });
      return;
    }

    try {
      setPortfolioSaving(true);
      setPortfolioMessage(null);

      if (portfolioFormMode === 'create') {
        const baseTitle = portfolioTitle.trim();
        const baseDesc = portfolioDescription.trim();
        const baseCat = portfolioCategory;

        const payloadItems = imagesToSave.map((imgUrl) => ({
          title: baseTitle,
          description: baseDesc,
          category: baseCat,
          img: imgUrl
        }));

        const createResult = await portfolioService.createBatch(payloadItems);
        if (createResult.status === 'uncertain') {
          setPortfolioMessage({
            type: 'error',
            text: `${createResult.message} As imagens foram preservadas para evitar registros quebrados. Recarregue ou confira o painel antes de tentar novamente. URLs não confirmadas: ${createResult.unconfirmedUrls.join(', ') || 'nenhuma identificável'}`,
          });
          return;
        }

        setPendingUploadedUrls(prev => prev.filter(url => !createResult.confirmedUrls.includes(url)));
        setPortfolios(prev => [...createResult.data, ...prev]);
        setPortfolioMessage({ 
          type: 'success', 
          text: imagesToSave.length > 1 
            ? `${imagesToSave.length} serviços cadastrados no portfólio com sucesso!` 
            : 'Novo serviço cadastrado com sucesso!' 
        });
        setPortfolioTitle('');
        setPortfolioDescription('');
        setPortfolioCategory('instalacao');
        setPortfolioImg('');
        setPortfolioImages([]);
        setIsPortfolioFormOpen(false);
      } else {
        if (!editingPortfolioId) return;
        const payload = {
          title: portfolioTitle.trim(),
          description: portfolioDescription.trim(),
          category: portfolioCategory,
          img: imagesToSave[0]
        };
        const result = await portfolioService.update(editingPortfolioId, payload, originalPortfolioImg);
        const confirmedUrl = result.data.img;
        const excessUrls = pendingUploadedUrls.filter(url => url !== confirmedUrl);
        const excessCleanup = await cleanupPendingUrls(excessUrls, [confirmedUrl]);
        setPendingUploadedUrls(prev => prev.filter(url => url !== confirmedUrl));
        setPortfolios(prev => prev.map(p => p.id === editingPortfolioId ? result.data : p));
        const cleanupErrors = [...result.cleanupErrors, ...excessCleanup.errors];
        setPortfolioMessage(result.storageCleanupSucceeded && excessCleanup.errors.length === 0
          ? { type: 'success', text: 'Serviço de portfólio atualizado com sucesso!' }
          : { type: 'error', text: `Edição salva, mas algumas imagens podem ter permanecido órfãs no Storage: ${cleanupErrors.join('; ')}` });
        setIsPortfolioFormOpen(false);
        setEditingPortfolioId(null);
        setPortfolioImg('');
        setPortfolioImages([]);
      }
    } catch (err: any) {
      console.error(err);
      const cleanupResult = await cleanupPendingUrls(pendingUploadedUrls);
      const cleanupWarning = cleanupResult.errors.length > 0
        ? ` As imagens novas podem ter permanecido órfãs no Storage: ${cleanupResult.errors.join('; ')}`
        : '';
      setPortfolioMessage({ type: 'error', text: 'Erro ao salvar serviço: ' + (err.message || err) + cleanupWarning });
    } finally {
      setPortfolioSaving(false);
    }
  };

  const handleDeletePortfolio = async (id: number) => {
    if (deletingPortfolioRef.current !== null) return;
    deletingPortfolioRef.current = id;
    try {
      setDeletingPortfolioId(id);
      setPortfolioSaving(true);
      setPortfolioMessage(null);
      const result = await portfolioService.delete(id);
      setPortfolios(prev => prev.filter(p => p.id !== id));
      setDeleteConfirmationId(null);

      if (result.storageCleanupSucceeded) {
        setPortfolioMessage({ type: 'success', text: 'Serviço removido com sucesso!' });
      } else {
        setPortfolioMessage({
          type: 'error',
          text: `Serviço removido do banco de dados, mas a imagem pode ter permanecido órfã no Storage: ${result.cleanupErrors.join('; ')}`,
        });
      }
    } catch (err: any) {
      setPortfolioMessage({ type: 'error', text: 'Erro ao deletar serviço: ' + (err.message || err) });
    } finally {
      deletingPortfolioRef.current = null;
      setDeletingPortfolioId(null);
      setPortfolioSaving(false);
    }
  };

  return {
    portfolios,
    setPortfolios,
    loadPortfolios,
    isPortfolioFormOpen,
    setIsPortfolioFormOpen,
    portfolioFormMode,
    editingPortfolioId,
    setEditingPortfolioId,
    portfolioTitle,
    setPortfolioTitle,
    portfolioDescription,
    setPortfolioDescription,
    portfolioCategory,
    setPortfolioCategory,
    portfolioImg,
    setPortfolioImg,
    portfolioImages,
    setPortfolioImages,
    handleRemoveImage,
    handleCancelPortfolioForm,
    portfolioSaving,
    portfolioUploadLoading: isUploading,
    portfolioUploadProgress: progress,
    portfolioUploadError: uploadError,
    portfolioMessage,
    setPortfolioMessage,
    deleteConfirmationId,
    deletingPortfolioId,
    setDeleteConfirmationId,
    handleOpenCreateForm,
    handleStartEdit,
    handleImageUpload,
    handleSavePortfolio,
    handleDeletePortfolio
  };
}
