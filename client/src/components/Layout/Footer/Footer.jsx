import { AtSign, Mail, Phone } from "lucide-react";
import Container from "@/components/common/Container/Container";
import { SITE } from "@/constants/site";

function Footer() {
  return <footer className="bg-[#24181a] pb-7 pt-14 text-stone-300"><Container><div className="grid gap-10 border-b border-white/15 pb-12 md:grid-cols-[1.4fr_1fr_1fr]">
    <div><p className="font-serif text-3xl text-white">Royal Bridal</p><p className="mt-4 max-w-sm text-sm leading-6">Heirloom-inspired bridal jewellery, thoughtfully selected for your most memorable celebration.</p></div>
    <div><h2 className="text-xs font-bold uppercase tracking-[.2em] text-white">Visit</h2><a className="mt-4 flex items-center gap-2 text-sm hover:text-white" href={`tel:${SITE.PHONE.replaceAll(" ", "")}`}><Phone size={15} />{SITE.PHONE}</a><a className="mt-3 flex items-center gap-2 text-sm hover:text-white" href={`mailto:${SITE.EMAIL}`}><Mail size={15} />{SITE.EMAIL}</a></div>
    <div><h2 className="text-xs font-bold uppercase tracking-[.2em] text-white">Follow along</h2><a className="mt-4 flex items-center gap-2 text-sm hover:text-white" href={SITE.INSTAGRAM} target="_blank" rel="noreferrer"><AtSign size={16} />Instagram</a></div>
  </div><p className="pt-7 text-xs text-stone-500">© {new Date().getFullYear()} Royal Bridal. Made for your forever moments.</p></Container></footer>;
}

export default Footer;
