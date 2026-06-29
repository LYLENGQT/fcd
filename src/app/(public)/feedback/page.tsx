import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { FeedbackForm } from "./feedback-form";

export const metadata = {
  title: "Feedback",
  description: "Share your feedback, questions, or concerns with the meet committee.",
};

export default function FeedbackPage() {
  return (
    <>
      <PageHeader
        eyebrow="We're Listening"
        title={
          <>
            Send <span className="text-gold">Feedback</span>
          </>
        }
        intro="Questions, suggestions, or concerns about the meet? Send a note to the organizing committee — it goes straight to the host."
      />

      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-2xl">
          <FeedbackForm />
          <p className="mt-6 font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/40">
            For emergencies during the meet, use the{" "}
            <Link
              href="/host/emergency"
              className="text-gold-deep underline-offset-4 hover:underline"
            >
              Emergency Directory
            </Link>{" "}
            under Host instead.
          </p>
        </div>
      </section>
    </>
  );
}
