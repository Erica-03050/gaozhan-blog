'use client';

export default function ContactSection() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('谢谢你的留言！高瞻将会尽快回复。');
  };
  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-gray-50 to-amber-50 bg-opacity-80">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="title-font text-4xl text-gray-800 mb-4">江湖联系</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">有缘千里来相会，无缘对面不相逢</p>
          <div className="flex justify-center mt-4">
            <div className="w-24 h-1 bg-amber-700 rounded-full"></div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white bg-opacity-90 rounded-xl shadow-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 bg-gradient-to-br from-amber-700 to-amber-900 p-8 text-white">
              <h3 className="title-font text-2xl mb-6">留下你的江湖名帖</h3>
              <p className="mb-6">
                若有疑问或想与高瞻切磋交流，请填写此表。江湖路远，期待与君相逢。
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-4 text-xl"></i>
                  <div>
                    <h4 className="font-bold">江湖总舵</h4>
                    <p>中原武林，紫禁之巅</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-envelope mr-4 text-xl"></i>
                  <div>
                    <h4 className="font-bold">飞鸽传书</h4>
                    <p>gaozhan@jianghu.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-phone-alt mr-4 text-xl"></i>
                  <div>
                    <h4 className="font-bold">千里传音</h4>
                    <p>+86 138 8888 8888</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 p-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 mb-2">江湖名号</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 mb-2">飞鸽地址</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="message" className="block text-gray-700 mb-2">江湖留言</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg transition duration-300 shadow-lg"
                >
                  发送名帖 <i className="fas fa-paper-plane ml-2"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
