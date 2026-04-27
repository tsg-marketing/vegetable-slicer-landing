import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const SubscribeButton = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (window.location.hash === '#subscribe') setOpen(true);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    history.pushState(null, '', '#subscribe');
  };

  const handleClose = (next: boolean) => {
    setOpen(next);
    if (!next && window.location.hash === '#subscribe') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const value = email.trim();
    if (!value) {
      setError('Введите email');
      return;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value)) {
      setError('Введите корректный email');
      return;
    }

    setSubmitting(true);
    try {
      await fetch('/api/b24-send-lead.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: value,
          form_type: 'subscribe',
          comment: 'Подписка на рассылку',
          timestamp: new Date().toISOString(),
        }),
      });
      toast({
        title: 'Спасибо за подписку!',
        description: `Мы будем присылать самые выгодные предложения на ${value}`,
      });
      setEmail('');
      handleClose(false);
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось оформить подписку. Попробуйте позже.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition-colors shadow-lg"
      >
        <Icon name="Mail" size={18} />
        Подписаться на нас
      </button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[620px] bg-[#f7f7f7] rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 text-center leading-tight tracking-tight mb-3">
            Узнавайте первыми о скидках и новых предложениях
          </h2>
          <p className="text-base sm:text-lg text-gray-700 text-center max-w-[470px] mx-auto mb-6">
            Подпишитесь, чтобы получать самые выгодные предложения.
          </p>

          <form onSubmit={handleSubmit} className="max-w-[500px] mx-auto w-full">
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
              <div className="relative flex-1">
                <Icon
                  name="Mail"
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Введите ваш email"
                  required
                  className="h-[50px] pl-11 pr-4 bg-white border-gray-300 text-base"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="h-[50px] px-6 bg-[#2f97ff] hover:bg-[#2388eb] font-bold text-[15px] whitespace-nowrap"
              >
                {submitting ? 'Отправка...' : 'ПОДПИСАТЬСЯ'}
              </Button>
            </div>
            {error && (
              <p className="text-red-600 text-sm text-center mt-2.5 min-h-[18px]">{error}</p>
            )}
          </form>

          <p className="text-sm text-gray-600 text-center mt-5">
            Вы сможете отписаться в любой момент.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscribeButton;
