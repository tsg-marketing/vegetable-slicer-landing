import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';

type Props = {
  images: string[];
  startIndex: number;
  open: boolean;
  onClose: () => void;
  alt?: string;
};

const ImageLightbox = ({ images, startIndex, open, onClose, alt }: Props) => {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    if (open) setIndex(startIndex);
  }, [open, startIndex]);

  useEffect(() => {
    if (!open) return;
    const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
    const next = () => setIndex((i) => (i + 1) % images.length);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, images.length, onClose]);

  if (!open || images.length === 0) return null;

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => (i - 1 + images.length) % images.length);
  };
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => (i + 1) % images.length);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Закрыть"
      >
        <Icon name="X" size={28} />
      </button>

      {images.length > 1 && (
        <button
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors z-10"
          onClick={goPrev}
          aria-label="Предыдущее фото"
        >
          <Icon name="ChevronLeft" size={32} />
        </button>
      )}

      <div
        className="max-w-[95vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[index]}
          alt={`${alt || 'Фото'} ${index + 1}`}
          className="max-w-[95vw] max-h-[85vh] object-contain select-none"
        />
      </div>

      {images.length > 1 && (
        <button
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors z-10"
          onClick={goNext}
          aria-label="Следующее фото"
        >
          <Icon name="ChevronRight" size={32} />
        </button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-white/10 rounded-full px-3 py-1">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;
