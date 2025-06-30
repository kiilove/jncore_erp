import { useState } from "react";
import { toast } from "react-toastify";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../../firebase/config";

const ProductRegistrationModal = ({ onClose, onProductCreated }) => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    purchasePrice: 0,
    marginType: "percentage",
    marginRate: 0,
    price: 0,
    barcode: "",
    description: "",
  });

  // 권장 판매가 계산
  const calculateRecommendedPrice = (purchasePrice, marginRate, marginType) => {
    if (marginType === "percentage") {
      return Math.round(purchasePrice * (1 + marginRate / 100));
    } else {
      return purchasePrice + marginRate;
    }
  };

  // 새 제품 등록 처리
  const handleCreateNewProduct = async () => {
    try {
      // 필수 입력값 검증
      if (!newProduct.name) {
        toast.error("품목명을 입력해주세요.");
        return;
      }
      if (!newProduct.purchasePrice || newProduct.purchasePrice <= 0) {
        toast.error("유효한 매입가를 입력해주세요.");
        return;
      }
      if (!newProduct.marginRate || newProduct.marginRate <= 0) {
        toast.error("유효한 마진을 입력해주세요.");
        return;
      }
      if (!newProduct.price || newProduct.price <= 0) {
        toast.error("유효한 판매가를 입력해주세요.");
        return;
      }

      // 제품 정보
      const productData = {
        name: newProduct.name,
        category: newProduct.category || "",
        barcode: newProduct.barcode || "",
        description: newProduct.description || "",
        purchasePrice: Number(newProduct.purchasePrice),
        marginType: newProduct.marginType,
        marginRate: Number(newProduct.marginRate),
        price: Number(newProduct.price),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "active",
      };

      // 제품 문서 생성
      const docRef = await addDoc(collection(db, "products"), productData);

      // 성공 처리
      toast.success("새 품목이 등록되었습니다.");
      onProductCreated && onProductCreated(docRef.id);
      onClose();
    } catch (error) {
      console.error("새 품목 생성 실패:", error);
      toast.error("새 품목 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[400px]">
        <h2 className="text-lg font-semibold mb-4">새 품목 등록</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              품목명
            </label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm px-3"
              placeholder="품목명을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              카테고리
            </label>
            <input
              type="text"
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm px-3"
              placeholder="카테고리를 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              매입가
            </label>
            <input
              type="number"
              value={newProduct.purchasePrice}
              onChange={(e) => {
                const purchasePrice = Number(e.target.value) || 0;
                setNewProduct((prev) => ({
                  ...prev,
                  purchasePrice,
                  price: calculateRecommendedPrice(
                    purchasePrice,
                    prev.marginRate,
                    prev.marginType
                  ),
                }));
              }}
              className="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm px-3"
              placeholder="매입가를 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              마진 설정
            </label>
            <div className="flex space-x-2">
              <select
                value={newProduct.marginType}
                onChange={(e) => {
                  const marginType = e.target.value;
                  setNewProduct((prev) => ({
                    ...prev,
                    marginType,
                    price: calculateRecommendedPrice(
                      prev.purchasePrice,
                      prev.marginRate,
                      marginType
                    ),
                  }));
                }}
                className="h-9 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm px-3"
              >
                <option value="percentage">퍼센트</option>
                <option value="fixed">고정금액</option>
              </select>
              <input
                type="number"
                value={newProduct.marginRate}
                onChange={(e) => {
                  const marginRate = Number(e.target.value) || 0;
                  setNewProduct((prev) => ({
                    ...prev,
                    marginRate,
                    price: calculateRecommendedPrice(
                      prev.purchasePrice,
                      marginRate,
                      prev.marginType
                    ),
                  }));
                }}
                className="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm px-3"
                placeholder={
                  newProduct.marginType === "percentage"
                    ? "마진율(%)"
                    : "마진금액"
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              권장 판매가
            </label>
            <input
              type="number"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct((prev) => ({
                  ...prev,
                  price: Number(e.target.value) || 0,
                }))
              }
              className="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm px-3"
              placeholder="판매가를 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              바코드
            </label>
            <input
              type="text"
              value={newProduct.barcode}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, barcode: e.target.value }))
              }
              className="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm px-3"
              placeholder="바코드를 입력하세요 (선택)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              설명
            </label>
            <textarea
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full h-20 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm px-3 py-2"
              placeholder="설명을 입력하세요 (선택)"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleCreateNewProduct}
            className="px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-md"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductRegistrationModal;
