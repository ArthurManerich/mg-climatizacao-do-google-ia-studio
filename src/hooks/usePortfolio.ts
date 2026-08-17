import React, { useState, useEffect } from 'react';
import { Photo } from '../types';
import { portfolioService } from '../services/portfolioService';
import { compressImage } from '../utils/imageCompressor';
import { IMAGES } from '../config';

export function usePortfolio() {
  const [userPhotos, setUserPhotos] = useState<Photo[]>([]);
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [newPhotoCategory, setNewPhotoCategory] = useState("instalacao");
  const [newPhotoImg, setNewPhotoImg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load photos from unified service
  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await portfolioService.getAll();
      setUserPhotos(data);
    } catch (e: any) {
      console.warn("Erro ao carregar fotos do portfólio:", e);
      setError("Erro ao carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 600, 600, 0.7);
        setNewPhotoImg(compressed);
      } catch (err) {
        console.warn("Erro ao processar imagem do portfólio:", err);
      }
    }
  };

  const handleAddUserPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoTitle) return;
    
    const imgUrl = newPhotoImg || IMAGES.portfolioDefault;
    try {
      const newItem = await portfolioService.create({
        title: newPhotoTitle,
        category: newPhotoCategory,
        img: imgUrl
      });
      setUserPhotos(prev => [newItem, ...prev]);
      setNewPhotoTitle("");
      setNewPhotoImg("");
    } catch (err) {
      console.warn("Erro ao adicionar foto:", err);
    }
  };

  const handleRemovePhoto = async (id: number) => {
    try {
      await portfolioService.delete(id);
      setUserPhotos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.warn("Erro ao remover foto:", err);
    }
  };

  return {
    userPhotos,
    newPhotoTitle,
    setNewPhotoTitle,
    newPhotoCategory,
    setNewPhotoCategory,
    newPhotoImg,
    setNewPhotoImg,
    handlePortfolioUpload,
    handleAddUserPhoto,
    handleRemovePhoto,
    loading,
    error,
    reloadPhotos: loadPhotos
  };
}
