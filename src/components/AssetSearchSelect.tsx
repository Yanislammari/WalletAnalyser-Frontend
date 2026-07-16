import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { HiOutlinePlusCircle } from "react-icons/hi2";
import type { Asset } from "../models/Asset";
import { inputCls } from "../constants/transactionConstants";
import { DROPDOWN_MAX_HEIGHT } from "../constants/styles";

const PAGE_SIZE = 10;

interface AssetSearchSelectProps {
  /** Currently selected asset (controlled) */
  selectedAsset: Asset | null;
  /** Called when user picks an asset from the list */
  onSelect: (asset: Asset | null) => void;
  /**
   * Function that fetches a page of assets.
   * The component calls this on open, on search change (debounced 300 ms),
   * and when the user scrolls to the bottom of the list.
   */
  fetchAssets: (
    search: string,
    offset: number,
    limit: number,
  ) => Promise<{ assets: Asset[]; hasMore: boolean }>;
  placeholder?: string;
  portalTarget?: HTMLElement | null;
  onAddCustomAsset?: () => void;
}

const AssetSearchSelect: React.FC<AssetSearchSelectProps> = ({
  selectedAsset,
  onSelect,
  fetchAssets,
  placeholder = "Search for an asset...",
  portalTarget,
  onAddCustomAsset,
}) => {
  const [query,       setQuery]       = useState<string>("");
  const [open,        setOpen]        = useState<boolean>(false);
  const [items,       setItems]       = useState<Asset[]>([]);
  const [loading,     setLoading]     = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore,     setHasMore]     = useState<boolean>(false);
  const [offset,      setOffset]      = useState<number>(0);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const containerRef  = useRef<HTMLDivElement>(null);
  const dropdownRef   = useRef<HTMLDivElement>(null);
  const sentinelRef   = useRef<HTMLDivElement>(null);
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track the current query in a ref so async callbacks can check for staleness
  const activeQueryRef = useRef<string>("");

  const displayName = (asset: Asset): string => {
    if (asset.officialName && asset.tickerName) return `${asset.officialName} (${asset.tickerName})`;
    return asset.officialName ?? asset.tickerName ?? "";
  };

  const computeDropdownStyle = () => {
    if (!containerRef.current) return;
    const rect        = containerRef.current.getBoundingClientRect();
    const spaceBelow  = window.innerHeight - rect.bottom;
    const top         = spaceBelow >= DROPDOWN_MAX_HEIGHT
      ? rect.bottom + 4
      : rect.top - DROPDOWN_MAX_HEIGHT - 4;
    setDropdownStyle({ position: "fixed", top, left: rect.left, width: rect.width });
  };

  // ── Fetch first page (resets list) ────────────────────────────────────────

  const loadFirst = useCallback(async (search: string) => {
    activeQueryRef.current = search;
    setLoading(true);
    setItems([]);
    setOffset(0);
    setHasMore(false);
    try {
      const result = await fetchAssets(search, 0, PAGE_SIZE);
      // Discard result if the query changed while we were waiting
      if (activeQueryRef.current !== search) return;
      setItems(result.assets);
      setHasMore(result.hasMore);
      setOffset(PAGE_SIZE);
    } catch { /* ignore */ }
    finally {
      if (activeQueryRef.current === search) setLoading(false);
    }
  }, [fetchAssets]);

  // ── Fetch next page (appends to list) ─────────────────────────────────────

  const loadMore = useCallback(async (currentOffset: number, search: string) => {
    setLoadingMore(true);
    try {
      const result = await fetchAssets(search, currentOffset, PAGE_SIZE);
      if (activeQueryRef.current !== search) return;
      setItems((prev) => [...prev, ...result.assets]);
      setHasMore(result.hasMore);
      setOffset(currentOffset + PAGE_SIZE);
    } catch { /* ignore */ }
    finally { setLoadingMore(false); }
  }, [fetchAssets]);

  // ── Open dropdown ─────────────────────────────────────────────────────────

  const openDropdown = () => {
    computeDropdownStyle();
    setOpen(true);
  };

  const handleFocus = () => {
    // Reset query on focus — show full list
    setQuery("");
    activeQueryRef.current = "";
    openDropdown();
    loadFirst("");
  };

  // ── Search input ──────────────────────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val === "") onSelect(null);
    if (!open) openDropdown();

    // Debounce: wait 300 ms of silence before firing
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadFirst(val), 300);
  };

  // ── Select an item ────────────────────────────────────────────────────────

  const handleSelect = (asset: Asset) => {
    onSelect(asset);
    setQuery("");
    setOpen(false);
  };

  const handleAddCustomAsset = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    setQuery("");
    onAddCustomAsset?.();
  };

  // ── Close on outside click ────────────────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!containerRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── IntersectionObserver — infinite scroll sentinel ───────────────────────

  useEffect(() => {
    if (!open || !sentinelRef.current) return;
    const sentinel = sentinelRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore(offset, activeQueryRef.current);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // Re-attach when offset/hasMore change so the observer picks up new state
  }, [open, hasMore, loadingMore, loading, offset, loadMore]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        className={inputCls}
        placeholder={open
          ? placeholder
          : (selectedAsset ? displayName(selectedAsset) : placeholder)
        }
        value={open
          ? query
          : (selectedAsset ? displayName(selectedAsset) : "")
        }
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
          {/* "Add custom asset" — always first */}
          {onAddCustomAsset && (
            <button
              type="button"
              onMouseDown={handleAddCustomAsset}
              className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-2 cursor-pointer border-b border-gray-100"
            >
              <HiOutlinePlusCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">Add custom asset</span>
            </button>
          )}

          {/* First-page loader */}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <span className="loading loading-spinner loading-sm text-purple-500" />
            </div>
          )}

          {/* Empty state */}
          {!loading && items.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400">No assets found</div>
          )}

          {/* Asset rows */}
          {!loading && items.map((asset) => (
            <button
              key={asset.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(asset); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center justify-between gap-2 cursor-pointer"
            >
              <span className="truncate">{asset.officialName ?? asset.tickerName}</span>
              {asset.tickerName && asset.officialName && (
                <span className="text-xs text-gray-400 shrink-0">{asset.tickerName}</span>
              )}
            </button>
          ))}

          {/* Sentinel div — when visible, triggers next-page load */}
          <div ref={sentinelRef} className="h-px" />

          {/* Next-page loader */}
          {loadingMore && (
            <div className="flex items-center justify-center py-2">
              <span className="loading loading-spinner loading-sm text-purple-400" />
            </div>
          )}
        </div>,
        portalTarget ?? document.body,
      )}
    </div>
  );
};

export default AssetSearchSelect;
