import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and Description */}
          <div className="mb-6 md:mb-0">
            <div className="flex items-center">
              <i className="fas fa-mountain text-amber-300 text-2xl mr-2"></i>
              <span className="title-font text-2xl text-amber-300">高瞻江湖</span>
            </div>
            <p className="text-amber-200 mt-2 max-w-lg">
              文武双全，智勇兼备。高瞻江湖，集百家之长，融会贯通，自成一家。
            </p>
          </div>

          {/* Social Links */}
          <div className="flex space-x-6">
            <Link 
              href="#" 
              className="text-amber-300 hover:text-white text-xl transition duration-300 transform hover:scale-110"
              aria-label="微信公众号"
              title="微信公众号"
            >
              <i className="fab fa-weixin"></i>
            </Link>
            <Link 
              href="#" 
              className="text-amber-300 hover:text-white text-xl transition duration-300 transform hover:scale-110"
              aria-label="Twitter"
              title="Twitter"
            >
              <i className="fab fa-twitter"></i>
            </Link>
            <Link 
              href="#" 
              className="text-amber-300 hover:text-white text-xl transition duration-300 transform hover:scale-110"
              aria-label="Facebook"
              title="Facebook"
            >
              <i className="fab fa-facebook"></i>
            </Link>
            <Link 
              href="#" 
              className="text-amber-300 hover:text-white text-xl transition duration-300 transform hover:scale-110"
              aria-label="GitHub"
              title="GitHub"
            >
              <i className="fab fa-github"></i>
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-amber-800 mt-8 pt-8 text-center text-amber-200">
          <p>
            &copy; 2025 高瞻江湖. 版权所有. 
            <span className="sword-icon">
              <i className="fas fa-sword text-amber-300"></i>
            </span>
            江湖险恶，请勿盗用
            <span className="sword-icon">
              <i className="fas fa-sword text-amber-300"></i>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
