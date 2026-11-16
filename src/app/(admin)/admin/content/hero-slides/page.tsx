import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import HeroSlideEditor from "@/components/admin/HeroSlideEditor";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { Button, EmptyState, PageHeader, Toast } from "@/components/admin/ui";
import { deleteHeroSlide, saveHeroSlide } from "@/app/admin/hero-actions";
import { DEFAULT_INTRO_SLIDE, normalizeHeroSlide } from "@/lib/hero-slides";

export const dynamic = "force-dynamic";

export default async function HeroSlidesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const [slides, query] = await Promise.all([
    db.heroSlide.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
    searchParams,
  ]);
  const newSlide = {
    ...DEFAULT_INTRO_SLIDE,
    id: "new",
    position: slides.length + 1,
    eyebrow: "",
    headline: "",
    primaryLabel: "Shop now",
    primaryHref: "/shop",
    secondaryLabel: "How to order",
    secondaryHref: "https://www.beautyclick.co.ke/how-to-order/",
    active: false,
  };
  const saved = query.saved === "slide" ? "Hero slide saved." : query.saved === "deleted" ? "Hero slide deleted." : null;

  return (
    <>
      <PageHeader title="Hero slides" description="Edit the homepage carousel, add optional picture backgrounds, reorder slides, and control which slides are shown." action={{ href: "#new-slide", label: "Add hero slide" }} />
      {saved && <div className="mb-5"><Toast message={saved} /></div>}
      <div className="space-y-6">
        {!slides.length && <EmptyState title="No saved hero slides" description="The storefront will show the built-in introduction slide until you add and activate slides." />}
        {slides.map((slide) => {
          const initial = { ...normalizeHeroSlide(slide), active: slide.active };
          return (
            <div key={slide.id} id={`slide-${slide.id}`} className="scroll-mt-24">
              <HeroSlideEditor
                initial={initial}
                action={saveHeroSlide.bind(null, slide.id)}
                onDelete={
                  <ConfirmDialog action={deleteHeroSlide.bind(null, slide.id)} message={`Delete "${slide.headline}"? This cannot be undone.`}>
                    <Button type="submit" variant="danger">Delete slide</Button>
                  </ConfirmDialog>
                }
              />
            </div>
          );
        })}
        <div id="new-slide" className="scroll-mt-24">
          <HeroSlideEditor initial={newSlide} action={saveHeroSlide.bind(null, "new")} />
        </div>
      </div>
    </>
  );
}
