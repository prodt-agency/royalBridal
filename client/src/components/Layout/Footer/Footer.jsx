import { Mail, Phone, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "@/components/common/Container/Container";
import { SITE } from "@/constants/site";

function Footer() {
  return (
    <footer className="bg-[#24181a] pb-7 pt-16 text-stone-300 sm:pt-20">
      <Container>
        <div className="grid gap-10 border-b border-white/15 pb-12 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-1">
            <p className="font-serif text-4xl tracking-[-.025em] text-white">Royal Bridal</p>
            <p className="mt-4 max-w-xs text-sm leading-6 text-stone-400">
              Heirloom-inspired bridal jewellery, thoughtfully selected for your most memorable celebration.
            </p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[.2em] text-white">Quick Links</h2>
            <ul className="mt-5 space-y-3 text-sm text-stone-400">
              <li>
                <Link to="/products" className="hover:text-white transition">All Collections</Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-white transition">Track Your Order</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition">Shopping Bag</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[.2em] text-white">Contact Us</h2>
            <a className="mt-5 flex items-center gap-2 text-sm text-stone-400 hover:text-white" href={`tel:${SITE.PHONE.replaceAll(" ", "")}`}>
              <Phone size={14} /> {SITE.PHONE}
            </a>
            <a className="mt-3 flex items-center gap-2 text-sm text-stone-400 hover:text-white" href={`mailto:${SITE.EMAIL}`}>
              <Mail size={14} /> {SITE.EMAIL}
            </a>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[.2em] text-white">Administration</h2>
            <Link to="/admin/login" className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[.14em] text-[#e6c98c] hover:underline">
              <ExternalLink size={13} /> Admin Portal
            </Link>
          </div>
        </div>
        <p className="pt-7 text-xs text-stone-500 text-center sm:text-left">
          © {new Date().getFullYear()} Royal Bridal. Made for your forever moments.
        </p>
      </Container>
    </footer>
  );
}

export default Footer;
