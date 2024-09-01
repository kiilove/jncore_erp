import React, { useRef, useState } from "react";
import { Input, List, message } from "antd";
import { useFirestoreQuery } from "../../hooks/useFirestore";
import { where } from "firebase/firestore";

const ClientSearchContent = ({ handleClientSelect }) => {
  const searchClients = useFirestoreQuery();

  const [clientResults, setClientSearchResults] = useState([]);
  const searchInputRef = useRef(null);

  const fetchClients = async (keyword) => {
    try {
      const trimKeyword = keyword.trim();
      const condition = [
        where("상호명_간단", ">=", trimKeyword),
        where("상호명_간단", "<=", trimKeyword + "\uf8ff"),
      ];
      await searchClients.getDocuments(
        "clients",
        (data) => {
          console.log(data);
          setClientSearchResults(data);
        },
        condition
      );
    } catch (error) {
      message.error("데이터를 불러오는데 오류가 발생했습니다.");
    }
  };

  const onSearch = (value) => {
    fetchClients(value);
  };

  const onSelect = (company, person) => {
    const clientSelection = { company: { ...company }, person: { ...person } };
    console.log(clientSelection);
    handleClientSelect(clientSelection);
  };
  return (
    <div>
      <Input.Search
        placeholder="고객사명을 입력하세요"
        ref={searchInputRef}
        onSearch={onSearch}
        style={{ marginBottom: 8 }}
      />
      <List
        bordered
        dataSource={clientResults}
        renderItem={(client) => {
          return (
            <>
              {client?.담당자?.length > 0 &&
                client.담당자.map((item, idx) => {
                  const companyName = client?.거래처상호;
                  const clientName = item?.성명;
                  const clientEmail = item?.이메일;
                  return (
                    <List.Item onClick={() => onSelect(client, item)}>
                      {`${companyName} / ${clientName} / ${clientEmail}`}
                    </List.Item>
                  );
                })}
            </>
          );
        }}
      />
    </div>
  );
};

export default ClientSearchContent;
