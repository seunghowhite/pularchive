import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 px-6 text-center text-black">
      <div className="space-y-3">
        <p className="text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl">
          404
        </p>
        <h1 className="text-balance text-2xl font-semibold tracking-tight">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mx-auto max-w-md text-pretty">
          요청한 주소가 없거나 옮겨졌을 수 있습니다. <br />
          홈에서 다시 시작해 보세요.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex h-10 origin-center items-center justify-center rounded-md border border-black bg-transparent px-6 text-sm font-medium text-black transition-transform duration-300 ease-out hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/35"
      >
        홈으로 이동
      </Link>
    </main>
  );
}
