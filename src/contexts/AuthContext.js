"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // 사용자 역할 가져오기
  const fetchUserRoles = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRoles(userData.roles || []);
        return userData.roles || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching user roles:", error);
      return [];
    }
  };

  // 회원가입
  const signup = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 사용자 프로필 업데이트
      await updateProfile(userCredential.user, { displayName });

      // Firestore에 사용자 정보 저장
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        displayName,
        roles: ["user"], // 기본 역할
        createdAt: new Date(),
      });

      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // 로그인
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // 로그아웃
  const logout = () => {
    return signOut(auth);
  };

  // 비밀번호 재설정
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // 사용자 역할 업데이트
  const updateUserRoles = async (uid, roles) => {
    try {
      await updateDoc(doc(db, "users", uid), { roles });
      if (currentUser && currentUser.uid === uid) {
        setUserRoles(roles);
      }
      return true;
    } catch (error) {
      console.error("Error updating user roles:", error);
      throw error;
    }
  };

  // 권한 확인
  const hasPermission = (requiredRole) => {
    if (!currentUser) return false;
    if (userRoles.includes("admin")) return true; // 관리자는 모든 권한 있음
    return userRoles.includes(requiredRole);
  };

  // 인증 상태 변경 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const roles = await fetchUserRoles(user.uid);
        setUserRoles(roles);
      } else {
        setUserRoles([]);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRoles,
    signup,
    login,
    logout,
    resetPassword,
    updateUserRoles,
    hasPermission,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
