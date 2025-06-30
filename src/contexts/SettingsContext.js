"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getSettings } from "../features/settings/services/settingsService";

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
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
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        if (data) {
          console.log("=== 전역 설정 정보 ===");
          console.log("회사 정보:", data.company);
          console.log("부가세율:", data.tax.rate);
          console.log("인감 이미지 URL:", data.stamp.url);
          console.log("====================");
          setSettings(data);
        }
      } catch (error) {
        console.error("설정을 불러오는 중 오류가 발생했습니다:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const value = {
    settings,
    setSettings,
    loading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {!loading && children}
    </SettingsContext.Provider>
  );
}
