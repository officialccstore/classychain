"use client";

import Link from "next/link";
import { ArrowRight, Star, Truck, RefreshCw, Shield, Flame, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { LogoWithText } from "@/components/Logo";

interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  image: string;
  brand: string;
}

interface Category {
  id: string;
  name: string;
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [heroProducts, setHeroProducts] = useState<Product[]>([]);
  const [homeReels, setHomeReels] = useState<{ id: string; url: string; title: string }[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [dealActive, setDealActive] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  // Parallax scroll listener — passive for performance
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/homepage/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.featuredProducts) setFeaturedProducts(data.featuredProducts);
        if (data.heroProducts) setHeroProducts(data.heroProducts);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/reels?page=home")
      .then((r) => r.json())
      .then((data) => { if (data.reels) setHomeReels(data.reels); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/deal")
      .then((r) => r.json())
      .then((data) => setDealActive(!!data.deal))
      .catch(() => {});
  }, []);

  const heroSlides = [
    {
      subtitle: "New Season · 2026",
      title: "Walk Like\nYou Mean It",
      desc: "Every step you take tells a story. Wear boots that make yours unforgettable.",
      tag: "Statement",
    },
    {
      subtitle: "Crafted for the Daring",
      title: "Born to\nBe Bold",
      desc: "Life's too short for ordinary footwear. The streets remember the ones who stood apart.",
      tag: "Identity",
    },
    {
      subtitle: "Leave Your Mark",
      title: "Every Step.\nYour Legacy.",
      desc: "They'll forget your words. They'll remember how you walked into the room.",
      tag: "Legacy",
    },
  ];


  const reviews = [
    {
      name: "Arjun M.",
      text: "I wore these to my job interview. Got the job. I'm not saying the boots did it — but I'm not saying they didn't.",
      rating: 5,
    },
    {
      name: "Priya S.",
      text: "I've never had so many strangers compliment my footwear. ClassyChain just gets it. Delivery was fast, packaging was beautiful.",
      rating: 5,
    },
    {
      name: "Rahul K.",
      text: "Third pair and counting. Once you know what real craftsmanship feels like under your feet, you can't go back.",
      rating: 5,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % heroSlides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  // Clamp parallax so it doesn't go wild
  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
  const parallaxBg = clamp(scrollY * 0.38, 0, 220);   // background image moves slower
  const parallaxShoe = clamp(scrollY * -0.18, -120, 0); // shoe floats upward relative to section

  return (
    <>
      <main>
        {/* ═══════════════════════════════════════
            HERO — Full-bleed + parallax
        ═══════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="relative w-full h-screen min-h-[680px] bg-[#080808] overflow-hidden"
        >
          {/* Subtle 80px grid texture */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />

          {heroSlides.map((slide, idx) => {
            const heroImg = heroProducts[idx]?.image;
            const shoeImg = heroImg;

            return (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 z-10 ${
                  idx === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                {/* ── BACKGROUND LAYER (parallax) ── */}
                <div
                  className="absolute inset-x-0 pointer-events-none"
                  style={{
                    top: "-18%",
                    bottom: "-18%",
                    transform: `translateY(${parallaxBg}px)`,
                    willChange: "transform",
                  }}
                >
                  {/* Full-bleed shoe background */}
                  <img
                    src={heroImg}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: "70% center" }}
                    loading="eager"
                  />
                  {/* Darken overall so text pops */}
                  <div className="absolute inset-0 bg-[#080808]/30" />
                </div>

                {/* ── LEFT GRADIENT — ensures text is always readable ── */}
                <div
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(8,8,8,0.88) 28%, rgba(8,8,8,0.65) 48%, rgba(8,8,8,0.18) 70%, rgba(8,8,8,0.0) 100%)",
                  }}
                />
                {/* ── BOTTOM gradient ── */}
                <div
                  className="absolute inset-x-0 bottom-0 h-40 pointer-events-none z-10"
                  style={{
                    background: "linear-gradient(to top, rgba(8,8,8,0.7) 0%, transparent 100%)",
                  }}
                />

                {/* ── CONTENT LAYER ── */}
                <div className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-12 md:px-16 flex items-center">

                  {/* Left vertical accent — desktop only */}
                  <div className="absolute left-6 top-0 h-full items-center hidden lg:flex flex-col">
                    <div className="flex-1 w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
                    <span className="text-amber-400/40 text-[9px] font-bold uppercase tracking-[0.4em] [writing-mode:vertical-rl] rotate-180 py-6 flex-shrink-0">
                      {slide.tag}
                    </span>
                    <div className="flex-1 w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
                  </div>

                  <div className="grid lg:grid-cols-[1fr_1fr] items-center gap-12 w-full">

                    {/* ── LEFT: Editorial copy ── */}
                    <div className="lg:pl-12">
                      <div className="flex items-center gap-4 mb-8 sm:mb-10">
                        <span className="block w-10 h-px bg-amber-400 flex-shrink-0" />
                        <span className="text-amber-400 text-[11px] font-bold uppercase tracking-[0.28em]">
                          {slide.subtitle}
                        </span>
                      </div>

                      <h1
                        className="font-black text-white leading-[0.88] tracking-tight mb-8 whitespace-pre-line"
                        style={{ fontSize: "clamp(3rem,9vw,7.5rem)" }}
                      >
                        {slide.title}
                      </h1>

                      <p className="text-white/50 text-[15px] leading-relaxed mb-10 max-w-[360px]">
                        {slide.desc}
                      </p>

                      <div className="flex flex-wrap gap-4">
                        <Link
                          href="/products"
                          className="group inline-flex items-center gap-3 bg-amber-400 text-black px-8 py-4 font-black text-[11px] uppercase tracking-[0.15em] hover:bg-amber-300 transition-colors"
                        >
                          Shop Collection
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                          href="/about"
                          className="inline-flex items-center border border-white/15 text-white/60 px-8 py-4 font-semibold text-[11px] uppercase tracking-[0.15em] hover:border-amber-400/40 hover:text-amber-400 transition-colors"
                        >
                          Our Story
                        </Link>
                      </div>
                    </div>

                    {/* ── RIGHT: Floating shoe image (desktop) ── */}
                    <div
                      className="hidden lg:flex items-center justify-center relative"
                      style={{
                        transform: `translateY(${parallaxShoe}px)`,
                        willChange: "transform",
                      }}
                    >
                      {/* Ambient glow behind shoe */}
                      <div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                          background:
                            "radial-gradient(ellipse at center, rgba(196,160,60,0.12) 0%, transparent 68%)",
                        }}
                      />

                      {/* Shoe image */}
                      <div className="relative w-[420px] h-[420px] xl:w-[500px] xl:h-[500px]">
                        {shoeImg ? (
                          <img
                            key={shoeImg}
                            src={shoeImg}
                            alt={slide.title}
                            className="w-full h-full object-contain transition-opacity duration-700"
                            style={{
                              filter:
                                "drop-shadow(0 32px 80px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(196,160,60,0.15))",
                            }}
                          />
                        ) : (
                          // Fallback monogram while loading
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <div className="text-amber-400 font-black" style={{ fontSize: "5rem" }}>CC</div>
                            <div className="text-white/20 text-[9px] uppercase tracking-[0.5em] mt-2">Est. 2024</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Giant slide counter — decorative, bottom-right */}
                  <div
                    className="absolute bottom-12 right-0 text-white/[0.05] font-black select-none hidden lg:block"
                    style={{ fontSize: "clamp(5rem,14vw,10rem)", lineHeight: 1 }}
                  >
                    0{idx + 1}
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── Prev / Next arrows ── */}
          <button
            onClick={() => setCurrentSlide(p => (p - 1 + heroSlides.length) % heroSlides.length)}
            aria-label="Previous slide"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide(p => (p + 1) % heroSlides.length)}
            aria-label="Next slide"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* ── Slide indicators ── */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-500 h-px rounded-none ${
                  idx === currentSlide ? "w-14 bg-amber-400" : "w-4 bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>

          {/* ── Scroll cue ── */}
          <div className="absolute bottom-9 right-10 hidden md:flex flex-col items-center gap-2 text-white/20 z-30">
            <span className="text-[9px] uppercase tracking-[0.4em] font-bold">Scroll</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
          </div>
        </section>

        {/* ═══════════════════════════════════════
            TRUST STRIP
        ═══════════════════════════════════════ */}
        <section className="bg-[#080808] border-t border-white/[0.05]">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row">
            {[
              { icon: <RefreshCw className="w-4 h-4" />, label: "Easy Returns", sub: "No questions asked, 30 days" },
              { icon: <Shield className="w-4 h-4" />, label: "100% Authentic", sub: "Real quality, real you" },
            ].map((b, i) => (
              <div
                key={i}
                className={`flex items-center gap-3.5 px-10 py-7 flex-1 justify-center ${
                  i > 0 ? "sm:border-l border-t sm:border-t-0 border-white/[0.05]" : ""
                }`}
              >
                <span className="text-amber-400 flex-shrink-0">{b.icon}</span>
                <div>
                  <p className="text-white text-xs font-bold uppercase tracking-widest">{b.label}</p>
                  <p className="text-white/30 text-xs mt-0.5">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            DEAL OF THE DAY
        ═══════════════════════════════════════ */}
        {dealActive && (
          <section className="bg-amber-400">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <Flame className="w-5 h-5 text-black flex-shrink-0" />
                <div>
                  <p className="font-black text-black text-sm uppercase tracking-widest">Deal of the Day</p>
                  <p className="text-black/60 text-xs">Today only — don&apos;t let this one walk away</p>
                </div>
              </div>
              <Link
                href="/deals"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 font-black text-[11px] uppercase tracking-widest hover:bg-gray-900 transition whitespace-nowrap"
              >
                View Deals <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════
            COLLECTIONS
        ═══════════════════════════════════════ */}
        {categories.length > 0 && (
          <section className="bg-white py-24 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-16">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="block w-8 h-px bg-amber-400" />
                    <span className="text-amber-500 text-[11px] font-bold uppercase tracking-[0.3em]">
                      Shop by Category
                    </span>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-black text-black leading-tight">Find Your Sole</h2>
                </div>
                <Link
                  href="/products"
                  className="hidden sm:inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-black/40 hover:text-amber-500 transition border-b border-black/20 hover:border-amber-500 pb-0.5"
                >
                  All Products <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="border-t border-black/10 divide-y divide-black/10">
                {categories.slice(0, 4).map((cat, idx) => (
                  <Link
                    key={cat.id}
                    href={`/products?categoryId=${cat.id}`}
                    className="group relative flex items-center justify-between py-6 sm:py-9 -mx-4 px-4 sm:-mx-6 sm:px-6 overflow-hidden transition-colors duration-300 hover:bg-[#faf7f0]"
                  >
                    <span className="absolute left-0 top-0 h-full w-[3px] bg-amber-400 origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                    <div className="flex items-baseline gap-4 sm:gap-8">
                      <span className="text-black/30 group-hover:text-amber-500 text-xs sm:text-sm font-bold tracking-widest transition-colors duration-300">
                        0{idx + 1}
                      </span>
                      <h3 className="text-3xl sm:text-6xl font-black text-black uppercase tracking-tight leading-none group-hover:text-amber-500 group-hover:translate-x-1.5 transition-all duration-300">
                        {cat.name}
                      </h3>
                    </div>
                    <ArrowRight className="w-5 h-5 sm:w-8 sm:h-8 text-black/15 group-hover:text-amber-500 group-hover:translate-x-2 transition-all duration-300 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════
            NEW ARRIVALS
        ═══════════════════════════════════════ */}
        {featuredProducts.length > 0 && (
          <section className="bg-[#f7f5f0] py-24 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-16">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="block w-8 h-px bg-amber-400" />
                    <span className="text-amber-500 text-[11px] font-bold uppercase tracking-[0.3em]">Just Landed</span>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-black text-black leading-tight">Fresh Off the Block</h2>
                </div>
                <Link
                  href="/products?sort=newest"
                  className="hidden sm:inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-black/40 hover:text-amber-500 transition border-b border-black/20 hover:border-amber-500 pb-0.5"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredProducts.slice(0, 4).map((product, idx) => (
                  <Link key={product.id} href={`/products/${product.id}`} className="group">
                    <div className="bg-white overflow-hidden">
                      <div className="aspect-square bg-gray-50 overflow-hidden relative">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#f0ede8]">
                            <span className="font-black text-5xl" style={{ color: "rgba(0,0,0,0.08)" }}>CC</span>
                          </div>
                        )}
                        {product.mrp && product.mrp > product.price && (
                          <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                            -{Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                          </span>
                        )}
                        <div
                          className="absolute top-3 right-3 font-black text-[10px] uppercase tracking-widest select-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                          style={{ color: "rgba(0,0,0,0.15)" }}
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                      </div>
                      <div className="p-4 border-b border-gray-100 flex flex-col">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                          {product.brand}
                        </p>
                        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-amber-600 transition leading-snug" style={{ minHeight: '2.5rem' }}>
                          {product.name}
                        </h3>
                        <div className="flex items-baseline gap-2 mt-3">
                          <span className="font-black text-base text-black">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                          {product.mrp && product.mrp > product.price && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{product.mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-10 sm:hidden">
                <Link
                  href="/products?sort=newest"
                  className="inline-flex items-center gap-2 text-[11px] font-black text-black border-2 border-black px-8 py-3 uppercase tracking-widest hover:bg-black hover:text-white transition"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════
            INSTAGRAM REELS
        ═══════════════════════════════════════ */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="block w-8 h-px bg-amber-400" />
                <span className="text-amber-500 text-[11px] font-bold uppercase tracking-[0.3em]">Follow Along</span>
                <span className="block w-8 h-px bg-amber-400" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-black leading-tight">From Instagram</h2>
              <p className="text-gray-400 mt-3 text-sm">ClassyChain showrooms &amp; new drops</p>
            </div>
            {homeReels.length > 0 && (
              <div className="grid gap-5 md:grid-cols-3">
                {homeReels.map((reel) => {
                  const embedUrl = reel.url.replace(/\/?$/, '/') + 'embed';
                  return (
                    <div key={reel.id} className="overflow-hidden bg-[#0d0d0d]">
                      <div className="aspect-[9/16] w-full">
                        <iframe
                          src={embedUrl}
                          title={reel.title}
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                          className="h-full w-full"
                        />
                      </div>
                      {reel.title && (
                        <div className="p-4 border-t border-white/5">
                          <p className="text-sm font-semibold text-white/60">{reel.title}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            TESTIMONIALS
        ═══════════════════════════════════════ */}
        <section className="py-24 px-4 bg-[#f7f5f0]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="block w-8 h-px bg-amber-400" />
                <span className="text-amber-500 text-[11px] font-bold uppercase tracking-[0.3em]">Customer Love</span>
                <span className="block w-8 h-px bg-amber-400" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-black leading-tight">Worn. Loved. Repeated.</h2>
              <p className="text-gray-400 mt-3 text-sm">Real people. Real steps. Real love — 500+ five-star reviews.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {reviews.map((r, i) => (
                <div key={i} className="bg-white p-8 hover:shadow-md transition-shadow">
                  <div
                    className="font-black text-7xl leading-none select-none mb-4"
                    style={{ color: "rgba(251,191,36,0.18)" }}
                  >
                    &ldquo;
                  </div>
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(r.rating)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{r.text}</p>
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-5">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-gray-900 uppercase tracking-wider">{r.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Verified Buyer</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            CTA BANNER
        ═══════════════════════════════════════ */}
        <section className="relative py-28 px-4 bg-[#080808] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rounded-full border border-amber-400/[0.06]" style={{ width: "600px", height: "600px" }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rounded-full border border-amber-400/[0.03]" style={{ width: "900px", height: "900px" }} />
          </div>
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="block w-8 h-px bg-amber-400" />
              <span className="text-amber-400 text-[11px] font-bold uppercase tracking-[0.3em]">Ready?</span>
              <span className="block w-8 h-px bg-amber-400" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
              You&apos;ve Waited Long Enough.
            </h2>
            <p className="text-white/40 text-base mb-10 max-w-md mx-auto leading-relaxed">
              The right pair doesn&apos;t just complete an outfit — it completes how you feel walking out the door. Find yours today.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/products"
                className="px-10 py-4 bg-amber-400 text-black font-black text-[11px] uppercase tracking-widest hover:bg-amber-300 transition"
              >
                Shop Now
              </Link>
              <Link
                href="/about"
                className="px-10 py-4 border border-white/15 text-white font-semibold text-[11px] uppercase tracking-widest hover:border-amber-400/40 hover:text-amber-400 transition"
              >
                Our Story
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            NEWSLETTER
        ═══════════════════════════════════════ */}
        <section className="bg-white py-20 px-4 border-t border-gray-100">
          <div className="max-w-xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="block w-8 h-px bg-amber-400" />
              <span className="text-amber-500 text-[11px] font-bold uppercase tracking-[0.3em]">Newsletter</span>
              <span className="block w-8 h-px bg-amber-400" />
            </div>
            <h2 className="text-3xl font-black text-black mb-2">Be First. Always.</h2>
            <p className="text-gray-400 text-sm mb-8">Drop alerts, secret deals, and stories from behind the store — plus 10% off your first order.</p>
            {newsletterStatus === 'done' ? (
              <p className="text-green-600 font-bold text-sm py-4">You&apos;re in! Check your inbox for your 10% off code.</p>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newsletterEmail) return;
                  setNewsletterStatus('loading');
                  try {
                    await fetch('/api/newsletter', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: newsletterEmail }),
                    });
                    setNewsletterStatus('done');
                  } catch {
                    setNewsletterStatus('error');
                  }
                }}
                className="flex gap-0 flex-col sm:flex-row border-2 border-black overflow-hidden"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-5 py-3.5 outline-none text-sm bg-transparent text-black placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className="bg-black text-white px-7 py-3.5 font-black text-[11px] uppercase tracking-widest hover:bg-gray-800 transition whitespace-nowrap disabled:opacity-60"
                >
                  {newsletterStatus === 'loading' ? 'Sending…' : 'Subscribe'}
                </button>
              </form>
            )}
            {newsletterStatus === 'error' && (
              <p className="text-red-500 text-xs mt-2">Something went wrong. Try again.</p>
            )}
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer className="bg-[#080808] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="mb-5">
                <LogoWithText size="md" variant="light" />
              </div>
              <p className="text-white/30 text-sm leading-relaxed max-w-xs">
                For people who believe the first impression starts at the ground. We make sure it&apos;s a good one.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-[0.25em] mb-6 text-white/40">Categories</h4>
              <ul className="space-y-3 text-sm text-white/30">
                <li><Link href="/products" className="hover:text-amber-400 transition">All Products</Link></li>
                <li><Link href="/products?family=men" className="hover:text-amber-400 transition">Men&apos;s Collection</Link></li>
                <li><Link href="/products?family=women" className="hover:text-amber-400 transition">Women&apos;s Collection</Link></li>
                <li><Link href="/deals" className="hover:text-amber-400 transition">Deals</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-[0.25em] mb-6 text-white/40">Information</h4>
              <ul className="space-y-3 text-sm text-white/30">
                <li><Link href="/about" className="hover:text-amber-400 transition">About Us</Link></li>
                <li><Link href="/about#contact" className="hover:text-amber-400 transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-[0.25em] mb-6 text-white/40">Get in Touch</h4>
              <p className="text-sm text-white/30 mb-1">officialccstore@gmail.com</p>
              <a href="tel:+918287833844" className="block text-sm text-white/30 hover:text-amber-400 transition mb-6">+91 82878 33844</a>
              <div className="flex gap-5">
                <a href="https://www.instagram.com/classychain_official_/" target="_blank" rel="noopener noreferrer" className="text-[11px] text-amber-400 hover:text-amber-300 transition font-bold uppercase tracking-widest">Instagram</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-8 text-center text-white/20 text-xs uppercase tracking-widest">
            &copy; 2026 ClassyChain. All rights reserved. Premium Footwear Store.
          </div>
        </div>
      </footer>
    </>
  );
}
