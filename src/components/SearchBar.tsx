import React from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

const SearchBar: React.FC = () => {
  return (
    <div className="relative hidden md:block shrink-0">
      <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search…"
        className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 w-48 lg:w-52 transition-all"
      />
    </div>
  );
};

export default SearchBar;
