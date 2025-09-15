import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  
  if (!imageUrl) {
    return new NextResponse('Missing image URL', { status: 400 });
  }

  // 验证是否是微信图片URL
  if (!imageUrl.includes('mmbiz.qpic.cn')) {
    return new NextResponse('Invalid image URL', { status: 400 });
  }

  // 尝试多种不同的请求头配置
  const headerConfigs = [
    {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://mp.weixin.qq.com/',
      'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
    {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      'Referer': 'https://mp.weixin.qq.com/',
    },
    {
      'User-Agent': 'WeChat/8.0.0',
      'Referer': 'https://servicewechat.com/',
    }
  ];

  for (let i = 0; i < headerConfigs.length; i++) {
    try {
      console.log(`尝试配置 ${i + 1} 获取图片:`, imageUrl.substring(0, 50) + '...');
      
      const response = await fetch(imageUrl, {
        headers: headerConfigs[i],
        timeout: 10000, // 10秒超时
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const imageBuffer = await response.arrayBuffer();
        
        console.log(`配置 ${i + 1} 成功获取图片，大小:`, imageBuffer.byteLength);

        return new NextResponse(imageBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400', // 缓存1天
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      console.log(`配置 ${i + 1} 失败:`, response.status, response.statusText);
    } catch (error) {
      console.log(`配置 ${i + 1} 错误:`, error.message);
      continue;
    }
  }

  // 所有配置都失败了，返回透明图片
  console.error('所有配置都无法获取图片:', imageUrl);
  
  const transparentPixel = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
  );
  
  return new NextResponse(transparentPixel, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=300', // 短时间缓存失败结果
    },
  });
}
