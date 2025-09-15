'use client';

// 平滑滚动函数
const smoothScrollTo = (elementId: string) => {
  const element = document.getElementById(elementId.replace('#', ''));
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};

export default function HeroBanner() {
  return (
    <section className="hero-banner flex items-center justify-center relative">
      <div className="text-center px-4">
        <h1 className="title-font text-5xl md:text-6xl text-amber-300 mb-4">
          高瞻江湖
        </h1>
        <p className="text-xl text-white mb-8">
          文武双全 · 智勇兼备 · 江湖一绝
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => smoothScrollTo('articles')}
            className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-full transition duration-300 shadow-lg"
          >
            探索武林秘籍
          </button>
          <button 
            onClick={() => smoothScrollTo('about')}
            className="border-2 border-amber-300 hover:bg-amber-900 hover:bg-opacity-50 text-amber-300 px-6 py-3 rounded-full transition duration-300 shadow-lg"
          >
            了解掌门人
          </button>
        </div>
      </div>
      
      {/* Scroll down indicator */}
      <button 
        onClick={() => smoothScrollTo('about')}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white text-4xl scroll-down"
      >
        <i className="fas fa-chevron-down"></i>
      </button>
    </section>
  );
}
