import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    equipment: '',
    comment: '',
    consent: false
  });

  useEffect(() => {
    const targetDate = new Date('2025-12-22T23:59:59');
    
    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо согласие на обработку персональных данных',
        variant: 'destructive'
      });
      return;
    }
    toast({
      title: 'Заявка отправлена!',
      description: 'Мы свяжемся с вами в ближайшее время'
    });
    setFormData({ name: '', phone: '', email: '', equipment: '', comment: '', consent: false });
  };

  const equipment = [
    {
      id: 1,
      name: 'Вакуумный шприц GZY2000 для колбасных изделий',
      image: 'https://cdn.poehali.dev/files/bfadd834-a4e4-423e-9f2f-4a3da77a6e6d.jpg',
      features: ['Работает в 6 режимах', 'Совместим со всеми типами оболочек', 'Сохраняет текстуру продукта'],
      details: 'Комплектация: сенсорный экран, вакуумный насос, нержавеющая сталь'
    },
    {
      id: 2,
      name: 'Вакуумный массажер для мяса GRZK500',
      image: 'https://cdn.poehali.dev/files/b0157878-c79f-4e38-bd09-f70ede3185f5.jpg',
      features: ['Объём бака: 500 л', 'Вакуумный насос: 20 м³/ч', 'Реверс вращения', 'Сенсорный экран'],
      details: 'Профессиональное оборудование для подготовки мясного сырья'
    },
    {
      id: 3,
      name: 'Машина для нарезки DRB-PSD 300',
      image: 'https://cdn.poehali.dev/files/bf1dd1db-a221-47ce-b8da-93fec6ea53e2.jpg',
      features: ['Нарезка мяса, птицы, рыбы', 'Сенсорный экран', 'Быстрая разборка для мойки', 'Низкий уровень шума'],
      details: 'Универсальная машина для нарезки кубиками и полосками'
    },
    {
      id: 4,
      name: 'Блокорезка роторная DRB-PR 3000',
      image: 'https://cdn.poehali.dev/projects/dc55a807-6efd-43bf-a71c-0f79d937bea4/files/8467db2e-4613-4313-ae63-9d3cb4838ef1.jpg',
      features: ['Производительность до 4000 кг/ч', 'Работа с блоками до 25 кг', 'Защитные кожухи', 'Регулируемая толщина резки'],
      details: 'Высокопроизводительная блокорезка для замороженного мяса'
    },
    {
      id: 5,
      name: 'Машина для нарезки овощей DRB-108S',
      image: 'https://cdn.poehali.dev/projects/dc55a807-6efd-43bf-a71c-0f79d937bea4/files/e7201c7c-3cb5-4f1f-95d1-912198bcf454.jpg',
      features: ['Производительность до 800 кг/ч', '9 сменных решёток', 'Мобильная конструкция на колёсах', 'Лёгкая очистка'],
      details: 'Полуавтоматическая овощерезательная машина'
    },
    {
      id: 6,
      name: 'Шкуросъемная машина DRB-Y270',
      image: 'https://cdn.poehali.dev/projects/dc55a807-6efd-43bf-a71c-0f79d937bea4/files/bb354159-f362-4158-8ea1-1c94ef9b8065.jpg',
      features: ['Компактная конструкция', 'Регулируемый нож', 'Низкое количество отходов', 'Безопасность оператора'],
      details: 'Настольная шкуросъемная машина для рыбы'
    }
  ];

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary">ТехноСиб</div>
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('hero')} className="hover:text-primary transition-colors">Главная</button>
              <button onClick={() => scrollToSection('equipment')} className="hover:text-primary transition-colors">Оборудование</button>
              <button onClick={() => scrollToSection('promo')} className="hover:text-primary transition-colors">Акция</button>
              <button onClick={() => scrollToSection('contacts')} className="hover:text-primary transition-colors">Контакты</button>
            </nav>
            <Button onClick={() => scrollToSection('form')}>Получить консультацию</Button>
          </div>
        </div>
      </header>

      <section id="hero" className="pt-32 pb-20 bg-gradient-to-br from-primary/5 via-white to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Акция на оборудование для мясного производства
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              До 22.12.2025: скидка 5% от цен с сайта
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Оборудование на складе. Доставка за наш счёт.
            </p>
            
            <div className="flex justify-center gap-4 mb-12">
              <div className="bg-white rounded-lg p-4 shadow-lg min-w-[80px]">
                <div className="text-3xl font-bold text-primary">{timeLeft.days}</div>
                <div className="text-sm text-muted-foreground">дней</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg min-w-[80px]">
                <div className="text-3xl font-bold text-primary">{timeLeft.hours}</div>
                <div className="text-sm text-muted-foreground">часов</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg min-w-[80px]">
                <div className="text-3xl font-bold text-primary">{timeLeft.minutes}</div>
                <div className="text-sm text-muted-foreground">минут</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg min-w-[80px]">
                <div className="text-3xl font-bold text-primary">{timeLeft.seconds}</div>
                <div className="text-sm text-muted-foreground">секунд</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => scrollToSection('equipment')} className="text-lg px-8">
                Смотреть каталог
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection('promo')} className="text-lg px-8">
                Узнать об акции
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="promo" className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Акционные условия</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Package" size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Оборудование на складе</h3>
              <p className="text-white/80">Готово к отгрузке</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Truck" size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Бесплатная доставка</h3>
              <p className="text-white/80">До вашего производства</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="BadgePercent" size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Скидка 5%</h3>
              <p className="text-white/80">При оплате до 22.12.2025</p>
            </div>
          </div>
          <div className="text-center">
            <Button size="lg" onClick={() => scrollToSection('form')} className="bg-accent hover:bg-accent/90 text-white">
              Получить расчёт со скидкой
            </Button>
          </div>
        </div>
      </section>

      <section id="equipment" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Каталог оборудования</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {equipment.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-video w-full overflow-hidden bg-gray-100">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">{item.name}</h3>
                  <ul className="space-y-2 mb-4">
                    {item.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Icon name="Check" size={20} className="text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="details" className="border-none">
                      <AccordionTrigger className="text-primary hover:no-underline">
                        Подробнее о модели
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-muted-foreground">{item.details}</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Как получить оборудование</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4 animate-fade-in">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">1</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Оставьте заявку</h3>
                  <p className="text-muted-foreground">Заполните форму на консультацию</p>
                </div>
              </div>
              <div className="flex gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">2</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Получите КП</h3>
                  <p className="text-muted-foreground">С учётом акционной скидки</p>
                </div>
              </div>
              <div className="flex gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">3</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Оплатите до 22.12.2025</h3>
                  <p className="text-muted-foreground">И получите скидку 5%</p>
                </div>
              </div>
              <div className="flex gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">4</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Бесплатная доставка</h3>
                  <p className="text-muted-foreground">До вашего производства</p>
                </div>
              </div>
            </div>
            <div className="text-center mt-12">
              <Button size="lg" onClick={() => scrollToSection('form')}>
                Оставить заявку
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="form" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">Форма заявки</h2>
            <p className="text-center text-muted-foreground mb-8">Заполните форму и получите коммерческое предложение со скидкой 5%</p>
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Имя *</Label>
                    <Input 
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Введите ваше имя"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input 
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="equipment">Выбор оборудования *</Label>
                    <Select value={formData.equipment} onValueChange={(value) => setFormData({...formData, equipment: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите оборудование" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipment.map((item) => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="comment">Комментарий</Label>
                    <Textarea 
                      id="comment"
                      value={formData.comment}
                      onChange={(e) => setFormData({...formData, comment: e.target.value})}
                      placeholder="Дополнительная информация"
                      rows={4}
                    />
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="consent"
                      checked={formData.consent}
                      onCheckedChange={(checked) => setFormData({...formData, consent: checked as boolean})}
                    />
                    <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                      Согласен на обработку персональных данных
                    </Label>
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    Получить КП со скидкой 5%
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 bg-secondary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">Гарантийное обслуживание и сервис-центры</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <Icon name="Shield" size={24} className="flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Официальная гарантия</p>
                  <p className="text-sm text-white/80">На всё оборудование от 12 месяцев</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Icon name="Wrench" size={24} className="flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Сервисные центры</p>
                  <p className="text-sm text-white/80">В Новосибирске и Москве</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Icon name="Headphones" size={24} className="flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Техподдержка</p>
                  <p className="text-sm text-white/80">Консультации по эксплуатации</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Icon name="Settings" size={24} className="flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Пусконаладка</p>
                  <p className="text-sm text-white/80">Установка и настройка оборудования</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="contacts" className="py-12 bg-secondary/90 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Icon name="Phone" size={20} />
                Телефон
              </h4>
              <a href="tel:88005337522" className="text-white/90 hover:text-white transition-colors">
                8-800-533-75-22
              </a>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Icon name="Mail" size={20} />
                Email
              </h4>
              <a href="mailto:info4@t-sib.ru" className="text-white/90 hover:text-white transition-colors">
                info4@t-sib.ru
              </a>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Icon name="MapPin" size={20} />
                Адреса
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-white/90">Новосибирск, ул. Электрозаводская, 2 к1</p>
                <p className="text-white/90">Москва, ш. Энтузиастов, д. 56, стр. 32, офис 115</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm text-white/70">
            <p>© 2025 ТехноСиб. Все права защищены.</p>
          </div>
        </div>
      </footer>

      <button
        onClick={() => scrollToSection('promo')}
        className="fixed bottom-8 right-8 bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-semibold transition-all hover:scale-105 z-40"
      >
        <Icon name="BadgePercent" size={20} />
        Узнать об акции
      </button>
    </div>
  );
};

export default Index;