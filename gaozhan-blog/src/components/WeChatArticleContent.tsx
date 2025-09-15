'use client';

import { useEffect, useRef, useState } from 'react';

interface WeChatArticleContentProps {
  content: string;
  title: string;
}

export default function WeChatArticleContent({ content, title }: WeChatArticleContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [processedContent, setProcessedContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processContent = async () => {
      if (!content) {
        setIsProcessing(false);
        return;
      }

      try {
        // 清理和处理HTML内容
        let cleanContent = content;
        
        // 移除DOCTYPE和html标签包装
        cleanContent = cleanContent.replace(/<!DOCTYPE[^>]*>/gi, '');
        cleanContent = cleanContent.replace(/<html[^>]*>/gi, '');
        cleanContent = cleanContent.replace(/<\/html>/gi, '');
        cleanContent = cleanContent.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
        cleanContent = cleanContent.replace(/<body[^>]*>/gi, '');
        cleanContent = cleanContent.replace(/<\/body>/gi, '');
        
        // 清理样式标签
        cleanContent = cleanContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
        
        // 处理微信图片链接，使用代理服务
        cleanContent = cleanContent.replace(
          /<img([^>]*src="(https:\/\/mmbiz\.qpic\.cn[^"]*)"[^>]*)>/gi,
          (match, imgAttrs, originalSrc) => {
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(originalSrc)}`;
            return `<img${imgAttrs.replace(`src="${originalSrc}"`, `src="${proxyUrl}"`)} loading="lazy" data-original-src="${originalSrc}">`;
          }
        );
        
        // 直接移除所有mb-8容器 - 简单粗暴但有效
        console.log('HTML预处理：开始查找mb-8容器...');
        const originalLength = cleanContent.length;
        
        cleanContent = cleanContent.replace(/<div[^>]*class="[^"]*mb-8[^"]*"[^>]*>[\s\S]*?<\/div>/gi, (match) => {
          console.log('HTML预处理：找到并移除mb-8容器:', match.substring(0, 100) + '...');
          return ''; // 移除整个mb-8容器
        });
        
        const newLength = cleanContent.length;
        console.log(`HTML预处理：内容长度从 ${originalLength} 变为 ${newLength}`);
        
        // 也尝试更宽松的匹配
        cleanContent = cleanContent.replace(/<div[^>]*mb-8[^>]*>[\s\S]*?<\/div>/gi, (match) => {
          console.log('HTML预处理：通过宽松匹配找到mb-8:', match.substring(0, 100) + '...');
          return '';
        });
        
        // 移除所有可能的图片占位符文本和相关内容
        cleanContent = cleanContent.replace(/此图片来自微信公众号/gi, '');
        cleanContent = cleanContent.replace(/图片来自微信公众号/gi, '');
        cleanContent = cleanContent.replace(/来自微信公众号/gi, '');
        cleanContent = cleanContent.replace(/微信公众号/gi, '');
        
        // 移除包含图片占位符文本的段落和div
        cleanContent = cleanContent.replace(/<p[^>]*>.*?此图片来自微信公众号.*?<\/p>/gi, '');
        cleanContent = cleanContent.replace(/<div[^>]*>.*?此图片来自微信公众号.*?<\/div>/gi, '');
        cleanContent = cleanContent.replace(/<span[^>]*>.*?此图片来自微信公众号.*?<\/span>/gi, '');
        
        // 清理图片的alt属性中的占位符文字
        cleanContent = cleanContent.replace(/alt="[^"]*此图片来自微信公众号[^"]*"/gi, 'alt=""');
        cleanContent = cleanContent.replace(/alt="[^"]*图片来自微信公众号[^"]*"/gi, 'alt=""');
        
        // 只清理alt属性中的占位符文字，保留其他有用信息
        cleanContent = cleanContent.replace(/alt="([^"]*?)此图片来自微信公众号([^"]*)"/gi, 'alt="$1$2"');
        
        // 移除可能的图片说明文字
        cleanContent = cleanContent.replace(/<figcaption[^>]*>.*?此图片来自微信公众号.*?<\/figcaption>/gi, '');
        cleanContent = cleanContent.replace(/<small[^>]*>.*?此图片来自微信公众号.*?<\/small>/gi, '');
        
        // 移除空的段落和换行符
        cleanContent = cleanContent.replace(/<p><br\s*\/?><\/p>/gi, '');
        cleanContent = cleanContent.replace(/<p>\s*<\/p>/gi, '');
        cleanContent = cleanContent.replace(/(<br\s*\/?>){3,}/gi, '<br><br>');
        
        // 处理特殊的微信样式标签
        cleanContent = cleanContent.replace(/<mp-style-type[^>]*>[\s\S]*?<\/mp-style-type>/gi, '');
        
        // 移除不必要的空白和换行
        cleanContent = cleanContent.replace(/\s+/g, ' ').trim();
        
        // 最后一步：移除任何可能的占位符相关内容
        cleanContent = cleanContent.replace(/<div[^>]*>[\s\S]*?此图片来自微信公众号[\s\S]*?<\/div>/gi, '');
        cleanContent = cleanContent.replace(/<p[^>]*>[\s\S]*?此图片来自微信公众号[\s\S]*?<\/p>/gi, '');
        
        // 移除空的mb-8容器
        cleanContent = cleanContent.replace(/<div[^>]*class="[^"]*mb-8[^"]*"[^>]*>\s*<\/div>/gi, '');
        
        setProcessedContent(cleanContent);
      } catch (error) {
        console.error('Content processing error:', error);
        setProcessedContent(content);
      } finally {
        setIsProcessing(false);
      }
    };

    processContent();
  }, [content]);

  useEffect(() => {
    if (contentRef.current && processedContent) {
      // 处理图片加载错误和样式
      const images = contentRef.current.querySelectorAll('img');
      images.forEach((img, index) => {
        // 设置图片样式
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '8px';
        img.style.margin = '20px auto';
        img.style.display = 'block';
        img.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        
        // 保持图片正常的alt属性，只在需要时清理占位符文字
        const altText = img.getAttribute('alt') || '';
        if (altText.includes('此图片来自微信公众号')) {
          img.setAttribute('alt', altText.replace(/此图片来自微信公众号/g, '').trim());
        }
        
        // 改进图片加载处理
        const checkAndFixImage = () => {
          // 确保所有图片都正常显示
          img.style.display = 'block';
          img.style.visibility = 'visible';
          
          // 检查图片加载状态
          const isProxyImage = img.src.includes('/api/proxy-image');
          const originalSrc = img.getAttribute('data-original-src');
          
          console.log('检查图片:', {
            src: img.src.substring(0, 50) + '...',
            isProxy: isProxyImage,
            complete: img.complete,
            naturalSize: `${img.naturalWidth}x${img.naturalHeight}`,
            hasOriginal: !!originalSrc
          });
          
          // 如果图片加载失败或尺寸为0
          if (!img.complete || img.naturalWidth === 0) {
            if (isProxyImage && originalSrc) {
              // 如果代理图片失败，尝试直接加载原图
              console.log('代理图片失败，尝试原图:', originalSrc.substring(0, 50) + '...');
              img.src = originalSrc;
              img.setAttribute('referrerpolicy', 'no-referrer');
              img.setAttribute('crossorigin', 'anonymous');
            }
          }
          
          return false;
        };
        
        // 图片加载完成后检查
        img.addEventListener('load', () => {
          checkAndFixImage();
          
          // 正常图片的显示动画
          if (img.style.display !== 'none') {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
              img.style.opacity = '1';
            }, 100);
          }
        });
        
        // 处理图片加载错误
        img.addEventListener('error', () => {
          // 如果是代理图片失败，尝试显示原图
          const originalSrc = img.getAttribute('data-original-src');
          if (originalSrc && !img.src.includes(originalSrc)) {
            img.src = originalSrc;
            img.setAttribute('referrerpolicy', 'no-referrer');
            img.setAttribute('crossorigin', 'anonymous');
            return;
          }
          
          // 彻底移除图片元素
          let elementToRemove = img;
          let parent = img.parentElement;
          
          // 向上查找，如果父元素只包含这个图片或者只有空文本，就移除父元素
          while (parent && parent !== contentRef.current) {
            const siblingElements = Array.from(parent.children).filter(child => 
              child !== elementToRemove && child.textContent?.trim()
            );
            const hasNonEmptyText = parent.textContent?.replace(elementToRemove.textContent || '', '').trim();
            
            if (siblingElements.length === 0 && !hasNonEmptyText) {
              elementToRemove = parent;
              parent = parent.parentElement;
            } else {
              break;
            }
          }
          
          // 移除确定的元素
          elementToRemove.remove();
        });
        
        // 如果图片已经加载完成，立即检查
        if (img.complete) {
          checkAndFixImage();
        }
        
        // 延时检查，确保图片尺寸信息已获取
        setTimeout(() => {
          checkAndFixImage();
        }, 200);
        
        setTimeout(() => {
          checkAndFixImage();
        }, 1000);

      });

      // 处理空的段落标签和包含图片占位符文字的元素
      const paragraphs = contentRef.current.querySelectorAll('p, div, span, small, figcaption');
      paragraphs.forEach((element) => {
        const textContent = element.textContent?.trim();
        const hasImages = element.querySelector('img');
        const hasOtherContent = element.querySelector('section, div, span');
        
        // 如果元素包含图片占位符文字，直接移除
        if (textContent && (
          textContent.includes('此图片来自微信公众号') ||
          textContent.includes('图片来自微信公众号') ||
          textContent.includes('来自微信公众号')
        )) {
          element.remove();
          return;
        }
        
        // 如果是空元素，隐藏
        if (!textContent && !hasImages && !hasOtherContent) {
          element.style.display = 'none';
        }
      });
      
      // 特别处理图片的标题和说明文字
      const allElements = contentRef.current.querySelectorAll('*');
      allElements.forEach((element) => {
        if (element.textContent && element.textContent.includes('此图片来自微信公众号')) {
          // 如果这个元素只包含占位符文字，直接移除
          if (element.textContent.trim() === '此图片来自微信公众号') {
            element.remove();
          } else {
            // 如果包含其他内容，只移除占位符文字
            element.textContent = element.textContent.replace(/此图片来自微信公众号/g, '').trim();
          }
        }
      });

      // 处理表格样式
      const tables = contentRef.current.querySelectorAll('table');
      tables.forEach((table) => {
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.margin = '20px 0';
        table.style.background = 'white';
        table.style.borderRadius = '8px';
        table.style.overflow = 'hidden';
        table.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      });

      // 处理表格单元格
      const cells = contentRef.current.querySelectorAll('td, th');
      cells.forEach((cell) => {
        (cell as HTMLElement).style.border = '1px solid #e2e8f0';
        (cell as HTMLElement).style.padding = '12px 16px';
      });
      
      // 立即清理一次，然后设置观察器持续监控
      const cleanPlaceholderText = () => {
        if (contentRef.current) {
          const elementsWithPlaceholder = contentRef.current.querySelectorAll('*');
          elementsWithPlaceholder.forEach((element) => {
            if (element.textContent && element.textContent.includes('此图片来自微信公众号')) {
              if (element.textContent.trim() === '此图片来自微信公众号') {
                element.remove();
              } else {
                element.textContent = element.textContent.replace(/此图片来自微信公众号/g, '').trim();
              }
            }
          });
          
          // 直接移除所有mb-8容器 - 按照你的要求
          console.log('开始查找mb-8容器...');
          const mb8Containers = contentRef.current.querySelectorAll('.mb-8');
          console.log('找到mb-8容器数量:', mb8Containers.length);
          
          mb8Containers.forEach((container, index) => {
            console.log(`移除第${index + 1}个mb-8容器:`, container.innerHTML.substring(0, 100));
            container.remove();
          });
          
          // 也尝试其他可能的选择器
          const allMb8 = contentRef.current.querySelectorAll('div[class*="mb-8"]');
          console.log('通过class*="mb-8"找到容器数量:', allMb8.length);
          allMb8.forEach((container, index) => {
            console.log(`移除第${index + 1}个mb-8容器(通配符):`, container.className);
            container.remove();
          });
        }
      };
      
      // 立即执行一次清理
      cleanPlaceholderText();
      
      // 延时再次清理，确保所有内容都已渲染
      setTimeout(() => {
        cleanPlaceholderText();
      }, 100);
      
      setTimeout(() => {
        cleanPlaceholderText();
      }, 500);
      
      // 设置观察器来持续清理可能动态添加的占位符文字
      const observer = new MutationObserver(() => {
        cleanPlaceholderText();
      });
      
      if (contentRef.current) {
        observer.observe(contentRef.current, {
          childList: true,
          subtree: true,
          characterData: true
        });
      }
      
      // 清理函数
      return () => {
        observer.disconnect();
      };
    }
  }, [processedContent]);

  // 如果内容为空，显示提示信息
  if (!content) {
    return (
      <div className="wechat-article-content">
        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-info-circle text-amber-600 mr-3"></i>
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">内容暂时无法显示</h3>
              <p className="text-amber-700">
                由于原文访问限制或内容获取问题，暂时无法显示完整内容。
                <br />
                您可以点击下方的"原文链接"查看完整文章。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="wechat-article-content">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mr-3"></div>
          <span className="text-gray-600">正在处理文章内容...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={contentRef}
      className="wechat-article-content"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}

