import Link from "next/link";

const showrooms = [
  {
    city: "Delhi – Kalkaji",
    area: "Kalka Ji, Delhi",
    phones: ["9310069736"],
    note: "Flagship store with the widest range of new drops.",
  },
  {
    city: "Delhi – Dwarka",
    area: "Ramphal Chowk, Sector 7, Dwarka",
    phones: ["9258316931"],
    note: "Popular for lifestyle sneakers and everyday comfort picks.",
  },
];

const highlights = [
  "Original international brands only",
  "Wide size runs with expert fitting help",
  "New launches, lifestyle sneakers, and formal classics",
  "Easy exchange support at the same store",
];

const contactPhones = Array.from(new Set(showrooms.flatMap((s) => s.phones)));

const heroImage = {
  src: "https://www.shutterstock.com/image-photo/close-female-legs-brown-leather-600nw-2210232001.jpg",
  alt: "Sneaker wall inside a modern footwear showroom",
};

const reels = [
  { id: "DQ4HFBMkgY7", title: "Dwarka Ramphal Chowk walk-through" },
  { id: "DRBifF4EpAX", title: "Sneaker wall highlight" },
  { id: "DRL2O5_kkVp", title: "Store drop teaser" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_30%)]" />
        <div className="max-w-6xl mx-auto px-6 py-20 relative z-10 grid gap-10 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.2em] text-yellow-300">
              About ClassyChain
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Multi-city showrooms for original branded footwear.
            </h1>
            <p className="text-lg text-gray-200 leading-relaxed">
              ClassyChain is a shoe showroom chain bringing verified
              international brands to Delhi and Agra. Visit for sneakers,
              formals, slides, and seasonal drops with size guidance from
              trained staff.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/products"
                className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition"
              >
                See What's In Store
              </Link>
              <Link
                href="#contact"
                className="px-6 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white/10 transition"
              >
                Call a Showroom
              </Link>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur space-y-4">
              <div className="text-sm uppercase tracking-[0.2em] text-gray-300">
                Showrooms
              </div>
              <ul className="space-y-3 text-gray-100">
                {showrooms.map((store) => (
                  <li key={store.city} className="flex flex-col">
                    <span className="font-semibold text-yellow-300">
                      {store.city}
                    </span>
                    <span className="text-sm text-gray-200">{store.area}</span>
                    <span className="text-sm text-gray-300">
                      Phones: {store.phones.join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img
                src={heroImage.src}
                alt={heroImage.alt}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="text-xs uppercase tracking-[0.2em] text-yellow-300">
                  In-store
                </div>
                <div className="font-semibold">Sneaker wall at ClassyChain</div>
                <div className="text-xs text-gray-200">
                  Lifestyle, running, and limited drops.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto pt-6 px-6 pb-6">
        <div className="space-y-3 mb-6">
          <p className="text-sm font-semibold text-yellow-600">See it live</p>
          <h3 className="text-2xl font-bold">Reels from our Instagram</h3>
          <p className="text-gray-600 max-w-3xl">
            Walk-throughs and product drops filmed in-store.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {reels.map((reel) => (
            <div
              key={reel.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="aspect-[9/16] w-full">
                <iframe
                  src={`https://www.instagram.com/reel/${reel.id}/embed`}
                  title={reel.title}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
              <div className="p-3 text-sm font-semibold text-gray-800">
                {reel.title}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-yellow-600">
            In-store experience
          </p>
          <h2 className="text-3xl font-bold">
            What to expect when you walk in
          </h2>
          <p className="text-gray-600 max-w-3xl">
            Every ClassyChain showroom is stocked with new launches and
            bestsellers across sports, lifestyle, and formal lines. Staff can
            help with sizing, comfort checks, and pairing.
          </p>
        </div>
        <div className="flex">
          <div className="p-6 border w-full border-gray-200 rounded-2xl shadow-sm bg-white">
            <div className="text-lg font-semibold">Showroom highlights</div>
            <ul className="mt-3 space-y-2 text-gray-600">
              {highlights.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="contact" className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-3xl bg-black text-white p-10 sm:p-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-yellow-300">
              Call a showroom
            </p>
            <h4 className="text-2xl font-bold">Talk to the ClassyChain team</h4>
            <p className="text-gray-200">
              Phone numbers are taken from ClassyChain's official Instagram and
              Facebook pages. Call to check stock, sizes, and directions before
              visiting.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {contactPhones.map((phone) => (
              <Link
                key={phone}
                href={`tel:${phone}`}
                className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition"
              >
                Call {phone}
              </Link>
            ))}
            <Link
              href="https://www.instagram.com/classychain_official_/"
              className="px-6 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white/10 transition"
            >
              DM on Instagram
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
