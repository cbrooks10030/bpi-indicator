import { faqs } from "@/lib/config";

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
        Frequently asked questions
      </h2>
      <div className="mt-12 divide-y divide-line rounded-2xl border border-line bg-paper card-shadow">
        {faqs.map((f) => (
          <details key={f.q} className="group px-6 py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
              {f.q}
              <span className="ml-4 text-ink/30 transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink/60">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
