// app/components/Navigation.tsx
'use client';

type SectionId = 'hero' | 'video2' | 'gallery' | 'about' | 'contact';

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'hero', label: 'Video01' },
  { id: 'video2', label: 'Video02' },
  { id: 'gallery', label: 'GIFs' },
  { id: 'about', label: 'How to make' },
  { id: 'contact', label: 'Contact' },
];

export default function Navigation() {
  const scrollToSection = (id: SectionId) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      {/* 상단 그라디언트 오버레이 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-transparent h-24" />

      {/* 컨텐츠 영역 */}
      <div className="relative mx-auto max-w-5xl px-8 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 / 타이틀 (클릭 시 hero로 스크롤) */}
          <button
            onClick={() => scrollToSection('hero')}
            className="text-xl font-bold text-white hover:text-gray-300 transition"
          >
            Visual Experiments <br />with AI
          </button>

          {/* 네비게이션 버튼들 */}
          <div className="space-x-6">
            {SECTIONS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm md:text-base text-white hover:text-gray-300 transition font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}