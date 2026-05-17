"use client";

import { useEffect } from 'react';

/**
 * Component này giúp bỏ qua trang cảnh báo của ngrok (interstitial page).
 * Nó thực hiện một yêu cầu fetch kèm theo header 'ngrok-skip-browser-warning',
 * giúp trình duyệt lưu lại cookie và cho phép hiển thị các thẻ <img> từ ngrok.
 */
export default function NgrokBypass() {
  useEffect(() => {
    const bypassNgrok = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl || !apiUrl.includes('ngrok-free.app')) return;

      try {
        await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
        // console.log('Ngrok bypass successful');
      } catch (error) {
        // console.error('Ngrok bypass failed:', error);
      }
    };

    bypassNgrok();
  }, []);

  return null;
}
