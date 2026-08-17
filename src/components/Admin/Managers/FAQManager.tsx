import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { FaqItem } from '../../../types';

interface FAQManagerProps {
  faqs: FaqItem[];
  isFaqFormOpen: boolean;
  faqFormMode: 'create' | 'edit';
  editingFaqId: number | null;
  faqQuestion: string;
  faqAnswer: string;
  faqOrderIndex: number;
  faqSaving: boolean;
  faqMessage: { type: 'success' | 'error'; text: string } | null;
  deleteFaqConfirmationId: number | null;
  deletingFaqId: number | null;
  setIsFaqFormOpen: (open: boolean) => void;
  setEditingFaqId: (id: number | null) => void;
  setFaqQuestion: (val: string) => void;
  setFaqAnswer: (val: string) => void;
  setFaqOrderIndex: (val: number) => void;
  setFaqMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  setDeleteFaqConfirmationId: (id: number | null) => void;
  handleOpenFaqCreateForm: () => void;
  handleStartFaqEdit: (item: FaqItem) => void;
  handleSaveFaq: (e: React.FormEvent) => void;
  handleDeleteFaq: (id: number) => void;
}

export const FAQManager: React.FC<FAQManagerProps> = ({
  faqs,
  isFaqFormOpen,
  faqFormMode,
  faqQuestion,
  faqAnswer,
  faqOrderIndex,
  faqSaving,
  faqMessage,
  deleteFaqConfirmationId,
  deletingFaqId,
  setIsFaqFormOpen,
  setEditingFaqId,
  setFaqQuestion,
  setFaqAnswer,
  setFaqOrderIndex,
  setFaqMessage,
  setDeleteFaqConfirmationId,
  handleOpenFaqCreateForm,
  handleStartFaqEdit,
  handleSaveFaq,
  handleDeleteFaq
}) => {
  return (
    <div className="admin-manager space-y-6" id="view-faq">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold font-display text-slate-900">Perguntas Frequentes (FAQ)</h2>
          <p className="text-xs text-slate-500">Gerencie as dúvidas comuns exibidas no site.</p>
        </div>
        
        {!isFaqFormOpen && (
          <button
            onClick={handleOpenFaqCreateForm}
            className="inline-flex items-center gap-1.5 bg-[#0096D6] hover:bg-[#0082BA] text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border border-[#0096D6] shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nova Pergunta
          </button>
        )}
      </div>

      {/* FAQ Messages Banner */}
      {faqMessage && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-bold ${
          faqMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{faqMessage.text}</span>
          <button 
            onClick={() => setFaqMessage(null)} 
            className="text-[10px] uppercase tracking-wider underline hover:text-slate-900 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* FAQ Form */}
      {isFaqFormOpen && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-[#002E5C] uppercase tracking-wider">
              {faqFormMode === 'create' ? '✨ Nova Pergunta FAQ' : '✏️ Editar Pergunta FAQ'}
            </h3>
            <button 
              onClick={() => {
                setIsFaqFormOpen(false);
                setEditingFaqId(null);
              }}
              className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSaveFaq} className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Pergunta */}
              <div className="md:col-span-3">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Pergunta</label>
                <input 
                  type="text" 
                  placeholder="Ex: Qual o prazo de garantia do serviço?"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0096D6]"
                  required
                />
              </div>

              {/* Ordem de Exibição */}
              <div className="md:col-span-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Ordem de Exibição</label>
                <input 
                  type="number" 
                  value={faqOrderIndex}
                  onChange={(e) => setFaqOrderIndex(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0096D6]"
                />
              </div>
            </div>

            {/* Resposta */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Resposta Completa</label>
              <textarea 
                placeholder="Ex: Oferecemos garantia completa de 90 dias para todos os serviços de instalação e higienização."
                value={faqAnswer}
                onChange={(e) => setFaqAnswer(e.target.value)}
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0096D6] resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="submit"
                disabled={faqSaving}
                className="bg-[#0096D6] hover:bg-[#0082BA] disabled:bg-slate-300 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider border border-[#0096D6] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                {faqSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <span>Salvar Pergunta</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200/70 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dúvidas Cadastradas ({faqs.length})</span>
          <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Ações Permitidas</span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {faqs.length === 0 ? (
            <div className="admin-empty-state p-8 text-center text-slate-400 text-xs font-semibold">
              <p className="admin-empty-title text-sm font-extrabold">Nenhuma pergunta cadastrada</p>
              <p className="mt-1 text-xs">Use o botão “Nova Pergunta” para publicar a primeira resposta.</p>
            </div>
          ) : (
            faqs.map((item) => {
              const isConfirmingDelete = deleteFaqConfirmationId === item.id;
              
              return (
                <div key={item.id || item.q} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#002E5C] bg-[#E6F5FC] border border-[#0096D6]/30 px-2 py-0.5 rounded">
                        Ordem: #{item.order_index ?? 0}
                      </span>
                      <h4 className="text-xs font-black text-slate-950 uppercase tracking-wide">{item.q}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{item.a}</p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isConfirmingDelete ? (
                      <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex items-center gap-2.5 text-xs">
                        <span className="font-extrabold text-rose-800">Excluir dúvida?</span>
                        <button 
                          onClick={() => item.id && handleDeleteFaq(item.id)}
                          disabled={deletingFaqId === item.id}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase cursor-pointer"
                        >
                          {deletingFaqId === item.id ? 'Excluindo...' : 'Sim, Excluir'}
                        </button>
                        <button 
                          onClick={() => setDeleteFaqConfirmationId(null)}
                          disabled={deletingFaqId === item.id}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase cursor-pointer"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
                        <button
                          onClick={() => handleStartFaqEdit(item)}
                          className="p-2.5 text-slate-500 hover:text-slate-950 hover:bg-slate-100 border border-slate-200/50 rounded-xl transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => item.id && setDeleteFaqConfirmationId(item.id)}
                          className="p-2.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-100 rounded-xl transition-all cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
