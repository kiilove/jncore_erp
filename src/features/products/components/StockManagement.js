"use client"

import { useState } from "react"
import { updateStock } from "../services/productService"
import { useAuth } from "../../../contexts/AuthContext"
import { useToast } from "../../../contexts/ToastContext"
import Input from "../../../components/common/Input"
import Button from "../../../components/common/Button"
import { FiPlus, FiMinus } from "react-icons/fi"

const StockManagement = ({ product, onUpdate }) => {
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const { currentUser } = useAuth()
  const toast = useToast()

  const handleQuantityChange = (e) => {
    const value = Number.parseInt(e.target.value, 10)
    setQuantity(isNaN(value) ? 0 : value)
  }

  const handleReasonChange = (e) => {
    setReason(e.target.value)
  }

  const handleStockUpdate = async (isIncrease) => {
    if (quantity <= 0) {
      toast.error("수량은 1 이상이어야 합니다.")
      return
    }

    if (!reason.trim()) {
      toast.error("재고 변경 사유를 입력해주세요.")
      return
    }

    const changeAmount = isIncrease ? quantity : -quantity

    setLoading(true)

    try {
      await updateStock(product.id, changeAmount, currentUser.uid)

      // 재고 이력 기록 (실제로는 별도의 서비스 함수로 구현)
      // await addStockHistory({
      //   productId: product.id,
      //   quantity: changeAmount,
      //   reason,
      //   userId: currentUser.uid,
      // })

      toast.success(`재고가 ${isIncrease ? "입고" : "출고"}되었습니다.`)
      onUpdate()
    } catch (error) {
      console.error("Error updating stock:", error)
      toast.error(error.message || "재고 업데이트 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">재고 관리</h3>

      <div className="flex items-center space-x-2">
        <div className="font-medium">현재 재고:</div>
        <div className="text-lg">
          {product.stock || 0} {product.unit || "개"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="수량" type="number" min="1" value={quantity} onChange={handleQuantityChange} />

        <Input label="사유" value={reason} onChange={handleReasonChange} placeholder="재고 변경 사유를 입력하세요" />
      </div>

      <div className="flex space-x-4">
        <Button
          variant="primary"
          onClick={() => handleStockUpdate(true)}
          disabled={loading}
          className="flex-1 flex items-center justify-center"
        >
          <FiPlus className="mr-2" />
          입고
        </Button>

        <Button
          variant="secondary"
          onClick={() => handleStockUpdate(false)}
          disabled={loading || (product.stock || 0) < quantity}
          className="flex-1 flex items-center justify-center"
        >
          <FiMinus className="mr-2" />
          출고
        </Button>
      </div>

      {(product.stock || 0) < quantity && (
        <p className="text-sm text-red-600 dark:text-red-400">출고 수량이 현재 재고보다 많습니다.</p>
      )}
    </div>
  )
}

export default StockManagement
