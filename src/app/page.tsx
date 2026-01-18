"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { LogoWithText } from "@/components/Logo";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Demo shoe data with placeholder images
  const heroSlides = [
    {
      title: "Premium Running Shoes",
      subtitle: "Engineered for Performance",
      desc: "Experience ultimate comfort with our advanced cushioning technology",
      color: "from-blue-600 to-cyan-500",
      emoji: "🏃‍♂️",
    },
    {
      title: "Elegant Casual Wear",
      subtitle: "Everyday Sophistication",
      desc: "Perfect blend of style and comfort for your daily adventures",
      color: "from-purple-600 to-pink-500",
      emoji: "🌟",
    },
    {
      title: "Formal Excellence",
      subtitle: "Timeless Elegance",
      desc: "Make a statement with our premium formal collection",
      color: "from-slate-700 to-slate-900",
      emoji: "✨",
    },
  ];

  const reels = [
    { id: "DQ4HFBMkgY7", title: "Dwarka Ramphal Chowk walk-through" },
    { id: "DRBifF4EpAX", title: "Sneaker wall highlight" },
    { id: "DRL2O5_kkVp", title: "Store drop teaser" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Keep scroll listener removed to avoid excessive re-renders

  return (
    <>
      <main>
        {/* Hero Carousel Section */}
        <section className="relative w-full min-h-screen md:h-screen overflow-hidden">
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className={`bg-gradient-to-r ${slide.color} w-full h-full flex flex-col md:flex-row items-center justify-center md:justify-between px-4 sm:px-8 md:px-16 py-12 md:py-0 gap-6 md:gap-0`}
              >
                {/* Left Content */}
                <div className="flex-1 z-10 text-white w-full md:w-auto text-center md:text-left">
                  <div className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full">
                    <span className="text-xs sm:text-sm font-semibold">
                      {slide.subtitle}
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-xl mx-auto md:mx-0">
                    {slide.desc}
                  </p>
                  <div className="flex gap-3 sm:gap-4 flex-col sm:flex-row sm:flex-wrap justify-center md:justify-start">
                    <Link
                      href="/products"
                      className="group px-6 sm:px-8 py-3 sm:py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      Shop Now
                    </Link>
                    <Link
                      href="/about"
                      className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition text-sm sm:text-base text-center"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>

                {/* Right Image Area */}
                <div className="flex-1 flex items-center justify-center relative w-full h-64 sm:h-72 md:h-full">
                  <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px]">
                    {/* Background circles for visual effect */}
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-5xl sm:text-7xl md:text-9xl lg:text-[200px] animate-bounce drop-shadow-2xl">
                        👟
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Slider Controls */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 sm:gap-3">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${
                  idx === currentSlide
                    ? "w-8 sm:w-12 bg-white"
                    : "w-2 sm:w-3 bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
        </section>

        {/* Instagram Reels */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="text-center">
              <span className="text-yellow-500 font-bold text-lg">
                IN-STORE VIDEOS
              </span>
              <h2 className="text-5xl font-black mt-2 mb-3">From Instagram</h2>
              <p className="text-gray-600 text-lg">
                See ClassyChain showrooms and new drops straight from our
                Instagram.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {reels.map((reel) => (
                <div
                  key={reel.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="aspect-[9/16] w-full">
                    <iframe
                      src={`https://www.instagram.com/reel/${reel.id}/embed`}
                      title={reel.title}
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                      className="h-full w-full"
                    />
                  </div>
                  <div className="p-3 text-sm font-semibold text-gray-800">
                    {reel.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "✨",
                  title: "Premium Quality",
                  desc: "Crafted with the finest materials and attention to detail",
                },
                {
                  icon: "🚚",
                  title: "Fast Shipping",
                  desc: "Quick and reliable delivery to your doorstep",
                },
                {
                  icon: "💝",
                  title: "Customer Care",
                  desc: "Dedicated support for your satisfaction",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="text-center p-8 rounded-lg hover:shadow-lg transition"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="bg-gray-50 py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black mb-4">Our Collections</h2>
              <p className="text-gray-600 text-lg">
                Discover our premium shoe collections
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categories.length > 0 ? (
                categories.slice(0, 4).map((category, idx) => {
                  const colors = [
                    "from-blue-500 to-blue-600",
                    "from-purple-500 to-purple-600",
                    "from-gray-700 to-gray-800",
                    "from-red-500 to-red-600",
                  ];
                  return (
                    <Link
                      key={category.id}
                      href={`/products?categoryId=${category.id}`}
                      className="group"
                    >
                      <div
                        className={`bg-gradient-to-br ${
                          colors[idx % colors.length]
                        } h-72 rounded-lg overflow-hidden relative flex items-end justify-start p-8 text-white hover:shadow-2xl transition transform hover:scale-105`}
                      >
                        <div className="relative z-10">
                          <h3 className="text-4xl font-black mb-2">
                            {category.name}
                          </h3>
                          <p className="text-lg opacity-90 mb-4">
                            Explore our {category.name.toLowerCase()} range
                          </p>
                          <button className="inline-flex items-center gap-2 bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition">
                            Explore <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <p className="text-gray-600">Loading collections...</p>
              )}
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="bg-white py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-yellow-500 font-bold text-lg">
                EXPLORE OUR RANGE
              </span>
              <h2 className="text-5xl font-black mt-2 mb-4">
                Featured Collections
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?categoryId=${category.id}`}
                  >
                    <div className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-lg transition hover:bg-yellow-50 cursor-pointer">
                      <div className="category-image text-5xl mb-4">👟</div>
                      <p className="font-bold text-sm md:text-base">
                        {category.name}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-600">Loading categories...</p>
              )}
            </div>
          </div>
        </section>

        {/* Best Selling Products */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-yellow-500 font-bold text-lg">
                OUR BEST SELLING ITEMS
              </span>
              <h2 className="text-5xl font-black mt-2 mb-4">
                Customer Favorites
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((product) => (
                <div
                  key={product}
                  className="group bg-white rounded-lg overflow-hidden hover:shadow-2xl transition"
                >
                  <div className="product-image relative h-64 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden flex items-center justify-center">
                    <div className="text-7xl">👟</div>
                    <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                      -35%
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">
                      Premium Shoe {product}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      High-quality footwear
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl font-black text-yellow-500">
                        ₹59
                      </span>
                      <span className="text-lg line-through text-gray-400">
                        ₹89
                      </span>
                    </div>
                    <div className="flex gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <button className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-yellow-500 font-bold text-lg">
                WHAT PEOPLE ARE SAYING
              </span>
              <h2 className="text-5xl font-black mt-2 mb-4">
                Customer Reviews
              </h2>
              <p className="text-gray-600">Over 500+ 5-Star Customer Reviews</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((review) => (
                <div key={review} className="bg-gray-50 p-8 rounded-lg">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">
                    "Absolutely love these shoes! The quality is exceptional and
                    they're so comfortable. Highly recommended!"
                  </p>
                  <div className="border-t pt-4">
                    <p className="font-bold">Customer {review}</p>
                    <p className="text-gray-500 text-sm">Verified Buyer</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-black mb-4 text-black">
              Ready to Step Into Style?
            </h2>
            <p className="text-xl text-black/80 mb-8">
              Join thousands of satisfied customers and discover your perfect
              shoe
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/products"
                className="px-8 py-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition"
              >
                Shop Now
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 border-2 border-black text-black font-bold rounded-lg hover:bg-black/10 transition"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-white py-16 px-4 border-t-2 border-yellow-400">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-black mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-8">
              Subscribe to our newsletter and get 10% off your first purchase
            </p>
            <div className="flex gap-2 flex-col md:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-400 outline-none"
              />
              <button className="bg-yellow-400 text-black px-8 py-3 font-bold rounded-lg hover:bg-yellow-300 transition whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <LogoWithText size="md" variant="light" />
              </div>
              <p className="text-gray-400">
                Premium footwear for those who dare to stand out. Quality,
                style, and comfort in every step.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/products" className="hover:text-yellow-400">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?category=running"
                    className="hover:text-yellow-400"
                  >
                    Running
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?category=casual"
                    className="hover:text-yellow-400"
                  >
                    Casual
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?category=formal"
                    className="hover:text-yellow-400"
                  >
                    Formal
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Information</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-yellow-400">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/about#contact" className="hover:text-yellow-400">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-yellow-400">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-yellow-400">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Get in Touch</h4>
              <p className="text-gray-400 mb-2">
                Email: support@classychain.com
              </p>
              <p className="text-gray-400">Phone: +1 (555) 123-4567</p>
              <div className="flex gap-4 mt-4">
                <a href="#" className="text-yellow-400 hover:text-yellow-300">
                  Facebook
                </a>
                <a href="#" className="text-yellow-400 hover:text-yellow-300">
                  Instagram
                </a>
                <a href="#" className="text-yellow-400 hover:text-yellow-300">
                  Twitter
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>
              &copy; 2026 ClassyChain. All rights reserved. Premium Footwear
              Store.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
