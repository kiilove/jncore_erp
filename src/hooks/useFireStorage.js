import { useState, useEffect } from "react";

import {
  getStorage,
  getDownloadURL,
  ref,
  uploadBytesResumable,
  deleteObject,
} from "firebase/storage";

import { storage } from "../firebase";

import canvasToBlob from "canvas-to-blob";

// 이미지 리사이즈 함수 (용량을 줄이며 maxSizeInBytes 이하로)
const resizeImage = async (file, maxSizeInBytes) => {
  if (file.size <= maxSizeInBytes) {
    // 이미지 파일이 maxSizeInBytes 이하인 경우, 리사이즈 필요 없음
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const width = img.width;
      const height = img.height;
      let newWidth = width;
      let newHeight = height;

      // 이미지 크기를 조정하여 maxSizeInBytes 이하로 만듭니다.
      while (newWidth * newHeight * 0.8 > maxSizeInBytes) {
        // 이미지 크기를 80%로 줄입니다. (압축 품질 조절 가능)
        newWidth *= 0.8;
        newHeight *= 0.8;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.9
      ); // 이미지 압축 품질 설정 (0.9는 90% 품질)
    };

    img.onerror = (error) => {
      reject(error);
    };
  });
};

const useImageUpload = () => {
  const [uploadResult, setUploadResult] = useState({
    success: false,
    downloadUrl: null,
    filename: null,
    error: null,
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (path, file, filename) => {
    return new Promise(async (resolve, reject) => {
      const newFile = file;
      const fileType = file.type;

      if (!filename) {
        setUploadResult({ success: false, error: "filename is Undefined" });
        return;
      }
      const storageRef = ref(storage, `${path}/${filename}`);
      const uploadTask = uploadBytesResumable(storageRef, newFile);

      uploadTask.on("state_changed", (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setUploadProgress(progress);
      });

      try {
        await uploadTask;
        // 업로드 성공한 경우 다운로드 URL 가져오기
        const url = await getDownloadURL(storageRef);

        setUploadResult({
          success: true,
          downloadUrl: url,
          filename,
          fileType: fileType,
          status: "uploaded",
        });
        resolve({
          success: true,
          downloadUrl: url,
          filename,
          fileType: fileType,
          status: "uploaded",
        });
      } catch (error) {
        setUploadResult({ success: false, status: "error" });
        reject({ success: false, status: "error" });
      }
    });
  };

  const uploadImage = async (
    path,
    file,
    filename,
    isResize = true,
    maxSizeInBytes = 500 * 1024
  ) => {
    return new Promise(async (resolve, reject) => {
      let resizedFile = file;

      if (resizedFile?.size > maxSizeInBytes) {
        // 이미지 크기가 maxSizeInBytes를 초과하면 리사이즈
        resizedFile = await resizeImage(resizedFile, maxSizeInBytes);
      }

      if (!filename) {
        setUploadResult({ success: false, error: "filename is Undefined" });
        return;
      }
      const storageRef = ref(storage, `${path}/${filename}`);
      const uploadTask = uploadBytesResumable(storageRef, resizedFile);

      uploadTask.on("state_changed", (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setUploadProgress(progress);
      });

      try {
        await uploadTask;
        // 업로드 성공한 경우 다운로드 URL 가져오기
        const url = await getDownloadURL(storageRef);

        setUploadResult({ success: true, downloadUrl: url, filename });
        resolve({ success: true, downloadUrl: url, filename });
      } catch (error) {
        setUploadResult({ success: false, error });
        reject({ success: false, error });
      }
    });
  };

  const deleteFileFromStorage = async (filePath) => {
    const storageRef = ref(storage, filePath);
    try {
      await deleteObject(storageRef);
      console.log("Firebase Storage에서 파일 삭제 성공:", filePath);
    } catch (error) {
      console.error("Firebase Storage에서 파일 삭제 실패:", error);
    }
  };

  return {
    uploadImage,
    uploadFile,
    deleteFileFromStorage,
    uploadProgress,
    uploadResult,
  };
};

export default useImageUpload;
