"use client";

import { useActionState, useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import {
  Button,
  Card,
  Checkbox,
  FormField,
  Input,
  Select,
} from "@/components/admin/ui";
import HeroVisual from "@/components/hero/HeroVisual";
import HeroBackground from "@/components/hero/HeroBackground";
import { heroThemeSchema, type HeroActionState, type HeroSlideData } from "@/lib/hero-slides";

type EditableSlide = HeroSlideData & { active: boolean };
type SaveAction = (state: HeroActionState, formData: FormData) => Promise<HeroActionState>;

function formString(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === "string" ? value : "";
}

export default function HeroSlideEditor({
  initial,
  action,
  onDelete,
}: {
  initial: EditableSlide;
  action: SaveAction;
  onDelete?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [preview, setPreview] = useState<HeroSlideData>(initial);
  const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState(initial.backgroundImageUrl ?? null);
  const previewObjectUrl = useRef<string | null>(null);

  useEffect(() => () => {
    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
  }, []);

  function updatePreview(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const theme = heroThemeSchema.safeParse(formString(data, "theme"));

    setPreview((current) => ({
      ...current,
      position: Number(formString(data, "position")) || current.position,
      theme: theme.success ? theme.data : current.theme,
      eyebrow: formString(data, "eyebrow"),
      headline: formString(data, "headline"),
      primaryLabel: formString(data, "primaryLabel"),
      primaryHref: formString(data, "primaryHref"),
      secondaryLabel: formString(data, "secondaryLabel"),
      secondaryHref: formString(data, "secondaryHref"),
    }));
  }

  function updateBackgroundPreview(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    previewObjectUrl.current = URL.createObjectURL(file);
    setBackgroundPreviewUrl(previewObjectUrl.current);
  }

  function toggleBackgroundRemoval(event: ChangeEvent<HTMLInputElement>) {
    setBackgroundPreviewUrl(event.currentTarget.checked ? null : previewObjectUrl.current ?? initial.backgroundImageUrl ?? null);
  }

  const prefix = `hero-${initial.id}`;

  return (
    <Card className="p-4 sm:p-6">
      <form action={formAction} onChange={updatePreview}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h2 className="font-semibold">{initial.id === "new" ? "Add a hero slide" : initial.headline}</h2>
            <p className="mt-1 text-xs text-muted">Slide ID: {initial.id === "new" ? "New" : initial.id}</p>
          </div>
          <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium">
            <Checkbox name="active" defaultChecked={initial.active} />
            Active on storefront
          </label>
        </div>

        {state.error && (
          <div role="alert" className="mb-5 border border-red-300 bg-red-50 p-3 text-sm text-red-900">
            <p className="font-semibold">{state.error}</p>
            {state.fieldErrors && <ul className="mt-2 list-inside list-disc">{Object.entries(state.fieldErrors).map(([field, error]) => <li key={field}>{field}: {error}</li>)}</ul>}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Position" htmlFor={`${prefix}-position`} error={state.fieldErrors?.position}>
                <Input id={`${prefix}-position`} name="position" type="number" min={0} max={1000} defaultValue={initial.position} required aria-invalid={!!state.fieldErrors?.position} />
              </FormField>
              <FormField label="Theme" htmlFor={`${prefix}-theme`} error={state.fieldErrors?.theme}>
                <Select id={`${prefix}-theme`} name="theme" defaultValue={initial.theme} required aria-invalid={!!state.fieldErrors?.theme}>
                  <option value="BLUE">Blue</option><option value="BLACK">Black</option><option value="LIGHT">Light</option>
                </Select>
              </FormField>
              <FormField label="Eyebrow" htmlFor={`${prefix}-eyebrow`} error={state.fieldErrors?.eyebrow}>
                <Input id={`${prefix}-eyebrow`} name="eyebrow" defaultValue={initial.eyebrow} maxLength={100} required aria-invalid={!!state.fieldErrors?.eyebrow} />
              </FormField>
            </div>

            <FormField label="Headline" htmlFor={`${prefix}-headline`} error={state.fieldErrors?.headline}>
              <Input id={`${prefix}-headline`} name="headline" defaultValue={initial.headline} maxLength={140} required aria-invalid={!!state.fieldErrors?.headline} />
            </FormField>
            <fieldset className="space-y-3 border border-line p-4">
              <legend className="px-1 text-sm font-semibold">Optional picture background</legend>
              <FormField label="Upload background image" htmlFor={`${prefix}-background-image`} error={state.fieldErrors?.backgroundImage} hint="JPG, PNG or WebP; up to 4 MB. The selected theme gradient remains as a tinted overlay.">
                <Input
                  id={`${prefix}-background-image`}
                  name="backgroundImage"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={updateBackgroundPreview}
                  aria-invalid={!!state.fieldErrors?.backgroundImage}
                />
              </FormField>
              {initial.backgroundImageUrl && (
                <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
                  <Checkbox name="removeBackgroundImage" onChange={toggleBackgroundRemoval} />
                  Remove current background image
                </label>
              )}
            </fieldset>
            <fieldset className="grid gap-4 border border-line p-4 sm:grid-cols-2">
              <legend className="px-1 text-sm font-semibold">Links</legend>
              <FormField label="Primary button label" htmlFor={`${prefix}-primary-label`} error={state.fieldErrors?.primaryLabel}>
                <Input id={`${prefix}-primary-label`} name="primaryLabel" defaultValue={initial.primaryLabel} maxLength={60} required aria-invalid={!!state.fieldErrors?.primaryLabel} />
              </FormField>
              <FormField label="Primary button path" htmlFor={`${prefix}-primary-href`} error={state.fieldErrors?.primaryHref}>
                <Input id={`${prefix}-primary-href`} name="primaryHref" defaultValue={initial.primaryHref} maxLength={512} required aria-invalid={!!state.fieldErrors?.primaryHref} />
              </FormField>
              <FormField label="Secondary link label" htmlFor={`${prefix}-secondary-label`} error={state.fieldErrors?.secondaryLabel}>
                <Input id={`${prefix}-secondary-label`} name="secondaryLabel" defaultValue={initial.secondaryLabel} maxLength={60} required aria-invalid={!!state.fieldErrors?.secondaryLabel} />
              </FormField>
              <FormField label="Secondary link path or HTTPS URL" htmlFor={`${prefix}-secondary-href`} error={state.fieldErrors?.secondaryHref}>
                <Input id={`${prefix}-secondary-href`} name="secondaryHref" defaultValue={initial.secondaryHref} maxLength={512} required aria-invalid={!!state.fieldErrors?.secondaryHref} />
              </FormField>
            </fieldset>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" loading={pending}>Save slide</Button>
            </div>
          </div>

          <aside aria-label="Live slide preview">
            <p className="mb-2 text-sm font-semibold">Live preview</p>
            <div className={`hero-preview hero-theme-${preview.theme.toLowerCase()}`}>
              <HeroBackground imageUrl={backgroundPreviewUrl} theme={preview.theme} />
              <div className="relative z-10">
                <p className="hero-eyebrow">{preview.eyebrow}</p>
                <h3 className="hero-headline">{preview.headline}</h3>
                <div className="mt-4 h-40"><HeroVisual slide={preview} /></div>
                <p className="mt-4 text-sm font-semibold">{preview.primaryLabel} · {preview.secondaryLabel}</p>
              </div>
            </div>
          </aside>
        </div>
      </form>
      {onDelete && <div className="mt-4">{onDelete}</div>}
    </Card>
  );
}
