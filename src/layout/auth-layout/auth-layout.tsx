import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { useGetLoginOptions } from '@/modules/auth/hooks/use-auth';
import { useAuthState } from '@/state/client-middleware';
import { ExtensionBanner, LanguageSelector } from '@/components/core';

export const AuthLayout = () => {
  const { isLoading } = useGetLoginOptions();
  const navigate = useNavigate();
  const { isMounted, isAuthenticated } = useAuthState();

  useEffect(() => {
    if (isAuthenticated && !window.location.pathname.includes('/verify-mfa')) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isMounted || isLoading) return null;

  const renderAuthContent = () => {
    return <Outlet />;
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <ExtensionBanner />

      <div className="relative flex flex-1 items-center justify-center px-6 sm:px-12">
        {/* Language selector */}
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>

        {/* Centered auth content */}
        <div className="w-full max-w-xl">{renderAuthContent()}</div>
      </div>
    </div>
  );
};
