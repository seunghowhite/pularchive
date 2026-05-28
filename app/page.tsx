"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";

const LAMBDA_URL = "https://ijlhkc5rw4bh5d3as5x7o7qpje0pctgd.lambda-url.ap-northeast-2.on.aws/";
const IMAGE_PREFIX = "images/";
const TEXT_PREFIX = "text/";

type KeysByFolder = {
  imageKeys: string[];
  textKeys: string[];
};

type ImagePair = {
  imageUrl: string;
  textUrl: string;
};

/**
 * 배열 섞기
 * @param arr 섞을 배열
 * @returns 섞인 배열
 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 키 목록 가져오기
 * @returns 키 목록
 */
async function fetchKeys(): Promise<KeysByFolder> {
  const res = await fetch(LAMBDA_URL);
  const data = await res.json() as { keys: string[] };
  const imageKeys = data.keys.filter((key) => key.startsWith(IMAGE_PREFIX));
  const textKeys = data.keys.filter((key) => key.startsWith(TEXT_PREFIX));
  return { imageKeys, textKeys };
}

/**
 * 이미지 로드 및 미리 로드
 * @param key 키
 * @returns 이미지 URL
 */
async function fetchAndPreload(key: string): Promise<string> {
  const res = await fetch(`${LAMBDA_URL}?key=${encodeURIComponent(key)}`);
  const data = await res.json() as { url: string };
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
  const [currentPair, setCurrentPair] = useState<ImagePair | null>(null);

  const imageDeckRef = useRef<string[]>([]);
  const textDeckRef = useRef<string[]>([]);
  const imageIndexRef = useRef(0);
  const textIndexRef = useRef(0);
  const nextPromise = useRef<Promise<ImagePair> | null>(null);

  const nextKey = useCallback((deckRef: MutableRefObject<string[]>, indexRef: MutableRefObject<number>): string | null => {
    const deck = deckRef.current;
    if (deck.length === 0) return null;
    if (indexRef.current >= deck.length) {
      deckRef.current = shuffle(deck);
      indexRef.current = 0;
    }
    return deckRef.current[indexRef.current++];
  }, []);

  const prefetchNext = useCallback(() => {
    const imageKey = nextKey(imageDeckRef, imageIndexRef);
    const textKey = nextKey(textDeckRef, textIndexRef);
    if (!imageKey || !textKey) {
      nextPromise.current = null;
      return;
    }
    nextPromise.current = Promise.all([
      fetchAndPreload(imageKey),
      fetchAndPreload(textKey),
    ]).then(([imageUrl, textUrl]) => ({ imageUrl, textUrl }));
  }, [nextKey]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchKeys().then(({ imageKeys, textKeys }) => {
      imageDeckRef.current = shuffle(imageKeys);
      textDeckRef.current = shuffle(textKeys);
      imageIndexRef.current = 0;
      textIndexRef.current = 0;
      prefetchNext();
    });
  }, [prefetchNext]);

  // 랜덤 이미지 열기
  const openRandom = useCallback(async () => {
    if (!nextPromise.current) prefetchNext();

    const minVisibleMs = 500;
    const started = performance.now();

    setLoading(true);
    try {
      const pair = await nextPromise.current!;
      const elapsed = performance.now() - started;
      if (elapsed < minVisibleMs) {
        await new Promise<void>((r) => setTimeout(r, minVisibleMs - elapsed));
      }
      setCurrentPair(pair);
      setOpen(true);
      prefetchNext();
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

  // 이미지 닫기
  const close = useCallback(() => {
    setOpen(false);
    if (!nextPromise.current) {
      prefetchNext();
    }
  }, [prefetchNext]);

  // 키보드 이벤트 처리
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
          {!open ? (
            <button
              type="button"
              aria-label="random"
              aria-busy={loading}
              disabled={loading}
              onClick={openRandom}
              className="cursor-pointer border-[1.5px] border-black bg-transparent px-3 py-1 text-3xl text-black font-[-apple-system,BlinkMacSystemFont,'Helvetica_Neue',Helvetica,Arial,sans-serif] transition-opacity disabled:cursor-wait disabled:opacity-40"
            >
              Take a Seat
            </button>
          ) : null}
          {loading && !open ? (
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
            aria-label="무작위 이미지 쌍"
            className="pointer-events-none absolute inset-0 z-10 flex min-h-0 items-start justify-center pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:justify-center sm:pl-[max(0.75rem,env(safe-area-inset-left))] sm:pr-[max(0.75rem,env(safe-area-inset-right))]"
          >
            <div className="pointer-events-none flex min-h-0 w-full max-w-full flex-col items-center justify-start overflow-y-auto overscroll-y-contain sm:items-center sm:justify-center">
              {currentPair ? (
                <div className="pointer-events-auto flex max-w-[min(100%,1280px)] shrink-0 flex-col items-center gap-3 px-2 sm:flex-row sm:items-start">
                  <div className="inline-block max-w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentPair.imageUrl}
                      alt="왼쪽 이미지"
                      onClick={close}
                      className="h-auto max-h-[calc((100svh-8rem)/2)] w-auto max-w-full cursor-pointer object-contain sm:max-h-[min(92svh,920px)]"
                    />
                  </div>
                  <div className="inline-block max-w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentPair.textUrl}
                      alt="오른쪽 텍스트 이미지"
                      onClick={close}
                      className="h-auto max-h-[calc((100svh-8rem)/2)] w-auto max-w-full cursor-pointer object-contain sm:max-h-[min(92svh,920px)]"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-20">
            <button
              type="button"
              aria-label="another seat"
              aria-busy={loading}
              disabled={loading}
              onClick={openRandom}
              className="pointer-events-auto inline-flex h-8 w-30 cursor-pointer items-center justify-center border border-black bg-white/80 text-sm text-black backdrop-blur-sm transition-opacity disabled:cursor-wait disabled:opacity-40"
            >
              {loading ? (
                <span className="flex items-end justify-center gap-1" aria-live="polite">
                  <span className="sr-only">다음 이미지를 불러오는 중</span>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1 rounded-full bg-black motion-reduce:animate-none motion-safe:animate-bounce"
                      style={{ animationDelay: `${i * 140}ms` }}
                    />
                  ))}
                </span>
              ) : (
                "another seat"
              )}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}