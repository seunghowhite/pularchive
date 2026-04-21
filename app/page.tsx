"use client";


import { useCallback, useEffect, useRef, useState } from "react";

const LAMBDA_URL = "https://ijlhkc5rw4bh5d3as5x7o7qpje0pctgd.lambda-url.ap-northeast-2.on.aws/";

// Lambda 호출 + 이미지 브라우저 캐시까지 완료
async function fetchAndPreload(): Promise<string> {
  const res = await fetch(LAMBDA_URL);
  const data = (await res.json()) as { url: string };
  await new Promise<void>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("이미지 로드 실패"));
    img.src = data.url;
  });
  return data.url;
}

export default function HOME() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  // 미리 준비 중인 다음 이미지 Promise
  const nextPromise = useRef<Promise<string> | null>(null);

  const prefetchNext = useCallback(() => {
    nextPromise.current = fetchAndPreload();
  }, []);

  // 페이지 로드 시 첫 이미지 미리 준비
  useEffect(() => {
    prefetchNext();
  }, [prefetchNext]);

  const openRandom = useCallback(async () => {
    if (!nextPromise.current) prefetchNext();

    const minVisibleMs = 500;
    const started = performance.now();

    setLoading(true);
    try {
      const url = await nextPromise.current!;
      const elapsed = performance.now() - started;
      if (elapsed < minVisibleMs) {
        await new Promise<void>((r) => setTimeout(r, minVisibleMs - elapsed));
      }
      setCurrentImage(url);
      setOpen(true);
    } catch {
      const elapsed = performance.now() - started;
      if (elapsed < minVisibleMs) {
        await new Promise<void>((r) => setTimeout(r, minVisibleMs - elapsed));
      }
      prefetchNext();
    } finally {
      setLoading(false);
    }
  }, [prefetchNext]);

  const close = useCallback(() => {
    setOpen(false);
    prefetchNext(); // 닫을 때 다음 이미지 미리 로드
  }, [prefetchNext]);
  

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
    <main className="relative min-h-dvh w-full overflow-hidden font-sans text-emerald-50">
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto flex flex-col items-center gap-3">
          <button
            type="button"
            aria-label="random"
            aria-busy={loading}
            disabled={loading}
            onClick={openRandom}
            className="cursor-pointer border-[1.5px] border-black bg-transparent px-3 py-1 text-3xl text-black font-[-apple-system,BlinkMacSystemFont,'Helvetica_Neue',Helvetica,Arial,sans-serif] transition-opacity disabled:cursor-wait disabled:opacity-40 "
            >
            Take a Seat
          </button>
          {loading ? (
            <div role="status" className="flex h-5 items-end justify-center gap-1.5" aria-live="polite">
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
            className="absolute inset-0 touch-manipulation"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="무작위 이미지"
            className="pointer-events-none absolute inset-0 z-10 flex min-h-0 items-center justify-center pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pl-[max(0.75rem,env(safe-area-inset-left))] sm:pr-[max(0.75rem,env(safe-area-inset-right))]"
          >
            <div className="pointer-events-none flex min-h-0 w-full max-w-full flex-col items-center justify-center overflow-y-auto overscroll-y-contain">
              {currentImage ? (
                <div className="pointer-events-auto inline-block max-w-[min(100%,1100px)] shrink-0">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentImage}
                    alt="무작위 이미지"
                    className="h-auto max-h-[min(92svh,920px)] w-auto max-w-full object-contain"
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