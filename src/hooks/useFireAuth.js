// useFirebaseAuth.js
import { useState, useEffect } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";
import { useFirestoreQuery } from "./useFirestore";
import { where } from "firebase/firestore";

const useFirebaseAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const idCheckQuery = useFirestoreQuery();

  const signUpWithEmail = async (email, password, callback) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (callback) {
        callback(userCredential);
      }
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setAuthError("이미 사용중인 이메일입니다.");
      } else if (error.code === "auth/invalid-email") {
        setAuthError("잘못된 이메일 형식입니다.");
      } else if (error.code === "auth/weak-password") {
        setAuthError("비밀번호가 너무 약합니다.");
      } else {
        setAuthError("회원가입 중 오류가 발생했습니다.");
      }
      // 필요한 경우 여기서 오류를 다시 throw할 수 있습니다.
      throw error;
    }
  };

  const checkExistID = async (key, value) => {
    let isExist = false;
    try {
      await idCheckQuery.getDocuments(
        "members",
        (data) => {
          if (data.length === 0) {
            setAuthError("사용중인 아이디입니다.");
            isExist = true;
          }
        },
        [where(key, "==", value)]
      );
    } catch (error) {
      setAuthError(error.message);
    }
    return isExist;
  };
  const signUpWithID = async (id, password, userInfo, callback = null) => {};

  const logInWithEmail = async (email, password, callback) => {
    setAuthError(null); // 오류 메시지 초기화
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        if (callback) {
          callback(userCredential);
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.code === "auth/user-not-found") {
          setAuthError("이메일 주소를 찾을 수 없습니다.");
        } else if (error.code === "auth/invalid-email") {
          setAuthError("이메일 주소 형식이 잘못되었습니다.");
        } else if (error.code === "auth/wrong-password") {
          setAuthError("잘못된 비밀번호입니다.");
        } else if (error.code === "auth/invalid-credential") {
          setAuthError("이메일 혹은 비밀번호를 확인하세요.");
        } else if (error.code === "auth/too-many-requests") {
          setAuthError(
            "너무 많은 로그인 시도가 감지되었습니다. 잠시후 다시 시도하세요."
          );
        } else {
          setAuthError("로그인 중 오류가 발생했습니다.");
        }
      });
  };

  const logOut = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  return {
    currentUser,
    signUpWithEmail,
    logInWithEmail,
    logOut,
    authError,
    checkExistID,
    signUpWithID,
  };
};

export default useFirebaseAuth;
