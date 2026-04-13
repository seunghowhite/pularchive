"use client";

import { useCallback, useEffect, useState } from "react";
/** 샘플 1 — 아래 로직은 의도적으로 다른 페이지와 복붙용으로 중복합니다. */

type Kind = "image" | "text" | "video";

const TEXT_POOL = [
  "빛은 어둠 속에서만 가장 또렷하게 보인다.",
  "기록은 기억보다 오래 남는다.",
  "한 장의 사진은 시간의 단면이다.",
  "무작위는 때로 가장 솔직한 큐레이션이다.",
];

/**
 * YouTube 공유 링크(youtu.be, watch?v=) 또는 11자 영상 ID만 넣으면 됩니다.
 * 임베드: https://www.youtube.com/embed/VIDEO_ID
 */
const YOUTUBE_VIDEO_URLS = [
  "https://youtu.be/xrRDlOWR1OU?si=l1sAlUg6XHDoulqB",
] as const;

/** 링크·ID → 영상 ID (예: xrRDlOWR1OU) */
function youtubeVideoIdFromInput(input: string): string {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const short = s.match(/youtu\.be\/([^?&/]+)/);
  if (short?.[1]) return short[1];
  const v = s.match(/[?&]v=([^&]+)/);
  if (v?.[1]) return v[1];
  const embed = s.match(/\/embed\/([^?&/]+)/);
  if (embed?.[1]) return embed[1];
  return s;
}

function youtubeEmbedSrc(videoId: string): string {
  const id = encodeURIComponent(youtubeVideoIdFromInput(videoId));
  return `https://www.youtube.com/embed/${id}?rel=0`;
}

const LOCAL_IMAGES = [
  "/images/1.jpg",
  "/images/2.jpg",
  "/images/3.jpg",
  "/images/4.jpg",
  "/images/5.jpg",
] as const;

function pickKind(): Kind {
  const r = Math.random();
  if (r < 1 / 3) return "image";
  if (r < 2 / 3) return "text";
  return "video";
}

function randomImageUrl(): string {
  const i = Math.floor(Math.random() * LOCAL_IMAGES.length);
  return LOCAL_IMAGES[i]!;
}

function randomText(): string {
  return TEXT_POOL[Math.floor(Math.random() * TEXT_POOL.length)]!;
}

function randomYoutubeVideoId(): string {
  const i = Math.floor(Math.random() * YOUTUBE_VIDEO_URLS.length);
  return youtubeVideoIdFromInput(YOUTUBE_VIDEO_URLS[i]!);
}

export default function HOME() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>("text");
  const [payload, setPayload] = useState<{
    image: string;
    text: string;
    video: string;
  }>({
    image: "",
    text: "",
    video: "",
  });

  // 무작위 열기 함수
  const openRandom = useCallback(() => {
    const nextKind = pickKind();
    setKind(nextKind);
    setPayload({
      image: randomImageUrl(),
      text: randomText(),
      video: randomYoutubeVideoId(),
    });
    setOpen(true);
  }, []);

  // 닫기 함수
  const close = useCallback(() => setOpen(false), []);

  // 키보드 이벤트 처리 (escape 키로 닫기)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    const prevTouch = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouch;
    };
  }, [open, close]);

  return (
    <main className="relative min-h-dvh  w-full overflow-hidden font-sans text-emerald-50">
     

      <div className=" relative z-10 flex min-h-dvh flex-col items-center justify-center pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto relative flex justify-center pb-1">
          <button
            type="button"
            aria-label="random"
            onClick={openRandom}
            className=" border-0 bg-transparent  text-black font-mono"
          >
            sample text
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50" role="presentation">
          <button
            type="button"
            aria-label="배경을 눌러 닫기"
            className="absolute inset-0 touch-manipulation bg-zinc-950/55 backdrop-blur-md"
            onClick={close}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="무작위 이미지"
            className="pointer-events-none absolute inset-0 z-10 flex min-h-0 items-center justify-center pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pl-[max(0.75rem,env(safe-area-inset-left))] sm:pr-[max(0.75rem,env(safe-area-inset-right))]"
          >
            <div className="pointer-events-none flex min-h-0 w-full max-w-full flex-col items-center justify-center overflow-y-auto overscroll-y-contain">
              {kind === "image" ? (
                /* eslint-disable-next-line */
                <img
                  src={payload.image}
                  alt="무작위 이미지"
                  className="pointer-events-auto max-h-[min(92svh,920px)] w-auto max-w-full object-contain"
                />
              ) : null}

              {kind === "text" ? (
                <p className="pointer-events-auto max-w-2xl text-pretty px-4 text-center text-lg font-medium leading-relaxed text-white sm:text-xl md:text-2xl">
                  {payload.text}
                </p>
              ) : null}

              {kind === "video" ? (
                <iframe
                  title="YouTube"
                  className="pointer-events-auto aspect-video max-h-[min(88svh,900px)] w-full max-w-[min(100%,1100px)] rounded-md border-0 bg-black"
                  src={youtubeEmbedSrc(payload.video)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
