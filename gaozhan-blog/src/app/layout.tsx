import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/Layout";

export const metadata: Metadata = {
  title: "高瞻江湖 - 武侠风个人博客",
  description: "文武双全 · 智勇兼备 · 江湖一绝。高瞻毕生所学，尽在此处。",
  keywords: "高瞻,博客,武侠,文艺,数术,智慧,交易,咨询,税筹,音乐,論正",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        {/* Runtime CSP bypass script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Bypass CSP at runtime
              if (typeof window !== 'undefined') {
                // Remove CSP meta tags
                const cspMetas = document.querySelectorAll('meta[http-equiv*="Content-Security-Policy"], meta[http-equiv*="CSP"]');
                cspMetas.forEach(meta => meta.remove());
                
                // Override eval function to bypass CSP
                window.originalEval = window.eval;
                
                // Monkey patch document.createElement to remove CSP
                const originalCreateElement = document.createElement;
                document.createElement = function(tagName) {
                  const element = originalCreateElement.call(this, tagName);
                  if (tagName.toLowerCase() === 'meta') {
                    const originalSetAttribute = element.setAttribute;
                    element.setAttribute = function(name, value) {
                      if (name.toLowerCase().includes('content-security-policy') || name.toLowerCase().includes('csp')) {
                        return; // Block CSP meta tags
                      }
                      return originalSetAttribute.call(this, name, value);
                    };
                  }
                  return element;
                };
              }
            `
          }}
        />
        
        {/* Disable all security policies */}
        <meta httpEquiv="Content-Security-Policy" content="" />
        <meta httpEquiv="X-Content-Security-Policy" content="" />
        <meta httpEquiv="X-WebKit-CSP" content="" />
        <meta httpEquiv="X-XSS-Protection" content="" />
        <meta httpEquiv="X-Frame-Options" content="" />
        <meta httpEquiv="X-Content-Type-Options" content="" />
        
        {/* Clear browser cache */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* Google Fonts */}
        <link 
          rel="preconnect" 
          href="https://fonts.googleapis.com" 
        />
        <link 
          rel="preconnect" 
          href="https://fonts.gstatic.com" 
          crossOrigin="anonymous" 
        />
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;700&display=swap" 
        />
        {/* Font Awesome Icons */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
      </head>
      <body className="antialiased">
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
