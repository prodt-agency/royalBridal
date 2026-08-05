import { Truck } from "lucide-react";
import Container from "@/components/common/Container/Container";

function AnnouncementBar() { return <div className="bg-[#24181a] text-white"><Container><div className="flex h-9 items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[.16em]"><Truck size={14} />Complimentary delivery across India</div></Container></div>; }

export default AnnouncementBar;
