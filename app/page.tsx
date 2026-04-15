"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
/** 샘플 1 — 아래 로직은 의도적으로 다른 페이지와 복붙용으로 중복합니다. */

const LAMBDA_URL = "https://ijlhkc5rw4bh5d3as5x7o7qpje0pctgd.lambda-url.ap-northeast-2.on.aws/";

/** fetch 완료 후에도 이미지가 늦게 뜨므로, 점 UI는 이 시간만큼 더 유지 */
const LOADING_DOTS_TAIL_MS = 10000;

export default function HOME() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<{ image: string }>({
    image: "",
  });

  const openRandom = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(LAMBDA_URL);
      const data = (await res.json()) as { url: string };
      setPayload({ image: data.url });
      setOpen(true);
    } finally {
      await new Promise((r) => setTimeout(r, LOADING_DOTS_TAIL_MS));
      setLoading(false);
    }
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setLoading(false);
  }, []);

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
        <div className="pointer-events-auto flex flex-col items-center gap-3">
          <button
            type="button"
            aria-label="random"
            aria-busy={loading}
            disabled={loading}
            onClick={openRandom}
            className="cursor-pointer border-2 border-black bg-transparent px-3 py-1 text-3xl text-black font-[-apple-system,BlinkMacSystemFont,'Helvetica_Neue',Helvetica,Arial,sans-serif] transition-opacity disabled:cursor-wait disabled:opacity-40 "
          >
            Take a Seat
          </button>
          {loading ? (
            <div
              role="status"
              className="flex h-5 items-end justify-center gap-1.5"
              aria-live="polite"
            >
              <span className="sr-only">이미지를 불러오는 중</span>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 rounded-full bg-black motion-reduce:animate-none motion-safe:animate-bounce"
                  style={{ animationDelay: `${i * 140}ms` }}
                />
              ))}
            </div>
          ) : (
            <div className="h-5" aria-hidden />
          )}
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50" role="presentation">
          <button
            type="button"
            aria-label="배경을 눌러 닫기"
            // className="absolute inset-0 touch-manipulation bg-zinc-950/55 backdrop-blur-md"
                 className="absolute inset-0 touch-manipulation "
            onClick={close}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="무작위 이미지"
            className="pointer-events-none absolute inset-0 z-10 flex min-h-0 items-center justify-center pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pl-[max(0.75rem,env(safe-area-inset-left))] sm:pr-[max(0.75rem,env(safe-area-inset-right))]"
          >
            <div className="pointer-events-none flex min-h-0 w-full max-w-full flex-col items-center justify-center overflow-y-auto overscroll-y-contain">
              {payload.image ? (
                <div className="pointer-events-auto inline-block max-w-[min(100%,1100px)] shrink-0">
                  <Image
                    src={payload.image}
                    alt="무작위 이미지"
                    width={1920}
                    height={1080}
                    className="h-auto max-h-[min(92svh,920px)] w-auto max-w-full object-contain"
                    sizes="(max-width: 1100px) 100vw, 1100px"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
