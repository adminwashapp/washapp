'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Calendar, Search } from 'lucide-react';
import { BLOG_POSTS, BLOG_CATEGORIES } from '@/lib/blog-data';
import Footer from '@/components/layout/Footer';

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = BLOG_POSTS.filter((p) => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const cardGradients = [
    'from-blue-500 to-blue-700',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-violet-500 to-purple-700',
    'from-rose-500 to-pink-600',
    'from-slate-600 to-slate-800',
    'from-cyan-500 to-blue-600',
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb]">

      {/* ── HERO ─────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-2xl">
            <span className="inline-block text-[11px] font-bold tracking-[0.18em] text-[#1558f5] uppercase mb-4">
              Blog Washapp
            </span>
            <h1 className="text-[2.5rem] sm:text-[3rem] font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
              Conseils auto &amp; actualités
            </h1>
            <p className="text-[1.05rem] text-gray-500 leading-relaxed">
              Entretien, nettoyage, bons gestes et actualités Washapp — tout ce qu&apos;il faut savoir pour prendre soin de votre véhicule.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── SIDEBAR SOMMAIRE ─────────────────── */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-6">
              <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                Sommaire
              </h2>

              {/* Recherche */}
              <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1558f5] bg-gray-50"
                />
              </div>

              {/* Catégories */}
              <div className="mb-5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Catégories</p>
                <div className="flex flex-col gap-1">
                  {BLOG_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setActiveCategory(cat.value)}
                      className={`text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                        activeCategory === cat.value
                          ? 'bg-[#1558f5] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {cat.name}
                      <span className={`ml-1.5 text-[11px] ${activeCategory === cat.value ? 'text-blue-200' : 'text-gray-400'}`}>
                        ({cat.value === 'all' ? BLOG_POSTS.length : BLOG_POSTS.filter(p => p.category === cat.value).length})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Articles */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Articles</p>
                <div className="flex flex-col gap-1">
                  {BLOG_POSTS.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/blog/${p.slug}`}
                      className="text-[12px] text-gray-500 hover:text-[#1558f5] py-1 leading-snug transition-colors line-clamp-2"
                    >
                      {p.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── GRILLE ARTICLES ──────────────────── */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg font-semibold mb-2">Aucun article trouvé</p>
                <p className="text-sm">Essayez une autre recherche ou catégorie.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((post, idx) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 group flex flex-col"
                  >
                    {/* Card image area */}
                    <div className={`h-40 bg-gradient-to-br ${cardGradients[idx % cardGradients.length]} relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 40%)'}} />
                      <div className="absolute bottom-3 left-4">
                        <span
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: post.categoryBg, color: post.categoryColor }}
                        >
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Card content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-[0.95rem] font-bold text-gray-900 leading-snug mb-2 group-hover:text-[#1558f5] transition-colors line-clamp-3">
                        {post.title}
                      </h3>
                      <p className="text-[0.8rem] text-gray-500 leading-relaxed mb-4 line-clamp-2 flex-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {post.date}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#1558f5] group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
