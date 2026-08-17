import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FAQManager } from './FAQManager';
import { PortfolioManager } from './PortfolioManager';
import { BeforeAfterManager } from './BeforeAfterManager';

const noop = vi.fn();

describe('confirmações de exclusão', () => {
  it('desabilita a confirmação do FAQ durante a exclusão', () => {
    render(React.createElement(FAQManager, {
      faqs: [{ id: 1, q: 'Pergunta', a: 'Resposta', order_index: 1 }],
      isFaqFormOpen: false, faqFormMode: 'create', editingFaqId: null,
      faqQuestion: '', faqAnswer: '', faqOrderIndex: 0, faqSaving: true,
      faqMessage: null, deleteFaqConfirmationId: 1, deletingFaqId: 1,
      setIsFaqFormOpen: noop, setEditingFaqId: noop, setFaqQuestion: noop,
      setFaqAnswer: noop, setFaqOrderIndex: noop, setFaqMessage: noop,
      setDeleteFaqConfirmationId: noop, handleOpenFaqCreateForm: noop,
      handleStartFaqEdit: noop, handleSaveFaq: noop, handleDeleteFaq: noop,
    }));
    expect(screen.getByRole('button', { name: 'Excluindo...' })).toBeDisabled();
  });

  it('desabilita a confirmação do Portfólio durante a exclusão', () => {
    render(React.createElement(PortfolioManager, {
      portfolios: [{ id: 1, title: 'Item', description: '', category: 'x', img: 'url' }],
      isPortfolioFormOpen: false, portfolioFormMode: 'create', editingPortfolioId: null,
      portfolioTitle: '', portfolioDescription: '', portfolioCategory: '', portfolioImg: '',
      portfolioImages: [], portfolioSaving: true, portfolioUploadLoading: false,
      portfolioMessage: null, deleteConfirmationId: 1, deletingPortfolioId: 1,
      setIsPortfolioFormOpen: noop, setEditingPortfolioId: noop, setPortfolioTitle: noop,
      setPortfolioDescription: noop, setPortfolioCategory: noop, setPortfolioImg: noop,
      setPortfolioMessage: noop, setDeleteConfirmationId: noop, handleOpenCreateForm: noop,
      handleStartEdit: noop, handleSavePortfolio: noop, handleDeletePortfolio: noop,
      handleImageUpload: noop, handleRemoveImage: noop, handleCancelPortfolioForm: noop,
    }));
    expect(screen.getByRole('button', { name: 'Excluindo...' })).toBeDisabled();
  });

  it('desabilita a confirmação do Antes & Depois durante a exclusão', () => {
    render(React.createElement(BeforeAfterManager, {
      beforeAfters: [{ id: 1, title: 'Item', description: '', category: 'x', before_img: 'a', after_img: 'b' }],
      isBeforeAfterFormOpen: false, beforeAfterFormMode: 'create', editingBeforeAfterId: null,
      beforeAfterTitle: '', beforeAfterDescription: '', beforeAfterCategory: '',
      beforeAfterBeforeImg: '', beforeAfterAfterImg: '', beforeAfterSaving: true,
      beforeAfterBeforeUploadLoading: false, beforeAfterAfterUploadLoading: false,
      beforeAfterMessage: null, deleteBeforeAfterConfirmationId: 1, deletingBeforeAfterId: 1,
      setIsBeforeAfterFormOpen: noop, setEditingBeforeAfterId: noop, setBeforeAfterTitle: noop,
      setBeforeAfterDescription: noop, setBeforeAfterCategory: noop, setBeforeAfterMessage: noop,
      setDeleteBeforeAfterConfirmationId: noop, handleOpenBeforeAfterCreateForm: noop,
      handleStartBeforeAfterEdit: noop, handleSaveBeforeAfter: noop, handleDeleteBeforeAfter: noop,
      handleBeforeImageUpload: noop, handleAfterImageUpload: noop, handleCancelBeforeAfterForm: noop,
    }));
    expect(screen.getByRole('button', { name: 'Excluindo...' })).toBeDisabled();
  });
});
