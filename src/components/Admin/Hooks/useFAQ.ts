import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { faqService } from '../../../services/faqService';
import { Faq } from '../../../types';

export function useFAQ() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isFaqFormOpen, setIsFaqFormOpen] = useState(false);
  const [faqFormMode, setFaqFormMode] = useState<'create' | 'edit'>('create');
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqOrderIndex, setFaqOrderIndex] = useState(0);
  const [faqSaving, setFaqSaving] = useState(false);
  const [faqMessage, setFaqMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteFaqConfirmationId, setDeleteFaqConfirmationId] = useState<number | null>(null);
  const [deletingFaqId, setDeletingFaqId] = useState<number | null>(null);
  const deletingFaqRef = useRef<number | null>(null);

  const loadFaqs = async () => {
    const data = await faqService.getAll();
    setFaqs(data);
  };

  const handleOpenFaqCreateForm = () => {
    setFaqFormMode('create');
    setEditingFaqId(null);
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqOrderIndex(faqs.length + 1);
    setFaqMessage(null);
    setIsFaqFormOpen(true);
  };

  const handleStartFaqEdit = (item: Faq) => {
    setFaqFormMode('edit');
    setEditingFaqId(item.id ?? null);
    setFaqQuestion(item.q);
    setFaqAnswer(item.a);
    setFaqOrderIndex(item.order_index ?? 0);
    setFaqMessage(null);
    setIsFaqFormOpen(true);
  };

  const handleSaveFaq = async (e: FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      setFaqMessage({ type: 'error', text: 'Por favor, preencha a pergunta e a resposta.' });
      return;
    }

    try {
      setFaqSaving(true);
      setFaqMessage(null);

      const payload = {
        q: faqQuestion.trim(),
        a: faqAnswer.trim(),
        order_index: faqOrderIndex
      };

      if (faqFormMode === 'create') {
        const newItem = await faqService.create(payload);
        setFaqs(prev => [...prev, newItem].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)));
        setFaqMessage({ type: 'success', text: 'Pergunta cadastrada com sucesso!' });
        setFaqQuestion('');
        setFaqAnswer('');
        setIsFaqFormOpen(false);
      } else {
        if (!editingFaqId) return;
        const updatedItem = await faqService.update(editingFaqId, payload);
        setFaqs(prev => prev.map(f => f.id === editingFaqId ? updatedItem : f).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)));
        setFaqMessage({ type: 'success', text: 'Pergunta atualizada com sucesso!' });
        setIsFaqFormOpen(false);
        setEditingFaqId(null);
      }
    } catch (err: any) {
      setFaqMessage({ type: 'error', text: 'Erro ao salvar pergunta: ' + (err.message || err) });
    } finally {
      setFaqSaving(false);
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (deletingFaqRef.current !== null) return;
    deletingFaqRef.current = id;
    try {
      setDeletingFaqId(id);
      setFaqSaving(true);
      setFaqMessage(null);
      await faqService.delete(id);
      setFaqs(prev => prev.filter(f => f.id !== id));
      setFaqMessage({ type: 'success', text: 'Pergunta removida com sucesso!' });
      setDeleteFaqConfirmationId(null);
    } catch (err: any) {
      setFaqMessage({ type: 'error', text: 'Erro ao remover pergunta: ' + (err.message || err) });
    } finally {
      deletingFaqRef.current = null;
      setDeletingFaqId(null);
      setFaqSaving(false);
    }
  };

  return {
    faqs,
    setFaqs,
    loadFaqs,
    isFaqFormOpen,
    setIsFaqFormOpen,
    faqFormMode,
    editingFaqId,
    setEditingFaqId,
    faqQuestion,
    setFaqQuestion,
    faqAnswer,
    setFaqAnswer,
    faqOrderIndex,
    setFaqOrderIndex,
    faqSaving,
    faqMessage,
    setFaqMessage,
    deleteFaqConfirmationId,
    deletingFaqId,
    setDeleteFaqConfirmationId,
    handleOpenFaqCreateForm,
    handleStartFaqEdit,
    handleSaveFaq,
    handleDeleteFaq
  };
}
