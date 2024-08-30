import React, { useEffect, useState } from "react";
import { Table, message, Spin, Input } from "antd";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  startAfter,
  limit,
  getDocs,
  getCountFromServer,
  where,
} from "firebase/firestore";
import { db } from "../firebase"; // Firestore 인스턴스 가져오기

const ClientList = () => {
  const [data, setData] = useState([]); // Firestore에서 가져온 데이터를 저장할 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [lastVisible, setLastVisible] = useState(null); // 페이지네이션을 위한 마지막 문서 참조
  const [total, setTotal] = useState(0); // 전체 문서 수
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태
  const pageSize = 10; // 페이지당 데이터 수

  const navigate = useNavigate(); // useNavigate 훅 추가

  // 전체 문서 수를 가져오는 함수
  const fetchTotalCount = async (search = "") => {
    try {
      const clientsRef = collection(db, "clients");
      const q = search
        ? query(
            clientsRef,
            where("상호명_간단", ">=", search),
            where("상호명_간단", "<=", search + "\uf8ff")
          )
        : clientsRef;
      const countSnapshot = await getCountFromServer(q);
      setTotal(countSnapshot.data().count);
    } catch (error) {
      message.error("전체 문서 수를 가져오는 중 오류가 발생했습니다.");
      console.error("Error fetching total count:", error);
    }
  };

  // Firestore에서 고객사 데이터를 가져오는 함수
  const fetchData = async (page, search = "") => {
    setLoading(true);
    const clientsRef = collection(db, "clients");
    let q;

    if (page === 1) {
      // 첫 페이지인 경우 처음부터 데이터를 가져옴
      q = search
        ? query(
            clientsRef,
            where("상호명_간단", ">=", search),
            where("상호명_간단", "<=", search + "\uf8ff"),
            orderBy("상호명_간단"),
            limit(pageSize)
          )
        : query(clientsRef, orderBy("상호명_간단"), limit(pageSize));
    } else {
      // 첫 페이지가 아닌 경우 마지막 문서부터 데이터를 가져옴
      q = search
        ? query(
            clientsRef,
            where("상호명_간단", ">=", search),
            where("상호명_간단", "<=", search + "\uf8ff"),
            orderBy("상호명_간단"),
            startAfter(lastVisible),
            limit(pageSize)
          )
        : query(
            clientsRef,
            orderBy("상호명_간단"),
            startAfter(lastVisible),
            limit(pageSize)
          );
    }

    try {
      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setData(documents);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]); // 마지막 문서 저장
    } catch (error) {
      message.error("데이터를 불러오는 중 오류가 발생했습니다.");
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalCount(searchTerm); // 전체 문서 수를 검색어 기준으로 가져오기
    fetchData(currentPage, searchTerm); // 현재 페이지의 데이터를 검색어 기준으로 가져오기
  }, [currentPage, searchTerm]);

  // 테이블 컬럼 설정
  const columns = [
    {
      title: "거래처등록번호",
      dataIndex: "거래처등록번호",
      key: "거래처등록번호",
    },
    {
      title: "거래처상호",
      dataIndex: "거래처상호",
      key: "거래처상호",
      render: (text, record) => (
        <a
          onClick={() =>
            navigate("/5994c397-ba14-4595-a142-6ed2e76bb822", {
              state: { clientInfo: record },
            })
          }
        >
          {text}
        </a>
      ),
    },
    {
      title: "대표자명",
      dataIndex: "대표자명",
      key: "대표자명",
    },
    {
      title: "사업자주소",
      dataIndex: "사업자주소",
      key: "사업자주소",
    },
    {
      title: "업태",
      dataIndex: "업태",
      key: "업태",
    },
    {
      title: "종목",
      dataIndex: "종목",
      key: "종목",
    },
    {
      title: "담당자",
      dataIndex: "담당자",
      key: "담당자",
      render: (contacts) =>
        contacts && Array.isArray(contacts) ? (
          <ul>
            {contacts.map((contact, index) => (
              <li key={index}>
                {contact.성명} ({contact.전화번호}, {contact.휴대전화번호},{" "}
                {contact.이메일})
              </li>
            ))}
          </ul>
        ) : (
          <span>담당자 정보 없음</span>
        ),
    },
  ];

  // 페이지 변경 핸들러
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
  };

  // 검색어 변경 핸들러
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  // 로딩 상태일 때 스피너 표시
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h2>고객사 리스트</h2>
      <Input.Search
        placeholder="거래처 상호 검색"
        enterButton
        onSearch={(value) => {
          handleSearch(value);
        }}
        style={{ marginBottom: 20 }}
      />
      <Table
        columns={columns}
        dataSource={data.map((item, index) => ({ ...item, key: index }))}
        pagination={{
          pageSize,
          current: currentPage,
          total: total,
        }}
        onChange={handleTableChange}
        rowKey="거래처등록번호" // 고유 키로 사용하는 값 설정
      />
    </div>
  );
};

export default ClientList;
