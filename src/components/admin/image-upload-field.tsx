"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/admin/admin-ui";

/** Uploads an image to the public "media" Storage bucket and stores the
 *  resulting public URL in a hidden input (consumed by the entity action).
 *  Used for delegation logos and athlete photos. */
export function ImageUploadField({
  name,
  label,
  folder,
  defaultValue,
}: {
  name: string;
  label: string;
  folder: string;
  defaultValue?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Field label={label} htmlFor={`${name}-file`}>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-4">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-ink/20 bg-bone-2/50">
          {url ? (
            <Image src={url} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <ImagePlus className="h-5 w-5 text-ink/30" />
          )}
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor={`${name}-file`}
            className="inline-flex cursor-pointer items-center gap-2 border border-ink/25 bg-bone px-3 py-1.5 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/70 transition hover:border-gold-deep hover:text-gold-deep"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {url ? "Replace" : "Upload"}
          </label>
          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="ml-2 inline-flex items-center gap-1 font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/45 hover:text-crimson"
            >
              <X className="h-3 w-3" /> Remove
            </button>
          )}
          <input
            id={`${name}-file`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPick}
            disabled={busy}
          />
          {error && (
            <p className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-crimson">
              {error}
            </p>
          )}
        </div>
      </div>
    </Field>
  );
}
