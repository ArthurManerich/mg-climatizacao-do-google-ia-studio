import React from 'react';
import { Plus, Upload, Edit, Trash2 } from 'lucide-react';
import { BeforeAfterItem } from '../../../types';

interface BeforeAfterManagerProps {
  beforeAfters: BeforeAfterItem[];
  isBeforeAfterFormOpen: boolean;
  beforeAfterFormMode: 'create' | 'edit';
  editingBeforeAfterId: number | null;
  beforeAfterTitle: string;
  beforeAfterDescription: string;
  beforeAfterCategory: string;
  beforeAfterBeforeImg: string;
  beforeAfterAfterImg: string;
  beforeAfterSaving: boolean;
  beforeAfterBeforeUploadLoading: boolean;
  beforeAfterBeforeProgress?: number;
  beforeAfterAfterUploadLoading: boolean;
  beforeAfterAfterProgress?: number;
  beforeAfterMessage: { type: 'success' | 'error'; text: string } | null;
  deleteBeforeAfterConfirmationId: number | null;
  deletingBeforeAfterId: number | null;
  setIsBeforeAfterFormOpen: (open: boolean) => void;
  setEditingBeforeAfterId: (id: number | null) => void;
  setBeforeAfterTitle: (val: string) => void;
  setBeforeAfterDescription: (val: string) => void;
  setBeforeAfterCategory: (val: string) => void;
  setBeforeAfterMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  setDeleteBeforeAfterConfirmationId: (id: number | null) => void;
  handleOpenBeforeAfterCreateForm: () => void;
  handleStartBeforeAfterEdit: (item: BeforeAfterItem) => void;
  handleSaveBeforeAfter: (e: React.FormEvent) => void;
  handleDeleteBeforeAfter: (id: number) => void;
  handleBeforeImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAfterImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCancelBeforeAfterForm: () => void;
}

export const BeforeAfterManager: React.FC<BeforeAfterManagerProps> = ({
  beforeAfters,
  isBeforeAfterFormOpen,
  beforeAfterFormMode,
  beforeAfterTitle,
  beforeAfterDescription,
  beforeAfterCategory,
  beforeAfterBeforeImg,
  beforeAfterAfterImg,
  beforeAfterSaving,
  beforeAfterBeforeUploadLoading,
  beforeAfterBeforeProgress = 0,
  beforeAfterAfterUploadLoading,
  beforeAfterAfterProgress = 0,
  beforeAfterMessage,
  deleteBeforeAfterConfirmationId,
  deletingBeforeAfterId,
  setIsBeforeAfterFormOpen,
  setEditingBeforeAfterId,
  setBeforeAfterTitle,
  setBeforeAfterDescription,
  setBeforeAfterCategory,
  setBeforeAfterMessage,
  setDeleteBeforeAfterConfirmationId,
  handleOpenBeforeAfterCreateForm,
  handleStartBeforeAfterEdit,
  handleSaveBeforeAfter,
  handleDeleteBeforeAfter,
  handleBeforeImageUpload,
  handleAfterImageUpload,
  handleCancelBeforeAfterForm
}) => {
  return (
    <div className="admin-manager space-y-6" id="view-before_after">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold font-display text-slate-900">Comparativos Antes & Depois</h2>
          <p className="text-xs text-slate-500">Visualização de transformações de instalações e higienizações de ar-condicionado.</p>
        </div>
        
        {!isBeforeAfterFormOpen && (
          <button
            onClick={handleOpenBeforeAfterCreateForm}
            className="inline-flex items-center gap-1.5 bg-[#0096D6] hover:bg-[#0082BA] text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border border-[#0096D6] shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Comparativo
          </button>
        )}
      </div>

      {/* Feedback Messages Banner */}
      {beforeAfterMessage && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-bold ${
          beforeAfterMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{beforeAfterMessage.text}</span>
          <button 
            onClick={() => setBeforeAfterMessage(null)} 
            className="text-[10px] uppercase tracking-wider underline hover:text-slate-900 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Expandable Form */}
      {isBeforeAfterFormOpen && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-[#002E5C] uppercase tracking-wider">
              {beforeAfterFormMode === 'create' ? '✨ Adicionar Novo Comparativo' : '✏️ Editar Comparativo'}
            </h3>
            <button 
              onClick={handleCancelBeforeAfterForm}
              className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSaveBeforeAfter} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Título */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Título do Comparativo</label>
                <input 
                  type="text" 
                  placeholder="Ex: Higienização Completa de Ar-Condicionado ou Instalação Split"
                  value={beforeAfterTitle}
                  onChange={(e) => setBeforeAfterTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0096D6]"
                  required
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Categoria</label>
                <select 
                  value={beforeAfterCategory}
                  onChange={(e) => setBeforeAfterCategory(e.target.value)}
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
                placeholder="Ex: Aparelho com mofo e sujeira acumulada limpo e sanificado com turbina higienizada."
                value={beforeAfterDescription}
                onChange={(e) => setBeforeAfterDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0096D6] resize-none"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-2">
              {/* Imagem Antes */}
              <div className="space-y-3">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-red-500">Foto "Antes"</label>
                <div className="flex flex-col gap-3">
                  <label className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer transition-all relative overflow-hidden">
                    {beforeAfterBeforeUploadLoading ? (
                      <div className="flex flex-col items-center gap-1.5 w-full px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] font-bold text-slate-700">Enviando Antes ({beforeAfterBeforeProgress}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-red-500 h-full transition-all duration-200 rounded-full"
                            style={{ width: `${beforeAfterBeforeProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <Upload className="w-5 h-5 text-red-400" />
                        <span className="text-[10px] font-bold text-slate-700">Enviar Foto de Antes</span>
                        <span className="text-[9px] text-slate-400">JPG, PNG, WebP (Máx. 5MB)</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp" 
                      onChange={handleBeforeImageUpload} 
                      disabled={beforeAfterBeforeUploadLoading}
                      className="hidden" 
                    />
                  </label>

                  {beforeAfterBeforeImg && (
                    <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                      <img 
                        src={beforeAfterBeforeImg} 
                        alt="Antes" 
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200" 
                        referrerPolicy="no-referrer"
                      />
                      <input 
                        type="text" 
                        readOnly 
                        value={beforeAfterBeforeImg} 
                        className="flex-1 bg-transparent border-none text-[9px] font-mono text-slate-500 truncate focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Imagem Depois */}
              <div className="space-y-3">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Foto "Depois"</label>
                <div className="flex flex-col gap-3">
                  <label className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer transition-all relative overflow-hidden">
                    {beforeAfterAfterUploadLoading ? (
                      <div className="flex flex-col items-center gap-1.5 w-full px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] font-bold text-slate-700">Enviando Depois ({beforeAfterAfterProgress}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full transition-all duration-200 rounded-full"
                            style={{ width: `${beforeAfterAfterProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <Upload className="w-5 h-5 text-emerald-400" />
                        <span className="text-[10px] font-bold text-slate-700">Enviar Foto de Depois</span>
                        <span className="text-[9px] text-slate-400">JPG, PNG, WebP (Máx. 5MB)</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp" 
                      onChange={handleAfterImageUpload} 
                      disabled={beforeAfterAfterUploadLoading}
                      className="hidden" 
                    />
                  </label>

                  {beforeAfterAfterImg && (
                    <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                      <img 
                        src={beforeAfterAfterImg} 
                        alt="Depois" 
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200" 
                        referrerPolicy="no-referrer"
                      />
                      <input 
                        type="text" 
                        readOnly 
                        value={beforeAfterAfterImg} 
                        className="flex-1 bg-transparent border-none text-[9px] font-mono text-slate-500 truncate focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="submit"
                disabled={beforeAfterSaving || beforeAfterBeforeUploadLoading || beforeAfterAfterUploadLoading}
                className="bg-[#0096D6] hover:bg-[#0082BA] disabled:bg-slate-300 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider border border-[#0096D6] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                {beforeAfterSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <span>Salvar Comparativo</span>
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
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lista de Comparativos ({beforeAfters.length})</span>
          <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Ações Permitidas</span>
        </div>
        <div className="divide-y divide-slate-100">
          {beforeAfters.length === 0 ? (
            <div className="admin-empty-state p-8 text-center text-slate-400 text-xs font-semibold">
              <p className="admin-empty-title text-sm font-extrabold">Nenhum comparativo cadastrado</p>
              <p className="mt-1 text-xs">Use o botão “Novo Comparativo” para adicionar o primeiro resultado.</p>
            </div>
          ) : (
            beforeAfters.map((item) => {
              const isConfirmingDelete = deleteBeforeAfterConfirmationId === item.id;
              
              return (
                <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 min-w-0 flex-1">
                    {/* Pictures */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-center relative">
                        <img 
                          src={item.before_img} 
                          alt="Antes" 
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200" 
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[8px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-150 px-1.5 py-0.5 rounded-full absolute -bottom-1 -left-1">Antes</span>
                      </div>
                      <div className="text-center relative">
                        <img 
                          src={item.after_img} 
                          alt="Depois" 
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200" 
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-150 px-1.5 py-0.5 rounded-full absolute -bottom-1 -right-1">Depois</span>
                      </div>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">{item.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-normal">{item.description}</p>
                      
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[#002E5C] bg-[#E6F5FC] border border-[#0096D6]/30 px-2 py-0.5 rounded-full inline-block">
                        {item.category === 'instalacao' && 'Instalação'}
                        {item.category === 'manutencao' && 'Manutenção'}
                        {item.category === 'higienizacao' && 'Higienização'}
                        {item.category === 'comercial' && 'Comercial'}
                        {!item.category && 'Instalação'}
                        {item.category && !['instalacao', 'manutencao', 'higienizacao', 'comercial'].includes(item.category) && item.category}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isConfirmingDelete ? (
                      <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex items-center gap-2.5 text-xs">
                        <span className="font-extrabold text-rose-800">Excluir comparativo?</span>
                        <button 
                          onClick={() => handleDeleteBeforeAfter(item.id)}
                          disabled={deletingBeforeAfterId === item.id}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase cursor-pointer"
                        >
                          {deletingBeforeAfterId === item.id ? 'Excluindo...' : 'Sim, Excluir'}
                        </button>
                        <button 
                          onClick={() => setDeleteBeforeAfterConfirmationId(null)}
                          disabled={deletingBeforeAfterId === item.id}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase cursor-pointer"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
                        <button
                          onClick={() => handleStartBeforeAfterEdit(item)}
                          className="p-2.5 text-slate-500 hover:text-slate-950 hover:bg-slate-100 border border-slate-200/50 rounded-xl transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteBeforeAfterConfirmationId(item.id)}
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
