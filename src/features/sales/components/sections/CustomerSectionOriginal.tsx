"use client";

import { useState } from "react";

// 타입 정의
export interface Contact {
  name: string;
  phone: string;
  email: string;
}

// 기본 거래처 정보 타입
export interface CustomerBasic {
  name: string;
  businessNumber: string;
  representative: string;
  address: string;
  businessType: string;
  businessCategory: string;
}

export interface Customer extends CustomerBasic {
  createdAt: Date;
  createdBy: string;
  contacts: Contact[];
  searchIndex?: {
    clean: string;
    korean: string;
  };
  searchTerms?: string[];
}

// 실제 데이터 구조에 맞춘 목업 데이터
const MOCK_CUSTOMERS = [
  {
    name: "(주)이루온",
    businessNumber: "214-86-23042",
    representative: "이승구",
    address: "경기 성남시 분당구 삼평동대왕판교로 660 A-905",
    businessType: "서비스외",
    businessCategory: "스프트웨어개발외",
    createdAt: new Date("2025-04-29T16:02:17+09:00"),
    createdBy: "excel",
    contacts: [
      {
        name: "정종화 팀장님",
        phone: "07044891077",
        email: "jjh0920@eluon.com",
      },
      {
        name: "백인수 차장님",
        phone: "07044891037",
        email: "isback@eluon.com",
      },
      {
        name: "김용환 실장님",
        phone: "",
        email: "kyh@eluon.com",
      },
    ],
    searchIndex: {
      clean: "주이루온",
      korean: "주이루온",
    },
    searchTerms: [
      "(주)이루온",
      "주이루온",
      "주이",
      "주이루",
      "이루",
      "이루온",
      "루온",
    ],
  },
  {
    name: "(주)테크솔루션",
    businessNumber: "123-45-67890",
    representative: "김기술",
    address: "서울특별시 강남구 테헤란로 123",
    businessType: "서비스업",
    businessCategory: "소프트웨어 개발",
    createdAt: new Date("2025-03-15T10:30:00+09:00"),
    createdBy: "system",
    contacts: [
      {
        name: "김담당 과장",
        phone: "01012345678",
        email: "kim@techsolution.com",
      },
      {
        name: "이담당 대리",
        phone: "01023456789",
        email: "lee@techsolution.com",
      },
    ],
    searchIndex: {
      clean: "주테크솔루션",
      korean: "주테크솔루션",
    },
    searchTerms: [
      "(주)테크솔루션",
      "주테크솔루션",
      "테크",
      "솔루션",
      "테크솔루션",
    ],
  },
];

interface CustomerSectionProps {
  data: {
    customer: CustomerBasic | null;
    contact: Contact | null;
  };
  onUpdate: (data: {
    customer: CustomerBasic | null;
    contact: Contact | null;
  }) => void;
}

export default function CustomerSection({
  data,
  onUpdate,
}: CustomerSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    data.customer as Customer
  );
  const [selectedContact, setSelectedContact] = useState<Contact | null>(
    data.contact
  );

  // 검색어에 따라 거래처 필터링
  const filteredCustomers = MOCK_CUSTOMERS.filter((customer) => {
    // searchTerms 배열이 있으면 그 안에서 검색, 없으면 이름으로 검색
    if (customer.searchTerms && customer.searchTerms.length > 0) {
      return customer.searchTerms.some((term) =>
        term.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return customer.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 거래처 선택 처리
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSelectedContact(null); // 거래처 변경 시 담당자 초기화

    // 부모 컴포넌트에 데이터 전달
    onUpdate({
      customer: {
        name: customer.name,
        businessNumber: customer.businessNumber,
        representative: customer.representative,
        address: customer.address,
        businessType: customer.businessType,
        businessCategory: customer.businessCategory,
      },
      contact: null,
    });
  };

  // 담당자 선택 처리
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);

    // 부모 컴포넌트에 데이터 전달
    onUpdate({
      customer: selectedCustomer
        ? {
            name: selectedCustomer.name,
            businessNumber: selectedCustomer.businessNumber,
            representative: selectedCustomer.representative,
            address: selectedCustomer.address,
            businessType: selectedCustomer.businessType,
            businessCategory: selectedCustomer.businessCategory,
          }
        : null,
      contact: {
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
      },
    });
  };

  // 날짜 포맷 함수
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden border border-border">
      <div className="bg-gradient-to-r from-blue-50 to-card dark:from-blue-950/20 dark:to-card border-b border-border py-4 px-6">
        <h2 className="text-lg font-medium text-foreground flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-blue-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
              clipRule="evenodd"
            />
          </svg>
          거래처 정보
        </h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-muted-foreground"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="거래처명 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50 text-sm"
                />
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
                검색
              </button>
            </div>

            <div className="mt-4 border border-border rounded-md overflow-hidden">
              <div className="bg-muted px-4 py-2 border-b border-border">
                <h3 className="text-sm font-medium text-foreground">
                  최근 거래처
                </h3>
              </div>
              <div className="max-h-60 overflow-y-auto bg-card">
                {filteredCustomers.map((customer, index) => (
                  <div
                    key={index}
                    className={`p-2 hover:bg-accent/10 cursor-pointer border-t border-border ${
                      selectedCustomer?.businessNumber ===
                      customer.businessNumber
                        ? "bg-primary/10"
                        : ""
                    }`}
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <p className="font-medium text-foreground">
                      {customer.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {customer.businessNumber}
                    </p>
                  </div>
                ))}

                {filteredCustomers.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    검색 결과가 없습니다
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedCustomer ? (
              <div className="bg-card rounded-md border border-border h-full">
                <div className="bg-muted px-4 py-2 border-b border-border flex justify-between items-center">
                  <h3 className="text-sm font-medium text-foreground">
                    사업자 정보
                  </h3>
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setSelectedContact(null);
                      onUpdate({ customer: null, contact: null });
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-3">
                  <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs">
                    <div className="flex items-center">
                      <span className="text-muted-foreground w-16">상호:</span>
                      <span className="font-medium text-foreground">
                        {selectedCustomer.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground w-16">
                        사업자번호:
                      </span>
                      <span className="font-medium text-foreground">
                        {selectedCustomer.businessNumber}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground w-16">
                        대표자:
                      </span>
                      <span className="font-medium text-foreground">
                        {selectedCustomer.representative}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground w-16">업태:</span>
                      <span className="font-medium text-foreground">
                        {selectedCustomer.businessType}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground w-16">종목:</span>
                      <span className="font-medium text-foreground">
                        {selectedCustomer.businessCategory}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground w-16">
                        등록일:
                      </span>
                      <span className="font-medium text-foreground">
                        {formatDate(selectedCustomer.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center col-span-3">
                      <span className="text-muted-foreground w-16">주소:</span>
                      <span className="font-medium text-foreground">
                        {selectedCustomer.address}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      담당자 선택
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedCustomer.contacts
                        .filter((contact) => contact.name) // 이름이 있는 담당자만 표시
                        .map((contact, index) => (
                          <div
                            key={index}
                            className={`p-3 border rounded-md cursor-pointer transition-colors ${
                              selectedContact?.name === contact.name
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-border hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                            }`}
                            onClick={() => handleSelectContact(contact)}
                          >
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400 mr-3">
                                {contact.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {contact.name}
                                </p>
                                <div className="flex flex-col text-xs">
                                  {contact.phone && (
                                    <span className="text-muted-foreground">
                                      {contact.phone.replace(
                                        /(\d{3})(\d{4})(\d{4})/,
                                        "$1-$2-$3"
                                      )}
                                    </span>
                                  )}
                                  {contact.email && (
                                    <span className="text-muted-foreground">
                                      {contact.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center bg-muted/50 rounded-md p-8 border border-dashed border-border h-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-muted-foreground mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <p className="text-foreground font-medium text-center">
                  거래처를 선택해주세요
                </p>
                <p className="text-muted-foreground text-sm text-center mt-2">
                  왼쪽에서 거래처를 검색하고 선택할 수 있습니다
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
