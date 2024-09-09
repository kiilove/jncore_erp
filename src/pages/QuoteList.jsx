import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Tooltip,
  message,
  Spin,
  Button,
  DatePicker,
  Space,
} from "antd";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { db } from "../firebase"; // Firestore 설정
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const pageSize = 10;

const QuoteList = () => {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(7, "day"),
    dayjs(),
  ]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const fetchQuotes = async () => {
    setLoading(true);
    const quotesRef = collection(db, "quotes");

    try {
      const q = query(
        quotesRef,
        where("quoteDate", ">=", dayjs(dateRange[0]).format("YYYY-MM-DD")),
        where(
          "quoteDate",
          "<=",
          dayjs(dateRange[1] || new Date()).format("YYYY-MM-DD")
        )
      );

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setAllData(documents);
      setFilteredData(documents);
      setTotalItems(documents.length);
    } catch (error) {
      message.error("견적 데이터를 불러오는 중 오류가 발생했습니다.");
      console.error("Error fetching quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [dateRange]);

  useEffect(() => {
    const filtered = allData.filter((item) =>
      item.검색어_간단.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
    setTotalItems(filtered.length);
  }, [searchTerm, allData]);

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  const handlePresetDate = (days) => {
    const endDate = dayjs();
    const startDate = endDate.subtract(days, "day");
    setDateRange([startDate, endDate]);
  };

  const handleRowClick = (record) => {
    navigate("/6002bd8f-b3c1-48c7-a70b-e6052b446515", {
      state: { quote: record },
    }); // Navigate with state
  };

  const columns = [
    {
      title: "문서번호",
      dataIndex: "quoteNumber",
      key: "quoteNumber",
    },
    {
      title: "작성일자",
      dataIndex: "quoteDate",
      key: "quoteDate",
    },
    {
      title: "거래처명",
      dataIndex: "businessName",
      key: "businessName",
    },
    {
      title: "담당자",
      dataIndex: "personName",
      key: "personName",
    },
    {
      title: "모델명",
      key: "quoteItems",
      render: (text, record) => {
        const { quoteItems } = record;
        const firstModel = quoteItems[0]?.model?.value || "모델 정보 없음";
        return (
          <Tooltip
            title={
              <div>
                {quoteItems.map((item, index) => (
                  <div key={index}>
                    <strong>{item.model.value}</strong> (수량: {item.amount},
                    가격: {item.price.value})
                  </div>
                ))}
              </div>
            }
          >
            {quoteItems.length === 1 ? (
              <span>{firstModel}</span>
            ) : (
              <span>
                {firstModel} 외 {quoteItems.length - 1}개
              </span>
            )}
          </Tooltip>
        );
      },
    },
    {
      title: "총 금액",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (value) => `${value.toLocaleString()} 원`,
    },
  ];

  const currentData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <h2>견적서 리스트</h2>
      <Space style={{ marginBottom: 20 }}>
        <RangePicker value={dateRange} onChange={handleDateChange} />
        <Button onClick={() => handlePresetDate(7)}>7일</Button>
        <Button onClick={() => handlePresetDate(30)}>1개월</Button>
        <Button onClick={() => handlePresetDate(90)}>3개월</Button>
        <Button onClick={() => handlePresetDate(180)}>6개월</Button>
        <Button onClick={() => handlePresetDate(365)}>12개월</Button>
      </Space>
      <Input.Search
        placeholder="거래처, 담당자, 날짜, 모델 검색"
        enterButton
        onSearch={handleSearch}
        style={{ marginBottom: 20 }}
      />
      {loading && !data.length ? (
        <Spin tip="Loading..." />
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={currentData.map((item, index) => ({
              ...item,
              key: index,
            }))}
            pagination={{
              pageSize,
              current: currentPage,
              total: totalItems,
              onChange: (page) => setCurrentPage(page),
            }}
            rowKey="quoteNumber"
            onRow={(record) => ({
              onClick: () => handleRowClick(record), // Add click event on row
            })}
          />
        </>
      )}
    </div>
  );
};

export default QuoteList;
