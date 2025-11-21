'use client';

import { useEffect, useRef, useState } from "react";

type SectionsMap = { [key: string]: HTMLElement | null };

const SECTION_ORDER = ["hero", "video2", "gallery", "about", "contact"] as const;
type SectionId = (typeof SECTION_ORDER)[number];

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const sectionsRef = useRef<SectionsMap>({});

  const [sectionOffsets, setSectionOffsets] = useState<{ [key: string]: number }>({});
  const [viewportHeight, setViewportHeight] = useState(0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // 스크롤/리사이즈 + 섹션 위치 계산
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleResize = () => setViewportHeight(window.innerHeight);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    setViewportHeight(window.innerHeight);

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1 }
    );

    const offsets: { [key: string]: number } = {};
    Object.entries(sectionsRef.current).forEach(([id, el]) => {
      if (el) {
        observer.observe(el);
        offsets[id] = el.offsetTop;
      }
    });
    setSectionOffsets(offsets);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  // 휠 → 섹션 단위 스냅
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isAnimating) return;

      const delta = e.deltaY;
      if (Math.abs(delta) < 30) return; // 트랙패드 미세 스크롤 무시

      e.preventDefault();

      let nextIndex = currentIndex;
      if (delta > 0 && currentIndex < SECTION_ORDER.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (delta < 0 && currentIndex > 0) {
        nextIndex = currentIndex - 1;
      }

      if (nextIndex === currentIndex) return;

      const nextId: SectionId = SECTION_ORDER[nextIndex];
      const el = sectionsRef.current[nextId];
      if (!el) return;

      setIsAnimating(true);
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setCurrentIndex(nextIndex);

      setTimeout(() => setIsAnimating(false), 900);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [currentIndex, isAnimating]);

  // 섹션 기준 패럴랙스 값
  const getParallax = (id: string, speed: number) => {
    const offsetTop = sectionOffsets[id];
    if (offsetTop === undefined || viewportHeight === 0) return 0;

    const distance = scrollY - offsetTop;
    const progress = distance / viewportHeight;
    return progress * speed;
  };

  // hero
  const heroTitleY = getParallax("hero", -40);
  const heroSubtitleY = getParallax("hero", -20);
  const heroArrowY = getParallax("hero", 30);

  // about
  const aboutTextY = getParallax("about", -30);
  const aboutImageY = getParallax("about", 40);
  const aboutTitleX = getParallax("about", 150); // How I Work with AI 좌→우 이동

  // contact
  const contactPhoneX = getParallax("contact", 120);
  const contactEmailX = getParallax("contact", -80);

  return (
    <>
      {/* 1. Hero 섹션 */}
      <section
        id="hero"
        ref={el => (sectionsRef.current.hero = el)}
        className="relative flex h-screen items-center justify-center overflow-hidden"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero-video.webm" type="video/webm" />
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 px-4 text-center text-white">
          <h1
            className="mb-4 text-5xl font-bold md:text-7xl"
            style={{
              transform: `translateY(${heroTitleY}px)`,
              transition: "transform 0.1s linear",
            }}
          >
            AI-Driven Visual Experiments
          </h1>
          <p
            className="text-xl md:text-3xl"
            style={{
              transform: `translateY(${heroSubtitleY}px)`,
              transition: "transform 0.1s linear",
            }}
          >
            Generative AI workflows for cinematic visuals
          </p>
        </div>

        <div
          className="absolute left-1/2 bottom-10 text-white"
          style={{
            transform: `translate(-50%, ${40 + heroArrowY}px)`,
            transition: "transform 0.1s linear",
          }}
        >
          <svg
            className="h-6 w-6 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* 2. 두번째 영상 섹션 */}
      <section
        id="video2"
        ref={el => (sectionsRef.current.video2 = el)}
        className="relative flex h-screen items-center justify-center overflow-hidden bg-black"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        >
          <source src="/2nd-video.webm" type="video/webm" />
          <source src="/2nd-video.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10 px-4 text-center text-white">
          <h2 className="mb-4 text-4xl font-bold md:text-6xl">
            Creating Motion from Stillness
          </h2>
          <p className="mx-auto max-w-3xl text-lg md:text-xl">
            정적인 이미지에 생명을 불어넣는 AI 워크플로우
          </p>
        </div>
      </section>

      {/* 3. 이미지 갤러리 섹션 – 화면 전체를 8장 이미지로 채움 */}
      <section
        id="gallery"
        ref={el => (sectionsRef.current.gallery = el)}
        className="relative h-screen overflow-hidden bg-black"
      >
        <div className="grid h-full w-full grid-cols-2 grid-rows-4 md:grid-cols-4 md:grid-rows-2">
          {[
            "/ai_img01.jpg",
            "/ai_img02.jpg",
            "/ai_img03.jpg",
            "/ai_img04.jpg",
            "/ai_img05.jpg",
            "/ai_img06.jpg",
            "/ai_img07.jpg",
            "/ai_img08.jpg",
          ].map((src, index) => (
            <div key={index} className="relative overflow-hidden">
              <img
                src={src}
                alt={`AI Gallery ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-110"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 4. 설명 섹션 */}
             {/* 4. 설명 섹션 */}
      <section
        id="about"
        ref={(el) => (sectionsRef.current.about = el)}
        className="relative min-h-screen overflow-hidden bg-gray-50"
      >
        {/* 상단 큰 텍스트 – 왼쪽 끝에서 시작, 살짝 우측으로만 움직이게 */}
        <div className="relative z-10 w-full px-4 md:px-10 pt-0">
          <h2
            className="leading-none text-black"
            style={{
              fontWeight: 900,
              fontSize: "11.7vw",                 // 이전보다 살짝 줄여서 전체 문구가 보이게
              letterSpacing: "-0.04em",          // 자간 좁게
              whiteSpace: "nowrap",
              marginTop: 0,
              paddingTop: 0,
              // 섹션 안에 들어왔을 때부터 살짝만 오른쪽으로 이동
              transform: `translateX(${Math.max(0, aboutTitleX)}px)`,
              transition: "transform 0.01s linear",
            }}
          >
            How I Work with AI
          </h2>
        </div>

        {/* 본문 텍스트 – 브라우저 1200px 기준 600 + 600 레이아웃 */}
        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 pt-10 pb-[150px]">
          <div className="grid gap-12 md:grid-cols-2">
            {/* 좌측: 설명 텍스트 + 툴 리스트 (같은 폰트 크기) */}
            <div
              className={`transition-all duration-1000 ease-out ${
                isVisible.about
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-10"
              }`}
              style={{
                transform: `translateY(${aboutTextY}px)`,
              }}
            >
              <p className="text-base md:text-lg leading-relaxed text-gray-700">
생성형 AI 툴을 활용해 정적인 이미지 한장으로 시네마틱한 영상을 만들어내는 워크플로우를 실험하고 있습니다.
ChatGPT로 콘셉트와 스토리라인을 구체화한 후 전체 내러티브를 정의합니다. AI가 정확히 이해할 수 있는 언어로 각 장면의 프롬프트를 설계하여 만든 텍스트 프롬프트는 Google AI Studio 나노바나나나 ImgaeFX 등 이미지 생성 툴로 전달되어 시각적 기반을 만들어냅니다.
생성된 이미지는 다시 프롬프트와 함께 Kling AI, Runway, Hailuo같은 image-to-video 툴을 통해 원하는 움직임을 구현합니다. 정적인 이미지 한장이 다양한 카메라 무빙과 디테일을 가진 애니메이션을 영상 클립으로 출력됩니다.
이후 영상 편집툴로 전체 시퀀스를 편집하며 장면 전환과 타이밍을 조정합니다. 사운드 레이어는 다층적으로 구성되는데, SoundQ 같은 AI 툴로 장면에 맞는 효과음을 삽입하고 Suno AI로 분위기에 어울리는 오리지널 음악을 제작합니다. 유투브 같은 플랫폼에 올릴때는 저작권 문제가 없는 Pixabay 음원을 선별해 사용합니다.
이 전체 파이프라인은 단순히 AI 툴을 사용하는 것을 넘어, 각 단계에서 적합한 툴을 선택하고 결과물을 다음 단계의 입력값으로 연결하는 통합적 사고를 보여줍니다. 
              </p>

              {/* 툴 리스트 – 검정색 1px stroke 타원형 pill 스타일 */}
              <div className="mt-6 flex flex-wrap gap-2">
                {["ChatGPT", "Claude", "Google AI Studio", "ImageFX", "Kling AI", "Grok", "Runway", "Hailuo", "Leonardo", "Gemini", "Midjourney"].map(
                  (tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center px-5 py-1.5 text-sm md:text-base"
                      style={{
                        borderRadius: "999px",
                        border: "1px solid#999999",
                        color: "#7f7f7f",
                        backgroundColor: "",
                      }}
                    >
                      {tool}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* 우측: Prompt 텍스트 (좌측 본문과 같은 폰트 크기) */}
            <div
              className={`transition-all duration-1000 delay-150 ease-out ${
                isVisible.about
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"
              }`}
              style={{
                transform: `translateY(${aboutTextY}px)`,
              }}
            >
              <h3 className="mb-4 text-base md:text-lg font-semibold text-gray-900">
                Ex Prompt
              </h3>
              <p className="text-base md:text-lg leading-relaxed text-gray-700">
                Start exactly from the first face image. Hold the face shot still for
                about 3 seconds. No movement except subtle breathing and blinking. After
                3 seconds, perform a fast snap zoom-out to match the second full-body
                image. The zoom-out must be quick and clean, happening almost instantly.
                Once the full-body frame is revealed, the character runs forward at a
                faster speed with strong momentum. His cape and hair flutter intensely
                with the wind. Allied characters behind him also run faster to keep up.
                As he runs uphill through short grass, the grass must react to his steps
                with visible compression and movement for depth. The sky should move
                slowly with drifting red clouds to avoid a static background. All
                weapons, armor, outfit, and proportions must remain identical from start
                to end. No weapon changes, no morphing, no disappearing limbs. Light
                battlefield atmosphere only: soft smoke, small sparks, a few embers. No
                large explosions. Camera timing: 3 seconds hold on the face → fast snap
                zoom-out → full-body running sequence...

                etc.
              </p>
            </div>
          </div>
        </div>

        {/* 하단 이미지 – 섹션 바닥에 100%로 깔고, 위 텍스트와 150px 간격 확보 */}
        <div className="absolute bottom-0 left-0 w-full">
          <img
            src="/fullshot.jpg"
            alt="AI visual experiment"
            className="h-[200px] w-full object-cover md:h-[260px] lg:h-[320px]"
          />
        </div>
      </section>

      {/* 5. 컨택트 섹션 – 화면 전체를 채우고, 중앙 번호/이메일 + 하단 푸터 */}
      <section
        id="contact"
        ref={el => (sectionsRef.current.contact = el)}
        className="relative flex h-screen w-full flex-col overflow-hidden bg-white"
      >
        {/* 중앙 번호 + 이메일 */}
        <div className="relative flex flex-1 items-center justify-center px-4 md:px-10">
          {/* 배경 전화번호 – 전체 폭 사용 */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p
              className="font-black"
              style={{
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 900,
                color: "#f5f5f5",
                letterSpacing: "-0.02em",
                transform: `translateX(${contactPhoneX}px)`,
                transition: "transform 0.1s linear",
                whiteSpace: "nowrap",
                fontSize: "14vw",
              }}
            >
              010.9361.6706
            </p>
          </div>

          {/* 전면 이메일 */}
          <div className="relative z-10 text-center">
            <p
              className="text-4xl font-bold md:text-5xl lg:text-6xl"
              style={{
                transform: `translateX(${contactEmailX}px)`,
                transition: "transform 0.1s linear",
                color: "#542718",
              }}
            >
              nosp6@naver.com
            </p>
          </div>
        </div>

        {/* 하단 푸터 – 같은 화면 안에서 보이게 */}
        <div
          className="flex h-[80px] items-center justify-center px-8"
          style={{ backgroundColor: "#272727" }}
        >
          <p className="text-center text-sm" style={{ color: "#666" }}>
            © Copyright JoonHyungKim All rights reserved.
          </p>
        </div>
      </section>
    </>
  );
}