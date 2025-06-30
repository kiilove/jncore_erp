import { FiSearch } from "react-icons/fi";

const CustomerSearch = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="검색..."
        className="pl-10 pr-4 py-2 border rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <FiSearch className="absolute left-3 top-3 text-gray-400" />
    </div>
  );
};

export default CustomerSearch;
