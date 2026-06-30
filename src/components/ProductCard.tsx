import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import Icon from '@/components/ui/icon';
import { categorySlug, productSlug } from '@/lib/slug';

export type ProductParam = { name: string; value: string; unit?: string };
export type Product = {
  offer_id: string;
  name: string;
  url: string;
  price: number;
  description: string;
  brand: string;
  available: boolean;
  pictures: string[];
  params: ProductParam[];
  category_id?: string;
  category_name?: string;
};

type Props = {
  product: Product;
  onRequest: (name: string, image: string) => void;
};

const ProductCard = ({ product, onRequest }: Props) => {
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const pictures = product.pictures.length ? product.pictures : [''];
  const mainImage = pictures[0] || '';
  const productUrl = `/${categorySlug(product.category_name || '', product.category_id)}/${productSlug(product.name, product.offer_id)}`;
  const goToProduct = () => navigate(productUrl);
  const discounted = Math.round(product.price * 0.95);
  const saving = Math.round(product.price * 0.05);

  if (api) {
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div className="aspect-square w-full overflow-hidden bg-gray-100 relative">
        {product.price > 0 && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg z-10">
            -5%
          </div>
        )}
        {pictures.length > 1 ? (
          <Carousel setApi={setApi} opts={{ loop: true }} className="h-full">
            <CarouselContent className="h-full">
              {pictures.map((pic, i) => (
                <CarouselItem key={i} className="h-full">
                  <div
                    className="aspect-square w-full flex items-center justify-center p-4 cursor-pointer"
                    onClick={goToProduct}
                  >
                    <img
                      src={pic}
                      alt={`${product.name} ${i + 1}`}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-3 h-10 w-10 bg-white/90" />
            <CarouselNext className="right-3 h-10 w-10 bg-white/90" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {pictures.map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === current ? 'bg-orange-600' : 'bg-white/70 border border-gray-300'
                  }`}
                />
              ))}
            </div>
          </Carousel>
        ) : (
          <img
            src={mainImage}
            alt={product.name}
            onClick={goToProduct}
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300 p-4 cursor-pointer"
          />
        )}
      </div>

      <CardContent className="p-6 flex-grow flex flex-col">
        <h3
          onClick={goToProduct}
          className="text-xl sm:text-2xl font-bold mb-2 cursor-pointer hover:text-primary transition-colors"
        >
          {product.name}
        </h3>

        {product.price > 0 && (
          <div className="mb-4">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold text-orange-600">
                {discounted.toLocaleString('ru-RU')} ₽
              </span>
              <span className="text-lg text-gray-400 line-through">
                {product.price.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <p className="text-sm text-green-600 font-semibold mt-1">
              Экономия: {saving.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        )}

        {product.params.length > 0 && (
          <ul className="space-y-2 mb-6 flex-grow">
            {product.params.map((p, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Icon name="Check" size={20} className="text-primary mt-1 flex-shrink-0" />
                <span className="text-base">
                  <span className="font-semibold">{p.name}:</span>{' '}
                  {p.value}
                  {p.unit ? ` ${p.unit}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto space-y-3">
          <Button
            variant="outline"
            onClick={goToProduct}
            className="w-full text-base py-5 font-semibold border-primary text-primary hover:bg-primary/5"
          >
            Подробнее о модели
            <Icon name="ArrowRight" size={18} className="ml-2" />
          </Button>
          <Button
            onClick={() => onRequest(product.name, mainImage)}
            className="w-full text-lg py-6 font-semibold"
          >
            Получить предложение
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;