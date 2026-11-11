"use client";

import { useState } from "react";
import Image from "next/image";

export type Media =
  | { kind: "image"; src: string }
  | { kind: "youtube"; id: string; start?: number; title: string };

/**
 * Apple-style media panel. YouTube clips render as a static thumbnail (one
 * small image request) and only load the privacy-enhanced iframe after the
 * visitor presses play, so the page stays light and no YouTube script runs
 * until asked for.
 */
export function MediaPanel({ media, tone = "dark" }: { media: Media; tone?: "dark" | "light" }) {
  const [playing, setPlaying] = useState(false);

  const shell =
    "relative aspect-[16/10] w-full overflow-hidden rounded-[28px] media-shadow " +
    (tone === "dark" ? "bg-[#0a0a0c] media-dark" : "bg-[#f5f5f7] media-light");

  if (media.kind === "youtube") {
    const params = new URLSearchParams({
      autoplay: "1",
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      ...(media.start ? { start: String(media.start) } : {}),
    });
    return (
      <div className={shell}>
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${media.id}?${params}`}
            title={media.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play: ${media.title}`}
            className="group absolute inset-0 flex items-center justify-center"
          >
            <Image
              src={`https://i.ytimg.com/vi/${media.id}/hqdefault.jpg`}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover opacity-80 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-ink shadow-2xl backdrop-blur transition duration-300 group-hover:scale-110 group-hover:bg-white">
              <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8 fill-current"><path d="M8 5v14l11-7z" /></svg>
            </span>
            <span className="absolute bottom-5 left-6 right-6 text-left text-sm font-medium text-white/80">{media.title}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={shell}>
      {/* Drop a screenshot at public{media.src} to replace this placeholder. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-mono text-xs ${tone === "dark" ? "text-white/30" : "text-ink/30"}`}>{media.src}</span>
      </div>
    </div>
  );
}
