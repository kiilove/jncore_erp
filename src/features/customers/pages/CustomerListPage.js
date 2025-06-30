import { useState } from "react";
import { Button } from "../../../components/common/Button";
import { RefreshCw } from "lucide-react";
import { updateCustomerSearchIndex } from "../services/customerService";

const CustomerListPage = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateSearchIndex = async () => {
    try {
      setIsUpdating(true);
      const result = await updateCustomerSearchIndex();
      alert(`검색 인덱스 업데이트가 완료되었습니다. (${result.count}개 처리)`);
    } catch (error) {
      console.error("Error updating search index:", error);
      alert("검색 인덱스 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          거래처 관리
        </h1>
        <div className="flex gap-2">
          <Button
            onClick={handleUpdateSearchIndex}
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isUpdating ? "animate-spin" : ""}`}
            />
            {isUpdating ? "업데이트 중..." : "검색 인덱스 업데이트"}
          </Button>
          {/* 기존의 추가 버튼 등 */}
        </div>
      </div>
      {/* 기존의 테이블 등 */}
    </div>
  );
};

export default CustomerListPage;
