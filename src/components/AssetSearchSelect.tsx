import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { HiOutlinePlusCircle } from "react-icons/hi2";
import type { Asset } from "../models/Asset";
import { inputCls } from "../constants/transactionConstants";
import { DROPDOWN_MAX_HEIGHT } from "../constants/styles";

interface AssetSearchSelectProps {
  assets: Asset[];
  value: string;
  onChange: (assetId: string) => void;
  placeholder?: string;
  portalTarget?: HTMLElement | null;
  onAddCustomAsset?: () => void;
}

const AssetSearchSelect: React.FC<AssetSearchSelectProps> = (props: AssetSearchSelectProps) => {
  const [query, setQuery] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedAsset: Asset | null = props.assets.find((asset) => asset.id === props.value) ?? null;
  const placeholder: string = props.placeholder ?? "Search for an asset...";

  const displayName = (asset: Asset): string => {
    if (asset.officialName && asset.tickerName) {
      return `${asset.officialName} (${asset.tickerName})`;
    }
    return asset.officialName ?? asset.tickerName ?? "";
  };

  const filtered: Asset[] = props.assets.filter((asset) => {
    const q: string = query.toLowerCase();
    return (
      asset.officialName?.toLowerCase().includes(q) ||
      asset.tickerName?.toLowerCase().includes(q)
    );
  });

  const openDropdown = () => {
    if (containerRef.current) {
      const rect: DOMRect = containerRef.current.getBoundingClientRect();
      const spaceBelow: number = window.innerHeight - rect.bottom;
      const top: number = spaceBelow >= DROPDOWN_MAX_HEIGHT
        ? rect.bottom + 4
        : rect.top - DROPDOWN_MAX_HEIGHT - 4;
      setDropdownStyle({ position: "fixed", top, left: rect.left, width: rect.width });
    }
    setOpen(true);
  };

  const handleSelect = (asset: Asset) => {
    props.onChange(asset.id);
    setQuery("");
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!open) openDropdown();
    if (e.target.value === "") props.onChange("");
  };

  const handleFocus = () => {
    setQuery("");
    openDropdown();
  };

  const handleAddCustomAsset = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    setQuery("");
    props.onAddCustomAsset?.();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target: Node = e.target as Node;
      const insideTrigger: boolean | undefined = containerRef.current?.contains(target);
      const insideDropdown: boolean | undefined = dropdownRef.current?.contains(target);
      if (!insideTrigger && !insideDropdown) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        className={inputCls}
        placeholder={open ? placeholder : (selectedAsset ? displayName(selectedAsset) : placeholder)}
        value={open ? query : (selectedAsset ? displayName(selectedAsset) : "")}
        onChange={handleInputChange}
        onFocus={handleFocus}
        autoComplete="off"
      />
      {open && createPortal(
        <div
          ref={dropdownRef}
          style={{ ...dropdownStyle, maxHeight: DROPDOWN_MAX_HEIGHT, zIndex: 9999 }}
          className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto"
        >
          {/* Add custom asset — always first */}
          {props.onAddCustomAsset && (
            <button
              type="button"
              onMouseDown={handleAddCustomAsset}
              className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-2 cursor-pointer border-b border-gray-100"
            >
              <HiOutlinePlusCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">Add custom asset</span>
            </button>
          )}

          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">No assets found</div>
          ) : (
            filtered.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(asset);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center justify-between gap-2 cursor-pointer"
              >
                <span className="truncate">{asset.officialName ?? asset.tickerName}</span>
                {asset.tickerName && asset.officialName && (
                  <span className="text-xs text-gray-400 shrink-0">{asset.tickerName}</span>
                )}
              </button>
            ))
          )}
        </div>,
        props.portalTarget ?? document.body
      )}
    </div>
  );
};

export default AssetSearchSelect;
