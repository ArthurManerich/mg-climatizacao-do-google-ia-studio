import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  useEffect(() => {
    let active = true;
    let validating = false;
    let validationId = 0;

    const checkAuth = async (hideProtectedContent = true) => {
      if (validating) return;
      validating = true;
      const currentValidationId = ++validationId;
      if (hideProtectedContent) setStatus('loading');

      try {
        const { data } = await authService.getCurrentAdmin();
        if (active && currentValidationId === validationId) {
          setStatus(data.isAdmin ? 'authorized' : 'unauthorized');
        }
      } catch {
        if (active && currentValidationId === validationId) setStatus('unauthorized');
      } finally {
        validating = false;
      }
    };

    void checkAuth();

    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === 'SIGNED_OUT' || !session) {
        validationId += 1;
        setStatus('unauthorized');
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
        void checkAuth(false);
      }
    });

    const unsubscribeAuthorizationFailure = authService.onAdminAuthorizationFailure(() => {
      if (!active) return;
      void checkAuth(false);
    });

    const revalidateOnFocus = () => void checkAuth(false);
    const revalidateWhenVisible = () => {
      if (document.visibilityState === 'visible') void checkAuth(false);
    };
    window.addEventListener('focus', revalidateOnFocus);
    document.addEventListener('visibilitychange', revalidateWhenVisible);

    return () => {
      active = false;
      validationId += 1;
      subscription.unsubscribe();
      unsubscribeAuthorizationFailure();
      window.removeEventListener('focus', revalidateOnFocus);
      document.removeEventListener('visibilitychange', revalidateWhenVisible);
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center" id="protected-route-loading">
        <Loader2 className="w-8 h-8 text-[#0096D6] animate-spin" />
        <p className="mt-3 text-sm text-[#475569] font-medium">Verificando permissões...</p>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
