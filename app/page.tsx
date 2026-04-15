"use client";

import { useCallback, useEffect, useState } from "react";
/** 샘플 1 — 아래 로직은 의도적으로 다른 페이지와 복붙용으로 중복합니다. */

const LAMBDA_URL = "https://ijlhkc5rw4bh5d3as5x7o7qpje0pctgd.lambda-url.ap-northeast-2.on.aws/";

export default function HOME() {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<{ image: string }>({
    image: "",
  });

  const openRandom = useCallback(async () => {
    const res = await fetch(LAMBDA_URL);
    const data = (await res.json()) as { url: string };
    setPayload({ image: data.url });
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
            className="cursor-pointer border-2 border-black bg-transparent text-3xl text-black font-[-apple-system,BlinkMacSystemFont,'Helvetica_Neue',Helvetica,Arial,sans-serif] px-3 py-1"
          >
            Take a Seat
          </button>
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
              {/* eslint-disable-next-line */}
              <img
                src={payload.image}
                alt="무작위 이미지"
                className="pointer-events-auto max-h-[min(92svh,920px)] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
