export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-zinc-400 tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              ASAAS PORTAL
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              &copy; 2026 ASaaS Education System. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">개인정보처리방침</a>
            <a href="#" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">이용약관</a>
            <a href="#" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">고객센터</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
