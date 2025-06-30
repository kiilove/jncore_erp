"use client";

import { useState, useRef } from "react";
import { FiSave, FiUpload, FiX } from "react-icons/fi";
import { updateSettings } from "../services/settingsService";
import { useToast } from "../../../contexts/ToastContext";
import { useSettings } from "../../../contexts/SettingsContext";
import { Card } from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("company");
  const [saving, setSaving] = useState(false);
  const { settings, setSettings } = useSettings();
  const stampInputRef = useRef(null);
  const { showError, showSuccess } = useToast();

  const handleInputChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleStampUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      showError("이미지 파일만 업로드 가능합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSettings((prev) => ({
        ...prev,
        stamp: {
          ...prev.stamp,
          url: e.target.result,
          file: file,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeStamp = () => {
    setSettings((prev) => ({
      ...prev,
      stamp: {
        ...prev.stamp,
        url: null,
        file: null,
      },
    }));
    if (stampInputRef.current) {
      stampInputRef.current.value = "";
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await updateSettings(settings);
      showSuccess("설정이 저장되었습니다.");
    } catch (error) {
      console.error("설정 저장 중 오류가 발생했습니다:", error);
      showError("설정 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          시스템 설정
        </h1>
        <Button
          onClick={saveSettings}
          disabled={saving}
          icon={FiSave}
          variant="primary"
        >
          {saving ? "저장 중..." : "설정 저장"}
        </Button>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <Button
              onClick={() => setActiveTab("company")}
              variant={activeTab === "company" ? "primary" : "ghost"}
              className={`rounded-none border-b-2 ${
                activeTab === "company"
                  ? "border-blue-500"
                  : "border-transparent"
              }`}
            >
              회사 정보
            </Button>
            <Button
              onClick={() => setActiveTab("tax")}
              variant={activeTab === "tax" ? "primary" : "ghost"}
              className={`rounded-none border-b-2 ${
                activeTab === "tax" ? "border-blue-500" : "border-transparent"
              }`}
            >
              부가세율 설정
            </Button>
            <Button
              onClick={() => setActiveTab("stamp")}
              variant={activeTab === "stamp" ? "primary" : "ghost"}
              className={`rounded-none border-b-2 ${
                activeTab === "stamp" ? "border-blue-500" : "border-transparent"
              }`}
            >
              회사 인감
            </Button>
          </nav>
        </div>
      </div>

      {activeTab === "company" && (
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div>
              <Input
                label="회사명"
                id="companyName"
                value={settings.company.name}
                onChange={(e) =>
                  handleInputChange("company", "name", e.target.value)
                }
                placeholder="회사명을 입력하세요"
                required
              />
            </div>
            <div>
              <Input
                label="사업자등록번호"
                id="businessNumber"
                value={settings.company.businessNumber}
                onChange={(e) =>
                  handleInputChange("company", "businessNumber", e.target.value)
                }
                placeholder="사업자등록번호를 입력하세요"
              />
            </div>
            <div>
              <Input
                label="대표자명"
                id="representative"
                value={settings.company.representative}
                onChange={(e) =>
                  handleInputChange("company", "representative", e.target.value)
                }
                placeholder="대표자명을 입력하세요"
              />
            </div>
            <div>
              <Input
                label="전화번호"
                id="phone"
                value={settings.company.phone}
                onChange={(e) =>
                  handleInputChange("company", "phone", e.target.value)
                }
                placeholder="전화번호를 입력하세요"
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="주소"
                id="address"
                value={settings.company.address}
                onChange={(e) =>
                  handleInputChange("company", "address", e.target.value)
                }
                placeholder="주소를 입력하세요"
              />
            </div>
            <div>
              <Input
                label="이메일"
                id="email"
                type="email"
                value={settings.company.email}
                onChange={(e) =>
                  handleInputChange("company", "email", e.target.value)
                }
                placeholder="이메일을 입력하세요"
              />
            </div>
          </div>
        </Card>
      )}

      {activeTab === "tax" && (
        <Card className="mb-6">
          <div className="max-w-md p-6">
            <Input
              label="부가세율 (%)"
              id="taxRate"
              type="number"
              min="0"
              max="100"
              value={settings.tax.rate}
              onChange={(e) =>
                handleInputChange(
                  "tax",
                  "rate",
                  Number.parseFloat(e.target.value) || 0
                )
              }
              placeholder="부가세율을 입력하세요"
              required
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              설정된 부가세율은 매출/매입 계산 시 자동으로 적용됩니다.
            </p>
          </div>
        </Card>
      )}

      {activeTab === "stamp" && (
        <Card className="mb-6">
          <div className="max-w-md p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              회사 인감 이미지
            </label>
            <div className="mt-1 flex items-center">
              <div
                className={`flex justify-center items-center w-32 h-32 border-2 border-dashed rounded-lg ${
                  settings.stamp.url
                    ? "border-gray-300"
                    : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
                }`}
              >
                {settings.stamp.url ? (
                  <div className="relative w-full h-full">
                    <img
                      src={settings.stamp.url || "/placeholder.svg"}
                      alt="회사 인감"
                      className="w-full h-full object-contain"
                    />
                    <Button
                      type="button"
                      onClick={removeStamp}
                      variant="destructive"
                      size="sm"
                      icon={FiX}
                      className="absolute -top-2 -right-2 rounded-full p-1 h-6 w-6"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <FiUpload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      인감 이미지 업로드
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={stampInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleStampUpload}
                id="stamp-upload"
              />
              {!settings.stamp.url && (
                <Button
                  type="button"
                  variant="outline"
                  className="ml-4"
                  onClick={() => stampInputRef.current?.click()}
                >
                  이미지 선택
                </Button>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              회사 인감 이미지는 매출명세서 및 공식 문서에 표시됩니다.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;
