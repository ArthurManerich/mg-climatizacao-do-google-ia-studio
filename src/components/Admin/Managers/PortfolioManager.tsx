import React from 'react';
import { Plus, Upload, Edit, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { PortfolioItem } from '../../../types';

interface PortfolioManagerProps {
  portfolios: PortfolioItem[];
  isPortfolioFormOpen: boolean;
  portfolioFormMode: 'create' | 'edit';
  editingPortfolioId: number | null;
  portfolioTitle: string;
  portfolioDescription: string;
  portfolioCategory: string;
  portfolioImg: string;
  portfolioImages?: string[];
  portfolioSaving: boolean;
  portfolioUploadLoading: boolean;
  portfolioUploadProgress?: number;
  portfolioMessage: { type: 'success' | 'error'; text: string } | null;
  deleteConfirmationId: number | null;
  deletingPortfolioId: number | null;
  setIsPortfolioFormOpen: (open: boolean) => void;
  setEditingPortfolioId: (id: number | null) => void;
  setPortfolioTitle: (val: string) => void;
  setPortfolioDescription: (val: string) => void;
  setPortfolioCategory: (val: string) => void;
  setPortfolioImg: (val: string) => void;
  setPortfolioMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  setDeleteConfirmationId: (id: number | null) => void;
  handleOpenCreateForm: () => void;
  handleStartEdit: (item: PortfolioItem) => void;
  handleSavePortfolio: (e: React.FormEvent) => void;
  handleDeletePortfolio: (id: number) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage?: (index: number) => void;
  handleCancelPortfolioForm: () => void;
}

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({
  portfolios,
  isPortfolioFormOpen,
  portfolioFormMode,
  portfolioTitle,
  portfolioDescription,
  portfolioCategory,
  portfolioImg,
  portfolioImages = [],
  portfolioSaving,
  portfolioUploadLoading,
  portfolioUploadProgress = 0,
  portfolioMessage,
  deleteConfirmationId,
  deletingPortfolioId,
  setIsPortfolioFormOpen,
  setEditingPortfolioId,
  setPortfolioTitle,
  setPortfolioDescription,
  setPortfolioCategory,
  setPortfolioMessage,
  setDeleteConfirmationId,
  handleOpenCreateForm,
  handleStartEdit,
  handleSavePortfolio,
  handleDeletePortfolio,
  handleImageUpload,
  handleRemoveImage,
  handleCancelPortfolioForm
}) => {
  const imagesToShow = portfolioImages.length > 0 
    ? portfolioImages 
    : (portfolioImg ? [portfolioImg] : []);

  return (
    <div className="admin-manager space-y-6" id="view-portfolio">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold font-display text-slate-900">Gerenciador de Portfólio</h2>
          <p className="text-xs text-slate-500">Visualização de fotos de projetos e serviços realizados.</p>
        </div>
        
        {!isPortfolioFormOpen && (
          <button
            onClick={handleOpenCreateForm}
            className="inline-flex items-center gap-1.5 bg-[#0096D6] hover:bg-[#0082BA] text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border border-[#0096D6] shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Cadastrar Serviço
          </button>
        )}
      </div>

      {/* Messages feedback banner */}
      {portfolioMessage && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-bold ${
          portfolioMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{portfolioMessage.text}</span>
          <button 
            onClick={() => setPortfolioMessage(null)} 
            className="text-[10px] uppercase tracking-wider underline hover:text-slate-900 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Expandable Creation / Editing Form */}
      {isPortfolioFormOpen && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-[#002E5C] uppercase tracking-wider">
              {portfolioFormMode === 'create' ? '✨ Adicionar Novo Serviço' : '✏️ Editar Serviço'}
            </h3>
            <button 
              onClick={handleCancelPortfolioForm}
              className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSavePortfolio} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Título */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Título do Serviço</label>
                <input 
                  type="text" 
                  placeholder="Ex: Instalação Split 12000 BTUs no Centro"
                  value={portfolioTitle}
                  onChange={(e) => setPortfolioTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0096D6]"
                  required
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Categoria</label>
                <select 
                  value={portfolioCategory}
                  onChange={(e) => setPortfolioCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0096D6]"
                >
                  <option value="instalacao">Instalação</option>
                  <option value="manutencao">Manutenção</option>
                  <option value="higienizacao">Higienização</option>
                  <option value="comercial">Comercial</option>
                </select>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Descrição / Detalhes</label>
              <textarea 
                placeholder="Ex: Instalação completa com furação, dreno embutido e teste de estanqueidade de gás."
                value={portfolioDescription}
                onChange={(e) => setPortfolioDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0096D6] resize-none"
              />
            </div>

            {/* Imagem Upload & Previews */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Fotos do Serviço ({imagesToShow.length})
                </label>
                {imagesToShow.length > 1 && (
                  <span className="text-[10px] font-bold text-[#002E5C] bg-[#E6F5FC] px-2.5 py-0.5 rounded-full border border-[#0096D6]/30">
                    {imagesToShow.length} fotos selecionadas
                  </span>
                )}
              </div>
              
              <div className="grid md:grid-cols-12 gap-4 items-start">
                {/* Upload Button */}
                <div className="md:col-span-5">
                  <label className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-200 hover:border-[#0096D6] rounded-2xl cursor-pointer transition-all relative overflow-hidden group">
                    {portfolioUploadLoading ? (
                      <div className="flex flex-col items-center gap-1.5 w-full px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-[#0096D6] border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] font-bold text-slate-700">Enviando fotos ({portfolioUploadProgress}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-[#0096D6] h-full transition-all duration-200 rounded-full"
                            style={{ width: `${portfolioUploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <Upload className="w-5 h-5 text-[#0096D6] group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-extrabold text-slate-800">
                          {imagesToShow.length > 0 ? '➕ Adicionar Mais Fotos' : '📱 Enviar Fotos do Celular'}
                        </span>
                        <span className="text-[9px] text-slate-500 font-medium">
                          Selecione 1 ou várias fotos de uma vez
                        </span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      multiple
                      accept="image/jpeg,image/png,image/webp" 
                      onChange={handleImageUpload} 
                      disabled={portfolioUploadLoading}
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Previews gallery */}
                <div className="md:col-span-7 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 min-h-[92px]">
                  {imagesToShow.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2.5 max-h-48 overflow-y-auto p-1">
                        {imagesToShow.map((url, idx) => (
                          <div key={idx} className="relative group/thumb rounded-xl overflow-hidden border-2 border-slate-200 bg-white shrink-0">
                            <img 
                              src={url} 
                              alt={`Foto ${idx + 1}`} 
                              className="w-16 h-16 object-cover" 
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute bottom-0 left-0 right-0 bg-slate-900/70 text-white text-[8px] font-bold text-center py-0.5">
                              #{idx + 1}
                            </span>
                            {handleRemoveImage && (
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                title="Remover esta foto"
                                className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md transition-opacity cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 w-full flex flex-col items-center justify-center gap-1">
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-400">Nenhuma foto adicionada ainda</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="submit"
                disabled={portfolioSaving || portfolioUploadLoading}
                className="bg-[#0096D6] hover:bg-[#0082BA] disabled:bg-slate-300 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider border border-[#0096D6] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                {portfolioSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <span>
                      {imagesToShow.length > 1 
                        ? `Cadastrar ${imagesToShow.length} Fotos no Portfólio` 
                        : 'Salvar e Publicar'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Portfolio dynamic list */}
      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200/70 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Serviços no Portfólio ({portfolios.length})</span>
          <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Ações Permitidas</span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {portfolios.length === 0 ? (
            <div className="admin-empty-state p-8 text-center text-slate-400 text-xs font-semibold">
              <ImageIcon className="mx-auto mb-3 h-8 w-8 text-slate-400" aria-hidden="true" />
              <p className="admin-empty-title text-sm font-extrabold">Nenhum item cadastrado</p>
              <p className="mt-1 text-xs">Use o botão “Cadastrar Serviço” para criar o primeiro registro.</p>
            </div>
          ) : (
            portfolios.map((item) => {
              const isConfirmingDelete = deleteConfirmationId === item.id;
              
              return (
                <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <img 
                      src={item.img} 
                      alt={item.title} 
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">{item.title}</h4>
                      
                      {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-normal">
                          {item.description}
                        </p>
                      )}
                      
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[#002E5C] bg-[#E6F5FC] border border-[#0096D6]/30 px-2 py-0.5 rounded-full inline-block">
                        {item.category === 'instalacao' && 'Instalação'}
                        {item.category === 'manutencao' && 'Manutenção'}
                        {item.category === 'higienizacao' && 'Higienização'}
                        {item.category === 'comercial' && 'Comercial'}
                        {!['instalacao', 'manutencao', 'higienizacao', 'comercial'].includes(item.category) && item.category}
                      </span>
                    </div>
                  </div>

                  {/* Actions / Delete Confirmation Box */}
                  <div className="shrink-0 flex items-center gap-2">
                    {isConfirmingDelete ? (
                      <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex items-center gap-2.5 text-xs">
                        <span className="font-extrabold text-rose-800">Confirmar exclusão?</span>
                        <button 
                          onClick={() => handleDeletePortfolio(item.id)}
                          disabled={deletingPortfolioId === item.id}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase cursor-pointer"
                        >
                          {deletingPortfolioId === item.id ? 'Excluindo...' : 'Sim, Excluir'}
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmationId(null)}
                          disabled={deletingPortfolioId === item.id}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase cursor-pointer"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-2.5 text-slate-500 hover:text-slate-950 hover:bg-slate-100 border border-slate-200/50 rounded-xl transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmationId(item.id)}
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
