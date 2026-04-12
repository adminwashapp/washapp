import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #040c24 0%, #0c1e55 55%, #0a3a99 100%)' }}
    >
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C%2Fg%3E%3C%2Fsvg%3E")` }} />
      <div className="relative max-w-[1200px] mx-auto px-6 pt-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-10 border-b border-white/10">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)' }}>
                <Image src="/logowashapp.png" alt="Washapp" width={22} height={22} className="object-contain" />
              </div>
              <span className="text-[17px] font-extrabold text-white tracking-tight">Washapp</span>
            </Link>
            <p className="text-[13.5px] text-white/50 leading-relaxed max-w-[230px] mb-6">
              Le lavage auto à domicile à Abidjan. Simple, rapide, professionnel.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Côte d\'Ivoire", 'OHADA', 'Données protégées'].map((b) => (
                <span key={b} className="text-[11px] font-semibold text-white/60 px-3 py-1 rounded-full"
                  style={{ border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.06)' }}>{b}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-bold tracking-[1.2px] uppercase text-white mb-5 pb-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Navigation</h4>
            <ul className="flex flex-col gap-3">
              {[
                { href: '/concept',        label: 'Concept' },
                { href: '/tarifs',         label: 'Tarifs' },
                { href: '/devenir-washer', label: 'Devenir washer' },
                { href: '/faq',            label: 'FAQ' },
                { href: '/booking',        label: 'Réserver un lavage' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[13.5px] text-white/55 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <span className="text-white/20 group-hover:text-[#5b9fff] transition-colors text-[10px]">›</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-bold tracking-[1.2px] uppercase text-white mb-5 pb-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Documents légaux</h4>
            <ul className="flex flex-col gap-3">
              {[
                { href: '/legal#mentions-legales',          label: 'Mentions légales' },
                { href: '/legal#cgu-clients',               label: 'CGU – Clients' },
                { href: '/legal#cgu-washers',               label: 'CGU – Washers' },
                { href: '/politique-de-confidentialite', label: 'Politique de confidentialité' },
                { href: '/legal#politique-cookies',         label: 'Politique cookies' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[13.5px] text-white/55 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <span className="text-white/20 group-hover:text-[#5b9fff] transition-colors text-[10px]">›</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-5">
          <p className="text-[12px] text-white/30">© 2026 Washapp — Société en cours de constitution · Cocody, Abidjan</p>
          <div className="flex flex-wrap items-center gap-5">
            {[
              { href: '/legal#mentions-legales',          label: 'Mentions légales' },
              { href: '/legal#cgu-clients',               label: 'CGU' },
              { href: '/politique-de-confidentialite', label: 'Confidentialité' },
              { href: '/legal#politique-cookies',         label: 'Cookies' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="text-[11.5px] text-white/30 hover:text-white/70 transition-colors">{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
