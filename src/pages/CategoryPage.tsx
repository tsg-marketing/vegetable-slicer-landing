import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import useSeo from '@/hooks/useSeo';
import ProductCard, { type Product } from '@/components/ProductCard';
import { categorySlug } from '@/lib/slug';
import func2url from '../../backend/func2url.json';

const CategoryPage = () => {
  const { categorySlug: catSlug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedEquipmentImage, setSelectedEquipmentImage] = useState('');
  const [quickForm, setQuickForm] = useState({ name: '', phone: '+7' });

  useEffect(() => {
    fetch(func2url.catalog)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data.items) ? data.items : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const categoryProducts = useMemo(
    () =>
      products.filter(
        (p) => categorySlug(p.category_name || '', p.category_id) === catSlug
      ),
    [products, catSlug]
  );

  const categoryName = categoryProducts[0]?.category_name || 'Каталог оборудования';

  const canonicalUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/category/${catSlug}`
      : '';

  useSeo({
    title: `${categoryName} — купить со скидкой 5% | Техно-Сиб`,
    description: `${categoryName}: ${categoryProducts.length} моделей оборудования DARIBO для мясного производства. Акция — скидка 5% от розничной цены, бесплатная доставка.`,
    url: canonicalUrl,
    image: categoryProducts[0]?.pictures?.[0],
    jsonLd: categoryProducts.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: categoryName,
          numberOfItems: categoryProducts.length,
          itemListElement: categoryProducts.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.name,
          })),
        }
      : null,
  });

  const handlePhoneChange = (value: string) => {
    let phone = value;
    if (!phone.startsWith('+7')) phone = '+7';
    const digits = phone.slice(2).replace(/\D/g, '');
    if (digits.length <= 10) phone = '+7' + digits;
    setQuickForm({ ...quickForm, phone });
  };

  const openQuickForm = (equipmentName: string, equipmentImage?: string) => {
    setSelectedEquipment(equipmentName);
    setSelectedEquipmentImage(equipmentImage || '');
    setIsDialogOpen(true);
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = quickForm.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 11) {
      toast({ title: 'Ошибка', description: 'Телефон должен содержать 11 цифр', variant: 'destructive' });
      return;
    }
    try {
      const response = await fetch('/api/b24-send-lead.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: quickForm.name,
          phone: quickForm.phone,
          equipment: selectedEquipment,
          equipment_name: selectedEquipment,
          model: selectedEquipment,
          equipment_image: selectedEquipmentImage,
          comment: `Интересует модель: ${selectedEquipment}`,
          form_type: 'category_page',
          timestamp: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Network error');
      toast({ title: 'Заявка отправлена!', description: `Мы свяжемся с вами по вопросу: ${selectedEquipment}` });
      setQuickForm({ name: '', phone: '+7' });
      setIsDialogOpen(false);
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось отправить заявку. Попробуйте позже.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <img src="https://cdn.poehali.dev/files/360a80ca-f911-4f02-94ff-c2728b707994.jpg" alt="ТехноСиб" className="h-8 sm:h-10" />
          </Link>
          <a href="tel:88005110977" className="flex items-center gap-2 text-base sm:text-lg font-bold text-primary">
            <Icon name="Phone" size={20} />
            <span className="hidden sm:inline">8-800-511-09-77</span>
          </a>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Link to="/" className="hover:text-primary">Главная</Link>
          <Icon name="ChevronRight" size={14} />
          <Link to="/#equipment" className="hover:text-primary">Каталог</Link>
          <Icon name="ChevronRight" size={14} />
          <span className="text-foreground font-medium">{categoryName}</span>
        </nav>
      </div>

      <main className="container mx-auto px-4 pb-16">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2">{categoryName}</h1>
        {!loading && (
          <p className="text-muted-foreground mb-8">Найдено моделей: {categoryProducts.length}</p>
        )}

        {loading ? (
          <p className="text-center text-muted-foreground py-12">Загружаем товары...</p>
        ) : categoryProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">В этой категории пока нет товаров.</p>
            <Button onClick={() => navigate('/#equipment')}>Вернуться в каталог</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...categoryProducts]
              .sort((a, b) => (a.price || 0) - (b.price || 0))
              .map((item) => (
                <ProductCard key={item.offer_id} product={item} onRequest={openQuickForm} />
              ))}
          </div>
        )}

        <div className="mt-12">
          <Button variant="outline" onClick={() => navigate('/#equipment')}>
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Назад в каталог
          </Button>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Получить предложение</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">{selectedEquipment}</p>
          <form onSubmit={handleQuickSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cq-name">Ваше имя</Label>
              <Input
                id="cq-name"
                value={quickForm.name}
                onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                placeholder="Иван"
                required
              />
            </div>
            <div>
              <Label htmlFor="cq-phone">Телефон</Label>
              <Input
                id="cq-phone"
                value={quickForm.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+7XXXXXXXXXX"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6 font-semibold">
              Получить КП со скидкой 5%
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryPage;
