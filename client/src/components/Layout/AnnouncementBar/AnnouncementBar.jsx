import clsx from "clsx";
import { Truck } from "lucide-react";
import Container from "@/components/common/Container/Container";

const ANNOUNCEMENT = "Complimentary delivery across India";

/**
 * Must match `--rb-marquee-copies` in `src/index.css`, which divides the track by
 * this count to shift exactly one copy. Enough copies to cover the widest
 * container plus one, so the ticker never runs out of text and shows a gap.
 */
const MARQUEE_COPIES = 8;

/**
 * The message scrolls as a single track of identical copies. The `rb-marquee`
 * keyframe moves the track by exactly one copy width, so the copy leaving the
 * right edge is replaced seamlessly by the next one and the speed stays constant
 * no matter how many copies render. Both the bar and the track viewport clip
 * their overflow, so the ticker never widens the page.
 *
 * The truck sits outside the track and stays fixed while the text moves. Under
 * `prefers-reduced-motion` the animation is dropped and the duplicate copies are
 * removed, leaving the announcement centred and static.
 */
function AnnouncementBar() {
  return (
    <div className="overflow-hidden bg-[#24181a] text-white">
      <Container>
        <div className="flex h-9 items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em]">
          <Truck size={14} className="shrink-0" />

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex w-max animate-marquee motion-reduce:w-full motion-reduce:justify-center motion-reduce:animate-none">
              {Array.from({ length: MARQUEE_COPIES }, (_, index) => (
                <span
                  key={index}
                  aria-hidden={index > 0 ? "true" : undefined}
                  className={clsx(
                    "whitespace-nowrap px-4",
                    index > 0 && "motion-reduce:hidden",
                  )}
                >
                  {ANNOUNCEMENT}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default AnnouncementBar;