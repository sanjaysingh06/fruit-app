import { useEffect, useMemo, useRef, useState } from "react";
import API from "../api/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import logoHeader from "../assets/pdf_logo.jpeg";

const RECENT_ACCOUNTS_KEY = "shubham-fruit-ledger-recent-accounts";
const RECENT_ACCOUNT_LIMIT = 5;

const pad2 = (value) => String(value).padStart(2, "0");

const toLocalISODate = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const formatMoney = (value) => {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number)) return "0.00";
  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const displayValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const humanizeKey = (key) =>
  String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getTransactionReference = (row) =>
  row.reference || row.ref || row.reference_number || row.transaction_id || "—";

const getAccountRole = (account) => {
  if (!account) return "";
  const role = account.role || account.account_type_name || "";
  return String(role).replace(/_/g, " ");
};

export default function Ledger() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedAccountName, setSelectedAccountName] = useState("");
  const [selectedAccountData, setSelectedAccountData] = useState(null);

  const [accountSearch, setAccountSearch] = useState("");
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [activeAccountIndex, setActiveAccountIndex] = useState(-1);
  const [recentAccountIds, setRecentAccountIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_ACCOUNTS_KEY) || "[]");
      return Array.isArray(saved) ? saved.map(String) : [];
    } catch {
      return [];
    }
  });
  const accountSearchRef = useRef(null);

  const [ledger, setLedger] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [type, setType] = useState("");
  const [activeQuickFilter, setActiveQuickFilter] = useState("CUSTOM");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load the account directory once. Search and suggestions use this local list.
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoadingAccounts(true);
        const res = await API.get("/api/accounts/");
        setAccounts(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Accounts error:", error);
        setMessage("Failed to load accounts");
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  const recentAccounts = useMemo(() => {
    return recentAccountIds
      .map((id) => accounts.find((account) => String(account.id) === String(id)))
      .filter(Boolean);
  }, [accounts, recentAccountIds]);

  const filteredAccounts = useMemo(() => {
    const query = accountSearch.trim().toLowerCase();
    if (query.length < 2) return [];

    return accounts
      .filter((account) =>
        [account.name, account.phone, account.role, account.account_type_name]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))
      )
      .slice(0, 30);
  }, [accounts, accountSearch]);

  const handleAccountSelect = (account) => {
    setSelectedAccount(String(account.id));
    setSelectedAccountName(account.name || "");
    setSelectedAccountData(account);
    setAccountSearch(account.name || "");
    setIsAccountDropdownOpen(false);
    setActiveAccountIndex(-1);
    setLedger([]);
    setSummary(null);
    setMessage("");

    setRecentAccountIds((previous) => {
      const next = [String(account.id), ...previous.filter((id) => String(id) !== String(account.id))]
        .slice(0, RECENT_ACCOUNT_LIMIT);
      try {
        localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(next));
      } catch (error) {
        console.warn("Could not save recent ledger accounts:", error);
      }
      return next;
    });
  };

  const clearAccountSelection = () => {
    setSelectedAccount("");
    setSelectedAccountName("");
    setSelectedAccountData(null);
    setAccountSearch("");
    setLedger([]);
    setSummary(null);
    setSelectedTransaction(null);
    setIsAccountDropdownOpen(true);
    setActiveAccountIndex(-1);
  };

  const handleAccountSearchChange = (value) => {
    setAccountSearch(value);
    setSelectedAccount("");
    setSelectedAccountName("");
    setSelectedAccountData(null);
    setLedger([]);
    setSummary(null);
    setSelectedTransaction(null);
    setActiveAccountIndex(-1);
    setIsAccountDropdownOpen(true);
  };

  const visibleSuggestions = accountSearch.trim().length >= 2
    ? filteredAccounts
    : accountSearch.trim().length === 0
      ? recentAccounts
      : [];

  const handleAccountSearchKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsAccountDropdownOpen(true);
      setActiveAccountIndex((current) =>
        visibleSuggestions.length === 0
          ? -1
          : Math.min(current + 1, visibleSuggestions.length - 1)
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveAccountIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && isAccountDropdownOpen) {
      event.preventDefault();
      if (activeAccountIndex >= 0 && visibleSuggestions[activeAccountIndex]) {
        handleAccountSelect(visibleSuggestions[activeAccountIndex]);
      } else if (visibleSuggestions.length === 1) {
        handleAccountSelect(visibleSuggestions[0]);
      }
    } else if (event.key === "Escape") {
      setIsAccountDropdownOpen(false);
      setActiveAccountIndex(-1);
    }
  };

  // Close suggestions when the user clicks outside the account search area.
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (accountSearchRef.current && !accountSearchRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false);
        setActiveAccountIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Existing ledger and summary endpoints are intentionally preserved.
  useEffect(() => {
    if (!selectedAccount) return undefined;

    let cancelled = false;
    const fetchLedger = async () => {
      try {
        setLoading(true);
        setMessage("");

        const params = new URLSearchParams();
        if (fromDate) params.append("from_date", fromDate);
        if (toDate) params.append("to_date", toDate);
        if (type) params.append("type", type);

        const queryString = params.toString();
        const ledgerUrl = `/api/ledger/${selectedAccount}/${queryString ? `?${queryString}` : ""}`;

        const [ledgerRes, summaryRes] = await Promise.all([
          API.get(ledgerUrl),
          API.get(`/api/summary/${selectedAccount}/`),
        ]);

        if (cancelled) return;
        setLedger(Array.isArray(ledgerRes.data) ? ledgerRes.data : []);
        setSummary(summaryRes.data || null);
      } catch (error) {
        if (cancelled) return;
        console.error("Ledger error:", error);
        setMessage("Error loading ledger. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLedger();
    return () => {
      cancelled = true;
    };
  }, [selectedAccount, fromDate, toDate, type]);

  const applyDateRange = (start, end, label) => {
    setFromDate(start);
    setToDate(end);
    setActiveQuickFilter(label);
  };

  const handleQuickDateFilter = (filter) => {
    const today = new Date();
    const end = toLocalISODate(today);
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (filter === "TODAY") {
      applyDateRange(end, end, filter);
      return;
    }

    if (filter === "WEEK") {
      const day = startDate.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      startDate.setDate(startDate.getDate() + mondayOffset);
      applyDateRange(toLocalISODate(startDate), end, filter);
      return;
    }

    if (filter === "MONTH") {
      startDate.setDate(1);
      applyDateRange(toLocalISODate(startDate), end, filter);
      return;
    }

    if (filter === "YEAR") {
      startDate.setMonth(0, 1);
      applyDateRange(toLocalISODate(startDate), end, filter);
    }
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setType("");
    setActiveQuickFilter("CUSTOM");
  };

  const handleCustomDateChange = (setter, value) => {
    setter(value);
    setActiveQuickFilter("CUSTOM");
  };

  const filteredTotals = useMemo(() => {
    return ledger.reduce(
      (totals, row) => {
        totals.debit += Number(row.debit || 0);
        totals.credit += Number(row.credit || 0);
        return totals;
      },
      { debit: 0, credit: 0 }
    );
  }, [ledger]);

  const accountOpeningBalance = selectedAccountData?.opening_balance;
  const accountOpeningBalanceType = selectedAccountData?.opening_balance_type || "Dr";
  const closingBalance = summary?.balance;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(`${String(dateStr).slice(0, 10)}T00:00:00`);
    if (Number.isNaN(date.getTime())) return String(dateStr);
    return `${pad2(date.getDate())}-${pad2(date.getMonth() + 1)}-${String(date.getFullYear()).slice(-2)}`;
  };

  const formatDateLong = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(`${String(dateStr).slice(0, 10)}T00:00:00`);
    if (Number.isNaN(date.getTime())) return String(dateStr);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const handlePrint = () => {
    if (!selectedAccount || ledger.length === 0) {
      setMessage("Select an account with ledger entries before exporting PDF.");
      return;
    }

    const doc = new jsPDF("landscape");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Use the last balance returned by the ledger API for this selected period.
    const lastBalanceRow = [...ledger].reverse().find(
      (row) => row.balance !== null && row.balance !== undefined && row.balance !== ""
    );
    const closingAmount = Number(lastBalanceRow?.balance ?? 0);
    const closingType = lastBalanceRow?.balance_type || (closingAmount >= 0 ? "Dr" : "Cr");

    const drawPageHeader = () => {
      // Classic VPS-style grey company header.
      doc.setFillColor(240, 240, 240);
      doc.rect(0, 0, pageWidth, 32, "F");

      try {
        doc.addImage(logoHeader, "JPEG", 10, 5, 24, 24);
      } catch (error) {
        console.warn("PDF logo could not be added:", error);
      }

      doc.setTextColor(25, 25, 25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("SHUBHAM FRUIT COMPANY", pageWidth / 2, 13, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(
        "Shop No FC10, Fal Mandi, Krishi Upaj Mandi, Jabalpur (M.P)",
        pageWidth / 2,
        18,
        { align: "center" }
      );
      doc.text("Mobile : 9752468799", pageWidth / 2, 24, { align: "center" });

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("LEDGER STATEMENT", pageWidth / 2, 40, { align: "center" });
      doc.text(`Name : ${selectedAccountName}`, 14, 50);
      doc.text("Closing Balance :", 14, 58);

      doc.setTextColor(220, 0, 0);
      doc.text(`Rs. ${formatMoney(Math.abs(closingAmount))} ${closingType}`, 65, 58);

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const periodLabel = fromDate || toDate
        ? `Period : ${fromDate ? formatDate(fromDate) : "Beginning"} to ${toDate ? formatDate(toDate) : "Till Date"}`
        : `Till Date : ${new Date().toLocaleDateString("en-GB")}`;
      doc.text(periodLabel, pageWidth - 14, 50, { align: "right" });
    };

    // Same nine-column layout as the VPS PDF. Keep the API's OPENING row.
    const tableRows = ledger.map((row) => [
      formatDate(row.date),
      row.transaction_type || "",
      row.item_name || "",
      row.quantity ?? "",
      row.weight ?? "",
      row.rate ?? "",
      row.debit === null || row.debit === undefined ? "" : row.debit,
      row.credit === null || row.credit === undefined ? "" : row.credit,
      row.balance === null || row.balance === undefined || row.balance === ""
        ? ""
        : `${formatMoney(Math.abs(Number(row.balance)))} ${row.balance_type || ""}`,
    ]);

    autoTable(doc, {
      didDrawPage: () => {
        drawPageHeader();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text("Generated By Shubham Fruit Company Software", 14, pageHeight - 8);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 25, pageHeight - 8);
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 8) {
          data.cell.styles.fontStyle = "bold";
        }
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      startY: 62,
      margin: { top: 62, bottom: 20, left: 10, right: 10 },
      head: [["Date", "Type", "Item", "Qty", "Weight", "Rate", "Debit", "Credit", "Balance"]],
      body: tableRows,
      styles: {
        font: "helvetica",
        fontSize: 10,
        fontStyle: "bold",
        cellPadding: 3,
        overflow: "linebreak",
        valign: "middle",
        halign: "center",
      },
      headStyles: { fillColor: [45, 45, 45], textColor: 255, fontStyle: "bold", halign: "center" },
      bodyStyles: { halign: "center" },
      // Expand the nine columns to use the full printable landscape width.
      // A4 landscape: 297mm page width - 10mm left/right margins = 277mm.
      tableWidth: "auto",
      columnStyles: {
        0: { cellWidth: 27 },
        1: { cellWidth: 29 },
        2: { cellWidth: 56, halign: "left" },
        3: { cellWidth: 21 },
        4: { cellWidth: 23 },
        5: { cellWidth: 23 },
        6: { cellWidth: 29 },
        7: { cellWidth: 29 },
        8: { cellWidth: 40 },
      },
    });

    const safeName = selectedAccountName.replace(/[\\/:*?"<>|]/g, "_");
    doc.save(`${safeName}_ledger.pdf`);
  };

  const handleExportExcel = () => {
    if (!selectedAccount || ledger.length === 0) {
      setMessage("Select an account with ledger entries before exporting Excel.");
      return;
    }

    const workbook = XLSX.utils.book_new();
    const rows = [
      ["SHUBHAM FRUIT COMPANY"],
      ["LEDGER STATEMENT"],
      ["Account", selectedAccountName],
      ["Role", getAccountRole(selectedAccountData) || "—"],
      ["Phone", selectedAccountData?.phone || "—"],
      ["Address", selectedAccountData?.address || "—"],
      ["Period", `${fromDate || "All"} to ${toDate || "Till date"}`],
      ["Account Opening Balance", accountOpeningBalance ?? "—"],
      ["Account Opening Balance Type", accountOpeningBalanceType],
      ["Total Debit (filtered period)", filteredTotals.debit],
      ["Total Credit (filtered period)", filteredTotals.credit],
      ["Closing Balance (account summary)", closingBalance ?? "—"],
      [],
      ["Date", "Type", "Reference", "Item", "Quantity", "Weight", "Rate", "Debit", "Credit", "Balance", "Balance Type"],
      ...ledger.map((row) => [
        row.date || "",
        row.transaction_type || "",
        getTransactionReference(row),
        row.item_name || "",
        row.quantity ?? "",
        row.weight ?? "",
        row.rate ?? "",
        row.debit ?? "",
        row.credit ?? "",
        row.balance ?? "",
        row.balance_type || "",
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 28 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 17 }, { wch: 14 },
    ];
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");

    const safeName = selectedAccountName.replace(/[\\/:*?"<>|]/g, "_");
    XLSX.writeFile(workbook, `${safeName}_ledger.xlsx`);
  };

  const transactionDetailFields = selectedTransaction
    ? Object.entries(selectedTransaction).filter(([, value]) => value !== null && value !== undefined && typeof value !== "object")
    : [];

  return (
    <div className="relative box-border flex w-full min-w-0 max-w-full min-h-[calc(100vh-60px)] flex-col gap-3 overflow-x-hidden">
      {/* Header and account selection */}
      <section className="box-border w-full min-w-0 max-w-full shrink-0 rounded-xl bg-white p-3 shadow sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ledger</h2>
            <p className="text-sm text-gray-500">Account-wise transaction statement</p>
          </div>
          {selectedAccount && (
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              Account selected
            </span>
          )}
        </div>

        <div className="grid w-full min-w-0 grid-cols-1 gap-2">
          <div ref={accountSearchRef} className="relative min-w-0">
            <label className="mb-1 block text-xs font-semibold text-gray-600">Account</label>
            <div className="relative">
              <input
                type="text"
                value={accountSearch}
                onChange={(event) => handleAccountSearchChange(event.target.value)}
                onFocus={() => setIsAccountDropdownOpen(true)}
                onKeyDown={handleAccountSearchKeyDown}
                placeholder={loadingAccounts ? "Loading accounts..." : "Search name, phone or role..."}
                autoComplete="off"
                role="combobox"
                aria-expanded={isAccountDropdownOpen}
                aria-controls="ledger-account-suggestions"
                aria-autocomplete="list"
                className="box-border w-full min-w-0 rounded-lg border border-gray-300 px-3 py-3 pr-10 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              {accountSearch && (
                <button
                  type="button"
                  onClick={clearAccountSelection}
                  aria-label="Clear account selection"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-xl leading-none text-gray-400 hover:text-gray-800"
                >
                  ×
                </button>
              )}
            </div>

            {isAccountDropdownOpen && (accountSearch.trim().length >= 2 || accountSearch.trim().length === 0) && (
              <div
                id="ledger-account-suggestions"
                role="listbox"
                className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 max-w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl"
              >
                {visibleSuggestions.length > 0 ? (
                  <>
                    {accountSearch.trim().length === 0 && (
                      <div className="border-b bg-gray-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                        Recently selected accounts
                      </div>
                    )}
                    {visibleSuggestions.map((account, index) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={activeAccountIndex === index}
                        key={account.id}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleAccountSelect(account)}
                        className={`flex min-h-12 w-full min-w-0 items-center justify-between gap-3 border-b border-gray-100 px-3 py-2.5 text-left last:border-b-0 hover:bg-blue-50 ${activeAccountIndex === index ? "bg-blue-50" : ""}`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-gray-900">{account.name}</span>
                          <span className="mt-0.5 block break-words text-xs text-gray-500">
                            {[account.phone, getAccountRole(account)].filter(Boolean).join(" • ") || "No phone or role"}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-gray-400">Select</span>
                      </button>
                    ))}
                  </>
                ) : accountSearch.trim().length >= 2 ? (
                  <div className="px-3 py-3 text-sm text-gray-500">No matching accounts found.</div>
                ) : null}
              </div>
            )}
            {isAccountDropdownOpen && accountSearch.trim().length === 1 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-lg">
                Type at least 2 characters to search.
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 md:hidden">
            <span className="text-xs text-gray-500">Narrow your ledger results</span>
            <button
              type="button"
              onClick={() => setShowMobileFilters((open) => !open)}
              aria-expanded={showMobileFilters}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
            >
              <span>Filters{type || fromDate || toDate ? " • Active" : ""}</span>
              <span aria-hidden="true">{showMobileFilters ? "−" : "+"}</span>
            </button>
          </div>

          <div className={`${showMobileFilters ? "grid" : "hidden"} min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 md:grid md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]`}>
            <div className="min-w-0">
              <label className="mb-1 block text-xs font-semibold text-gray-600">From date</label>
              <input type="date" className="box-border w-full min-w-0 rounded-lg border border-gray-300 px-3 py-3" value={fromDate} onChange={(event) => handleCustomDateChange(setFromDate, event.target.value)} />
            </div>
            <div className="min-w-0">
              <label className="mb-1 block text-xs font-semibold text-gray-600">To date</label>
              <input type="date" className="box-border w-full min-w-0 rounded-lg border border-gray-300 px-3 py-3" value={toDate} min={fromDate || undefined} onChange={(event) => handleCustomDateChange(setToDate, event.target.value)} />
            </div>
            <div className="min-w-0">
              <label className="mb-1 block text-xs font-semibold text-gray-600">Transaction type</label>
              <select className="box-border w-full min-w-0 rounded-lg border border-gray-300 px-3 py-3" value={type} onChange={(event) => setType(event.target.value)}>
                <option value="">All types</option>
                <option value="SALE">Sale</option>
                <option value="PURCHASE">Purchase</option>
                <option value="PAYMENT">Payment</option>
                <option value="RECEIPT">Receipt</option>
              </select>
            </div>
            <div className="flex min-w-0 items-end">
              <button type="button" onClick={handleReset} className="min-h-11 w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50">Reset filters</button>
            </div>
          </div>
        </div>

        <div className="mt-3 flex min-w-0 max-w-full flex-nowrap items-center gap-2 overflow-x-auto overscroll-x-contain pb-1 md:flex-wrap md:overflow-visible">
          <span className="mr-1 shrink-0 text-xs font-semibold text-gray-500">Quick dates:</span>
          {[
            ["TODAY", "Today"],
            ["WEEK", "This Week"],
            ["MONTH", "This Month"],
            ["YEAR", "This Year"],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              onClick={() => handleQuickDateFilter(value)}
              className={`min-h-9 shrink-0 rounded-full border px-3 py-2 text-xs font-medium transition ${activeQuickFilter === value ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
            >
              {label}
            </button>
          ))}
          {(fromDate || toDate) && <span className="text-xs text-gray-500">{formatDate(fromDate) || "Start"} – {formatDate(toDate) || "Today"}</span>}
        </div>
      </section>

      {/* Ledger body */}
      <section className="box-border w-full min-w-0 max-w-full flex-1 overflow-x-hidden rounded-xl bg-white p-3 shadow sm:p-4">
        {!selectedAccount ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-600">⌕</div>
            <h3 className="font-semibold text-gray-800">Select an account to view its ledger</h3>
            <p className="mt-1 max-w-md text-sm text-gray-500">Search by account name or mobile number, or choose one of your recently viewed accounts.</p>
          </div>
        ) : loading ? (
          <div className="py-12 text-center text-sm text-gray-500">Loading ledger...</div>
        ) : (
          <>
            {/* Account summary */}
            <div className="mb-4 w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
              <div className="mb-3 flex min-w-0 flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 max-w-full">
                  <h3 className="break-words text-lg font-bold text-gray-900">{selectedAccountName}</h3>
                  <p className="break-words text-xs text-gray-500">
                    {[getAccountRole(selectedAccountData), selectedAccountData?.phone].filter(Boolean).join(" • ") || "Account ledger"}
                  </p>
                </div>
                <div className="min-w-0 max-w-full break-words text-right text-xs text-gray-500">
                  {fromDate || toDate ? `${formatDate(fromDate) || "Start"} – ${formatDate(toDate) || "Till date"}` : "All transactions"}
                </div>
              </div>
              <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <div className="min-w-0 rounded-lg bg-white p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Account opening balance</p>
                  <p className="mt-1 break-words text-base font-bold text-gray-900">{accountOpeningBalance === undefined || accountOpeningBalance === null ? "—" : `₹${formatMoney(accountOpeningBalance)} ${accountOpeningBalanceType}`}</p>
                  <p className="text-[11px] text-gray-400">Initial balance in account record</p>
                </div>
                <div className="min-w-0 rounded-lg bg-white p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Total debit</p>
                  <p className="mt-1 break-words text-base font-bold text-red-600">₹{formatMoney(filteredTotals.debit)}</p>
                  <p className="text-[11px] text-gray-400">Selected period</p>
                </div>
                <div className="min-w-0 rounded-lg bg-white p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Total credit</p>
                  <p className="mt-1 break-words text-base font-bold text-green-600">₹{formatMoney(filteredTotals.credit)}</p>
                  <p className="text-[11px] text-gray-400">Selected period</p>
                </div>
                <div className="min-w-0 rounded-lg bg-white p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Current closing balance</p>
                  <p className={`mt-1 break-words text-base font-bold ${Number(closingBalance || 0) >= 0 ? "text-green-700" : "text-red-600"}`}>
                    {closingBalance === undefined || closingBalance === null ? "—" : `₹${formatMoney(Math.abs(Number(closingBalance)))}`}
                    {closingBalance !== undefined && closingBalance !== null ? ` ${Number(closingBalance) >= 0 ? "Dr" : "Cr"}` : ""}
                  </p>
                  <p className="text-[11px] text-gray-400">All transactions</p>
                </div>
              </div>
            </div>

            {/* Export actions and count */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-gray-600">{ledger.length} transaction{ledger.length === 1 ? "" : "s"}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handlePrint} disabled={!ledger.length} className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-40">Export PDF</button>
                <button type="button" onClick={handleExportExcel} disabled={!ledger.length} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">Export Excel</button>
              </div>
            </div>

            {ledger.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
                <p className="font-medium text-gray-700">No transactions found</p>
                <p className="mt-1 text-sm text-gray-500">Try another date range or transaction type.</p>
              </div>
            ) : (
              <>
                {/* Desktop transaction table */}
                <div className="hidden w-full min-w-0 max-w-full overscroll-x-contain overflow-x-auto rounded-lg border border-gray-200 md:block">
                  <table className="w-full min-w-[900px] table-auto text-sm">
                    <thead className="sticky top-0 bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
                      <tr>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Reference</th>
                        <th className="p-2 text-left">Item</th>
                        <th className="p-2 text-right">Qty</th>
                        <th className="p-2 text-right">Weight</th>
                        <th className="p-2 text-right">Rate</th>
                        <th className="p-2 text-right">Debit</th>
                        <th className="p-2 text-right">Credit</th>
                        <th className="p-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.map((row, index) => (
                        <tr
                          key={row.id ?? `${row.date}-${index}`}
                          onClick={() => setSelectedTransaction(row)}
                          onKeyDown={(event) => event.key === "Enter" && setSelectedTransaction(row)}
                          tabIndex={0}
                          title="Click to view transaction details"
                          className="cursor-pointer border-t border-gray-100 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                        >
                          <td className="whitespace-nowrap p-3">{formatDateLong(row.date)}</td>
                          <td className="p-2">{row.transaction_type || "—"}</td>
                          <td className="p-2">{getTransactionReference(row)}</td>
                          <td className="max-w-[220px] truncate p-2">{row.item_name || "—"}</td>
                          <td className="p-2 text-right">{displayValue(row.quantity)}</td>
                          <td className="p-2 text-right">{displayValue(row.weight)}</td>
                          <td className="p-2 text-right">{displayValue(row.rate)}</td>
                          <td className="p-2 text-right font-medium text-red-600">{row.debit ? `₹${formatMoney(row.debit)}` : "—"}</td>
                          <td className="p-2 text-right font-medium text-green-700">{row.credit ? `₹${formatMoney(row.credit)}` : "—"}</td>
                          <td className="whitespace-nowrap p-2 text-right font-semibold">{row.balance === null || row.balance === undefined || row.balance === "" ? "—" : `₹${formatMoney(row.balance)} ${row.balance_type || ""}`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile transaction cards */}
                <div className="space-y-2 md:hidden">
                  {ledger.map((row, index) => (
                    <button
                      type="button"
                      key={row.id ?? `${row.date}-${index}`}
                      onClick={() => setSelectedTransaction(row)}
                      className="w-full rounded-xl border border-gray-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">{row.transaction_type || "Transaction"}</p>
                          <p className="mt-0.5 break-words text-xs text-gray-500">{formatDateLong(row.date)} · Ref: {getTransactionReference(row)}</p>
                          <p className="mt-1 truncate text-sm text-gray-700">{row.item_name || "No item description"}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          {Number(row.debit || 0) > 0 && <p className="font-semibold text-red-600">Dr ₹{formatMoney(row.debit)}</p>}
                          {Number(row.credit || 0) > 0 && <p className="font-semibold text-green-700">Cr ₹{formatMoney(row.credit)}</p>}
                          {!Number(row.debit || 0) && !Number(row.credit || 0) && <p className="font-semibold text-gray-700">—</p>}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-500">
                        <span>Balance: {row.balance === null || row.balance === undefined ? "—" : `₹${formatMoney(row.balance)} ${row.balance_type || ""}`}</span>
                        <span className="font-medium text-blue-600">View details →</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* Transaction detail modal: displays fields supplied by the existing ledger API */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3" onMouseDown={(event) => event.target === event.currentTarget && setSelectedTransaction(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="transaction-detail-title" className="max-h-[85dvh] w-full max-w-[min(42rem,calc(100vw-1.5rem))] overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-4 py-3">
              <div>
                <h3 id="transaction-detail-title" className="font-bold text-gray-900">Transaction details</h3>
                <p className="text-xs text-gray-500">{selectedTransaction.transaction_type || "Transaction"} · {formatDateLong(selectedTransaction.date)}</p>
              </div>
              <button type="button" onClick={() => setSelectedTransaction(null)} aria-label="Close transaction details" className="rounded-full px-3 py-1 text-2xl leading-none text-gray-500 hover:bg-gray-100">×</button>
            </div>
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
              {transactionDetailFields.map(([key, value]) => (
                <div key={key} className="min-w-0 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">{humanizeKey(key)}</p>
                  <p className="mt-1 break-words text-sm font-semibold text-gray-900">{displayValue(value)}</p>
                </div>
              ))}
            </div>
            <div className="border-t px-4 py-3 text-right">
              <button type="button" onClick={() => setSelectedTransaction(null)} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">Close</button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div role="status" className="fixed bottom-4 right-4 z-[110] max-w-sm rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">
          <div className="flex items-start gap-3">
            <span>{message}</span>
            <button type="button" onClick={() => setMessage("")} aria-label="Dismiss message" className="font-bold">×</button>
          </div>
        </div>
      )}
    </div>
  );
}
