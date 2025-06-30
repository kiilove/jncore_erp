"use client"

import { useState, useEffect } from "react"
import { FiDownload } from "react-icons/fi"
import { Bar } from "react-chartjs-2"
import purchaseService from "../services/purchaseService"
import supplierService from "../../suppliers/services/supplierService"
import * as XLSX from "xlsx" // Import XLSX

const PurchaseReportPage = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [period, setPeriod] = useState("month")
  const [chartData, setChartData] = useState(null)
  const [supplierChartData, setSupplierChartData] = useState(null)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    try {
      setLoading(true)

      // 매입 통계 가져오기
      const statsData = await purchaseService.fetchPurchaseStats(period)
      setStats(statsData)

      // 공급업체 목록 가져오기
      const suppliersList = await supplierService.fetchSuppliers()
      setSuppliers(suppliersList)

      // 차트 데이터 생성
      generateChartData(statsData)
    } catch (error) {
      console.error("Error fetching report data: ", error)
    } finally {
      setLoading(false)
    }
  }

  const generateChartData = (statsData) => {
    // 공급업체별 차트 데이터
    if (statsData && statsData.supplierStats) {
      const supplierLabels = Object.keys(statsData.supplierStats).slice(0, 10) // 상위 10개만
      const supplierValues = supplierLabels.map((supplier) => statsData.supplierStats[supplier])

      setSupplierChartData({
        labels: supplierLabels,
        datasets: [
          {
            label: "공급업체별 매입액",
            data: supplierValues,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgb(54, 162, 235)",
            borderWidth: 1,
          },
        ],
      })
    }

    // 결제 상태별 차트 데이터
    if (statsData && statsData.paymentStatusStats) {
      const statusLabels = Object.keys(statsData.paymentStatusStats)
      const statusValues = statusLabels.map((status) => statsData.paymentStatusStats[status])

      setChartData({
        labels: statusLabels,
        datasets: [
          {
            label: "결제 상태별 매입액",
            data: statusValues,
            backgroundColor: ["rgba(75, 192, 192, 0.5)", "rgba(255, 206, 86, 0.5)", "rgba(255, 99, 132, 0.5)"],
            borderColor: ["rgb(75, 192, 192)", "rgb(255, 206, 86)", "rgb(255, 99, 132)"],
            borderWidth: 1,
          },
        ],
      })
    }
  }

  const handleExportExcel = () => {
    if (!stats) return

    // 공급업체별 데이터
    const supplierData = Object.entries(stats.supplierStats || {}).map(([supplier, amount]) => ({
      공급업체: supplier,
      매입액: amount,
      비율: `${((amount / stats.totalAmount) * 100).toFixed(2)}%`,
    }))

    // 결제 상태별 데이터
    const statusData = Object.entries(stats.paymentStatusStats || {}).map(([status, amount]) => ({
      결제상태: status,
      금액: amount,
      비율: `${((amount / stats.totalAmount) * 100).toFixed(2)}%`,
    }))

    // 엑셀 파일로 내보내기
    const workbook = {
      Sheets: {
        "공급업체별 매입": XLSX.utils.json_to_sheet(supplierData),
        "결제상태별 매입": XLSX.utils.json_to_sheet(statusData),
      },
      SheetNames: ["공급업체별 매입", "결제상태별 매입"],
    }

    XLSX.writeFile(workbook, `매입보고서_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">매입 분석 및 보고서</h1>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
          <div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="week">최근 1주</option>
              <option value="month">최근 1개월</option>
              <option value="quarter">최근 3개월</option>
              <option value="year">최근 1년</option>
            </select>
          </div>
          <button
            onClick={handleExportExcel}
            disabled={loading || !stats}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
          >
            <FiDownload className="mr-2" />
            엑셀로 내보내기
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* 요약 통계 */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">총 매입액</h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(stats.totalAmount || 0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">총 {stats.purchaseCount || 0}건의 매입</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">미지급 매입액</h3>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(stats.paymentStatusStats?.미지급 || 0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  전체의{" "}
                  {stats.totalAmount
                    ? (((stats.paymentStatusStats?.미지급 || 0) / stats.totalAmount) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">주요 공급업체</h3>
                <div className="space-y-2">
                  {Object.entries(stats.supplierStats || {})
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([supplier, amount], index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{supplier}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {supplierChartData && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">공급업체별 매입액</h3>
                <div className="h-80">
                  <Bar
                    data={supplierChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => formatCurrency(value).replace("₩", "") + "원",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {chartData && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">결제 상태별 매입액</h3>
                <div className="h-80">
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => formatCurrency(value).replace("₩", "") + "원",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 상세 데이터 테이블 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">공급업체별 매입 현황</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        공급업체
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        매입액
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        비율
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {stats &&
                      Object.entries(stats.supplierStats || {})
                        .sort((a, b) => b[1] - a[1])
                        .map(([supplier, amount], index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {supplier}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {formatCurrency(amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {stats.totalAmount ? ((amount / stats.totalAmount) * 100).toFixed(2) : 0}%
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default PurchaseReportPage
