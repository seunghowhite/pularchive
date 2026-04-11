"use client";

import ColorBends from "@/components/ColorBends";
import FloatingLines from "@/components/FloatingLines";
import ImageTrail from "@/components/ImageTrail";
import LineWaves from "@/components/LineWaves";
import LiquidChrome from "@/components/LiquidChrome";
import MetaBalls from "@/components/MetaBalls";
import Plasma from "@/components/Plasma";
import Prism from "@/components/Prism";
import PrismaticBurst from "@/components/PrismaticBurst";
import SoftAurora from "@/components/SoftAurora";
import SplashCursor from "@/components/SplashCursor";
import Waves from "@/components/Waves";
import { useCallback, useEffect, useState } from "react";
/** 샘플 1 — 아래 로직은 의도적으로 다른 페이지와 복붙용으로 중복합니다. */

type Kind = "image" | "text" | "video";

const TEXT_POOL = [
  "빛은 어둠 속에서만 가장 또렷하게 보인다.",
  "기록은 기억보다 오래 남는다.",
  "한 장의 사진은 시간의 단면이다.",
  "무작위는 때로 가장 솔직한 큐레이션이다.",
];

const SAMPLE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";

function pickKind(): Kind {
  const r = Math.random();
  if (r < 1 / 3) return "image";
  if (r < 2 / 3) return "text";
  return "video";
}

function randomImageUrl(): string {
  const seed = Math.random().toString(36).slice(2, 10);
  return `https://picsum.photos/seed/${seed}/720/480`;
}

function randomText(): string {
  return TEXT_POOL[Math.floor(Math.random() * TEXT_POOL.length)]!;
}

const kindLabel: Record<Kind, string> = {
  image: "사진",
  text: "텍스트",
  video: "비디오",
};

export default function Page() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>("text");
  const [payload, setPayload] = useState<{ image: string; text: string }>({
    image: "",
    text: "",
  });

  const openRandom = useCallback(() => {
    const nextKind = pickKind();
    setKind(nextKind);
    setPayload({
      image: randomImageUrl(),
      text: randomText(),
    });
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

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
    <main className="relative min-h-dvh min-h-[100svh] w-full overflow-hidden font-sans text-emerald-50">
      <div
        className="pointer-events-auto absolute inset-0 z-0 min-h-[100svh] w-full bg-black"
        aria-hidden
      >
        <ImageTrail
          key={1}
          items={[
            "https://picsum.photos/id/287/300/300",
            "https://picsum.photos/id/1001/300/300",
            "https://picsum.photos/id/1025/300/300",
            "https://picsum.photos/id/1026/300/300",
            "https://picsum.photos/id/1027/300/300",
            "https://picsum.photos/id/1028/300/300",
            "https://picsum.photos/id/1029/300/300",
            "https://picsum.photos/id/1030/300/300",
          ]}
          variant={8}
        />
      </div>

      <div className="pointer-events-none relative z-10 flex min-h-dvh min-h-[100svh] flex-col items-center justify-center pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="mb-8 max-w-md space-y-3 text-center sm:mb-10">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-200/85">
            pularchive
          </p>
        </div>

        <div className="pointer-events-auto relative flex justify-center pb-1">
          <button
            type="button"
            aria-label="무작위로 열기"
            onClick={openRandom}
            className="relative flex h-[4.5rem] w-[4.5rem] shrink-0 touch-manipulation items-center justify-center rounded-full border-0 bg-gradient-to-b from-emerald-500 via-emerald-700 to-emerald-900 text-transparent shadow-[0_0_0_1px_rgba(209,250,229,0.45)_inset,0_8px_0_#047857,0_10px_24px_rgba(6,95,70,0.22),0_18px_40px_-6px_rgba(6,78,59,0.32),0_26px_56px_-14px_rgba(52,211,153,0.18)] outline-none ring-1 ring-emerald-400/30 transition-[transform,box-shadow,filter] duration-150 ease-out hover:brightness-[1.04] hover:shadow-[0_0_0_1px_rgba(209,250,229,0.5)_inset,0_8px_0_#059669,0_12px_28px_rgba(6,95,70,0.26),0_22px_48px_-4px_rgba(6,78,59,0.34),0_28px_60px_-12px_rgba(52,211,153,0.22)] active:translate-y-[8px] active:scale-[0.96] active:shadow-[0_0_0_1px_rgba(52,211,153,0.5)_inset,0_0_0_#047857,0_0_28px_rgba(110,231,183,0.55),0_8px_22px_rgba(6,95,70,0.26),inset_0_4px_18px_rgba(16,185,129,0.28)] focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-50"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_5px_12px_rgba(255,255,255,0.26),inset_0_-14px_22px_rgba(5,150,105,0.42)]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute left-[17%] top-[18%] h-[30%] w-[54%] rounded-full bg-emerald-100/35 blur-md"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-[13%] left-1/2 h-2 w-[44%] -translate-x-1/2 rounded-full bg-emerald-900/45 blur-[3px]"
            />
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
            aria-label={kindLabel[kind]}
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))]"
          >
            <div className="pointer-events-auto max-h-full max-w-full overflow-y-auto overscroll-y-contain">
              {kind === "image" ? (
                /* eslint-disable-next-line @next/next/no-img-element -- 외부 랜덤 URL */
                <img
                  src={payload.image}
                  alt="무작위 이미지"
                  className="max-h-[min(92svh,920px)] w-auto max-w-full object-contain"
                />
              ) : null}

              {kind === "text" ? (
                <p className="max-w-2xl text-pretty px-4 text-center text-lg font-medium leading-relaxed text-white sm:text-xl md:text-2xl">
                  {payload.text}
                </p>
              ) : null}

              {kind === "video" ? (
                <video
                  className="max-h-[min(88svh,900px)] w-full max-w-[min(100%,1100px)] bg-black object-contain"
                  controls
                  playsInline
                  preload="metadata"
                  src={SAMPLE_VIDEO}
                >
                  이 브라우저는 비디오 태그를 지원하지 않습니다.
                </video>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
