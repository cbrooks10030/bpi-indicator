import { useState } from 'react'

const SECTIONS = [
  { id: 'disclaimer', label: 'Risk disclaimer' },
  { id: 'terms', label: 'Terms of use' },
  { id: 'privacy', label: 'Privacy' },
]

function Block({ heading, children }) {
  return (
    <section className="mt-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-[#c3b4ff]">{heading}</h3>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-slate-300">{children}</div>
    </section>
  )
}

/**
 * The wording that keeps this an educational statistics tool: no advice, no
 * signals, no ownership of the concepts it is built around.
 */
export default function LegalPage() {
  const [section, setSection] = useState('disclaimer')

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            className={`rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-widest ${
              section === item.id
                ? 'border-[#6d4aff] bg-[#6d4aff]/25 text-white'
                : 'border-white/10 bg-white/5 text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {section === 'disclaimer' && (
        <div className="mt-6 rounded-3xl border border-amber-400/30 bg-amber-400/[0.07] p-5">
          <h2 className="text-xl font-black text-amber-200">This is not financial advice</h2>
          <Block heading="What this is">
            <p>
              This application is an educational checklist and statistics tool. It records the observations you type
              in, scores them against a weighting you can change, and keeps a journal of your own trades. Every number
              it shows is a description of your inputs — nothing more.
            </p>
          </Block>
          <Block heading="What it is not">
            <p>
              It is not a signal service, not a trading advisory, not a broker or introducing broker, and not a
              registered investment adviser or commodity trading advisor. No output is a recommendation to buy, sell,
              or hold anything. Nobody here is monitoring the market on your behalf.
            </p>
          </Block>
          <Block heading="Risk">
            <p>
              Futures and leveraged instruments carry substantial risk of loss and are not suitable for every
              investor. You can lose more than your initial deposit. Past results — yours or anyone else&apos;s — do
              not indicate future results. Any hypothetical or back-tested figure has the inherent limitations of
              hindsight.
            </p>
            <p>
              You alone decide what to trade, when, and at what size. You are responsible for every order you place
              and for compliance with the rules of your broker, exchange, and jurisdiction.
            </p>
          </Block>
          <Block heading="Methodologies">
            <p>
              The concepts this tool organises — the fractal model, the ATM model, unicorn setups, change in state of
              delivery, fair value gaps, breaker blocks, and related ideas commonly taught as Inner Circle Trader
              (ICT) concepts — are not owned by, invented by, or claimed by this application or its author. They are
              used here only as a personal framework for organising analysis.
            </p>
            <p>
              This application is not affiliated with, endorsed by, sponsored by, or connected to ICT / Inner Circle
              Trader, any of its instructors, or any other educator, YouTube channel, mentor, or trading service. All
              names and marks belong to their respective owners.
            </p>
          </Block>
        </div>
      )}

      {section === 'terms' && (
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-black text-white">Terms of use</h2>
          <Block heading="Licence">
            <p>
              You are granted a personal, non-exclusive, non-transferable right to use this application for your own
              analysis and journalling. You may not resell, sublicense, redistribute, or publish it, or present its
              output as a trading service of your own.
            </p>
          </Block>
          <Block heading="Access">
            <p>
              Where access is provided alongside an indicator or subscription, access may be suspended for sharing
              credentials, redistributing the indicator source, or attempting to circumvent access controls.
            </p>
          </Block>
          <Block heading="No warranty">
            <p>
              The application is provided &quot;as is&quot;, without warranty of any kind, express or implied,
              including merchantability, fitness for a particular purpose, accuracy, or uninterrupted operation.
              Scores, timings, and statistics may be wrong, stale, or incomplete.
            </p>
          </Block>
          <Block heading="Limitation of liability">
            <p>
              To the maximum extent permitted by law, the author is not liable for any trading loss, lost profit,
              lost data, or any indirect, incidental, special, or consequential damages arising from use of this
              application, whether or not the possibility of such damage was known.
            </p>
          </Block>
          <Block heading="Your responsibility">
            <p>
              You confirm that you are of legal age, that you trade your own capital at your own risk, and that you
              are not relying on this application for advice. If you do not agree, do not use it.
            </p>
          </Block>
        </div>
      )}

      {section === 'privacy' && (
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-black text-white">Privacy</h2>
          <Block heading="Where your data lives">
            <p>
              Your answers, journal entries, and screenshots are stored on this device only — answers and journal in
              localStorage, screenshots in the browser&apos;s IndexedDB. Nothing is uploaded, and there is no account,
              server, or analytics in this version.
            </p>
          </Block>
          <Block heading="What that means for you">
            <p>
              Clearing your browser data, using private browsing, or switching devices loses the journal. Export to
              CSV from the dashboard to keep a copy. &quot;Clear all data&quot; removes it permanently.
            </p>
          </Block>
          <Block heading="If accounts are added later">
            <p>
              Any future hosted features — logins, subscriptions, chart alert webhooks, or AI analysis — would send
              data to a server, and this page will be updated to say exactly what is sent and stored before that
              happens.
            </p>
          </Block>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-slate-600">
        By using this application you accept the disclaimer and terms above.
      </p>
    </div>
  )
}
