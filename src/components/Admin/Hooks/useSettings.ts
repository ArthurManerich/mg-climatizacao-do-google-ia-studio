import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { settingsService } from '../../../services/settingsService';
import { uploadService } from '../../../services/uploadService';
import type { CleanupResult } from '../../../services/mutationResult';
import { useUploads } from './useUploads';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function useSettings() {
  const [companyName, setCompanyName] = useState('mgclimatizacao');
  const [companyWhatsapp, setCompanyWhatsapp] = useState('5547997464218');
  const [companyWhatsappMessage, setCompanyWhatsappMessage] = useState('Olá, MG Climatização! Gostaria de solicitar um orçamento para climatização.');
  const [companyAddress, setCompanyAddress] = useState('Blumenau - SC');
  const [companyPhone, setCompanyPhone] = useState('(47) 99746-4218');
  const [companyEmail, setCompanyEmail] = useState('contato@mgclimatizacao.com.br');
  const [companyInstagram, setCompanyInstagram] = useState('https://instagram.com/mgclimatizacao');
  const [companyFacebook, setCompanyFacebook] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [confirmedLogoUrl, setConfirmedLogoUrl] = useState('');
  const confirmedLogoRef = useRef('');
  const [pendingLogoUrls, setPendingLogoUrls] = useState<string[]>([]);
  const pendingLogoUrlsRef = useRef<string[]>([]);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const settingsSavingRef = useRef(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { isUploading: logoUploadLoading, progress: logoUploadProgress, uploadImage } = useUploads();

  const updatePendingUrls = (urls: string[]) => {
    const uniqueUrls = [...new Set(urls)];
    pendingLogoUrlsRef.current = uniqueUrls;
    setPendingLogoUrls(uniqueUrls);
  };

  const cleanupUrls = async (urls: string[], preservedUrls: string[] = []): Promise<CleanupResult> => {
    const result: CleanupResult = { cleanedUrls: [], failedUrls: [], errors: [] };
    const uniqueUrls = [...new Set(urls)].filter(url => url && !preservedUrls.includes(url));

    for (const url of uniqueUrls) {
      try {
        await uploadService.deleteImage(url);
        result.cleanedUrls.push(url);
      } catch (error) {
        result.failedUrls.push(url);
        result.errors.push(`${url}: ${errorMessage(error)}`);
      }
    }

    const treatedUrls = new Set(result.cleanedUrls);
    updatePendingUrls(pendingLogoUrlsRef.current.filter(url => !treatedUrls.has(url)));
    return result;
  };

  const initializeCompanyLogo = (url: string) => {
    confirmedLogoRef.current = url;
    setConfirmedLogoUrl(url);
    setCompanyLogo(url);
    updatePendingUrls([]);
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSettingsMessage(null);
      const publicUrl = await uploadImage(file, 'company-logo');
      const previousPendingUrls = pendingLogoUrlsRef.current;
      updatePendingUrls([...previousPendingUrls, publicUrl]);
      setCompanyLogo(publicUrl);

      const cleanupResult = await cleanupUrls(previousPendingUrls, [publicUrl, confirmedLogoRef.current]);
      if (cleanupResult.errors.length > 0) {
        setSettingsMessage({
          type: 'error',
          text: `Novo logotipo pronto para salvar, mas uploads substituídos podem ter permanecido órfãos: ${cleanupResult.errors.join('; ')}`,
        });
      } else {
        setSettingsMessage({ type: 'success', text: 'Logotipo atualizado e pronto para salvar!' });
      }
    } catch (error) {
      setSettingsMessage({ type: 'error', text: errorMessage(error) || 'Falha no envio do logotipo.' });
    } finally {
      e.target.value = '';
    }
  };

  const handleCancelLogoChange = async () => {
    const cleanupResult = await cleanupUrls(pendingLogoUrlsRef.current, [confirmedLogoRef.current]);
    setCompanyLogo(confirmedLogoRef.current);

    if (cleanupResult.errors.length > 0) {
      setSettingsMessage({
        type: 'error',
        text: `Alteração cancelada, mas imagens podem ter permanecido órfãs: ${cleanupResult.errors.join('; ')}`,
      });
    } else {
      setSettingsMessage({ type: 'success', text: 'Alteração do logotipo cancelada.' });
    }
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (settingsSavingRef.current) return;
    settingsSavingRef.current = true;

    const oldConfirmedLogo = confirmedLogoRef.current;
    try {
      setSettingsSaving(true);
      setSettingsMessage(null);

      const compSettings = {
        company_name: companyName,
        whatsapp_number: companyWhatsapp,
        whatsapp_message: companyWhatsappMessage,
        address: companyAddress,
        phone: companyPhone,
        email: companyEmail,
        instagram: companyInstagram,
        facebook: companyFacebook,
        logo_url: companyLogo,
      };

      await settingsService.set('company_settings', compSettings);
      confirmedLogoRef.current = companyLogo;
      setConfirmedLogoUrl(companyLogo);
      updatePendingUrls(pendingLogoUrlsRef.current.filter(url => url !== companyLogo));

      const urlsToClean = [
        ...pendingLogoUrlsRef.current,
        ...(oldConfirmedLogo && oldConfirmedLogo !== companyLogo ? [oldConfirmedLogo] : []),
      ];
      const cleanupResult = await cleanupUrls(urlsToClean, [companyLogo]);

      if (cleanupResult.errors.length > 0) {
        setSettingsMessage({
          type: 'error',
          text: `Configurações salvas, mas imagens podem ter permanecido órfãs no Storage: ${cleanupResult.errors.join('; ')}`,
        });
      } else {
        setSettingsMessage({ type: 'success', text: 'Configurações salvas e atualizadas com sucesso em todo o site!' });
      }
    } catch (error) {
      const cleanupResult = await cleanupUrls(pendingLogoUrlsRef.current, [oldConfirmedLogo]);
      setCompanyLogo(oldConfirmedLogo);
      const cleanupWarning = cleanupResult.errors.length > 0
        ? ` Imagens novas podem ter permanecido órfãs: ${cleanupResult.errors.join('; ')}`
        : '';
      setSettingsMessage({
        type: 'error',
        text: `Falha ao salvar configurações: ${errorMessage(error)}.${cleanupWarning}`,
      });
    } finally {
      settingsSavingRef.current = false;
      setSettingsSaving(false);
    }
  };

  return {
    companyName, setCompanyName,
    companyWhatsapp, setCompanyWhatsapp,
    companyWhatsappMessage, setCompanyWhatsappMessage,
    companyAddress, setCompanyAddress,
    companyPhone, setCompanyPhone,
    companyEmail, setCompanyEmail,
    companyInstagram, setCompanyInstagram,
    companyFacebook, setCompanyFacebook,
    companyLogo, setCompanyLogo,
    confirmedLogoUrl,
    pendingLogoUrls,
    initializeCompanyLogo,
    settingsSaving,
    settingsMessage, setSettingsMessage,
    logoUploadLoading,
    logoUploadProgress,
    handleSaveSettings,
    handleLogoUpload,
    handleCancelLogoChange,
  };
}
