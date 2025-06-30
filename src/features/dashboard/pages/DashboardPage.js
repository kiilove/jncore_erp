"use client"

import { useState, useEffect } from "react"
import { FiShoppingCart, FiShoppingBag, FiUsers, FiTrendingUp, FiTrendingDown, FiRefreshCw } from "react-icons/fi"
import { getDashboardSummary, getRecentActivities, getMonthlyData } from "../services/dashboardService"
import { Chart, registerables } from "chart.js"
import { Bar, Line } from "react-chartjs-2"

// Chart.js 등록
Chart.register(...registerables)

const Dashboard = () => {
  const [summary, setSummary] = useState({
    sales: { total: 0, change: "0", isPositive: true },
    purchases: { total: 0, change: "0", isPositive: true },
    profit: { total: 0, change: "0", isPositive: true },
    customers: { count: 0, change: "0", isPositive: true },
  })
  const [activities, setActivities] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [summaryData, activitiesData, monthlyDataResult] = await Promise.all([
        getDashboardSummary(),
        getRecentActivities(),
        getMonthlyData(new Date().getFullYear()),
      ])

      setSummary(summaryData)
      setActivities(activitiesData)
      setMonthlyData(monthlyDataResult)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(value)
  }

  const formatDate = (date) => {
    const now = new Date()
    const diff = Math.floor((now - date) / 1000) // 초 단위 차이

    if (diff < 60) return "방금 전"
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`

    return new Intl.DateTimeFormat("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  // 월별 차트 데이터
  const monthlyChartData = {
    labels: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
    datasets: [
      {
        label: "매출",
        data: monthlyData.map((data) => data.sales),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
      {
        label: "매입",
        data: monthlyData.map((data) => data.purchases),
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
      },
      {
        label: "순이익",
        data: monthlyData.map((data) => data.profit),
        backgroundColor: "rgba(139, 92, 246, 0.5)",
        borderColor: "rgb(139, 92, 246)",
        borderWidth: 1,
      },
    ],
  }

  // 월별 차트 옵션
  const monthlyChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "월별 매출/매입/순이익",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value).replace("₩", "") + "원",
        },
      },
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">대시보드</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
        >
          <FiRefreshCw className={`mr-2 ${refreshing ? "animate-spin" : ""}`} />
          새로고침
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="이번 달 매출"
              value={formatCurrency(summary.sales.total)}
              change={`${summary.sales.change}%`}
              isPositive={summary.sales.isPositive}
              icon={<FiShoppingBag className="h-8 w-8" />}
              color="blue"
            />
            <StatCard
              title="이번 달 매입"
              value={formatCurrency(summary.purchases.total)}
              change={`${summary.purchases.change}%`}
              isPositive={summary.purchases.isPositive}
              icon={<FiShoppingCart className="h-8 w-8" />}
              color="green"
            />
            <StatCard
              title="순이익"
              value={formatCurrency(summary.profit.total)}
              change={`${summary.profit.change}%`}
              isPositive={summary.profit.isPositive}
              icon={<FiTrendingUp className="h-8 w-8" />}
              color="indigo"
            />
            <StatCard
              title="거래처 수"
              value={summary.customers.count}
              change={summary.customers.change}
              isPositive={summary.customers.isPositive}
              icon={<FiUsers className="h-8 w-8" />}
              color="purple"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
              <Bar data={monthlyChartData} options={monthlyChartOptions} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
              <Line
                data={{
                  labels: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
                  datasets: [
                    {
                      label: "순이익 추이",
                      data: monthlyData.map((data) => data.profit),
                      fill: false,
                      borderColor: "rgb(139, 92, 246)",
                      tension: 0.1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    title: {
                      display: true,
                      text: "월별 순이익 추이",
                    },
                  },
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

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">최근 활동</h2>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => {
                  let title = ""
                  let description = ""

                  if (activity.type === "sale") {
                    title = "새로운 매출 등록"
                    description = `${activity.customer} - ${formatCurrency(activity.total)}`
                  } else if (activity.type === "purchase") {
                    title = "새로운 매입 등록"
                    description = `${activity.supplier} - ${formatCurrency(activity.total)}`
                  } else if (activity.type === "stock") {
                    const action = activity.quantity > 0 ? "입고" : "출고"
                    title = `재고 ${action}`
                    description = `${activity.productName} - ${Math.abs(activity.quantity)}개`
                  }

                  return (
                    <ActivityItem
                      key={activity.id}
                      title={title}
                      description={description}
                      time={formatDate(activity.date)}
                    />
                  )
                })
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">최근 활동이 없습니다.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const StatCard = ({ title, value, change, isPositive, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200",
    green: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200",
    indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200",
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>{icon}</div>
      </div>
      <div className="mt-4 flex items-center">
        {isPositive ? (
          <FiTrendingUp className="text-green-500 mr-1" />
        ) : (
          <FiTrendingDown className="text-red-500 mr-1" />
        )}
        <span className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>{change}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">지난 달 대비</span>
      </div>
    </div>
  )
}

const ActivityItem = ({ title, description, time }) => {
  return (
    <div className="flex items-start border-b dark:border-gray-700 pb-4 last:border-0 last:pb-0">
      <div className="flex-1">
        <p className="font-medium text-gray-800 dark:text-white">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">{time}</span>
    </div>
  )
}

export default Dashboard
