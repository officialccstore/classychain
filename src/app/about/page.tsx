'use client'

import Link from "next/link";
import { ArrowRight, Star, MapPin, Phone, Mail, Heart } from "lucide-react";

const showrooms = [
  {
    city: "Delhi – Kalkaji",
    area: "Kalka Ji, Delhi",
    phones: ["9310069736"],
    tag: "Flagship Store",
    note: "Our first home. Where it all started — and still the one with the widest wall of drops.",
  },
  {
    city: "Delhi – Dwarka",
    area: "Ramphal Chowk, Sector 7, Dwarka",
    phones: ["9258316931"],
    tag: "Community Favourite",
    note: "The store that never stops buzzing. Lifestyle sneakers, everyday comfort, and a team that knows your name.",
  },
];

const stats = [
  { number: "2+", label: "Showrooms" },
  { number: "50+", label: "Brands Stocked" },
  { number: "10,000+", label: "Happy Customers" },
  { number: "100%", label: "Authentic Pairs" },
];

const values = [
  {
    heading: "We Never Fake It",
    body: "Every shoe on our shelf is original, verified, and sourced directly. We'd rather stock fewer pairs than sell a single fake one. That's a promise we've kept since day one.",
  },
  {
    heading: "We Know Our Customers",
    body: "Our staff aren't salespeople. They're footwear obsessives who'll tell you honestly if a shoe doesn't suit you — and find you one that does.",
  },
  {
    heading: "We Started Local, We Stay Local",
    body: "ClassyChain was born in Delhi. Built for the streets of Kalkaji and Dwarka. Every step forward has been with our city in mind — and that never changes.",
  },
];

const reels = [
  { id: "DQ4HFBMkgY7", title: "Dwarka Ramphal Chowk walk-through" },
  { id: "DRBifF4EpAX", title: "Sneaker wall highlight" },
  { id: "DRL2O5_kkVp", title: "Store drop teaser" },
];

const contactPhones = Array.from(new Set(showrooms.flatMap((s) => s.phones)));

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative bg-[#080808] text-white overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(251,191,36,0.07),transparent_60%)] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-28 lg:py-36">
          <div className="flex items-center gap-3 mb-8">
            <span className="block w-10 h-px bg-amber-400" />
            <span className="text-amber-400 text-[11px] font-bold uppercase tracking-[0.3em]">Our Story</span>
          </div>

          <h1
            className="font-black text-white leading-[0.9] tracking-tight mb-8"
            style={{ fontSize: "clamp(2.8rem,8vw,6.5rem)" }}
          >
            Built by People<br />
            <span className="text-amber-400">Who Love Shoes.</span>
          </h1>

          <p className="text-white/50 text-lg leading-relaxed max-w-xl mb-10">
            ClassyChain didn&apos;t start as a business plan. It started as a belief —
            that people in Delhi deserve access to genuine, premium footwear without
            compromise. We opened our first showroom in Kalkaji and never looked back.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 bg-amber-400 text-black px-8 py-4 font-black text-[11px] uppercase tracking-[0.15em] hover:bg-amber-300 transition"
            >
              Shop Collection <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center border border-white/15 text-white/60 px-8 py-4 font-semibold text-[11px] uppercase tracking-[0.15em] hover:border-amber-400/40 hover:text-amber-400 transition"
            >
              Visit a Showroom
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="bg-amber-400">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-0">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`flex flex-col items-center py-6 ${i > 0 ? "border-l border-black/10" : ""}`}
            >
              <span className="font-black text-4xl text-black leading-none">{s.number}</span>
              <span className="text-black/60 text-[11px] font-bold uppercase tracking-[0.2em] mt-1">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── STORY SECTION ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="block w-8 h-px bg-amber-400" />
            <span className="text-amber-500 text-[11px] font-bold uppercase tracking-[0.3em]">Who We Are</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-black leading-tight mb-6">
            The Store Your<br />City Needed.
          </h2>
          <p className="text-gray-500 leading-relaxed mb-5">
            Before ClassyChain, finding original branded footwear in Delhi meant
            navigating grey-market stores, fake imports, or spending hours online
            with no guarantee of what would arrive. We knew there was a better way.
          </p>
          <p className="text-gray-500 leading-relaxed mb-5">
            So we built showrooms — physical, real spaces where you can touch the
            shoe, feel the sole, and walk out confident. Where our staff remembers
            your last purchase and recommends the next one honestly.
          </p>
          <p className="text-gray-900 font-semibold leading-relaxed">
            ClassyChain isn&apos;t just a shoe store. It&apos;s the place you come back to.
          </p>
        </div>

        {/* Visual quote block */}
        <div className="relative">
          <div className="bg-[#080808] p-10 relative overflow-hidden">
            <div
              className="absolute top-0 right-0 font-black text-[8rem] leading-none select-none pointer-events-none"
              style={{ color: "rgba(251,191,36,0.07)" }}
            >
              &ldquo;
            </div>
            <p className="text-white text-xl font-black leading-snug tracking-tight relative z-10 mb-8">
              &ldquo;We&apos;d rather you walk out with nothing than walk out with the wrong pair.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-400 flex items-center justify-center font-black text-black text-sm flex-shrink-0">
                CC
              </div>
              <div>
                <p className="text-white text-xs font-bold uppercase tracking-widest">The ClassyChain Team</p>
                <p className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">Delhi, Since 2022</p>
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-amber-400" />
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────── */}
      <section className="bg-[#f7f5f0] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="block w-8 h-px bg-amber-400" />
              <span className="text-amber-500 text-[11px] font-bold uppercase tracking-[0.3em]">What We Stand For</span>
              <span className="block w-8 h-px bg-amber-400" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-black leading-tight">
              Three Things We<br />Won&apos;t Compromise On.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white p-8 border-t-2 border-amber-400">
                <div className="w-8 h-8 bg-amber-400 flex items-center justify-center font-black text-black text-sm mb-6 flex-shrink-0">
                  0{i + 1}
                </div>
                <h3 className="font-black text-lg text-black mb-3">{v.heading}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOWROOMS ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="flex items-center gap-3 mb-4">
          <span className="block w-8 h-px bg-amber-400" />
          <span className="text-amber-500 text-[11px] font-bold uppercase tracking-[0.3em]">Find Us</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-black leading-tight mb-14">
          Come Walk In.<br />We&apos;ll Take It From There.
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {showrooms.map((store) => (
            <div key={store.city} className="border border-gray-200 p-8 hover:border-amber-400 transition-colors group">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 bg-amber-50 px-3 py-1 mb-5">
                {store.tag}
              </span>
              <h3 className="font-black text-xl text-black mb-1 group-hover:text-amber-600 transition-colors">
                {store.city}
              </h3>
              <div className="flex items-start gap-2 text-gray-400 text-sm mb-4">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{store.area}</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{store.note}</p>
              <div className="flex flex-col gap-2">
                {store.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-black hover:text-amber-600 transition"
                  >
                    <Phone className="w-3.5 h-3.5" /> {phone}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INSTAGRAM REELS ──────────────────────────────────── */}
      <section className="bg-[#f7f5f0] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="block w-8 h-px bg-amber-400" />
              <span className="text-amber-500 text-[11px] font-bold uppercase tracking-[0.3em]">Inside the Store</span>
              <span className="block w-8 h-px bg-amber-400" />
            </div>
            <h2 className="text-4xl font-black text-black leading-tight">See It Before You Visit.</h2>
            <p className="text-gray-400 mt-3 text-sm">Real footage. Real shelves. No filters.</p>
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

      {/* ── LOVE NOTE ────────────────────────────────────────── */}
      <section className="bg-[#080808] py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Heart className="w-6 h-6 text-amber-400 mx-auto mb-8" />
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-6">
            Every pair we sell carries<br />a little piece of this city.
          </h2>
          <p className="text-white/40 leading-relaxed max-w-xl mx-auto">
            The regulars who come in every drop season. The first-time buyer nervous
            about spending big. The parent buying a gift. We remember you all. And
            we show up every day because of you — not despite it.
          </p>
          <div className="flex gap-0.5 justify-center mt-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-white/20 text-xs uppercase tracking-[0.3em] mt-3">
            Rated 5 stars by thousands of customers
          </p>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────── */}
      <section id="contact" className="max-w-6xl mx-auto px-6 py-24">
        <div className="bg-[#080808] text-white p-10 sm:p-14">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="block w-8 h-px bg-amber-400" />
                <span className="text-amber-400 text-[11px] font-bold uppercase tracking-[0.3em]">Get in Touch</span>
              </div>
              <h3 className="text-3xl font-black text-white leading-tight mb-4">
                We&apos;re Real People.<br />Talk to Us.
              </h3>
              <p className="text-white/40 leading-relaxed mb-8">
                No bots. No ticketing queues. Just call or DM and someone from the
                team will pick up — the same way we have since we opened.
              </p>
              <div className="space-y-4">
                <a
                  href="mailto:officialccstore@gmail.com"
                  className="flex items-center gap-3 text-white/60 hover:text-amber-400 transition text-sm group"
                >
                  <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  officialccstore@gmail.com
                </a>
                {contactPhones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone}`}
                    className="flex items-center gap-3 text-white/60 hover:text-amber-400 transition text-sm"
                  >
                    <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    +91 {phone}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                href="https://www.instagram.com/classychain_official_/"
                className="flex items-center justify-between px-6 py-4 border border-white/10 text-white hover:border-amber-400 hover:text-amber-400 transition group"
              >
                <span className="font-bold text-sm uppercase tracking-widest">DM on Instagram</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              {contactPhones.map((phone) => (
                <Link
                  key={phone}
                  href={`tel:${phone}`}
                  className="flex items-center justify-between px-6 py-4 bg-amber-400 text-black hover:bg-amber-300 transition group"
                >
                  <span className="font-black text-sm uppercase tracking-widest">Call {phone}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
              <Link
                href="/products"
                className="flex items-center justify-between px-6 py-4 border border-white/10 text-white/50 hover:border-amber-400 hover:text-amber-400 transition group"
              >
                <span className="font-bold text-sm uppercase tracking-widest">Browse the Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
