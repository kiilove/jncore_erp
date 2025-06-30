"use client";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiShoppingCart,
  FiShoppingBag,
  FiUsers,
  FiFileText,
  FiPackage,
  FiX,
  FiSettings,
  FiUserCheck,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { hasPermission } = useAuth();

  const menuItems = [
    { path: "/", icon: <FiHome />, name: "대시보드" },
    { path: "/purchases", icon: <FiShoppingCart />, name: "매입관리" },
    { path: "/sales", icon: <FiShoppingBag />, name: "매출관리" },
    { path: "/products", icon: <FiPackage />, name: "제품관리" },
    { path: "/customers", icon: <FiUsers />, name: "거래처관리" },
    { path: "/sales-invoice", icon: <FiFileText />, name: "매출명세표" },
    { path: "/settings", icon: <FiSettings />, name: "설정" },
  ];

  // 관리자 전용 메뉴
  const adminMenuItems = [
    {
      path: "/user-management",
      icon: <FiUserCheck />,
      name: "사용자 권한 관리",
      role: "admin",
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            JN Core
          </h2>
          <button
            onClick={toggleSidebar}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none md:hidden"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => window.innerWidth < 768 && toggleSidebar()}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}

            {/* 관리자 메뉴 */}
            {adminMenuItems.some((item) => hasPermission(item.role)) && (
              <>
                <li className="pt-4">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    관리자 메뉴
                  </div>
                </li>

                {adminMenuItems.map(
                  (item) =>
                    hasPermission(item.role) && (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={`flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 rounded-lg transition-colors duration-200 ${
                            isActive(item.path)
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                              : "hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                          onClick={() =>
                            window.innerWidth < 768 && toggleSidebar()
                          }
                        >
                          <span className="text-xl mr-3">{item.icon}</span>
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    )
                )}
              </>
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
