"use client";

import { useState } from "react";
import CustomerExcelUpload from "../components/CustomerExcelUpload";
import { Button } from "../../../components/common/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/common/Card";
import { Save, AlertCircle } from "lucide-react";
import { db } from "../../../firebase/config";
import { collection, addDoc, writeBatch } from "firebase/firestore";

const CustomerImportPage = () => {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpload = (data) => {
    setCustomers(data);
  };

  const handleSave = async () => {
    if (customers.length === 0) {
      setError("저장할 거래처 정보가 없습니다.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const batch = writeBatch(db);
      const customersRef = collection(db, "customers");

      for (const customer of customers) {
        const docRef = await addDoc(customersRef, {
          ...customer,
          createdBy: "excel",
          createdAt: new Date(),
        });
      }

      await batch.commit();

      alert(`${customers.length}개의 거래처가 저장되었습니다.`);
      window.location.href = "/sales/customers";
    } catch (error) {
      console.error("거래처 저장 실패:", error);
      setError(error.message || "거래처 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.history.back()}
          className="flex items-center"
        >
          뒤로가기
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleSave}
          disabled={customers.length === 0 || isSaving}
          className="flex items-center"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "저장 중..." : "저장하기"}
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-6">거래처 정보 일괄 등록</h1>

      <div className="grid gap-6">
        <CustomerExcelUpload onUpload={handleUpload} />

        {customers.length > 0 && (
          <Card className="border-t-4 border-t-green-500 dark:border-t-green-400 shadow-md">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-9 flex items-center justify-between px-4 py-0">
              <CardTitle className="text-sm flex items-center text-green-700 dark:text-green-300">
                <Save className="mr-2 h-4 w-4" />
                등록할 거래처 정보 ({customers.length}건)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {error && (
                <div className="mb-4 flex items-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 text-xs border-y dark:border-gray-700">
                      <th className="text-left py-2 px-1">사업자번호</th>
                      <th className="text-left py-2 px-1">상호</th>
                      <th className="text-left py-2 px-1">대표자</th>
                      <th className="text-left py-2 px-1">주소</th>
                      <th className="text-left py-2 px-1">업태</th>
                      <th className="text-left py-2 px-1">종목</th>
                      <th className="text-left py-2 px-1">담당자</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer, index) => (
                      <tr
                        key={index}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="py-1 px-1 text-xs">
                          {customer.businessNumber}
                        </td>
                        <td className="py-1 px-1 text-xs">{customer.name}</td>
                        <td className="py-1 px-1 text-xs">
                          {customer.representative}
                        </td>
                        <td className="py-1 px-1 text-xs">
                          {customer.address}
                        </td>
                        <td className="py-1 px-1 text-xs">
                          {customer.businessType}
                        </td>
                        <td className="py-1 px-1 text-xs">
                          {customer.businessCategory}
                        </td>
                        <td className="py-1 px-1 text-xs">
                          {customer.contacts.map((contact, i) => (
                            <div key={i} className="mb-1">
                              {contact.name && <div>{contact.name}</div>}
                              {contact.phone && <div>{contact.phone}</div>}
                              {contact.email && <div>{contact.email}</div>}
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerImportPage;
