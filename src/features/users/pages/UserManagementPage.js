"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useAuth } from "../../../contexts/AuthContext";
import { FiUser, FiShield, FiEdit2, FiSave, FiX } from "react-icons/fi";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editRoles, setEditRoles] = useState([]);
  const { currentUser, hasPermission } = useAuth();

  // 사용 가능한 역할 목록
  const availableRoles = [
    { id: "admin", name: "관리자", description: "모든 기능에 접근 가능" },
    { id: "manager", name: "매니저", description: "대부분의 기능에 접근 가능" },
    { id: "sales", name: "영업", description: "매출 관련 기능에 접근 가능" },
    {
      id: "inventory",
      name: "재고",
      description: "재고 관련 기능에 접근 가능",
    },
    { id: "user", name: "일반 사용자", description: "기본 기능에만 접근 가능" },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, "users");
      const userSnapshot = await getDocs(usersCollection);
      const usersList = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("사용자 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditRoles(user.roles || []);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditRoles([]);
  };

  const handleRoleToggle = (roleId) => {
    if (editRoles.includes(roleId)) {
      setEditRoles(editRoles.filter((id) => id !== roleId));
    } else {
      setEditRoles([...editRoles, roleId]);
    }
  };

  const handleSaveRoles = async () => {
    try {
      if (!editingUser) return;

      // 최소한 하나의 역할은 있어야 함
      if (editRoles.length === 0) {
        alert("사용자는 최소한 하나의 역할이 필요합니다.");
        return;
      }

      await updateDoc(doc(db, "users", editingUser.id), {
        roles: editRoles,
      });

      // 사용자 목록 업데이트
      setUsers(
        users.map((user) => {
          if (user.id === editingUser.id) {
            return { ...user, roles: editRoles };
          }
          return user;
        })
      );

      setEditingUser(null);
      setEditRoles([]);
      alert("사용자 권한이 업데이트되었습니다.");
    } catch (error) {
      console.error("Error updating user roles:", error);
      alert("사용자 권한 업데이트 중 오류가 발생했습니다.");
    }
  };

  // 관리자 권한이 없으면 접근 불가
  if (!hasPermission("admin")) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FiShield className="text-red-500 text-5xl mb-4" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          접근 권한이 없습니다
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          이 페이지에 접근하려면 관리자 권한이 필요합니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          사용자 권한 관리
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    사용자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    역할
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                        editingUser?.id === user.id
                          ? "bg-blue-50 dark:bg-blue-900"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.displayName || "사용자"}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.id === currentUser?.uid
                                ? "(현재 사용자)"
                                : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        {editingUser?.id === user.id ? (
                          <div className="space-y-2">
                            {availableRoles.map((role) => (
                              <div key={role.id} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`role-${user.id}-${role.id}`}
                                  checked={editRoles.includes(role.id)}
                                  onChange={() => handleRoleToggle(role.id)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                  htmlFor={`role-${user.id}-${role.id}`}
                                  className="ml-2 block text-sm text-gray-900 dark:text-gray-100"
                                >
                                  {role.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {(user.roles || []).map((role) => {
                              const roleInfo = availableRoles.find(
                                (r) => r.id === role
                              ) || {
                                name: role,
                                id: role,
                              };
                              return (
                                <span
                                  key={role}
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    role === "admin"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      : role === "manager"
                                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  }`}
                                >
                                  {roleInfo.name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingUser?.id === user.id ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={handleSaveRoles}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="저장"
                            >
                              <FiSave className="h-5 w-5" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="취소"
                            >
                              <FiX className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="권한 편집"
                          >
                            <FiEdit2 className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      등록된 사용자가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
