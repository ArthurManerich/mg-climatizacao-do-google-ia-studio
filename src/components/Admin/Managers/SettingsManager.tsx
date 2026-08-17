import React from 'react';
import { Shield, Phone, Layers, CheckCircle2, AlertCircle, Upload, MessageCircle } from 'lucide-react';

interface SettingsManagerProps {
  companyName: string;
  companyEmail: string;
  companyLogo: string;
  companyPhone: string;
  companyWhatsapp: string;
  companyWhatsappMessage: string;
  companyAddress: string;
  companyInstagram: string;
  companyFacebook: string;
  settingsSaving: boolean;
  logoUploadLoading: boolean;
  logoUploadProgress?: number;
  settingsMessage: { type: 'success' | 'error'; text: string } | null;
  pendingLogoUrls: string[];
  setCompanyName: (val: string) => void;
  setCompanyEmail: (val: string) => void;
  setCompanyLogo: (val: string) => void;
  setCompanyPhone: (val: string) => void;
  setCompanyWhatsapp: (val: string) => void;
  setCompanyWhatsappMessage: (val: string) => void;
  setCompanyAddress: (val: string) => void;
  setCompanyInstagram: (val: string) => void;
  setCompanyFacebook: (val: string) => void;
  handleSaveSettings: (e: React.FormEvent) => void;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCancelLogoChange: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  companyName,
  companyEmail,
  companyLogo,
  companyPhone,
  companyWhatsapp,
  companyWhatsappMessage,
  companyAddress,
  companyInstagram,
  companyFacebook,
  settingsSaving,
  logoUploadLoading,
  logoUploadProgress = 0,
  settingsMessage,
  pendingLogoUrls,
  setCompanyName,
  setCompanyEmail,
  setCompanyLogo,
  setCompanyPhone,
  setCompanyWhatsapp,
  setCompanyWhatsappMessage,
  setCompanyAddress,
  setCompanyInstagram,
  setCompanyFacebook,
  handleSaveSettings,
  handleLogoUpload,
  handleCancelLogoChange
}) => {
  return (
    <div className="admin-manager space-y-6" id="view-settings">
      <div>
        <h2 className="text-xl font-extrabold font-display text-slate-900">Configurações do Sistema</h2>
        <p className="text-xs text-slate-500">Gerencie as informações gerais da empresa, contatos, WhatsApp, redes sociais e logotipo exibidos no site.</p>
      </div>

      {settingsMessage && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-xs font-semibold ${
          settingsMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
            : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          <AlertCircle className={`w-5 h-5 shrink-0 ${settingsMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`} />
          <div>{settingsMessage.text}</div>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* CARD 1: IDENTIDADE DA EMPRESA & LOGO */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-[#E6F5FC] text-[#002E5C] flex items-center justify-center font-bold text-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#002E5C] uppercase tracking-wider">Identidade & Logotipo</h3>
              <p className="text-[11px] text-slate-400">Personalize o nome da sua empresa e a identidade visual principal.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Nome da Empresa e Email */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nome da Empresa</label>
                <input 
                  type="text" 
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-[#0096D6] focus:bg-white rounded-xl px-4 py-3 text-xs font-bold text-slate-800 transition-all focus:outline-none"
                  placeholder="mgclimatizacao"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email de Contato</label>
                <input 
                  type="email" 
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-[#0096D6] focus:bg-white rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 transition-all focus:outline-none"
                  placeholder="contato@mgclimatizacao.com.br"
                />
              </div>
            </div>

            {/* Logo Upload Box */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 text-center self-start w-full">Logotipo</label>
              
              {companyLogo ? (
                <div className="relative w-24 h-24 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 mb-2 group/logo overflow-hidden">
                  <img 
                    src={companyLogo} 
                    alt="Logotipo" 
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      type="button"
                      onClick={pendingLogoUrls.length > 0 ? handleCancelLogoChange : () => setCompanyLogo('')}
                      className="bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm cursor-pointer"
                    >
                      {pendingLogoUrls.length > 0 ? 'Cancelar' : 'Remover'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-100/50 mb-2">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Vazio</span>
                </div>
              )}

              <div className="relative w-full flex flex-col items-center">
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp" 
                  onChange={handleLogoUpload}
                  className="hidden" 
                  id="settings-logo-upload"
                  disabled={logoUploadLoading}
                />
                <label 
                  htmlFor="settings-logo-upload"
                  className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase shadow-sm cursor-pointer transition-all"
                >
                  {logoUploadLoading ? `Enviando (${logoUploadProgress}%)` : 'Fazer Upload'}
                </label>
                
                {logoUploadLoading && (
                  <div className="w-full mt-2 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-[#0096D6] h-full transition-all duration-200 rounded-full"
                      style={{ width: `${logoUploadProgress}%` }}
                    />
                  </div>
                )}
                <span className="text-[9px] text-slate-400 mt-1">JPG, PNG, WebP (Máx. 5MB)</span>
              </div>
            </div>

          </div>
        </div>

        {/* CARD 2: WHATSAPP & ATENDIMENTO */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Atendimento & WhatsApp</h3>
              <p className="text-[11px] text-slate-400">Configure o número de celular e a mensagem pré-definida de contato.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Número do WhatsApp (Código do País + DDD + Número)</label>
              <input 
                type="text" 
                required
                value={companyWhatsapp}
                onChange={(e) => setCompanyWhatsapp(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-[#0096D6] focus:bg-white rounded-xl px-4 py-3 text-xs font-mono font-bold text-slate-800 transition-all focus:outline-none"
                placeholder="5547997464218"
              />
              <p className="text-[9px] text-slate-400 mt-1">Exemplo: 55 (Brasil) + 47 (Gaspar/Blumenau) + 997464218.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Telefone de Exibição / Comercial</label>
              <input 
                type="text" 
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-[#0096D6] focus:bg-white rounded-xl px-4 py-3 text-xs font-bold text-slate-800 transition-all focus:outline-none"
                placeholder="(47) 99746-4218"
              />
              <p className="text-[9px] text-slate-400 mt-1">Formato livre de telefone que aparecerá no cabeçalho ou rodapé.</p>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Mensagem Inicial Padrão</label>
            <textarea 
              rows={3}
              value={companyWhatsappMessage}
              onChange={(e) => setCompanyWhatsappMessage(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 focus:border-[#0096D6] focus:bg-white rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 transition-all focus:outline-none resize-none"
              placeholder="Olá! Gostaria de solicitar um orçamento para climatização."
            />
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">Geração de Leads</h4>
              <p className="text-[11px] text-emerald-900/80 mt-1 leading-relaxed">
                Todos os botões de contato, simulações de orçamento final e solicitações rápidas na página principal geram automaticamente um link dinâmico codificado para o número configurado acima. Isso garante conversão imediata de visitas para mensagens em seu celular!
              </p>
            </div>
          </div>
        </div>

        {/* CARD 3: LOCALIZAÇÃO & REDES SOCIAIS */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-[#E6F5FC] text-[#002E5C] flex items-center justify-center font-bold text-sm">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#002E5C] uppercase tracking-wider">Localização & Presença Digital</h3>
              <p className="text-[11px] text-slate-400">Configure o endereço físico e links para redes sociais para aumentar sua credibilidade.</p>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Endereço Comercial</label>
            <input 
              type="text" 
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 focus:border-[#0096D6] focus:bg-white rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
              placeholder="Blumenau, SC - Atendemos toda a região"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Perfil do Instagram (URL completa)</label>
              <input 
                type="url" 
                value={companyInstagram}
                onChange={(e) => setCompanyInstagram(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-[#0096D6] focus:bg-white rounded-xl px-4 py-3 text-xs font-medium text-slate-700 transition-all focus:outline-none"
                placeholder="https://instagram.com/seu-perfil"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Página do Facebook (URL completa)</label>
              <input 
                type="url" 
                value={companyFacebook}
                onChange={(e) => setCompanyFacebook(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-[#0096D6] focus:bg-white rounded-xl px-4 py-3 text-xs font-medium text-slate-700 transition-all focus:outline-none"
                placeholder="https://facebook.com/sua-pagina"
              />
            </div>
          </div>
        </div>

        {/* ACTIONS BAR */}
        <div className="flex justify-end gap-3 bg-slate-100 p-4 rounded-2xl border border-slate-200/60 shadow-inner">
          <button 
            type="submit"
            disabled={settingsSaving}
            className="bg-[#002E5C] hover:bg-[#001E3D] disabled:bg-slate-600 text-white font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center gap-2 transition-all"
          >
            {settingsSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#0096D6]" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
