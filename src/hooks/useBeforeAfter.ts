import React, { useState, useRef, useEffect } from 'react';
import { compressImage, safeStorage } from '../utils/imageCompressor';
import { IMAGES } from '../config';

export function useBeforeAfter() {
  const [state, setState] = useState(() => {
    const savedBefore = safeStorage.getItem("mgclimatizacao_before_img");
    const savedAfter = safeStorage.getItem("mgclimatizacao_after_img");
    const savedTitle = safeStorage.getItem("mgclimatizacao_before_after_title");
    const savedDesc = safeStorage.getItem("mgclimatizacao_before_after_desc");
    return {
      customBeforeImg: savedBefore || IMAGES.before,
      customAfterImg: savedAfter || IMAGES.after,
      customTitle: savedTitle || "Instalação Split — MG Climatização",
      customDesc: savedDesc || "Exemplo interativo de antes e depois. Você pode carregar as fotos reais do seu serviço abaixo!",
      sliderPosition: 50,
      isDragging: false
    };
  });

  const sliderContainerRef = useRef<HTMLDivElement>(null);

  const setCustomBeforeImg = (img: string) => setState(prev => ({ ...prev, customBeforeImg: img }));
  const setCustomAfterImg = (img: string) => setState(prev => ({ ...prev, customAfterImg: img }));
  const setCustomTitle = (title: string) => setState(prev => ({ ...prev, customTitle: title }));
  const setCustomDesc = (desc: string) => setState(prev => ({ ...prev, customDesc: desc }));
  const setSliderPosition = (pos: number) => setState(prev => ({ ...prev, sliderPosition: pos }));
  const setIsDragging = (dragging: boolean) => setState(prev => ({ ...prev, isDragging: dragging }));

  useEffect(() => {
    if (state.customBeforeImg && !state.customBeforeImg.startsWith('http')) {
      safeStorage.setItem("mgclimatizacao_before_img", state.customBeforeImg);
    }
  }, [state.customBeforeImg]);

  useEffect(() => {
    if (state.customAfterImg && !state.customAfterImg.startsWith('http')) {
      safeStorage.setItem("mgclimatizacao_after_img", state.customAfterImg);
    }
  }, [state.customAfterImg]);

  useEffect(() => {
    if (state.customTitle) {
      safeStorage.setItem("mgclimatizacao_before_after_title", state.customTitle);
    }
  }, [state.customTitle]);

  useEffect(() => {
    if (state.customDesc) {
      safeStorage.setItem("mgclimatizacao_before_after_desc", state.customDesc);
    }
  }, [state.customDesc]);

  const handleBeforeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.7);
        setCustomBeforeImg(compressed);
      } catch (err) {
        console.error("Erro ao processar imagem de antes:", err);
      }
    }
  };

  const handleAfterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.7);
        setCustomAfterImg(compressed);
      } catch (err) {
        console.error("Erro ao processar imagem de depois:", err);
      }
    }
  };

  const handleMove = (clientX: number) => {
    const container = sliderContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  // Bind mouse/touch down listeners on the container element
  useEffect(() => {
    const container = sliderContainerRef.current;
    if (!container) return;

    const handleStart = (e: MouseEvent | TouchEvent) => {
      setIsDragging(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      handleMove(clientX);
    };

    container.addEventListener('mousedown', handleStart);
    container.addEventListener('touchstart', handleStart, { passive: true });

    return () => {
      container.removeEventListener('mousedown', handleStart);
      container.removeEventListener('touchstart', handleStart);
    };
  }, [sliderContainerRef.current]);

  // Bind move & up listeners globally when dragging
  useEffect(() => {
    if (!state.isDragging) return;

    const handleUpdate = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      handleMove(clientX);
    };

    const handleStop = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleUpdate);
    window.addEventListener('touchmove', handleUpdate, { passive: true });
    window.addEventListener('mouseup', handleStop);
    window.addEventListener('touchend', handleStop);

    return () => {
      window.removeEventListener('mousemove', handleUpdate);
      window.removeEventListener('touchmove', handleUpdate);
      window.removeEventListener('mouseup', handleStop);
      window.removeEventListener('touchend', handleStop);
    };
  }, [state.isDragging]);

  return {
    customBeforeImg: state.customBeforeImg,
    setCustomBeforeImg,
    customAfterImg: state.customAfterImg,
    setCustomAfterImg,
    customTitle: state.customTitle,
    setCustomTitle,
    customDesc: state.customDesc,
    setCustomDesc,
    sliderPosition: state.sliderPosition,
    setSliderPosition,
    isDragging: state.isDragging,
    setIsDragging,
    sliderContainerRef,
    handleBeforeUpload,
    handleAfterUpload
  };
}

