import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { addItem, approveReview, delItem } from "@/app/admin/actions2";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { Button, Card, EmptyState, FormField, Input, PageHeader, Textarea, Toast } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function Content({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const query = await searchParams;
  const [banners, testimonials, faqs, reviews] = await Promise.all([
    db.promotionalBanner.findMany({ orderBy: { position: "asc" } }),
    db.testimonial.findMany({ orderBy: { createdAt: "desc" } }),
    db.faq.findMany({ orderBy: { position: "asc" } }),
    db.productReview.findMany({ where: { approved: false }, include: { product: true }, orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <>
      <PageHeader title="Homepage content" description="Manage promotional banners, testimonials, FAQs and submitted reviews." />
      {query.saved && <div className="mb-5"><Toast message={query.saved === "review" ? "Review updated." : "Homepage content saved."} /></div>}
      <div className="space-y-6">
        <Card id="banners" className="scroll-mt-24">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-semibold">Promotional banners</h2>
            <p className="mt-1 text-sm text-muted">Banners are shown on the storefront when active.</p>
          </div>
          <div className="p-5">
            {banners.length ? <ul className="mb-6 divide-y divide-line">{banners.map((banner) => (
              <li key={banner.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
                <div><p className="font-medium">{banner.title}</p>{banner.subtitle && <p className="text-sm text-muted">{banner.subtitle}</p>}</div>
                <ConfirmDialog action={delItem.bind(null, "banner", banner.id)} message={`Delete the banner "${banner.title}"?`}>
                  <Button type="submit" variant="danger">Delete</Button>
                </ConfirmDialog>
              </li>
            ))}</ul> : <EmptyState title="No banners yet" description="Create a banner to promote a current store message." />}
            <form action={addItem.bind(null, "banner")} className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
              <FormField label="Title" htmlFor="banner-title"><Input id="banner-title" name="title" required minLength={2} /></FormField>
              <FormField label="Subtitle" htmlFor="banner-subtitle"><Input id="banner-subtitle" name="subtitle" /></FormField>
              <FormField label="Link" htmlFor="banner-href" hint="Use an internal path such as /shop."><Input id="banner-href" name="href" placeholder="/shop" /></FormField>
              <div className="flex items-end"><Button type="submit">Add banner</Button></div>
            </form>
          </div>
        </Card>

        <Card id="testimonials" className="scroll-mt-24">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-semibold">Testimonials</h2>
            <p className="mt-1 text-sm text-muted">Publish only genuine customer feedback with permission.</p>
          </div>
          <div className="p-5">
            {testimonials.length ? <ul className="mb-6 divide-y divide-line">{testimonials.map((testimonial) => (
              <li key={testimonial.id} className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0">
                <div className="min-w-0 flex-1"><p className="font-medium">{testimonial.name}</p><p className="mt-1 whitespace-pre-wrap text-sm text-muted">{testimonial.body}</p></div>
                <ConfirmDialog action={delItem.bind(null, "testimonial", testimonial.id)} message={`Delete the testimonial from ${testimonial.name}?`}>
                  <Button type="submit" variant="danger">Delete</Button>
                </ConfirmDialog>
              </li>
            ))}</ul> : <EmptyState title="No testimonials yet" description="Approved customer feedback will appear on the storefront." />}
            <form action={addItem.bind(null, "testimonial")} className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
              <FormField label="Customer name" htmlFor="testimonial-name"><Input id="testimonial-name" name="name" required minLength={2} /></FormField>
              <FormField label="Feedback" htmlFor="testimonial-body"><Textarea id="testimonial-body" name="body" required minLength={5} /></FormField>
              <div className="sm:col-span-2"><Button type="submit">Add testimonial</Button></div>
            </form>
          </div>
        </Card>

        <Card id="faq" className="scroll-mt-24">
          <div className="border-b border-line px-5 py-4"><h2 className="font-semibold">Frequently asked questions</h2></div>
          <div className="p-5">
            {faqs.length ? <ul className="mb-6 divide-y divide-line">{faqs.map((faq) => (
              <li key={faq.id} className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0">
                <div className="min-w-0 flex-1"><p className="font-medium">{faq.question}</p><p className="mt-1 text-sm text-muted">{faq.answer}</p></div>
                <ConfirmDialog action={delItem.bind(null, "faq", faq.id)} message={`Delete the FAQ "${faq.question}"?`}>
                  <Button type="submit" variant="danger">Delete</Button>
                </ConfirmDialog>
              </li>
            ))}</ul> : <EmptyState title="No FAQs yet" description="Add answers to common customer questions." />}
            <form action={addItem.bind(null, "faq")} className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
              <FormField label="Question" htmlFor="faq-question"><Input id="faq-question" name="question" required minLength={3} /></FormField>
              <FormField label="Answer" htmlFor="faq-answer"><Textarea id="faq-answer" name="answer" required minLength={3} /></FormField>
              <div className="sm:col-span-2"><Button type="submit">Add FAQ</Button></div>
            </form>
          </div>
        </Card>

        <Card id="reviews" className="scroll-mt-24">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-semibold">Reviews awaiting approval</h2>
            <p className="mt-1 text-sm text-muted">Reviews are moderated before publication.</p>
          </div>
          <div className="p-5">
            {reviews.length ? <ul className="divide-y divide-line">{reviews.map((review) => (
              <li key={review.id} className="flex flex-wrap items-start gap-4 py-4 first:pt-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{review.product.name} | {review.rating}/5</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{review.body}</p>
                  <p className="mt-1 text-xs text-muted">{review.verifiedPurchase ? "Verified purchase" : "Unverified"} | {review.createdAt.toLocaleDateString("en-KE")}</p>
                </div>
                <form action={approveReview.bind(null, review.id)}><Button type="submit" variant="secondary">Approve</Button></form>
                <ConfirmDialog action={delItem.bind(null, "review", review.id)} message="Permanently delete this review?">
                  <Button type="submit" variant="danger">Delete</Button>
                </ConfirmDialog>
              </li>
            ))}</ul> : <EmptyState title="No reviews to moderate" description="New customer reviews will appear here after submission." />}
          </div>
        </Card>
      </div>
    </>
  );
}
