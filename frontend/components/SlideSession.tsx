import React, { useEffect } from 'react';
import UserService from '@/modules/admin/service/UserService';
const SlideSession: React.FC = () => {
  // Truy cập trực tiếp các biến môi trường
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
  const loginPage = process.env.NEXT_PUBLIC_LOGIN_PAGE || "/login";
  const tokenExpiration = parseInt((process.env.NEXT_PUBLIC_TOKEN_EXPIRATION || "60m").replace(/[^\d]/g, ""), 10) * 60;

  console.log("Environment variables in SlideSession:", {
    apiBaseUrl,
    loginPage,
    tokenExpiration,
  });

  useEffect(() => {
    const refreshToken = async () => {
      try {
        console.log('Refreshing token...');
        await UserService.refreshToken();
        console.log('Token refreshed successfully');
      } catch (error) {
        console.error('Error during token refresh:', error);

        // Điều hướng đến trang đăng nhập nếu lỗi xảy ra
        if (typeof window !== 'undefined') {
          window.location.href = loginPage;
        }
      }
    };

    // Cài đặt thời gian làm mới token
    const refreshInterval = Math.max(tokenExpiration - 30, 30); // Ít nhất 30 giây
    console.log(`Setting refresh interval to ${refreshInterval} seconds.`);

    // Thiết lập khoảng thời gian định kỳ để làm mới token
    const interval = setInterval(refreshToken, refreshInterval * 1000);

    // Làm mới token ngay lập tức
    refreshToken();

    // Xóa khoảng thời gian khi unmount
    return () => {
      console.log('Clearing refresh interval.');
      clearInterval(interval);
    };
  }, []);

  return null;
};

export default SlideSession;