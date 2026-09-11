export function NoticePanel({ notices }: { notices: string[] }) {
  return (
    <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <div className="flex gap-3"><span className="text-lg" aria-hidden>!</span><div><h3 className="font-extrabold">공식 채널 사전 확인 안내</h3><ul className="mt-1.5 space-y-1 text-xs leading-5 text-amber-900">{notices.map((notice) => <li key={notice}>{notice}</li>)}</ul></div></div>
    </aside>
  );
}
