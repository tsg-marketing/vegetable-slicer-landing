import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [formData, setFormData] = useState({
    name: '',
    phone: '+7',
    email: '',
    equipment: '',
    comment: '',
    consent: false
  });
  const [quickFormData, setQuickFormData] = useState({ name: '', phone: '+7' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedEquipmentImage, setSelectedEquipmentImage] = useState('');

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

    const visitCookie = document.cookie.split('; ').find(row => row.startsWith('visited='));
    if (!visitCookie) {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      document.cookie = `visited=true; expires=${expiryDate.toUTCString()}; path=/`;
      document.cookie = `first_visit=${new Date().toISOString()}; expires=${expiryDate.toUTCString()}; path=/`;
    }
    const visitCount = parseInt(localStorage.getItem('visit_count') || '0') + 1;
    localStorage.setItem('visit_count', visitCount.toString());
    localStorage.setItem('last_visit', new Date().toISOString());

    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePhoneChange = (value: string, isQuick: boolean = false) => {
    let phone = value;
    if (!phone.startsWith('+7')) {
      phone = '+7';
    }
    const digits = phone.slice(2).replace(/\D/g, '');
    if (digits.length <= 10) {
      phone = '+7' + digits;
    }
    if (isQuick) {
      setQuickFormData({...quickFormData, phone});
    } else {
      setFormData({...formData, phone});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 11) {
      toast({
        title: 'Ошибка',
        description: 'Телефон должен содержать 11 цифр',
        variant: 'destructive'
      });
      return;
    }
    if (!formData.consent) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо согласие на обработку персональных данных',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/b24-send-lead.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          equipment: formData.equipment,
          comment: formData.comment,
          form_type: 'main_form',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Network error');

      toast({
        title: 'Заявка отправлена!',
        description: 'Мы свяжемся с вами в ближайшее время'
      });
      setFormData({ name: '', phone: '+7', email: '', equipment: '', comment: '', consent: false });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заявку. Попробуйте позже.',
        variant: 'destructive'
      });
    }
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = quickFormData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 11) {
      toast({
        title: 'Ошибка',
        description: 'Телефон должен содержать 11 цифр',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/b24-send-lead.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: quickFormData.name,
          phone: quickFormData.phone,
          equipment: selectedEquipment,
          equipment_image: selectedEquipmentImage,
          form_type: 'quick_form',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Network error');

      toast({
        title: 'Заявка отправлена!',
        description: `Мы свяжемся с вами по вопросу: ${selectedEquipment}`
      });
      setQuickFormData({ name: '', phone: '+7' });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заявку. Попробуйте позже.',
        variant: 'destructive'
      });
    }
  };

  const openQuickForm = (equipmentName: string, equipmentImage?: string) => {
    setSelectedEquipment(equipmentName);
    setSelectedEquipmentImage(equipmentImage || '');
    setIsDialogOpen(true);
  };

  const equipment = [
    {
      id: 6,
      name: 'Шкуросъемная машина DRB-Y270',
      image: 'https://cdn.poehali.dev/files/bb38ce8b-08c0-4d72-a531-166aed397797.jpg',
      features: ['Компактная конструкция', 'Регулируемый нож', 'Низкое количество отходов', 'Безопасность оператора'],
      details: 'Настольная шкуросъемная машина для рыбы',
      price: 492800
    },
    {
      id: 5,
      name: 'Машина для нарезки овощей DRB-108S',
      image: 'https://cdn.poehali.dev/files/96e1e993-be6d-4de8-8cbf-e5ca559b9ee1.png',
      features: ['Производительность до 800 кг/ч', '9 сменных решёток', 'Мобильная конструкция на колёсах', 'Лёгкая очистка'],
      details: 'Полуавтоматическая овощерезательная машина',
      price: 658000
    },
    {
      id: 9,
      name: 'Автоматический инъектор DRB-ZS50',
      image: 'https://cdn.poehali.dev/files/fc17b83b-6f2d-402e-86f5-628e9fa2c4b6.png',
      features: [
        'Импортные компоненты, надёжная конструкция',
        'Точечная посолка кости с воздушно-пружинным механизмом',
        'Регулировка давления, скорости и шага инъекции',
        'Мешалка для рассола против осадка и засоров',
        'Точная пошаговая подача зубчатого типа',
        'Возможность двойной инъекции (до 180%)',
        'Простота эксплуатации и обслуживания'
      ],
      details: 'Количество игл: 50 шт. (диаметр 4 мм) • Скорость впрыска: 17–60 раз/мин • Ширина конвейера: 350 мм • Габариты: 1700×750×1650 мм • Вес: 560 кг • Высота продукта: до 180 мм',
      price: 1285000
    },
    {
      id: 4,
      name: 'Блокорезка роторная DRB-PR 3000',
      image: 'https://cdn.poehali.dev/files/a109eda6-fca3-4cf3-83a4-1c19d9f26844.png',
      features: ['Производительность до 4000 кг/ч', 'Работа с блоками до 25 кг', 'Защитные кожухи', 'Регулируемая толщина резки'],
      details: 'Высокопроизводительная блокорезка для замороженного мяса',
      price: 1309000
    },
    {
      id: 2,
      name: 'Волчок для мяса DRB-JR 120 (нержавеющий корпус)',
      image: 'https://cdn.poehali.dev/files/15be6eaa-7b1e-448b-a613-d0cd4fc3ca42.png',
      features: [
        'Переработка мороженого мяса (до -5°C), свежего мяса, субпродуктов, овощей',
        'Режущий шнек с винтовыми лопастями и переменным шагом',
        'Самозатачивающиеся ножи',
        'Высокая производительность: 3–5 тонн в смену',
        'Система безопасности при открытии решётки'
      ],
      details: 'Бренд: Daribo • Мощность: 7,5 кВт • Производительность: до 1000 кг/ч • Диаметр решетки: 120 мм • Размер отверстий решёток: Ø3–Ø30 мм • Бункер: 70 л • Габариты: 660×960×1150 мм • Вес: 302 кг',
      price: 650000
    },
    {
      id: 7,
      name: 'Машина для нарезки кубиками DRB-R350',
      image: 'https://cdn.poehali.dev/files/78b128f8-ca45-4c1c-9d7f-02b1f0894aee.jpg',
      features: [
        'Нарезка кубиками замороженного мяса, птицы, рыбы, морепродуктов',
        'Система защиты с остановкой ножа при открытии кожуха',
        'Лёгкая очистка: разборная режущая решётка и блок лезвий',
        'Сенсорный экран для управления толщиной и глубиной нарезки',
        'Соответствие стандартам HACCP'
      ],
      details: 'Бренд: Daribo • Мощность: 1,5 кВт • Производительность: 300–500 кг/ч • Размер камеры наполнителя: 84×84×350 мм • Размеры решёток на выбор: от 4 до 28 мм • Габариты: 1480×800×1000 мм • Вес: 400 кг',
      price: 842830
    },
    {
      id: 3,
      name: 'Машина для нарезки DRB-PSD 300',
      image: 'https://cdn.poehali.dev/files/bf1dd1db-a221-47ce-b8da-93fec6ea53e2.jpg',
      features: ['Нарезка мяса, птицы, рыбы', 'Сенсорный экран', 'Быстрая разборка для мойки', 'Низкий уровень шума'],
      details: 'Универсальная машина для нарезки кубиками и полосками',
      price: 2012000
    },
    {
      id: 8,
      name: 'Автоматический слайсер DRB-120',
      image: 'https://cdn.poehali.dev/files/759f3025-4e29-4751-b054-c0678ea66099.jpg',
      features: [
        'Нарезка мяса без костей, рыбы, овощей, сыра',
        'Регулируемая скорость и толщина нарезки (1–40 мм)',
        'Быстросъёмный транспортер для мойки',
        'Серповидные ножи для плавной резки',
        'Система безопасности с остановкой при открытии кожуха',
        'Прижимная лента для фиксации продукта'
      ],
      details: 'Бренд: Daribo • Мощность: 1,5 кВт • Производительность: 150–800 кг/ч • Ширина транспортера: 120 мм • Макс. высота продукта: 80 мм • Габариты: 1350×600×1250 мм • Вес: 115 кг',
      price: 492613
    },
    {
      id: 1,
      name: 'Профессиональный слайсер DRB-21K-C',
      image: 'https://cdn.poehali.dev/files/4e44f4ae-fa6f-4853-a4f5-3f1907f48496.png',
      features: [
        'Нарезка мяса, рыбы, колбас, сыров на ломти толщиной 1–38 мм',
        'Высокая скорость: до 280 резов в минуту',
        'Большая укладочная камера: 210×165 мм',
        'Подходит для свежего, охлаждённого и замороженного сырья (до -15°C)',
        'Информативный ЖК-дисплей для управления',
        'Оснащён отводящим транспортером'
      ],
      details: 'Бренд: Daribo • Скорость нарезки: до 280 резов/мин • Диапазон толщины: 1–38 мм • Размер укладочной камеры: 210×165 мм • Работа с замороженным сырьём: до -15°C',
      price: 1439354
    }
  ];

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <img src="https://cdn.poehali.dev/files/360a80ca-f911-4f02-94ff-c2728b707994.jpg" alt="ТехноСиб" className="h-8 sm:h-10" />
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('hero')} className="text-lg font-semibold hover:text-primary transition-colors">Главная</button>
              <button onClick={() => scrollToSection('equipment')} className="text-lg font-semibold hover:text-primary transition-colors">Оборудование</button>
              <button onClick={() => scrollToSection('promo')} className="text-lg font-semibold hover:text-primary transition-colors">Акция</button>
              <button onClick={() => scrollToSection('contacts')} className="text-lg font-semibold hover:text-primary transition-colors">Контакты</button>
            </nav>
            <Button onClick={() => scrollToSection('form')} className="hidden md:inline-flex text-base font-semibold">Получить консультацию</Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Icon name="Menu" size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col gap-6 mt-8">
                  <button onClick={() => scrollToSection('hero')} className="text-lg hover:text-primary transition-colors text-left">Главная</button>
                  <button onClick={() => scrollToSection('equipment')} className="text-lg hover:text-primary transition-colors text-left">Оборудование</button>
                  <button onClick={() => scrollToSection('promo')} className="text-lg hover:text-primary transition-colors text-left">Акция</button>
                  <button onClick={() => scrollToSection('contacts')} className="text-lg hover:text-primary transition-colors text-left">Контакты</button>
                  <Button onClick={() => scrollToSection('form')} className="w-full">Получить консультацию</Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <section id="hero" className="pt-20 pb-12 min-h-screen flex items-center bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-4 gap-2 w-full h-full">
            <img src="https://cdn.poehali.dev/files/bb38ce8b-08c0-4d72-a531-166aed397797.jpg" alt="" className="w-full h-full object-cover" />
            <img src="https://cdn.poehali.dev/files/96e1e993-be6d-4de8-8cbf-e5ca559b9ee1.png" alt="" className="w-full h-full object-cover" />
            <img src="https://cdn.poehali.dev/files/fc17b83b-6f2d-402e-86f5-628e9fa2c4b6.png" alt="" className="w-full h-full object-cover" />
            <img src="https://cdn.poehali.dev/files/a109eda6-fca3-4cf3-83a4-1c19d9f26844.png" alt="" className="w-full h-full object-cover" />
            <img src="https://cdn.poehali.dev/files/15be6eaa-7b1e-448b-a613-d0cd4fc3ca42.png" alt="" className="w-full h-full object-cover" />
            <img src="https://cdn.poehali.dev/files/78b128f8-ca45-4c1c-9d7f-02b1f0894aee.jpg" alt="" className="w-full h-full object-cover" />
            <img src="https://cdn.poehali.dev/files/bf1dd1db-a221-47ce-b8da-93fec6ea53e2.jpg" alt="" className="w-full h-full object-cover" />
            <img src="https://cdn.poehali.dev/files/759f3025-4e29-4751-b054-c0678ea66099.jpg" alt="" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="container mx-auto px-4 relative z-10 w-full">
          <div className="max-w-6xl mx-auto text-center animate-fade-in">
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="flex-1 max-w-2xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
                  <span className="bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                    Акция на оборудование <span className="text-[#1e3a8a] bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] bg-clip-text">DARIBO</span>
                  </span>
                  <br />
                  <span className="text-gray-800">
                    для мясного производства
                  </span>
                </h1>
              </div>
              <div className="hidden lg:block">
                <img 
                  src="https://cdn.poehali.dev/files/e3490a20-ad92-48a5-83fc-1e6fdc9722dc.jpeg" 
                  alt="DARIBO" 
                  className="h-24 w-auto"
                />
              </div>
            </div>
            
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600 mb-3">
              До 22.12.2025: скидка 5%
            </p>
            <p className="text-lg sm:text-xl text-gray-700 mb-6 font-medium">
              Оборудование на складе • Доставка за наш счёт
            </p>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 max-w-4xl mx-auto shadow-2xl">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Акция на оборудование:</h3>
              <ul className="grid sm:grid-cols-2 gap-3 text-left">
                <li className="flex items-start gap-2">
                  <Icon name="CircleCheck" size={20} className="text-orange-600 mt-1 flex-shrink-0" />
                  <span className="text-base sm:text-lg">Автоматический слайсер DRB-120</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="CircleCheck" size={20} className="text-orange-600 mt-1 flex-shrink-0" />
                  <span className="text-base sm:text-lg">Шкуросъемная машина DRB-Y270</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="CircleCheck" size={20} className="text-orange-600 mt-1 flex-shrink-0" />
                  <span className="text-base sm:text-lg">Волчок для мяса DRB-JR 120</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="CircleCheck" size={20} className="text-orange-600 mt-1 flex-shrink-0" />
                  <span className="text-base sm:text-lg">Овощерезка DRB-108S</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="CircleCheck" size={20} className="text-orange-600 mt-1 flex-shrink-0" />
                  <span className="text-base sm:text-lg">Шпигорезка DRB-R350</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="CircleCheck" size={20} className="text-orange-600 mt-1 flex-shrink-0" />
                  <span className="text-base sm:text-lg">Инъектор DRB-ZS50</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="CircleCheck" size={20} className="text-orange-600 mt-1 flex-shrink-0" />
                  <span className="text-base sm:text-lg">Блокорезка DRB-PR 3000</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="CircleCheck" size={20} className="text-orange-600 mt-1 flex-shrink-0" />
                  <span className="text-base sm:text-lg">Профессиональный слайсер DRB-21K-C</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button size="lg" onClick={() => scrollToSection('equipment')} className="text-lg sm:text-xl px-8 py-5 h-auto bg-orange-600 hover:bg-orange-700 font-bold shadow-xl">
                Смотреть каталог
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection('form')} className="text-lg sm:text-xl px-8 py-5 h-auto border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-bold shadow-xl">
                Получить консультацию
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-8">
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-2xl min-w-[70px] sm:min-w-[90px] border-2 border-orange-500">
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-orange-600">{timeLeft.days}</div>
                <div className="text-sm sm:text-base font-semibold text-gray-600 mt-1">дней</div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-2xl min-w-[70px] sm:min-w-[90px] border-2 border-orange-500">
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-orange-600">{timeLeft.hours}</div>
                <div className="text-sm sm:text-base font-semibold text-gray-600 mt-1">часов</div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-2xl min-w-[70px] sm:min-w-[90px] border-2 border-orange-500">
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-orange-600">{timeLeft.minutes}</div>
                <div className="text-sm sm:text-base font-semibold text-gray-600 mt-1">минут</div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-2xl min-w-[70px] sm:min-w-[90px] border-2 border-orange-500">
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-orange-600">{timeLeft.seconds}</div>
                <div className="text-sm sm:text-base font-semibold text-gray-600 mt-1">секунд</div>
              </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">Преимущества оборудования</h2>
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 sm:p-10 shadow-xl">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Icon name="Award" size={32} className="text-orange-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Высокое качество стали марки 304</h3>
                  <p className="text-base sm:text-lg text-gray-600">Пищевая нержавеющая сталь гарантирует безопасность продукции и долговечность оборудования</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Icon name="Settings" size={32} className="text-orange-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Комплектующие мировых брендов</h3>
                  <p className="text-base sm:text-lg text-gray-600">NORD, Mitsubishi, Schneider, SIEMENS и OMRON — лучшие компоненты для надёжной работы</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Icon name="ShieldCheck" size={32} className="text-orange-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Безотказная работа</h3>
                  <p className="text-base sm:text-lg text-gray-600">Исключительная долговечность и продолжительный срок службы оборудования</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="promo" className="py-12 sm:py-20 bg-secondary text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">Акционные условия</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Package" size={48} className="text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">Оборудование на складе</h3>
              <p className="text-lg sm:text-xl text-white/90">Готово к отгрузке</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Truck" size={48} className="text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">Бесплатная доставка</h3>
              <p className="text-lg sm:text-xl text-white/90">До вашего производства</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="BadgePercent" size={48} className="text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">Скидка 5%</h3>
              <p className="text-lg sm:text-xl text-white/90">При оплате до 22.12.2025</p>
            </div>
          </div>
          <div className="text-center">
            <Button size="lg" onClick={() => scrollToSection('form')} className="bg-accent hover:bg-accent/90 text-white">
              Получить расчёт со скидкой
            </Button>
          </div>
        </div>
      </section>

      <section id="equipment" className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">Каталог оборудования</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...equipment].sort((a, b) => a.price - b.price).map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="aspect-square w-full overflow-hidden bg-gray-100 relative">
                  {item.price > 0 && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg z-10">
                      -5%
                    </div>
                  )}
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300 p-4"
                  />
                </div>
                <CardContent className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">{item.name}</h3>
                  {item.price > 0 && (
                    <div className="mb-4">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-orange-600">{Math.round(item.price * 0.95).toLocaleString('ru-RU')} ₽</span>
                        <span className="text-lg text-gray-400 line-through">{Math.round(item.price).toLocaleString('ru-RU')} ₽</span>
                      </div>
                      <p className="text-sm text-green-600 font-semibold mt-1">Экономия: {Math.round(item.price * 0.05).toLocaleString('ru-RU')} ₽</p>
                    </div>
                  )}
                  <ul className="space-y-3 mb-6 flex-grow">
                    {item.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Icon name="Check" size={24} className="text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-base sm:text-lg">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Accordion type="single" collapsible className="mb-4">
                    <AccordionItem value="details" className="border-none">
                      <AccordionTrigger className="text-primary hover:no-underline text-base sm:text-lg font-semibold">
                        Подробнее о модели
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-base text-muted-foreground">{item.details}</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <Button onClick={() => openQuickForm(item.name, item.image)} className="w-full text-lg py-6 font-semibold">
                    Получить предложение
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">Как получить оборудование</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4 animate-fade-in">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl flex-shrink-0">1</div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Оставьте заявку</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Заполните форму на консультацию</p>
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
              <Button size="lg" onClick={() => scrollToSection('form')} className="text-2xl px-12 py-8 h-auto bg-orange-600 hover:bg-orange-700 font-bold shadow-xl">
                Оставить заявку
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="form" className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">Форма заявки</h2>
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
                      onChange={(e) => handlePhoneChange(e.target.value, false)}
                      placeholder="+7 (999) 123-45-67"
                      maxLength={12}
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
                  <Button type="submit" size="lg" className="w-full text-2xl py-8 h-auto bg-orange-600 hover:bg-orange-700 font-bold shadow-xl">
                    Получить КП со скидкой 5%
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 bg-secondary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold mb-6 text-center">Гарантийное обслуживание и сервис-центры</h3>
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
        className="fixed bottom-8 right-8 bg-accent hover:bg-accent/90 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg flex items-center gap-2 font-semibold transition-all hover:scale-105 z-40 text-sm sm:text-base"
      >
        <Icon name="BadgePercent" size={20} />
        <span className="hidden sm:inline">Узнать об акции</span>
        <span className="sm:hidden">Акция</span>
      </button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Получить предложение</DialogTitle>
            <p className="text-lg sm:text-xl font-semibold mt-2 text-gray-800">
              {selectedEquipment}
            </p>
          </DialogHeader>
          {selectedEquipmentImage && (
            <div className="w-full aspect-square overflow-hidden bg-gray-100 rounded-lg">
              <img 
                src={selectedEquipmentImage} 
                alt={selectedEquipment}
                className="w-full h-full object-contain p-4"
              />
            </div>
          )}
          <form onSubmit={handleQuickSubmit} className="space-y-4">
            <div>
              <Label htmlFor="quick-name">Имя *</Label>
              <Input
                id="quick-name"
                required
                value={quickFormData.name}
                onChange={(e) => setQuickFormData({...quickFormData, name: e.target.value})}
                placeholder="Введите ваше имя"
              />
            </div>
            <div className="mb-6">
              <Label htmlFor="quick-phone">Телефон * (11 цифр)</Label>
              <Input
                id="quick-phone"
                type="tel"
                required
                value={quickFormData.phone}
                onChange={(e) => handlePhoneChange(e.target.value, true)}
                placeholder="+7 (999) 123-45-67"
                maxLength={12}
              />
            </div>
            <Button type="submit" className="w-full text-base py-4 h-auto bg-orange-600 hover:bg-orange-700 font-bold shadow-xl">
              Получить предложение со скидкой
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;