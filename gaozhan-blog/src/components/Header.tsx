'use client';

import Link from 'next/link';
import { useState } from 'react';

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

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-amber-100 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <i className="fas fa-mountain text-amber-300 text-2xl"></i>
            <Link 
              href="/" 
              className="title-font text-2xl text-amber-300 hover:text-white transition duration-300"
            >
              高瞻江湖
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className="nav-item py-2 px-1 hover:text-amber-300 transition duration-300"
            >
              江湖首页
            </Link>
            <button 
              onClick={() => smoothScrollTo('about')}
              className="nav-item py-2 px-1 hover:text-amber-300 transition duration-300"
            >
              掌门人
            </button>
            <button 
              onClick={() => smoothScrollTo('articles')}
              className="nav-item py-2 px-1 hover:text-amber-300 transition duration-300"
            >
              武林秘籍
            </button>
            <button 
              onClick={() => smoothScrollTo('contact')}
              className="nav-item py-2 px-1 hover:text-amber-300 transition duration-300"
            >
              江湖联系
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              className="text-amber-300 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <i className="fas fa-bars text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 border-t border-gray-700 pt-4">
            <Link 
              href="/" 
              className="block py-2 px-1 hover:text-amber-300 transition duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              江湖首页
            </Link>
            <button 
              className="block py-2 px-1 hover:text-amber-300 transition duration-300 w-full text-left"
              onClick={() => {
                smoothScrollTo('about');
                setIsMenuOpen(false);
              }}
            >
              掌门人
            </button>
            <button 
              className="block py-2 px-1 hover:text-amber-300 transition duration-300 w-full text-left"
              onClick={() => {
                smoothScrollTo('articles');
                setIsMenuOpen(false);
              }}
            >
              武林秘籍
            </button>
            <button 
              className="block py-2 px-1 hover:text-amber-300 transition duration-300 w-full text-left"
              onClick={() => {
                smoothScrollTo('contact');
                setIsMenuOpen(false);
              }}
            >
              江湖联系
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
