import React, { useState } from "react";
import { Input } from "../../../components/common/Input";
import { Button } from "../../../components/common/Button";
import { FiSearch, FiFilter, FiCalendar } from "react-icons/fi";

const SalesFilters = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [status, setStatus] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onFilterChange({
      searchTerm,
      ...dateRange,
      status,
    });
  };

  const handleReset = () => {
    setSearchTerm("");
    setDateRange({ startDate: "", endDate: "" });
    setStatus("");
    onFilterChange({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="고객명 또는 품목명으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={FiSearch}
            />
          </div>
          <div className="flex space-x-2">
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              icon={FiCalendar}
            />
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              icon={FiCalendar}
            />
          </div>
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">전체 상태</option>
              <option value="completed">완료</option>
              <option value="pending">대기중</option>
              <option value="cancelled">취소됨</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={handleReset}>
            초기화
          </Button>
          <Button type="submit">
            <FiFilter className="mr-2 h-4 w-4" />
            필터 적용
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SalesFilters;
