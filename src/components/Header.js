"use client";

import { useContext, useState, useRef, useEffect } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import {
  FiMenu,
  FiMoon,
  FiSun,
  FiUser,
  FiLogOut,
  FiSettings,
} from "react-icons/fi";
import NotificationCenter from "../features/notifications/components/NotificationCenter";
import { useNotification } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = ({ toggleSidebar }) => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const {} = useNotification();
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-10 transition-colors duration-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none md:hidden"
          >
            <FiMenu className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-800 dark:text-white">
            JN Core ERP
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
          >
            {darkMode ? (
              <FiSun className="h-5 w-5" />
            ) : (
              <FiMoon className="h-5 w-5" />
            )}
          </button>

          <NotificationCenter />

          <div className="relative" ref={userMenuRef}>
            <button
              className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <FiUser className="h-5 w-5" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                {currentUser && (
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {currentUser.displayName || currentUser.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                )}

                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/profile");
                    setShowUserMenu(false);
                  }}
                >
                  <FiSettings className="mr-2" /> 프로필 설정
                </a>

                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  <FiLogOut className="mr-2" /> 로그아웃
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
