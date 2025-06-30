"use client";

import { Settings2 } from "lucide-react";
import { useState } from "react";

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
}

export default function TemplateSelector({
  selectedTemplate,
  onTemplateChange,
}: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const templates = [
    {
      id: "modern",
      name: "모던 템플릿",
      description: "그라데이션과 현대적인 디자인의 템플릿",
    },
    {
      id: "simple",
      name: "심플 템플릿",
      description: "깔끔한 디자인으로 토너 절약",
    },
    {
      id: "basic",
      name: "기본 템플릿",
      description: "기본적인 테이블 형태의 템플릿",
    },
    {
      id: "minimal",
      name: "미니멀 템플릿",
      description: "최소한의 디자인으로 최대 토너 절약",
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Settings2 className="w-4 h-4 mr-2" />
        템플릿 선택
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50 border border-gray-200">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">템플릿 선택</h3>
              <p className="text-xs text-gray-500 mt-1">
                인쇄 및 PDF 생성에 사용할 템플릿을 선택하세요
              </p>
            </div>
            <div className="p-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-2 rounded-md cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                  onClick={() => {
                    onTemplateChange(template.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full mr-2 ${
                        selectedTemplate === template.id
                          ? "bg-blue-500"
                          : "bg-gray-200"
                      }`}
                    >
                      {selectedTemplate === template.id && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {template.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {template.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
