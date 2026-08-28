import { supabase, hasSupabaseConfig } from '../lib/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import {
  notifyAdminAuthorizationFailure,
  subscribeAdminAuthorizationFailure,
} from './adminAuthEvents';

const configurationError = () => new Error(
  'O acesso administrativo está indisponível. Configure as credenciais do Supabase para continuar.'
);

export const authService = {
  /**
   * Realiza o login usando exclusivamente o Supabase Auth.
   */
  async signIn(email: string, password: string) {
    if (!hasSupabaseConfig()) {
      return {
        data: { user: null, session: null },
        error: configurationError(),
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  },

  /**
   * Encerra a sessão atual.
   */
  async signOut() {
    if (!hasSupabaseConfig()) {
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Obtém o usuário autenticado, sem conceder permissões administrativas.
   */
  async getCurrentUser() {
    if (!hasSupabaseConfig()) {
      return { data: { user: null }, error: configurationError() };
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    return { data: { user }, error };
  },

  /**
   * Verifica se o usuário autenticado está na tabela public.admin_users.
   * A permissão RLS do banco é a fonte única de verdade.
   */
  async getCurrentAdmin() {
    const currentUser = await this.getCurrentUser();
    const user = currentUser.data.user;

    if (currentUser.error || !user || !hasSupabaseConfig()) {
      return {
        data: { user: null, isAdmin: false },
        error: currentUser.error,
      };
    }

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    const isAdmin = Boolean(!error && admin && admin.user_id === user.id);
    const safeError = error
      ? new Error('Não foi possível confirmar a permissão administrativa. Tente novamente.')
      : null;

    return {
      data: { user, isAdmin },
      error: safeError,
    };
  },

  /**
   * Escuta mudanças de sessão do Supabase.
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    if (!hasSupabaseConfig()) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    return supabase.auth.onAuthStateChange(callback);
  },

  invalidateAdminAuthorization() {
    notifyAdminAuthorizationFailure(401);
  },

  onAdminAuthorizationFailure(callback: () => void) {
    return subscribeAdminAuthorizationFailure(callback);
  },
};
