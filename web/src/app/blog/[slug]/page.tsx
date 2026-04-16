import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, ArrowRight, ChevronDown } from 'lucide-react';
import { BLOG_POSTS } from '@/lib/blog-data';
import Footer from '@/components/layout/Footer';

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const postIndex = BLOG_POSTS.findIndex((p) => p.slug === params.slug);
  const related = BLOG_POSTS.filter((_, i) => i !== postIndex).slice(0, 3);

  const headings = post.sections.map((s, i) => s.heading ? { heading: s.heading, idx: i } : null).filter(Boolean) as { heading: string; idx: number }[];

  return (
    <div className="min-h-screen bg-[#f9fafb]">

      {/* BACK + HERO */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
          <Link href="/blog" className="inline-flex items-center gap-2 text-[13px] text-gray-500 hover:text-[#1558f5] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour au blog
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[11px] font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: post.categoryBg, color: post.categoryColor }}>
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-[12px] text-gray-400">
              <Clock className="w-3 h-3" />{post.readTime} de lecture
            </span>
            <span className="flex items-center gap-1 text-[12px] text-gray-400">
              <Calendar className="w-3 h-3" />{post.date}
            </span>
          </div>
          <h1 className="text-[1.8rem] sm:text-[2.2rem] font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
            {post.title}
          </h1>
          <p className="text-[1.05rem] text-gray-500 leading-relaxed max-w-2xl">{post.excerpt}</p>
        </div>
      </div>

      {/* ARTICLE */}
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Sommaire mobile */}
        {headings.length > 0 && (
          <details className="lg:hidden mb-6 bg-white rounded-2xl border border-gray-100 overflow-hidden group">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-bold text-[0.875rem] text-gray-900 list-none select-none">
              <span>Sommaire</span>
              <ChevronDown className="w-4 h-4 text-[#1558f5] transition-transform group-open:rotate-180" />
            </summary>
            <ul className="px-5 pb-4 pt-3 space-y-2 border-t border-gray-100">
              {headings.map(({ heading, idx }) => (
                <li key={idx}>
                  <a href={`#section-${idx}`} className="text-[13px] text-[#1558f5] hover:underline block py-0.5">
                    {heading}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="flex flex-col lg:flex-row gap-10">

          {/* Sommaire desktop */}
          {headings.length > 0 && (
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-6 bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Dans cet article</p>
                <ul className="space-y-2">
                  {headings.map(({ heading, idx }) => (
                    <li key={idx}>
                      <a href={`#section-${idx}`} className="text-[12px] text-gray-500 hover:text-[#1558f5] leading-snug transition-colors block">
                        {heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}

          {/* Contenu */}
          <article className="flex-1 max-w-2xl">
            <div className="bg-white rounded-2xl border border-gray-100 p-7 md:p-10">
              {post.sections.map((section, idx) => (
                <div key={idx} id={`section-${idx}`} className={idx > 0 ? 'mt-8' : ''}>
                  {section.heading && (
                    <h2 className="text-[1.2rem] font-bold text-gray-900 mb-3 leading-snug">
                      {section.heading}
                    </h2>
                  )}
                  {section.paragraphs.map((para, pIdx) => (
                    <p key={pIdx} className="text-[0.9375rem] text-gray-600 leading-relaxed mb-4">
                      {para}
                    </p>
                  ))}
                </div>
              ))}

              <div className="mt-10 p-6 bg-[#1558f5] rounded-2xl text-white text-center">
                <p className="font-bold text-[1.05rem] mb-1">Pret a essayer Washapp ?</p>
                <p className="text-blue-100 text-[0.875rem] mb-4">Reservez votre lavage en quelques secondes.</p>
                <Link href="/booking" className="inline-flex items-center gap-2 bg-white text-[#1558f5] font-bold px-5 py-2.5 rounded-xl text-[0.875rem] hover:bg-blue-50 transition-all">
                  Reserver maintenant
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {related.length > 0 && (
              <div className="mt-10">
                <h3 className="text-[1.1rem] font-bold text-gray-900 mb-5">Articles similaires</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {related.map((r) => (
                    <Link key={r.slug} href={`/blog/${r.slug}`} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: r.categoryBg, color: r.categoryColor }}>
                        {r.category}
                      </span>
                      <p className="text-[0.82rem] font-semibold text-gray-800 mt-2 leading-snug group-hover:text-[#1558f5] transition-colors line-clamp-3">
                        {r.title}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-2">{r.readTime}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

        </div>
      </div>

      <Footer />
    </div>
  );
}