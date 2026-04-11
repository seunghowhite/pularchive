"use client";

import FluidGlass2 from "./FluidGlass2";
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
      {/* <div
        className="pointer-events-auto absolute inset-0 z-0 min-h-[100svh] w-full bg-black"
        aria-hidden
      >
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0}
          glow={1}
        />
      </div> */}
      {/* 풀스크린 WebGL — PUL ARCHIVE 클릭으로 모달 */}
      <div className="pointer-events-auto absolute inset-0 z-0 min-h-[100svh] w-full touch-none">
        <div className="h-full min-h-[100svh] w-full [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full">
          <FluidGlass2
            label="PUL ARCHIVE"
            onLabelClick={openRandom}
            lensProps={{
              scale: 0.25,
              ior: 1.15,
              thickness: 5,
              chromaticAberration: 0.1,
              anisotropy: 0.01,
            }}
          />
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
