import { Truck, BadgeIndianRupee, MessageCircle } from "lucide-react";
import Container from "../../common/Container/Container";
import { SITE } from "../../../constants/site";

function AnnouncementBar() {
  const announcements = [
    {
      icon: <Truck size={16} />,
      text: "Free Shipping Across India",
    },
    {
      icon: <BadgeIndianRupee size={16} />,
      text: "Cash on Delivery Available",
    },
    {
      icon: <MessageCircle size={16} />,
      text: "WhatsApp Support",
      href: `https://wa.me/${SITE.WHATSAPP}`,
    },
  ];

  return (
    <div className="bg-rose-700 text-white">
      <Container>
        <div className="flex h-10 items-center justify-center gap-8 text-sm font-medium">
          {announcements.map((item) =>
            item.href ? (
              <a
                key={item.text}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-2 transition hover:text-rose-200 md:flex"
              >
                {item.icon}
                <span>{item.text}</span>
              </a>
            ) : (
              <div
                key={item.text}
                className="hidden items-center gap-2 md:flex"
              >
                {item.icon}
                <span>{item.text}</span>
              </div>
            )
          )}

          {/* Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <Truck size={16} />
            <span>Free Shipping Across India</span>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default AnnouncementBar;