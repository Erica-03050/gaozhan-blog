export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-gradient-to-b from-transparent to-amber-50 bg-opacity-80">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="title-font text-4xl text-gray-800 mb-4">
            掌门人 <span className="text-amber-700">高瞻</span>
          </h2>
          <div className="flex justify-center">
            <div className="w-24 h-1 bg-amber-700 rounded-full"></div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center">
          {/* 头像区域 */}
          <div className="md:w-1/3 mb-8 md:mb-0 flex justify-center slide-in-left">
            <div className="relative">
              <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-amber-700 shadow-xl smooth-transition hover:shadow-2xl hover:scale-105">
                <img 
                  src="https://img.freepik.com/free-photo/portrait-handsome-chinese-man-traditional-costume_23-2149436919.jpg" 
                  alt="高瞻" 
                  className="w-full h-full object-cover smooth-transition hover:scale-110"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-amber-800 text-white px-4 py-2 rounded-full shadow-lg smooth-transition hover:bg-amber-700">
                <i className="fas fa-crown mr-2"></i> 掌门人
              </div>
            </div>
          </div>

          {/* 介绍区域 */}
          <div className="md:w-2/3 md:pl-12 slide-in-right delay-200">
            <h3 className="title-font text-3xl text-gray-800 mb-4">
              江湖人称&ldquo;<span className="text-amber-700">智多星</span>&rdquo;
            </h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              高瞻，字远之，号智多星，江湖人称&ldquo;文武全才&rdquo;。自幼习武修文，精通数术谋略，深谙江湖之道。二十载江湖历练，集百家之长，融会贯通，自成一家。今开此江湖博客，与天下英雄分享毕生所学。
            </p>
            
            {/* 技能卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-md text-center smooth-transition hover:shadow-lg hover:scale-105 fade-in-up delay-300">
                <i className="fas fa-book text-3xl text-amber-700 mb-2 smooth-transition hover:scale-110"></i>
                <h4 className="font-bold">文艺人生</h4>
                <p className="text-sm text-gray-600">诗词歌赋，琴棋书画</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md text-center smooth-transition hover:shadow-lg hover:scale-105 fade-in-up delay-400">
                <i className="fas fa-calculator text-3xl text-amber-700 mb-2 smooth-transition hover:scale-110"></i>
                <h4 className="font-bold">数术人生</h4>
                <p className="text-sm text-gray-600">阴阳五行，奇门遁甲</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md text-center smooth-transition hover:shadow-lg hover:scale-105 fade-in-up delay-500">
                <i className="fas fa-brain text-3xl text-amber-700 mb-2 smooth-transition hover:scale-110"></i>
                <h4 className="font-bold">智慧人生</h4>
                <p className="text-sm text-gray-600">处世哲学，人生智慧</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
