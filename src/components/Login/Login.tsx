import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { hasSupabaseConfig } from '../../lib/supabase';
import { Lock, Mail, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Redirect only users explicitly registered as administrators.
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await authService.getCurrentAdmin();
      if (data.isAdmin) {
        navigate('/admin');
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasSupabaseConfig()) {
      setError('O acesso administrativo está indisponível. Configure o Supabase para continuar.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await authService.signIn(email, password);
      
      if (authError) {
        setError(authError.message || 'Erro ao realizar login.');
      } else if (data.user) {
        const { data: adminData, error: adminError } = await authService.getCurrentAdmin();

        if (adminError) {
          await authService.signOut();
          setError('Não foi possível verificar suas permissões. Tente novamente.');
        } else if (!adminData.isAdmin) {
          await authService.signOut();
          setError('Esta conta não possui permissão para acessar o painel administrativo.');
        } else {
          navigate('/admin');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-[#0096D6] selection:text-white">
      {/* Back button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#002E5C] hover:text-[#0096D6] transition-colors bg-white px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full border border-slate-200/80 shadow-sm min-h-[40px]"
          id="back-to-site-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao site</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md pt-12 sm:pt-0">
        <div className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#002E5C] bg-[#E6F5FC] px-3 py-1.5 rounded-full border border-[#0096D6]/30">
            Painel Administrativo
          </span>
          <h2 className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-extrabold text-[#002E5C] font-display">
            MG Climatização
          </h2>
          <p className="mt-2 text-xs text-[#475569] max-w-xs mx-auto">
            Acesse para gerenciar seu portfólio, serviços, antes & depois e depoimentos.
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white py-6 px-4 sm:py-8 sm:px-10 rounded-2xl sm:rounded-3xl border border-[#E2E8F0] shadow-sm"
        >
          <form className="space-y-4 sm:space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3.5 sm:p-4 rounded-xl" role="alert" id="login-error-alert">
                <p className="text-xs font-semibold text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#002E5C] mb-1.5">
                Endereço de E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0096D6] transition-colors min-h-[44px]"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#002E5C] mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-12 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0096D6] transition-colors min-h-[44px]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 min-w-[44px] justify-center"
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading || !hasSupabaseConfig()}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wide uppercase bg-[#0096D6] hover:bg-[#0082BA] text-white transition-colors cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0096D6] disabled:opacity-50 min-h-[48px]"
                id="login-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  'Entrar no Painel'
                )}
              </button>
            </div>
          </form>

          {!hasSupabaseConfig() && (
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#002E5C] bg-[#E6F5FC] px-2 py-1 rounded">
                Configuração necessária
              </span>
              <p className="mt-2 text-[11px] text-slate-500">
                Configure as variáveis do Supabase para liberar o acesso administrativo.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
