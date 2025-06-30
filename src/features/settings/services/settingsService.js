import { db, storage } from "../../../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// 설정 정보 가져오기
export const getSettings = async () => {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "global"));

    if (settingsDoc.exists()) {
      return settingsDoc.data();
    } else {
      // 기본 설정 값 반환
      return {
        company: {
          name: "",
          address: "",
          phone: "",
          email: "",
          businessNumber: "",
          representative: "",
        },
        tax: {
          rate: 10,
        },
        stamp: {
          url: null,
        },
      };
    }
  } catch (error) {
    console.error("설정 정보를 가져오는 중 오류가 발생했습니다:", error);
    throw error;
  }
};

// 설정 정보 업데이트
export const updateSettings = async (settings) => {
  try {
    // 인감 이미지가 있고 파일이 있으면 Storage에 업로드
    if (settings.stamp && settings.stamp.file) {
      const stampRef = ref(storage, `settings/stamp_${Date.now()}`);
      await uploadBytes(stampRef, settings.stamp.file);
      const stampUrl = await getDownloadURL(stampRef);

      // 기존 인감 이미지 URL이 있으면 삭제
      if (settings.stamp.oldUrl) {
        try {
          const oldStampRef = ref(storage, settings.stamp.oldUrl);
          await deleteObject(oldStampRef);
        } catch (error) {
          console.warn("기존 인감 이미지 삭제 중 오류가 발생했습니다:", error);
        }
      }

      // 설정 객체 업데이트
      settings = {
        ...settings,
        stamp: {
          url: stampUrl,
        },
      };
    }

    // 파일 객체 제거 (Firestore에 저장할 수 없음)
    if (settings.stamp && settings.stamp.file) {
      delete settings.stamp.file;
    }
    if (settings.stamp && settings.stamp.oldUrl) {
      delete settings.stamp.oldUrl;
    }

    // Firestore에 설정 저장
    await setDoc(doc(db, "settings", "global"), settings);

    return settings;
  } catch (error) {
    console.error("설정 정보를 업데이트하는 중 오류가 발생했습니다:", error);
    throw error;
  }
};
