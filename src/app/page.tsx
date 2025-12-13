import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto text-center space-y-10">
        {/* Logo & Branding */}
        <header className="space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-accent/30 to-accent/10 mb-4 shadow-xl shadow-accent/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
            >
              <path d="M12 3v18" />
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M3 15h18" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            نيجيبة ستوديو
          </h1>
          <p className="text-lg text-accent font-medium tracking-wide">Nejiba Studio</p>
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          <p className="text-foreground-secondary">
            دار الثقافة بن عروس
          </p>
        </header>

        {/* Main CTA */}
        <Link
          href="/create"
          className="group block w-full p-8 bg-gradient-to-br from-accent/20 to-accent/5 hover:from-accent/30 hover:to-accent/10 border border-accent/30 hover:border-accent/50 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-1"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-4xl">💡</span>
            <span className="text-4xl">→</span>
            <span className="text-4xl">📋</span>
            <span className="text-4xl">→</span>
            <span className="text-4xl">🎨</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            إنشاء محتوى الورشة
          </h2>
          <p className="text-foreground-secondary">
            فكرة ← خطة كاملة ← ملصق احترافي
          </p>
          <p className="text-sm text-accent mt-3">
            اضغط للبدء ✨
          </p>
        </Link>

        {/* Complete CASEL Program - Main Feature */}
        <Link
          href="/program"
          className="group block w-full p-6 bg-gradient-to-br from-violet-500/20 via-purple-500/15 to-fuchsia-500/10 hover:from-violet-500/30 hover:via-purple-500/20 hover:to-fuchsia-500/15 border-2 border-violet-500/30 hover:border-violet-500/50 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/20 hover:-translate-y-1"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-3xl">🎓</span>
            <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-full">
              36 ورشة • CASEL
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            برنامج CASEL الكامل
          </h2>
          <p className="text-sm text-foreground-secondary mb-3">
            منهج علمي شامل للتعلم الاجتماعي والعاطفي
          </p>
          <div className="flex justify-center gap-3 text-xs text-foreground-secondary/70">
            <span className="flex items-center gap-1">📚 5 وحدات</span>
            <span>•</span>
            <span className="flex items-center gap-1">📅 9 أشهر</span>
            <span>•</span>
            <span className="flex items-center gap-1">👥 10-15 سنة</span>
          </div>
        </Link>

        {/* Quick Access Links */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/workshop"
            className="px-4 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-background-secondary rounded-lg transition-colors"
          >
            📋 ورشة منفردة
          </Link>
          <Link
            href="/import"
            className="px-4 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-background-secondary rounded-lg transition-colors"
          >
            📥 استيراد JSON
          </Link>
          <Link
            href="/poster"
            className="px-4 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-background-secondary rounded-lg transition-colors"
          >
            🎨 ملصق فقط
          </Link>
          <Link
            href="/ideas"
            className="px-4 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-background-secondary rounded-lg transition-colors"
          >
            💡 أفكار
          </Link>
          <Link
            href="/ads"
            className="px-4 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-background-secondary rounded-lg transition-colors"
          >
            🎬 فيديو الورشة
          </Link>
          <Link
            href="/video"
            className="px-4 py-2 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors font-medium"
          >
            ✨ فيديو أمل
          </Link>
        </div>

        {/* Footer */}
        <footer className="space-y-2 text-sm text-foreground-secondary/60">
          <p>نادي الطفل القائد • Leader Kid Club</p>
          <p className="text-xs">مدعوم بالذكاء الاصطناعي ✨</p>
        </footer>
      </div>
    </main>
  );
}
