import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toRutubeEmbed } from '@/lib/productParams';

type Props = {
  url: string | null;
  title?: string;
  onClose: () => void;
};

const VideoModal = ({ url, title, onClose }: Props) => {
  const embed = url ? toRutubeEmbed(url) : '';
  return (
    <Dialog open={!!url} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
        {embed && (
          <div className="aspect-video w-full">
            <iframe
              src={embed}
              title={title || 'Видео'}
              className="w-full h-full"
              frameBorder={0}
              allow="clipboard-write; autoplay"
              allowFullScreen
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
