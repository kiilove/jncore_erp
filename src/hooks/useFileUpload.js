import { useState } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { message } from "antd";

const useFileUpload = () => {
  const storage = getStorage(); // Firebase Storage 인스턴스

  const [progress, setProgress] = useState(0); // 업로드 진행 상태

  const uploadFile = (path, file, fileName) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `${path}/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress); // 진행률 업데이트
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.log(error);
          message.error("파일 업로드 중 오류가 발생했습니다.");
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              message.success("파일이 성공적으로 업로드되었습니다.");
              resolve({ downloadUrl: downloadURL, fileName });
            })
            .catch((error) => {
              message.error("파일 URL을 가져오는 중 오류가 발생했습니다.");
              reject(error);
            });
        }
      );
    });
  };

  const deleteFileFromStorage = (fileUrl) => {
    return new Promise((resolve, reject) => {
      const fileRef = ref(storage, fileUrl);
      deleteObject(fileRef)
        .then(() => {
          message.success("파일이 성공적으로 삭제되었습니다.");
          resolve();
        })
        .catch((error) => {
          message.error("파일 삭제 중 오류가 발생했습니다.");
          reject(error);
        });
    });
  };

  return {
    uploadFile,
    deleteFileFromStorage,
    progress,
  };
};

export default useFileUpload;
