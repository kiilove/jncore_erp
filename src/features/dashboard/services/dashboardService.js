import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../../firebase/config";

// 특정 기간의 매출 데이터 가져오기
export const getSalesData = async (startDate, endDate) => {
  try {
    const salesQuery = query(
      collection(db, "sales"),
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "asc")
    );
    const querySnapshot = await getDocs(salesQuery);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
    }));
  } catch (error) {
    console.error("Error fetching sales data:", error);
    throw error;
  }
};

// 특정 기간의 매입 데이터 가져오기
export const getPurchasesData = async (startDate, endDate) => {
  try {
    const purchasesQuery = query(
      collection(db, "purchases"),
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "asc")
    );
    const querySnapshot = await getDocs(purchasesQuery);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
    }));
  } catch (error) {
    console.error("Error fetching purchases data:", error);
    throw error;
  }
};

// 최근 활동 데이터 가져오기
export const getRecentActivities = async (limit = 10) => {
  try {
    // 최근 매출 데이터
    const recentSalesQuery = query(
      collection(db, "sales"),
      orderBy("createdAt", "desc"),
      limit(limit)
    );
    const salesSnapshot = await getDocs(recentSalesQuery);
    const salesActivities = salesSnapshot.docs.map((doc) => ({
      id: doc.id,
      type: "sale",
      customer: doc.data().customer,
      total: doc.data().total,
      date: doc.data().createdAt?.toDate() || new Date(),
    }));

    // 최근 매입 데이터
    const recentPurchasesQuery = query(
      collection(db, "purchases"),
      orderBy("createdAt", "desc"),
      limit(limit)
    );
    const purchasesSnapshot = await getDocs(recentPurchasesQuery);
    const purchasesActivities = purchasesSnapshot.docs.map((doc) => ({
      id: doc.id,
      type: "purchase",
      supplier: doc.data().supplier,
      total: doc.data().total,
      date: doc.data().createdAt?.toDate() || new Date(),
    }));

    // 최근 재고 변경 데이터
    const recentStockQuery = query(
      collection(db, "stockHistory"),
      orderBy("timestamp", "desc"),
      limit(limit)
    );
    const stockSnapshot = await getDocs(recentStockQuery);
    const stockActivities = stockSnapshot.docs.map((doc) => ({
      id: doc.id,
      type: "stock",
      productName: doc.data().productName,
      quantity: doc.data().quantity,
      date: doc.data().timestamp?.toDate() || new Date(),
    }));

    // 모든 활동 데이터 합치기 및 날짜순 정렬
    const allActivities = [
      ...salesActivities,
      ...purchasesActivities,
      ...stockActivities,
    ];
    allActivities.sort((a, b) => b.date - a.date);

    return allActivities.slice(0, limit);
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    throw error;
  }
};

// 대시보드 요약 데이터 가져오기
export const getDashboardSummary = async () => {
  try {
    // 오늘 날짜 설정
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 이번 달의 시작일과 종료일 설정
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    // 지난 달의 시작일과 종료일 설정
    const startOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const endOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0,
      23,
      59,
      59
    );

    // 이번 달 매출 데이터
    const currentMonthSales = await getSalesData(startOfMonth, endOfMonth);
    const currentMonthSalesTotal = currentMonthSales.reduce(
      (sum, sale) => sum + (sale.total || 0),
      0
    );

    // 지난 달 매출 데이터
    const lastMonthSales = await getSalesData(startOfLastMonth, endOfLastMonth);
    const lastMonthSalesTotal = lastMonthSales.reduce(
      (sum, sale) => sum + (sale.total || 0),
      0
    );

    // 이번 달 매입 데이터
    const currentMonthPurchases = await getPurchasesData(
      startOfMonth,
      endOfMonth
    );
    const currentMonthPurchasesTotal = currentMonthPurchases.reduce(
      (sum, purchase) => sum + (purchase.total || 0),
      0
    );

    // 지난 달 매입 데이터
    const lastMonthPurchases = await getPurchasesData(
      startOfLastMonth,
      endOfLastMonth
    );
    const lastMonthPurchasesTotal = lastMonthPurchases.reduce(
      (sum, purchase) => sum + (purchase.total || 0),
      0
    );

    // 순이익 계산
    const currentMonthProfit =
      currentMonthSalesTotal - currentMonthPurchasesTotal;
    const lastMonthProfit = lastMonthSalesTotal - lastMonthPurchasesTotal;

    // 거래처 수 계산
    const customersQuery = query(collection(db, "customers"));
    const customersSnapshot = await getDocs(customersQuery);
    const customersCount = customersSnapshot.size;

    // 변화율 계산
    const salesChangeRate =
      lastMonthSalesTotal === 0
        ? 100
        : ((currentMonthSalesTotal - lastMonthSalesTotal) /
            lastMonthSalesTotal) *
          100;
    const purchasesChangeRate =
      lastMonthPurchasesTotal === 0
        ? 100
        : ((currentMonthPurchasesTotal - lastMonthPurchasesTotal) /
            lastMonthPurchasesTotal) *
          100;
    const profitChangeRate =
      lastMonthProfit === 0
        ? 100
        : ((currentMonthProfit - lastMonthProfit) / lastMonthProfit) * 100;

    return {
      sales: {
        total: currentMonthSalesTotal,
        change: salesChangeRate.toFixed(1),
        isPositive: salesChangeRate >= 0,
      },
      purchases: {
        total: currentMonthPurchasesTotal,
        change: purchasesChangeRate.toFixed(1),
        isPositive: purchasesChangeRate >= 0,
      },
      profit: {
        total: currentMonthProfit,
        change: profitChangeRate.toFixed(1),
        isPositive: profitChangeRate >= 0,
      },
      customers: {
        count: customersCount,
        change: "+0", // 실제로는 이전 달과 비교하여 계산
        isPositive: true,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw error;
  }
};

// 월별 매출/매입 데이터 가져오기
export const getMonthlyData = async (year) => {
  try {
    const startDate = new Date(year, 0, 1); // 해당 연도의 1월 1일
    const endDate = new Date(year, 11, 31, 23, 59, 59); // 해당 연도의 12월 31일

    // 해당 연도의 모든 매출 데이터
    const salesData = await getSalesData(startDate, endDate);

    // 해당 연도의 모든 매입 데이터
    const purchasesData = await getPurchasesData(startDate, endDate);

    // 월별 데이터 초기화
    const monthlyData = Array(12)
      .fill()
      .map(() => ({
        sales: 0,
        purchases: 0,
        profit: 0,
      }));

    // 매출 데이터 월별로 집계
    salesData.forEach((sale) => {
      const month = sale.date.getMonth();
      monthlyData[month].sales += sale.total || 0;
    });

    // 매입 데이터 월별로 집계
    purchasesData.forEach((purchase) => {
      const month = purchase.date.getMonth();
      monthlyData[month].purchases += purchase.total || 0;
    });

    // 순이익 계산
    monthlyData.forEach((data) => {
      data.profit = data.sales - data.purchases;
    });

    return monthlyData;
  } catch (error) {
    console.error("Error fetching monthly data:", error);
    throw error;
  }
};

// 카테고리별 매출 데이터 가져오기
export const getCategorySalesData = async (startDate, endDate) => {
  try {
    // 해당 기간의 모든 매출 데이터
    const salesData = await getSalesData(startDate, endDate);

    // 제품 데이터 가져오기
    const productsQuery = query(collection(db, "products"));
    const productsSnapshot = await getDocs(productsQuery);
    const products = {};

    productsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      products[doc.id] = {
        name: data.name,
        category: data.category,
      };
    });

    // 카테고리별 매출 집계
    const categoryData = {};

    salesData.forEach((sale) => {
      sale.items.forEach((item) => {
        // 제품 ID로 카테고리 찾기 (실제로는 매출 항목에 제품 ID가 포함되어 있어야 함)
        const category = "컴퓨터"; // 임시 데이터, 실제로는 products[item.productId]?.category || "기타"

        if (!categoryData[category]) {
          categoryData[category] = 0;
        }

        categoryData[category] += item.quantity * item.price;
      });
    });

    // 배열 형태로 변환
    return Object.entries(categoryData).map(([category, total]) => ({
      category,
      total,
    }));
  } catch (error) {
    console.error("Error fetching category sales data:", error);
    throw error;
  }
};
