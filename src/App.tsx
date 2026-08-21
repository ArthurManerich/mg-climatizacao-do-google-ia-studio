import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Services from './components/Services/Services';
import About from './components/About/About';
import BudgetSimulator from './components/BudgetSimulator/BudgetSimulator';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import FloatingWhatsApp from './components/WhatsAppButton/FloatingWhatsApp';
import AccessModeModal from './components/AccessSelector/AccessModeModal';
import { BudgetProvider } from './context/BudgetContext';
import { SettingsProvider } from './context/SettingsContext';
import { WhatsAppContactProvider } from './context/WhatsAppContactContext';

// Lazy loading core landing sections
const BeforeAfter = lazy(() => import('./components/BeforeAfter/BeforeAfter'));
const Portfolio = lazy(() => import('./components/Portfolio/Portfolio'));
const FAQ = lazy(() => import('./components/FAQ/FAQ'));

// Lazy loading admin and auth screens
const Login = lazy(() => import('./components/Login/Login'));
const ProtectedRoute = lazy(() => import('./components/Admin/ProtectedRoute'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));

const LoadingFallback = () => (
  <div className="py-20 flex justify-center items-center bg-white">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-[#0096D6] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-[#475569] font-medium">Carregando seção...</p>
    </div>
  </div>
);

const FullPageLoading = () => (
  <div className="min-h-screen bg-white flex flex-col justify-center items-center">
    <div className="w-12 h-12 border-4 border-[#0096D6] border-t-transparent rounded-full animate-spin" />
    <p className="mt-4 text-sm text-[#475569] font-semibold">Carregando MG Climatização...</p>
  </div>
);

function LandingPage() {
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#002E5C] selection:bg-[#0096D6]/20 selection:text-[#002E5C] relative">
      <Header onOpenAccessModal={() => setIsAccessModalOpen(true)} />
      <main>
        <Hero />
        <Services />
        <About />

        <BudgetSimulator />

        <Suspense fallback={<LoadingFallback />}>
          <BeforeAfter />
        </Suspense>

        <Suspense fallback={<LoadingFallback />}>
          <Portfolio />
        </Suspense>

        <Suspense fallback={<LoadingFallback />}>
          <FAQ />
        </Suspense>

        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />

      <AccessModeModal 
        isOpen={isAccessModalOpen} 
        onClose={() => setIsAccessModalOpen(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <WhatsAppContactProvider>
        <BudgetProvider>
        <BrowserRouter>
          <Suspense fallback={<FullPageLoading />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
        </BudgetProvider>
      </WhatsAppContactProvider>
    </SettingsProvider>
  );
}
