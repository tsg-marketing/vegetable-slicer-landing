import Icon from '@/components/ui/icon';
import SubscribeButton from '@/components/SubscribeButton';

const SiteFooter = () => (
  <footer id="contacts" className="py-12 bg-secondary/90 text-white">
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
        <div>
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Icon name="Phone" size={20} />
            Телефон
          </h4>
          <a href="tel:88005004054" className="text-white/90 hover:text-white transition-colors">
            8-800-500-4-054
          </a>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Icon name="Mail" size={20} />
            Email
          </h4>
          <a href="mailto:promo_dec2025@t-sib.ru" className="text-white/90 hover:text-white transition-colors">
            promo_dec2025@t-sib.ru
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

      <div className="mt-8 flex justify-center">
        <SubscribeButton />
      </div>

      <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm text-white/70 space-y-3">
        <div className="max-w-3xl mx-auto text-xs leading-relaxed space-y-1">
          <p className="font-semibold text-white/90">
            Общество с ограниченной ответственностью «Техно-Сиб Групп»
          </p>
          <p>Юридический адрес: 630005, г. Новосибирск, ул. Крылова, д. 36, этаж 8, офис 81</p>
          <p>ИНН 5406804844 · ОГРН 1205400012146 · КПП 540601001</p>
        </div>
        <p className="text-xs max-w-3xl mx-auto leading-relaxed">*Подробную информацию об акции узнавайте у менеджеров компании.</p>
        <p className="text-xs max-w-3xl mx-auto leading-relaxed">Информация, представленная на сайте, не является публичной офертой. Данный интернет-сайт носит исключительно информационный характер и не является публичной офертой, определяемой положениями ч. 2 ст. 437 Гражданского кодекса РФ.</p>
        <p>© {new Date().getFullYear()} ТехноСиб. Все права защищены.</p>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
