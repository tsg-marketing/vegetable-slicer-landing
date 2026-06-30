import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import ImageLightbox from '@/components/ImageLightbox';
import useSeo from '@/hooks/useSeo';
import VideoModal from '@/components/VideoModal';
import { categorySlug, productSlug } from '@/lib/slug';
import { isVideoParam, extractUrl } from '@/lib/productParams';
import { type Product } from '@/components/ProductCard';
import func2url from '../../backend/func2url.json';

const ProductPage = () => {
  const { categorySlug: catSlug, productSlug: prodSlug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '+7' });

  useEffect(() => {
    fetch(func2url.catalog)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data.items) ? data.items : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const product = useMemo(
    () => products.find((p) => productSlug(p.name, p.offer_id) === prodSlug),
    [products, prodSlug]
  );

  useEffect(() => {
    setActiveImage(0);
  }, [prodSlug]);

  const pictures = product?.pictures?.length ? product.pictures : [''];
  const discounted = product ? Math.round(product.price * 0.95) : 0;
  const saving = product ? Math.round(product.price * 0.05) : 0;

  const plainDescription = useMemo(() => {
    if (!product?.description) return '';
    return product.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }, [product]);

  const canonicalUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${catSlug}/${prodSlug}`
      : '';

  useSeo({
    title: product
      ? `${product.name} — купить со скидкой 5% | Техно-Сиб`
      : 'Товар каталога | Техно-Сиб',
    description: product
      ? `${product.name}${product.brand ? ` (${product.brand})` : ''}. ${
          plainDescription
            ? plainDescription.slice(0, 150)
            : 'Оборудование DARIBO для мясного производства'
        } Акция: скидка 5% от розничной цены.`
      : 'Каталог оборудования DARIBO для мясного производства со скидкой 5%.',
    image: pictures[0] || undefined,
    url: canonicalUrl,
    type: 'product',
    jsonLd: product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: product.pictures,
          description: plainDescription || product.name,
          brand: { '@type': 'Brand', name: product.brand || 'DARIBO' },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'RUB',
            price: discounted || product.price,
            availability: product.available
              ? 'https://schema.org/InStock'
              : 'https://schema.org/PreOrder',
            url: canonicalUrl,
          },
        }
      : null,
  });

  // Корректируем категорию в URL, если она не совпадает
  useEffect(() => {
    if (product) {
      const correctCat = categorySlug(product.category_name || '', product.category_id);
      if (catSlug !== correctCat) {
        navigate(`/${correctCat}/${prodSlug}`, { replace: true });
      }
    }
  }, [product, catSlug, prodSlug, navigate]);

  const handlePhoneChange = (value: string) => {
    let phone = value;
    if (!phone.startsWith('+7')) phone = '+7';
    const digits = phone.slice(2).replace(/\D/g, '');
    if (digits.length <= 10) phone = '+7' + digits;
    setForm({ ...form, phone });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 11) {
      toast({ title: 'Ошибка', description: 'Телефон должен содержать 11 цифр', variant: 'destructive' });
      return;
    }
    try {
      const response = await fetch('/api/b24-send-lead.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          equipment: product?.name,
          equipment_name: product?.name,
          model: product?.name,
          equipment_image: pictures[0],
          comment: `Интересует модель: ${product?.name}`,
          form_type: 'product_page',
          timestamp: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Network error');
      toast({ title: 'Заявка отправлена!', description: `Мы свяжемся с вами по вопросу: ${product?.name}` });
      setForm({ name: '', phone: '+7' });
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось отправить заявку. Попробуйте позже.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Загружаем товар...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <Icon name="PackageX" size={48} className="text-muted-foreground" />
        <h1 className="text-2xl font-bold">Товар не найден</h1>
        <p className="text-muted-foreground">Возможно, он был снят с продажи.</p>
        <Button onClick={() => navigate('/')}>Вернуться в каталог</Button>
      </div>
    );
  }

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
          {product.category_name && (
            <>
              <Icon name="ChevronRight" size={14} />
              <Link
                to={`/category/${categorySlug(product.category_name, product.category_id)}`}
                className="hover:text-primary"
              >
                {product.category_name}
              </Link>
            </>
          )}
          <Icon name="ChevronRight" size={14} />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      <main className="container mx-auto px-4 pb-16">
        <div className="mb-6">
          {product.brand && (
            <p className="text-sm font-semibold text-muted-foreground uppercase mb-2">{product.brand}</p>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold">{product.name}</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Колонка 1 — фото */}
          <div>
            <div className="aspect-square w-full bg-gray-100 rounded-2xl overflow-hidden relative flex items-center justify-center">
              {product.price > 0 && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg z-10">
                  -5%
                </div>
              )}
              <img
                src={pictures[activeImage]}
                alt={product.name}
                onClick={() => setLightboxOpen(true)}
                className="max-w-full max-h-full object-contain p-6 cursor-zoom-in"
              />
            </div>
            {pictures.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {pictures.map((pic, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 bg-gray-50 ${
                      i === activeImage ? 'border-orange-600' : 'border-transparent'
                    }`}
                  >
                    <img src={pic} alt={`${product.name} ${i + 1}`} className="w-full h-full object-contain p-1" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
            <ImageLightbox
              images={pictures}
              startIndex={activeImage}
              open={lightboxOpen}
              onClose={() => setLightboxOpen(false)}
              alt={product.name}
            />
          </div>

          {/* Колонка 2 — характеристики */}
          <div>
            {product.params.length > 0 ? (
              <>
                <h2 className="text-xl font-bold mb-3">Характеристики</h2>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {product.params.map((p, idx) => {
                    const url = isVideoParam(p) ? extractUrl(p.value) : null;
                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 items-baseline odd:bg-gray-50"
                      >
                        <span className="text-muted-foreground">
                          {p.name}{p.unit ? `, ${p.unit}` : ''}
                        </span>
                        {url ? (
                          <button
                            type="button"
                            onClick={() => setVideoUrl(url)}
                            className="font-semibold text-primary hover:underline inline-flex items-center gap-1.5 justify-self-end"
                          >
                            <Icon name="PlayCircle" size={18} />
                            Смотреть видео
                          </button>
                        ) : (
                          <span className="font-semibold text-right justify-self-end">
                            {p.value}{p.unit ? ` ${p.unit}` : ''}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Характеристики уточняйте у менеджера.</p>
            )}
          </div>

          {/* Колонка 3 — цена и ФОС */}
          <div className="lg:sticky lg:top-24 space-y-4">
            {product.price > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-orange-600">
                    {discounted.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    {product.price.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <p className="text-base text-green-600 font-semibold mt-1">
                  Экономия по акции: {saving.toLocaleString('ru-RU')} ₽
                </p>
                <div className="flex items-center gap-2 mt-3 text-sm text-secondary">
                  <Icon name="BadgePercent" size={18} className="text-orange-600" />
                  Акция: скидка 5% от розничной цены
                </div>
              </div>
            )}

            <Card className="bg-secondary text-white">
              <CardContent className="p-5">
                <h2 className="text-xl font-bold mb-1">
                  {product.price > 0 ? 'Получить предложение со скидкой' : 'Узнать стоимость'}
                </h2>
                <p className="text-white/80 text-sm mb-4">Оставьте контакты — пришлём КП с актуальной ценой</p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <Label htmlFor="pp-name" className="text-white">Ваше имя</Label>
                    <Input
                      id="pp-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Иван"
                      required
                      className="bg-white text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pp-phone" className="text-white">Телефон</Label>
                    <Input
                      id="pp-phone"
                      value={form.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="+7XXXXXXXXXX"
                      required
                      className="bg-white text-foreground"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6 font-semibold">
                    {product.price > 0 ? 'Получить КП со скидкой 5%' : 'Узнать стоимость'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {product.description && (
          <div className="mt-12 max-w-4xl">
            <h2 className="text-2xl font-bold mb-4">Описание</h2>
            <div
              className="prose prose-base max-w-none text-muted-foreground [&_a]:text-primary [&_img]:rounded-md"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        <div className="mt-12">
          <Button variant="outline" onClick={() => navigate('/#equipment')}>
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Назад в каталог
          </Button>
        </div>
      </main>
      <VideoModal url={videoUrl} title={product.name} onClose={() => setVideoUrl(null)} />
    </div>
  );
};

export default ProductPage;