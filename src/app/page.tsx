"use client";

import Link from "next/link";
import { ArrowRight, Star, Truck, RefreshCw, Shield, Flame, ChevronDown } from "lucide-react";
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

// Reliable Unsplash shoe shots — used as slide backgrounds
const SLIDE_BG = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1800&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1800&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1800&q=85&auto=format&fit=crop",
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [scrollY, setScrollY] = useState(0);
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
    fetch("/api/products?limit=6&sort=newest")
      .then((r) => r.json())
      .then((data) =>
        setFeaturedProducts(
          Array.isArray(data.products) ? data.products : Array.isArray(data) ? data : []
        )
      )
      .catch(() => {});
  }, []);

  const heroSlides = [
    {
      subtitle: "New Season · 2026",
      title: "Premium\nRunning",
      desc: "Advanced cushioning meets sleek design. Built for those who move with intention.",
      tag: "Performance",
    },
    {
      subtitle: "Timeless Silhouettes",
      title: "Everyday\nElegance",
      desc: "The perfect union of comfort and timeless style for the modern connoisseur.",
      tag: "Classic",
    },
    {
      subtitle: "Black Tie Ready",
      title: "Formal\nExcellence",
      desc: "Command every room. Make an impression that lasts long after you've left.",
      tag: "Formal",
    },
  ];

  const reels = [
    { id: "DQ4HFBMkgY7", title: "Dwarka Ramphal Chowk walk-through" },
    { id: "DRBifF4EpAX", title: "Sneaker wall highlight" },
    { id: "DRL2O5_kkVp", title: "Store drop teaser" },
  ];

  const reviews = [
    {
      name: "Arjun M.",
      text: "Absolutely love the quality. These shoes are worth every rupee — comfortable from day one.",
      rating: 5,
    },
    {
      name: "Priya S.",
      text: "ClassyChain has the best collection I've found. Fast delivery and packaging was gorgeous.",
      rating: 5,
    },
    {
      name: "Rahul K.",
      text: "Bought 3 pairs already. The craftsmanship is exceptional. My go-to footwear brand.",
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
            // Right-side shoe: use actual product image, or fall back to Unsplash product shot
            const shoeImg =
              featuredProducts[idx]?.image || SLIDE_BG[idx];

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
                    src={SLIDE_BG[idx]}
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
              { icon: <Truck className="w-4 h-4" />, label: "Free Shipping", sub: "On all orders" },
              { icon: <RefreshCw className="w-4 h-4" />, label: "Easy Returns", sub: "30-day policy" },
              { icon: <Shield className="w-4 h-4" />, label: "Authentic Only", sub: "100% genuine" },
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
        <section className="bg-amber-400">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <Flame className="w-5 h-5 text-black flex-shrink-0" />
              <div>
                <p className="font-black text-black text-sm uppercase tracking-widest">Deal of the Day</p>
                <p className="text-black/60 text-xs">Exclusive offers — refreshed daily</p>
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
                  <h2 className="text-4xl sm:text-5xl font-black text-black leading-tight">Our Collections</h2>
                </div>
                <Link
                  href="/products"
                  className="hidden sm:inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-black/40 hover:text-amber-500 transition border-b border-black/20 hover:border-amber-500 pb-0.5"
                >
                  All Products <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.slice(0, 4).map((cat, idx) => {
                  const bgs = ["bg-[#0d0d0d]", "bg-[#1a1410]", "bg-[#0f1217]", "bg-[#161411]"];
                  return (
                    <Link key={cat.id} href={`/products?categoryId=${cat.id}`} className="group">
                      <div
                        className={`${bgs[idx % 4]} h-56 sm:h-72 relative overflow-hidden flex flex-col justify-between p-6`}
                      >
                        <div className="font-black text-5xl leading-none select-none" style={{ color: "rgba(255,255,255,0.06)" }}>
                          0{idx + 1}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
                          <div className="w-36 h-36 rounded-full border-2 border-white" />
                        </div>
                        <div>
                          <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] mb-2">Explore</p>
                          <h3 className="text-white font-black text-xl leading-tight">{cat.name}</h3>
                          <span className="inline-flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-widest mt-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            Shop now <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
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
                  <h2 className="text-4xl sm:text-5xl font-black text-black leading-tight">New Arrivals</h2>
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
                      <div className="p-4 border-b border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                          {product.brand}
                        </p>
                        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-3 group-hover:text-amber-600 transition leading-snug">
                          {product.name}
                        </h3>
                        <div className="flex items-baseline gap-2">
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
            <div className="grid gap-5 md:grid-cols-3">
              {reels.map((reel) => (
                <div key={reel.id} className="overflow-hidden bg-[#0d0d0d]">
                  <div className="aspect-[9/16] w-full">
                    <iframe
                      src={`https://www.instagram.com/reel/${reel.id}/embed`}
                      title={reel.title}
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                      className="h-full w-full"
                    />
                  </div>
                  <div className="p-4 border-t border-white/5">
                    <p className="text-sm font-semibold text-white/60">{reel.title}</p>
                  </div>
                </div>
              ))}
            </div>
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
              <h2 className="text-4xl sm:text-5xl font-black text-black leading-tight">What People Say</h2>
              <p className="text-gray-400 mt-3 text-sm">500+ five-star reviews from our customers</p>
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
              Step Into Style Today
            </h2>
            <p className="text-white/40 text-base mb-10 max-w-md mx-auto leading-relaxed">
              Join thousands of customers who trust ClassyChain for premium footwear
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
            <h2 className="text-3xl font-black text-black mb-2">Stay in the Loop</h2>
            <p className="text-gray-400 text-sm mb-8">Subscribe and get 10% off your first order</p>
            <div className="flex gap-0 flex-col sm:flex-row border-2 border-black overflow-hidden">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-5 py-3.5 outline-none text-sm bg-transparent text-black placeholder-gray-400"
              />
              <button className="bg-black text-white px-7 py-3.5 font-black text-[11px] uppercase tracking-widest hover:bg-gray-800 transition whitespace-nowrap">
                Subscribe
              </button>
            </div>
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
                Premium footwear for those who dare to stand out. Quality, style, and comfort in every step.
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
                <li><a href="#" className="hover:text-amber-400 transition">Terms &amp; Conditions</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-[0.25em] mb-6 text-white/40">Get in Touch</h4>
              <p className="text-sm text-white/30 mb-1">support@classychain.com</p>
              <p className="text-sm text-white/30 mb-6">+91 98765 43210</p>
              <div className="flex gap-5">
                <a href="#" className="text-[11px] text-amber-400 hover:text-amber-300 transition font-bold uppercase tracking-widest">Instagram</a>
                <a href="#" className="text-[11px] text-amber-400 hover:text-amber-300 transition font-bold uppercase tracking-widest">Facebook</a>
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
