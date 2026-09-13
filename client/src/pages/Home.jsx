import { useEffect, useState } from "react";
import { ArrowRight, Gem, HeartHandshake, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "@/components/common/Container/Container";
import SectionHeading from "@/components/common/SectionHeading/SectionHeading";
import Button from "@/components/common/Button/Button";
import ProductGrid from "@/components/home/ProductGrid";
import Seo from "@/components/Seo";
import heroImage from "@/assets/hero.jpg";
import { productService } from "@/services/product.service";
import { getImageUrl } from "@/utils/image";

const brandPillars = [
  [Gem, "A considered edit", "Discover jewellery selected to complement every bridal expression."],
  [Sparkles, "Details that matter", "Explore finishing touches that feel personal to your celebration."],
  [HeartHandshake, "Made for the moment", "Find the pieces that complete the traditions you hold close."],
];

const getItems = (data) => Array.isArray(data) ? data : (data?.data ?? data?.products ?? data?.categories ?? []);

function CategoryCard({ category }) {
  return (
    <Link to={`/products?category=${category.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-[#ded0c2] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7d2034]">
      {category.image ? (
        <img src={getImageUrl(category.image)} alt={category.name} loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]" />
      ) : (
        <div className="grid h-full place-items-center bg-[#c7a586] font-serif text-6xl text-white/80">{category.name.charAt(0)}</div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#24181a]/80 via-[#24181a]/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
        <p className="font-serif text-2xl leading-tight">{category.name}</p>
        <span className="mt-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] transition-transform duration-300 group-hover:translate-x-1">Shop collection <ArrowRight size={14} /></span>
      </div>
    </Link>
  );
}

function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([productService.getCategories(), productService.getFeatured(), productService.getLatest()])
      .then(([categoryResult, featuredResult, latestResult]) => {
        if (!active) return;
        if (categoryResult.status === "fulfilled") setCategories(getItems(categoryResult.value));
        if (featuredResult.status === "fulfilled") setFeatured(getItems(featuredResult.value));
        if (latestResult.status === "fulfilled") setLatest(getItems(latestResult.value));
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return (
    <>
      <Seo title="Royal Bridal | Jewellery for your forever moment" description="Discover bridal jewellery selected for every celebration." />

      <section className="overflow-hidden bg-[#f5ede5]">
        <Container className="grid min-h-[620px] items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.15fr_.85fr] lg:gap-16 lg:py-12">
          <div className="max-w-2xl py-4 lg:py-10">
            <p className="text-[11px] font-bold uppercase tracking-[.32em] text-[#9b6b35] sm:text-xs">The bridal edit</p>
            <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[.94] tracking-[-.035em] text-[#24181a] sm:text-6xl lg:text-7xl">Jewellery for your <em className="font-light">forever</em> moment.</h1>
            <p className="mt-7 max-w-md text-base leading-7 text-stone-600 sm:text-lg">A considered collection of bridal adornments, made to complete the day you have always imagined.</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button size="lg" onClick={() => document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" })}>Explore the collection <ArrowRight size={16} /></Button>
              <Link to="/products" className="inline-flex items-center gap-2 border-b border-[#7d2034] pb-1 text-xs font-bold uppercase tracking-[.16em] text-[#7d2034] transition hover:text-[#5f1727]">Shop all pieces <ArrowRight size={15} /></Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[480px] self-end lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#d8cabd]">
              <img src={heroImage} alt="Bride wearing traditional jewellery" className="h-full w-full object-cover object-center" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#24181a]/50 to-transparent" />
              <p className="absolute bottom-6 left-6 max-w-[11rem] font-serif text-2xl leading-[1.05] text-white sm:bottom-8 sm:left-8 sm:text-3xl">For the story only you can tell.</p>
            </div>
            <div className="absolute -bottom-4 -left-4 hidden h-24 w-24 border border-[#9b6b35]/60 lg:block" />
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mb-9 flex flex-col justify-between gap-5 sm:mb-11 sm:flex-row sm:items-end">
            <SectionHeading eyebrow="Made for every ritual" title="Discover your bridal expression" description="Find the pieces that speak to your celebration." align="left" />
            <Link to="/products" className="mb-9 inline-flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#7d2034] hover:text-[#5f1727] sm:mb-0">View all collections <ArrowRight size={15} /></Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">{Array.from({ length: 3 }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse bg-stone-200" />)}</div>
          ) : categories.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">{categories.slice(0, 3).map((category) => <CategoryCard key={category.id} category={category} />)}</div>
          ) : null}
        </Container>
      </section>

      <section id="featured" className="bg-[#fbf8f5] py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mb-10 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <SectionHeading eyebrow="Our signatures" title="Featured treasures" description="A focused edit of pieces chosen to make an entrance." align="left" />
            <Link to="/products" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#7d2034] hover:text-[#5f1727]">View collection <ArrowRight size={15} /></Link>
          </div>
          <ProductGrid products={featured} loading={loading} />
        </Container>
      </section>

      <section className="bg-[#24181a] py-16 text-white sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:gap-20">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.3em] text-[#e6c98c]">The Royal Bridal edit</p>
              <h2 className="mt-5 max-w-md font-serif text-4xl leading-[1.02] tracking-[-.025em] sm:text-5xl">A beautiful beginning, thoughtfully considered.</h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-stone-300 sm:text-base">Explore a collection designed around the colour, detail and meaning you want to carry into your celebration.</p>
              <Link to="/products" className="mt-8 inline-flex items-center gap-2 border-b border-[#e6c98c] pb-1 text-xs font-bold uppercase tracking-[.16em] text-[#e6c98c] transition hover:text-white">Explore the edit <ArrowRight size={15} /></Link>
            </div>
            <div className="grid gap-7 sm:grid-cols-3 sm:gap-5">{brandPillars.map(([Icon, title, text]) => <div key={title} className="border-t border-white/25 pt-5"><Icon size={21} className="text-[#e6c98c]" /><h3 className="mt-5 font-serif text-2xl leading-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-stone-300">{text}</p></div>)}</div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <SectionHeading eyebrow="Just arrived" title="New in the collection" description="The latest additions to our bridal edit." align="left" />
            <Link to="/products?sort=createdAt&order=desc" className="mb-9 inline-flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#7d2034] hover:text-[#5f1727] sm:mb-0">Shop new arrivals <ArrowRight size={15} /></Link>
          </div>
          <ProductGrid products={latest} loading={loading} />
        </Container>
      </section>

      <section className="bg-[#efe2d4] py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[.3em] text-[#9b6b35]">Begin your edit</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-.025em] text-[#24181a] sm:text-5xl">Find the finishing touch for your celebration.</h2>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-stone-600 sm:text-base">Browse the collection and discover bridal jewellery that feels distinctly yours.</p>
            <Link to="/products" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#7d2034] px-6 py-3.5 text-sm font-semibold uppercase tracking-[.14em] text-white transition hover:bg-[#5f1727]">Shop the collection <ArrowRight size={16} /></Link>
          </div>
        </Container>
      </section>
    </>
  );
}

export default Home;
