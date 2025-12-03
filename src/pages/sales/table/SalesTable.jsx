import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { KeenIcon } from '@/components';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon, CalendarRange as CalendarRangeIcon, Calendar as CalendarAllIcon, X, ChevronLeft, ChevronRight, RotateCcw, MapPin, Calculator, Banknote, CheckCircle2, DollarSign } from 'lucide-react';
import { Check } from 'lucide-react';
import authService from '@/services/authService';
import { Chip } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentIcon from '@mui/icons-material/Payment';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import { CreditCard, ShoppingBag } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CommonTable from '@/components/common/CommonTable';

const API_URL = import.meta.env.VITE_APP_API_URL;

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Toolbar = ({
  searchInput,
  handleSearch,
  clearSearch,
  searchField,
  onChangeSearchField,
  // user search dropdown props
  salespersonOptions,
  salespersonsLoading,
  selectedSalesperson,
  onSelectSalesperson,
  onOpenUserDropdown,
  selectedCompany,
  handleCompanyChange,
  selectedDate,
  handleDateChange,
  dateRange,
  handleDateRangeChange,
  calendarMode,
  toggleCalendarMode,
  filteredData,
  totalUsers,
  companyOptions,
  onReset, // Add this prop
  onSelectSuggestion, // when selecting a suggestion from dropdown
  // user totals props
  userTotals,
  userTotalsLoading,
  // totals toggle
  totalsEnabled,
  onToggleTotals,
}) => {
  const displayedRows = filteredData.length;

  const [calendarOpen, setCalendarOpen] = useState(false);
  // Search suggestions dropdown state
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const prevSuggestionQuery = useRef("");
  // Control opening of user select when 'User' mode chosen
  const [userSelectOpen, setUserSelectOpen] = useState(false);

  // Compute totals from current filteredData (current page)
  const computedTotals = useMemo(() => {
    const normalizeAmount = (a) => {
      if (a === null || a === undefined) return 0;
      if (typeof a === 'number') return a;
      const s = String(a).replace(/[,$₹]/g, '').trim();
      const n = parseFloat(s);
      return Number.isNaN(n) ? 0 : n;
    };
    let countAll = 0;
    let sumDone = 0;
    (filteredData || []).forEach((r) => {
      const rawAmt = r?.paymentAmount ?? r?.PaymentAmount ?? 0;
      const amt = normalizeAmount(rawAmt);
      if (amt !== 0) {
        countAll += 1;
      }
      const status = String(r?.paymentStatus ?? r?.PaymentStatus ?? '').trim().toLowerCase();
      if (status === 'done') {
        sumDone += amt;
      }
    });
    return { countAll, sumDone };
  }, [filteredData]);

  const formatMoney = useCallback((n) => {
    return Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, []);


  const handleDateSelect = (date) => {
    handleDateChange(date);
    setCalendarOpen(false);
  };

  const handleDateRangeSelect = (range) => {
    if (range?.from) {
      handleDateRangeChange(range);
      if (range.to) {
        setCalendarOpen(false);
      }
    }
  };

  const getCalendarModeIcon = () => {
    switch (calendarMode) {
      case 'single':
        return <CalendarIcon className="h-4 w-4" />;
      case 'range':
        return <CalendarRangeIcon className="h-4 w-4" />;
      case 'all':
        return <CalendarAllIcon className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  // Add: Helper to format date range/single date for display
  const getDateDisplay = () => {
    if (calendarMode === 'range' && dateRange?.from) {
      const from = dateRange.from;
      const to = dateRange.to || dateRange.from;
      if (from && to) {
        const fromStr = format(from, "MMM d, yyyy");
        const toStr = format(to, "MMM d, yyyy");
        if (fromStr === toStr) {
          return `for ${format(from, "MMM do, yyyy")}`;
        }
        return `from ${fromStr} to ${toStr}`;
      }
      if (from) {
        return `from ${format(from, "MMM d, yyyy")}`;
      }
    }
    if (calendarMode === 'single' && selectedDate) {
      return ` : for ${format(selectedDate, "MMM do, yyyy")}`;
    }
    return null;
  };

  // Updated: Handlers for previous/next day navigation
  const handlePrevDay = () => {
    if (calendarMode === 'single' && selectedDate) {
      const prev = new Date(selectedDate);
      prev.setDate(prev.getDate() - 1);
      handleDateChange(prev);
    } else if (calendarMode === 'all') {
      // Go to previous day from today
      const prev = new Date();
      prev.setHours(0, 0, 0, 0);
      prev.setDate(prev.getDate() - 1);
      handleDateChange(prev);
    }
  };
  const handleNextDay = () => {
    if (calendarMode === 'single' && selectedDate) {
      const next = new Date(selectedDate);
      next.setDate(next.getDate() + 1);
      handleDateChange(next);
    } else if (calendarMode === 'all') {
      // Go to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      handleDateChange(today);
    }
  };

  // No suggestions now
  const canToggleTotals = (searchField === 'user') && !!selectedSalesperson;

  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-2 border-b border-gray-200 px-3 md:px-5 py-4 items-start md:items-center justify-between dark:bg-gray-100">
      <h3 className="font-medium text-sm dark:text-gray-800 mb-2 md:mb-0">
        Showing {displayedRows} of {totalUsers} Sales
        {/* Add date display after the count */}
        {getDateDisplay() && (
          <span>
            {getDateDisplay()}
          </span>
        )}
      </h3>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 lg:gap-5 w-full md:w-auto">
        <div className="flex items-center gap-2 border rounded-lg px-2 py-1 w-full sm:w-64 dark:bg-gray-200 relative">
          <Popover open={searchDropdownOpen} onOpenChange={setSearchDropdownOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-200/70 transition-colors"
                aria-label="Open search suggestions"
                onClick={() => setSearchDropdownOpen((o) => !o)}
              >
                <KeenIcon icon="magnifier" className="dark:text-gray-800" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[250px] p-0 shadow-lg">
              <div className="p-1">
                {[{ key: 'text', label: 'Text' }, { key: 'transaction', label: 'Transaction ID' }, { key: 'card', label: 'Card' }, { key: 'user', label: 'User' }].map(opt => (
                  <button
                    key={opt.key}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-gray-100 ${searchField === opt.key ? 'text-gray-900' : 'text-gray-700'}`}
                    onClick={() => {
                      setSearchDropdownOpen(false);
                      onChangeSearchField?.(opt.key);
                      if (opt.key === 'user') {
                        // Slight delay to ensure Select renders before opening
                        setTimeout(() => setUserSelectOpen(true), 0);
                      } else {
                        setUserSelectOpen(false);
                      }
                    }}
                  >
                    <span>{opt.label}</span>
                    {searchField === opt.key && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
              {/* Suggestions removed: dropdown now only shows mode selector */}
            </PopoverContent>
          </Popover>
          {searchField === 'user' ? (
            <div className="w-full">
              <Select
                value={selectedSalesperson || ''}
                onValueChange={(val) => { setUserSelectOpen(false); onSelectSalesperson?.(val); }}
                open={userSelectOpen}
                onOpenChange={(open) => {
                  setUserSelectOpen(open);
                  if (open) {
                    // fetch if we don't have options yet for current filters
                    onOpenUserDropdown?.();
                  }
                }}
                disabled={salespersonsLoading}
              >
                <SelectTrigger className="w-full dark:text-gray-800">
                  <SelectValue placeholder={salespersonsLoading ? 'Loading users…' : 'Select user'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(salespersonOptions || []).map((opt, idx) => (
                      <SelectItem key={`sp-${idx}-${opt.value}`} value={String(opt.value)}>
                        {String(opt.label)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <input
              type="text"
              placeholder={
                searchField === 'transaction' ? 'Search by Transaction ID' :
                  searchField === 'card' ? 'Search by Card' :
                    'Search Sales'
              }
              value={searchInput}
              onChange={handleSearch}
              className="w-full outline-none bg-transparent dark:text-gray-800 dark:placeholder-gray-700"
              style={{ fontSize: "14px" }}
            />
          )}
          {searchInput && searchField !== 'user' && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Clear search"
            >
              <X size={16} className="text-gray-500 dark:text-gray-700" />
            </button>
          )}
        </div>
        {/* Totals master switch: only show after selecting a User in dropdown */}
        {searchField === 'user' && !!selectedSalesperson && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2 py-1 rounded-md border bg-white shadow-sm dark:bg-gray-200">
              <Calculator className="w-4 h-4 text-gray-700" />
              <span className="text-sm text-gray-700">Summary</span>
              <button
                type="button"
                role="switch"
                aria-checked={!!totalsEnabled}
                aria-disabled={!canToggleTotals}
                disabled={!canToggleTotals}
                title={!canToggleTotals ? 'Select a user to enable totals' : 'Toggle totals'}
                onClick={() => {
                  if (!canToggleTotals) return;
                  onToggleTotals(!totalsEnabled);
                }}
                className={cn(
                  "relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400",
                  !canToggleTotals ? "bg-gray-200 opacity-60 cursor-not-allowed" : (totalsEnabled ? "bg-emerald-500" : "bg-gray-300")
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                    totalsEnabled ? "translate-x-5" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto items-center">
          <Select value={selectedCompany} onValueChange={handleCompanyChange}>
            <SelectTrigger className="w-full sm:w-40 dark:text-gray-800">
              <SelectValue placeholder="QS" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {companyOptions.map((company, index) => {
                  const companyValue = typeof company.value === 'object'
                    ? JSON.stringify(company.value)
                    : String(company.value || '');

                  const companyLabel = typeof company.label === 'object'
                    ? '[Object]'
                    : String(company.label || '');

                  return (
                    <SelectItem key={`company-${index}-${companyValue}`} value={companyValue}>
                      {companyLabel}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleCalendarMode}
              className="w-10 h-10 dark:text-gray-800"
              title={
                calendarMode === 'single'
                  ? "Switch to date range"
                  : calendarMode === 'range'
                    ? "Switch to all sales"
                    : "Switch to single date"
              }
            >
              {getCalendarModeIcon()}
            </Button>
            {/* Updated: Previous day button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevDay}
              className="w-10 h-10 dark:text-gray-800"
              disabled={calendarMode === 'range'}
              title="Previous day"
            >
              <ChevronLeft />
            </Button>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-auto justify-start text-left font-normal dark:text-gray-800",
                    (calendarMode === 'all') && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {calendarMode === 'range' ? (
                    dateRange?.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, "dd MMM")} - ${format(dateRange.to, "dd MMM")}`
                      ) : (
                        `${format(dateRange.from, "dd MMM")} - ?`
                      )
                    ) : (
                      "Select date range"
                    )
                  ) : calendarMode === 'single' ? (
                    selectedDate ? format(selectedDate, "dd MMM yyyy") : "Select date"
                  ) : (
                    "All Sales"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <div className="p-2 border-b border-gray-100">
                  <button
                    className="w-full text-left p-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      handleDateChange(null);
                    }}
                  >
                    All Sales
                  </button>
                </div>
                {calendarMode === 'range' ? (
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateRangeSelect}
                    initialFocus
                  />
                ) : (
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                )}
              </PopoverContent>
            </Popover>
            {/* Updated: Next day button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextDay}
              className="w-10 h-10 dark:text-gray-800"
              disabled={calendarMode === 'range'}
              title="Next day"
            >
              <ChevronRight />
            </Button>
            {/* Add: Reset button */}
            <Button
              variant="outline"
              size="icon"
              onClick={onReset}
              className="w-10 h-10 dark:text-gray-800"
              title="Reset all filters"
            >
              <RotateCcw />
            </Button>
          </div>
        </div>
      </div>
      {/* Bottom totals bar (professional, no gradients) */}
      {totalsEnabled && (
        <div className="w-full mt-3 pt-2 border-t border-gray-200">
          {searchField === 'user' && selectedSalesperson ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calculator className="w-4 h-4 text-gray-600" />
                <span>Summary for</span>
                <span className="font-medium text-gray-900">{selectedSalesperson}</span>
              </div>
              {userTotalsLoading ? (
                <div className="text-sm text-gray-600">Calculating…</div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-md border bg-white shadow-sm flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-blue-600" />
                    <div className="flex items-baseline gap-2">
                      {/* <span className="text-gray-600 text-sm">Count</span> */}
                      <span className="text-gray-900 font-semibold">{Number(userTotals?.countAll || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-md border bg-white shadow-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <div className="flex items-baseline gap-2">
                      {/* <span className="text-gray-600 text-sm">Total</span> */}
                      <span className="text-gray-900 font-semibold">{formatMoney(userTotals?.sumDone || 0)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calculator className="w-4 h-4 text-gray-600" />
                <span>Page totals</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-md border bg-white shadow-sm flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-blue-600" />
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-600 text-sm">Count</span>
                    <span className="text-gray-900 font-semibold">{computedTotals.countAll.toLocaleString()}</span>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-md border bg-white shadow-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-600 text-sm">Total Paid</span>
                    <span className="text-gray-900 font-semibold">{formatMoney(computedTotals.sumDone)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SalesTable = () => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('QS');
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [calendarMode, setCalendarMode] = useState('all');
  const [userData, setUserData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [sorting, setSorting] = useState([{ id: 'PaymentDate', desc: true }]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [companyDataLoaded, setCompanyDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchField, setSearchField] = useState('text');
  // Totals master toggle
  const [totalsEnabled, setTotalsEnabled] = useState(false);
  // Salesperson dropdown state for 'user' search mode
  const [salespersonsLoading, setSalespersonsLoading] = useState(false);
  const [salespersonOptions, setSalespersonOptions] = useState([]);
  const [selectedSalesperson, setSelectedSalesperson] = useState(null);
  const salespersonsCacheRef = useRef(new Map());
  const activeRequest = useRef(null);
  const pendingRequest = useRef(null);
  // user totals state
  const [userTotals, setUserTotals] = useState({ countAll: 0, sumDone: 0 });
  const [userTotalsLoading, setUserTotalsLoading] = useState(false);
  const userTotalsReqIdRef = useRef(0);
  const userTotalsInFlightRef = useRef(false);
  const [filters, setFilters] = useState({
    searchText: '',
    company: 'QS',
    page: 1,
    pageSize: 10,
    sortColumn: 'PaymentDate',
    sortDirection: 'desc',
    dateFrom: null,
    dateTo: null
  });
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const debouncedSearchText = useDebounce(searchInput, 500);
  const initialRender = useRef(true);
  const initialCompany = 'QS';
  const initialFilters = {
    searchText: '',
    company: initialCompany,
    page: 1,
    pageSize: 10,
    sortColumn: 'PaymentDate',
    sortDirection: 'desc',
    dateFrom: null,
    dateTo: null
  };

  const fetchOptionsData = useCallback(async () => {
    if (companyDataLoaded) return;

    try {
      authService.setupAxios();
      const companyResponse = await axios.get(`${API_URL}/Leads/GetAllCompany`);
      if (companyResponse.data && Array.isArray(companyResponse.data)) {
        const options = companyResponse.data
          .filter(company => company !== null)
          .map(company => ({
            value: typeof company === 'object' && company.company ? company.company : String(company),
            label: typeof company === 'object' && company.company ? company.company : String(company)
          }));
        setCompanyOptions(options);
      } else {
        console.error('Unexpected company data format:', companyResponse.data);
        setCompanyOptions([]);
      }
      setCompanyDataLoaded(true);
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
      toast.error('Failed to fetch dropdown options');

      if (error.response && error.response.status === 401) {
        toast.error('Session expired. Please log in again.');
        authService.logout();
        window.location.href = '/login';
      }
      throw error;
    }
  }, [companyDataLoaded]);

  const fetchData = useCallback(async () => {
    const requestId = JSON.stringify(filters);

    if (activeRequest.current === requestId) {
      return;
    }

    if (activeRequest.current) {
      pendingRequest.current = { ...filters };
      return;
    }

    activeRequest.current = requestId;
    setIsLoading(true);

    try {
      authService.setupAxios();
      const queryParams = {
        // Default text search for compatibility
        Text: searchField === 'text' ? filters.searchText.trim() : '',
        Company: filters.company,
        PageNo: searchField === 'user' ? 1 : filters.page,
        // Use normal page size to avoid lag; fetching "all" can be provided via export or explicit action
        PageSize: filters.pageSize,
        SortColumn: filters.sortColumn,
        SortDirection: filters.sortDirection
      };
      // Add field-specific params
      if (searchField === 'transaction') {
        queryParams.TransactionId = filters.searchText.trim();
      } else if (searchField === 'card') {
        queryParams.Card = filters.searchText.trim();
      } else if (searchField === 'user') {
        queryParams.SalesUser = filters.searchText.trim();
        // also set Text empty to avoid server mixing
        queryParams.Text = '';
      }
      if (filters.dateFrom) {
        queryParams.FromDate = filters.dateFrom;
        queryParams.ToDate = filters.dateTo || filters.dateFrom;
      }
  // Removed URL query string updates to keep URL clean

      const response = await axios.get(`${API_URL}/Sales/GetSalesBycompany`, { params: queryParams });
      let records = [];
      let totalRecordsCount = 0;

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        records = response.data;
        if (records[0].totalRecords !== undefined) {
          totalRecordsCount = records[0].totalRecords;
        } else {
          totalRecordsCount = records.length;
        }
      } else if (response.data && typeof response.data === 'object') {
        if (response.data.totalRecords !== undefined) {
          totalRecordsCount = response.data.totalRecords;
          if (response.data.id) {
            records.push(response.data);
          }
        } else if (response.data.data && Array.isArray(response.data.data)) {
          records = response.data.data;
          totalRecordsCount = response.data.totalRecords || records.length;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          records = response.data.items;
          totalRecordsCount = response.data.totalRecords || records.length;
        } else if (Array.isArray(response.data)) {
          records = response.data;
          totalRecordsCount = records.length;
        }
      }
      setUserData(records);
      setTotalUsers(totalRecordsCount);
    } catch (error) {
      console.error('Error fetching sales data:', error);

      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Session expired. Please log in again.');
          authService.logout();
          window.location.href = '/login';
        } else {
          toast.error(`Failed to fetch sales data: ${error.response.status}`);
        }
      } else if (error.request) {
        toast.error('Network error while fetching sales data');
      } else {
        toast.error(`Error: ${error.message}`);
      }
      setUserData([]);
      setTotalUsers(0);
    } finally {
      setIsLoading(false);
      activeRequest.current = null;
      if (pendingRequest.current) {
        const nextRequest = { ...pendingRequest.current };
        pendingRequest.current = null;
        setTimeout(() => {
          setFilters(nextRequest);
        }, 0);
      }
    }
  }, [filters]);

  const updateFilters = useCallback((newFilterValues) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, ...newFilterValues };
      if (newFilterValues.page !== undefined) {
        setPageNo(newFilterValues.page);
      }
      if (newFilterValues.pageSize !== undefined) {
        setPageSize(newFilterValues.pageSize);
      }
      return updatedFilters;
    });
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchInput(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchInput('');
    // If currently in 'user' mode, also clear selected salesperson and filter
    setSelectedSalesperson(null);
    updateFilters({ searchText: '', page: 1 });
  }, [updateFilters]);

  const handleFilterChange = useCallback((filterName, value) => {
    if (filterName === 'company') {
      setSelectedCompany(value);
    }
    updateFilters({ [filterName]: value, page: 1 });
  }, [updateFilters]);

  const handleSearchFieldChange = useCallback((field) => {
    setSearchField(field);
    if (field === 'user') {
      // Auto-fetch is handled by an effect when in 'user' mode
    } else {
      setSelectedSalesperson(null);
    }
  }, []);

  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);

    if (date === null && calendarMode !== 'all') {
      setCalendarMode('all');
      updateFilters({ dateFrom: null, dateTo: null, page: 1 });
    } else if (date !== null) {
      if (calendarMode === 'all') {
        setCalendarMode('single');
      }

      const dateStr = date ? new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString() : null;
      updateFilters({ dateFrom: dateStr, dateTo: dateStr, page: 1 });
    }
  }, [calendarMode, updateFilters]);

  const handleDateRangeChange = useCallback((range) => {
    setDateRange(range);
    if (range?.from && calendarMode === 'all') {
      setCalendarMode('range');
    }
    if ((range?.from && range?.to) || !range?.from) {
      const fromStr = range?.from ?
        new Date(range.from.getTime() - (range.from.getTimezoneOffset() * 60000)).toISOString() : null;
      const toStr = range?.to ?
        new Date(range.to.getTime() - (range.to.getTimezoneOffset() * 60000)).toISOString() : fromStr;

      updateFilters({ dateFrom: fromStr, dateTo: toStr, page: 1 });
    }
  }, [calendarMode, updateFilters]);

  const toggleCalendarMode = useCallback(() => {
    if (calendarMode === 'single') {
      setCalendarMode('range');
      if (selectedDate) {
        setDateRange({ from: selectedDate, to: undefined });
      }
    } else if (calendarMode === 'range') {
      setCalendarMode('all');
      setSelectedDate(null);
      setDateRange({ from: undefined, to: undefined });
      updateFilters({ dateFrom: null, dateTo: null, page: 1 });
    } else {
      setCalendarMode('single');
    }
  }, [calendarMode, selectedDate, updateFilters]);

  // Fetch all salespersons for current filters to populate the dropdown
  const fetchSalespersons = useCallback(async () => {
    try {
      setSalespersonsLoading(true);
      authService.setupAxios();
      const cacheKey = JSON.stringify({ c: filters.company, f: filters.dateFrom, t: filters.dateTo });
      if (salespersonsCacheRef.current.has(cacheKey)) {
        setSalespersonOptions(salespersonsCacheRef.current.get(cacheKey));
        return;
      }
      const params = {
        Company: filters.company,
        PageNo: 1,
        PageSize: 500, // limit to reduce lag; adjust as needed
        SortColumn: filters.sortColumn,
        SortDirection: filters.sortDirection,
      };
      if (filters.dateFrom) {
        params.FromDate = filters.dateFrom;
        params.ToDate = filters.dateTo || filters.dateFrom;
      }
      const resp = await axios.get(`${API_URL}/Sales/GetSalesBycompany`, { params });
      const list = Array.isArray(resp.data) ? resp.data : (resp.data?.data || resp.data?.items || []);
      const map = new Map();
      (list || []).forEach(item => {
        const username = String(item?.username || item?.userName || '').trim();
        const salesPerson = String(item?.salesPerson || '').trim();
        const key = username || salesPerson;
        if (!key) return;
        if (!map.has(key)) {
          map.set(key, { value: username || salesPerson, label: salesPerson || username });
        }
      });
      const options = Array.from(map.values()).sort((a, b) => String(a.label).localeCompare(String(b.label)));
      setSalespersonOptions(options);
      salespersonsCacheRef.current.set(cacheKey, options);
    } catch (e) {
      console.error('Failed to fetch salespersons', e);
      setSalespersonOptions([]);
    } finally {
      setSalespersonsLoading(false);
    }
  }, [filters]);

  const handleOpenUserDropdown = useCallback(() => {
    // Only fetch if no options in cache for current filter combo
    const cacheKey = JSON.stringify({ c: filters.company, f: filters.dateFrom, t: filters.dateTo });
    if (!salespersonsCacheRef.current.has(cacheKey)) {
      fetchSalespersons();
    } else {
      setSalespersonOptions(salespersonsCacheRef.current.get(cacheKey));
    }
  }, [filters, fetchSalespersons]);

  // Keep salesperson list fresh if filters change while in 'user' mode
  // Only refetch when cache key changes and user opens the dropdown; we keep effect minimal
  useEffect(() => {
    if (searchField === 'user' && !salespersonsLoading && (!salespersonOptions || salespersonOptions.length === 0)) {
      fetchSalespersons();
    }
  }, [searchField, salespersonsLoading, salespersonOptions, fetchSalespersons]);

  const handleSelectSalesperson = useCallback((value) => {
    const val = String(value || '').trim(); // this should be username from Select value
    setSelectedSalesperson(val);
    // Ensure we're in user mode and update filters
    if (searchField !== 'user') setSearchField('user');
    updateFilters({ searchText: val, page: 1 });
  }, [searchField, updateFilters]);

  // Helper: compute totals from an array of rows
  const computeTotalsFromList = useCallback((list) => {
    const normalizeAmount = (a) => {
      if (a === null || a === undefined) return 0;
      if (typeof a === 'number') return a;
      const s = String(a).replace(/[,$₹]/g, '').trim();
      const n = parseFloat(s);
      return Number.isNaN(n) ? 0 : n;
    };
    let countAll = 0;
    let sumDone = 0;
    (list || []).forEach((r) => {
      const rawAmt = r?.paymentAmount ?? r?.PaymentAmount ?? 0;
      const amt = normalizeAmount(rawAmt);
      if (amt !== 0) countAll += 1;
      const status = String(r?.paymentStatus ?? r?.PaymentStatus ?? '').trim().toLowerCase();
      if (status === 'done') sumDone += amt;
    });
    return { countAll, sumDone };
  }, []);

  // Fetch totals for selected user across all pages (server-paginated)
  const fetchUserTotals = useCallback(async () => {
    if (searchField !== 'user' || !filters.searchText) return;
    if (userTotalsInFlightRef.current) return; // single-flight guard
    try {
      userTotalsInFlightRef.current = true;
      // bump request id to invalidate earlier runs
      const myReqId = ++userTotalsReqIdRef.current;
      setUserTotalsLoading(true);
      authService.setupAxios();
      // Paginate through all results to compute totals accurately
      const pageSize = 10000; // balance between speed and payload
      let pageNoLocal = 1;
      let aggregated = { countAll: 0, sumDone: 0 };
      let totalRecords = Infinity;
      let fetched = 0;

      const buildParams = () => {
        const p = {
          Company: filters.company,
          SalesUser: filters.searchText.trim(),
          PageNo: pageNoLocal,
          PageSize: pageSize,
          SortColumn: filters.sortColumn,
          SortDirection: filters.sortDirection,
        };
        if (filters.dateFrom) {
          p.FromDate = filters.dateFrom;
          p.ToDate = filters.dateTo || filters.dateFrom;
        }
        return p;
      };

      const parseResponse = (data) => {
        let list = [];
        let total = undefined;
        if (Array.isArray(data)) {
          list = data;
          // sometimes totalRecords may be on first row
          if (data[0]?.totalRecords !== undefined) total = data[0].totalRecords;
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.data)) {
            list = data.data;
            total = data.totalRecords ?? data.total ?? data.count ?? list.length;
          } else if (Array.isArray(data.items)) {
            list = data.items;
            total = data.totalRecords ?? data.total ?? data.count ?? list.length;
          } else if (data.id) {
            list = [data];
            total = data.totalRecords ?? 1;
          }
          if (total === undefined && data.totalRecords !== undefined) total = data.totalRecords;
        }
        return { list, totalRecords: total };
      };

      while (fetched < totalRecords) {
        // if a newer request started, stop
        if (myReqId !== userTotalsReqIdRef.current) break;
        const resp = await axios.get(`${API_URL}/Sales/GetSalesBycompany`, { params: buildParams() });
        const { list, totalRecords: respTotal } = parseResponse(resp.data);
        const partial = computeTotalsFromList(list);
        aggregated.countAll += partial.countAll;
        aggregated.sumDone += partial.sumDone;
        fetched += list.length;
        if (respTotal !== undefined) {
          totalRecords = respTotal;
        }
        if (list.length < pageSize) {
          break; // no more pages
        }
        pageNoLocal += 1;
        // safety cap to prevent infinite loops
        if (pageNoLocal > 200) break;
      }
      // only apply if still latest
      if (myReqId === userTotalsReqIdRef.current) {
        setUserTotals(aggregated);
      }
    } catch (e) {
      console.error('Failed to compute user totals', e);
      setUserTotals({ countAll: 0, sumDone: 0 });
    } finally {
      setUserTotalsLoading(false);
      userTotalsInFlightRef.current = false;
    }
  }, [filters, searchField, computeTotalsFromList]);

  const handleSortingChange = useCallback((newSorting) => {
    setSorting(newSorting);

    if (newSorting.length > 0) {
      updateFilters({
        sortColumn: newSorting[0].id,
        sortDirection: newSorting[0].desc ? 'desc' : 'asc',
        page: 1
      });
    }
  }, [updateFilters]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage < 1) return;

    updateFilters({ page: newPage });
  }, [updateFilters]);

  const handlePageSizeChange = useCallback((e) => {
    const newPageSize = parseInt(e.target.value);
    updateFilters({ pageSize: newPageSize, page: 1 });
  }, [updateFilters]);

  const handleReset = useCallback(() => {
    setSearchInput('');
    setSearchField('text');
    setSelectedCompany(initialCompany);
    setSelectedDate(null);
    setDateRange({ from: undefined, to: undefined });
    setCalendarMode('all');
    setPageNo(1);
    setPageSize(10);
    setSorting([{ id: 'PaymentDate', desc: true }]);
    setFilters({ ...initialFilters });
  }, []);

  // When user picks a suggestion (transaction id or user), set search and trigger filters
  const handleSelectSuggestion = useCallback((value, mode) => {
    const val = String(value || '').trim();
    setSearchInput(val);
    if (mode) setSearchField(mode);
    updateFilters({ searchText: val, page: 1 });
  }, [updateFilters]);

  // Ensure re-enabling totals immediately triggers recompute for user mode
  const handleToggleTotals = useCallback((nextEnabled) => {
    setTotalsEnabled(nextEnabled);
    if (nextEnabled && searchField === 'user' && filters.searchText) {
      // fire a fetch immediately so UI shows results without waiting solely on effect
      fetchUserTotals();
    }
  }, [searchField, filters.searchText, fetchUserTotals]);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      setIsLoading(true);
      authService.setupAxios();
      try {
        await fetchOptionsData();

  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  // Remove any query string from the URL after reading it
  try { window.history.replaceState(null, '', window.location.pathname); } catch (_) {}

        if (Object.keys(params).length > 0) {
          const updatedFilters = { ...filters };

          if (params.FromDate) {
            updatedFilters.dateFrom = params.FromDate;
            const fromDate = new Date(params.FromDate);
            if (!isNaN(fromDate.getTime())) {
              setSelectedDate(fromDate);
              setCalendarMode('single');

              if (params.ToDate && params.ToDate !== params.FromDate) {
                updatedFilters.dateTo = params.ToDate;
                const toDate = new Date(params.ToDate);
                if (!isNaN(toDate.getTime())) {
                  setDateRange({ from: fromDate, to: toDate });
                  setCalendarMode('range');
                  setSelectedDate(null);
                }
              } else if (params.ToDate) {
                updatedFilters.dateTo = params.ToDate;
              }
            }
          }

          if (params.Company && params.Company !== 'all') {
            updatedFilters.company = params.Company;
            setSelectedCompany(params.Company);
          } else if (params.Company === 'all' || params.Company === '') {
            updatedFilters.company = initialCompany;
            setSelectedCompany(initialCompany);
          }

          if (params.PageNo) {
            updatedFilters.page = parseInt(params.PageNo);
            setPageNo(parseInt(params.PageNo));
          }

          if (params.PageSize) {
            updatedFilters.pageSize = parseInt(params.PageSize);
            setPageSize(parseInt(params.PageSize));
          }

          if (params.SalesUser) {
            const user = String(params.SalesUser).trim();
            updatedFilters.searchText = user;
            setSearchField('user');
            setSelectedSalesperson(user);
          }

          if (params.SortColumn) {
            updatedFilters.sortColumn = params.SortColumn;

            if (params.SortDirection) {
              updatedFilters.sortDirection = params.SortDirection;
              setSorting([{
                id: params.SortColumn,
                desc: params.SortDirection.toLowerCase() === 'desc'
              }]);
            }
          }

          setFilters(updatedFilters);
        }

        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error during initialization:', error);
        if (isMounted) {
          toast.error('Failed to initialize. Please refresh the page.');
        }
        setInitialLoadComplete(true);
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (searchField !== 'user') {
      updateFilters({ searchText: debouncedSearchText, page: 1 });
    }
  }, [debouncedSearchText, updateFilters, searchField]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    if (initialLoadComplete) {
      const fetchTimer = setTimeout(() => {
        fetchData();
      }, 50);

      return () => clearTimeout(fetchTimer);
    }
  }, [filters, initialLoadComplete, fetchData]);

  // Recompute user totals when user filter/date/company changes and in user mode
  useEffect(() => {
    if (totalsEnabled && (searchField === 'user') && filters.searchText) {
      fetchUserTotals();
    } else {
      setUserTotals({ countAll: 0, sumDone: 0 });
    }
  }, [totalsEnabled, searchField, filters.company, filters.dateFrom, filters.dateTo, filters.searchText, fetchUserTotals]);

  // Auto-disable totals when not in user mode or no user selected
  useEffect(() => {
    const canEnable = (searchField === 'user') && !!selectedSalesperson;
    if (!canEnable && totalsEnabled) {
      setTotalsEnabled(false);
    }
  }, [searchField, selectedSalesperson, totalsEnabled]);

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.no,
        id: 'No',
        header: () => ({ props: { title: "No." } }),
        enableSorting: true,
        cell: ({ row }) => row.original.id || 'N/A',
        meta: { headerClassName: 'min-w-[10px] w-10' },
      },
      {
        accessorFn: (row) => row.name,
        id: 'Name',
        header: () => ({ props: { title: "Name" } }),
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4 overflow-hidden" style={{ width: '250px' }}>
              <div className="flex flex-col gap-0.5">
                <div className='flex gap-2 items-center'>
                  <span className="text-sm text-primary font-bold hover:text-primary-active mb-px">
                    {row.original.name || 'N/A'}
                  </span>
                  <span className="text-xs text-gray-700 font-normal hover:text-primary-active ">
                    {!row.original.customerStatus ? <CancelIcon sx={{ fontSize: '14px', display: 'flex', alignContent: 'center' }} className='text-danger small text-2sm' /> : ''}
                  </span>
                </div>
                <span className="text-xs text-gray-700 font-normal hover:text-primary-active">
                  {row.original.email || 'N/A'}
                </span>
                <div className='flex'>
                  <span className="text-xs text-gray-700 font-normal hover:text-primary-active">
                    {row.original.phoneNo1 || 'N/A'}&nbsp;
                  </span>
                  <span className="text-xs text-gray-700 font-normal hover:text-primary-active">
                    {row.original.phoneNo2 === null ? '' : `- ${row.original.phoneNo2}`}
                  </span>
                </div>
                <div className="flex mt-2 gap-3">
                  {row.original.kindOfSale != 'New' ? <Chip label='RENEW' color="warning" size="small" sx={{ fontSize: '0.6rem' }} className='text font-bold' /> : ''}
                  {row.original.cancelled == true ? <Chip label='CANCELLED ' color="secondary" size="small" sx={{ fontSize: '0.6rem' }} className='text font-bold' /> : ''}
                </div>
              </div>
            </div>
          );
        },
        meta: { className: 'min-w-[300px]', cellClassName: 'text-gray-800 font-normal' },
      },
      {
        accessorFn: (row) => row.address,
        id: 'address',
        header: () => ({ props: { title: "Address" } }),
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4 overflow-hidden" style={{ width: '250px' }}>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px">
                  {row.original.address || 'N/A'}
                </span>
                <div className='flex'>
                  <span className="text-xs text-gray-700 font-normal hover:text-primary-active">
                    {row.original.city || 'N/A'},&nbsp;
                  </span>
                  <span className="text-xs text-gray-700 font-normal hover:text-primary-active">
                    {row.original.state || 'N/A'}
                  </span>
                </div>
                <span className="text-xs text-gray-700 font-normal hover:text-primary-active">
                  {row.original.zipCode || 'N/A'}
                </span>
              </div>
            </div>
          );
        },
        meta: { className: 'min-w-[300px]', cellClassName: 'text-gray-800 font-normal' },
      },
      {
        accessorFn: (row) => row.salesperson,
        id: 'salesperson',
        header: () => ({ props: { title: "Sales Person" } }),
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4 overflow-hidden" style={{ width: '150px' }}>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-primary font-bold hover:text-primary-active mb-px">
                  {row.original.salesPerson || 'N/A'}
                </span>
                <span className="text-xs text-gray-700 font-normal hover:text-primary-active">
                  {row.original.username || 'N/A'}
                </span>
                {row.original.location && (
                  <span className="text-xs text-gray-700 font-normal hover:text-primary-active flex items-center gap-1">
                    <MapPin size={15} />{row.original.location}
                  </span>
                )}
              </div>
            </div>
          );
        },
        meta: { className: 'min-w-[100px]', cellClassName: 'text-gray-800 font-normal' },
      },
      {
        accessorFn: (row) => row.payments,
        id: 'payments',
        header: () => ({ props: { title: "Payments" } }),
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4 overflow-hidden" style={{ width: '140px' }}>
              <div className="flex flex-col gap-0.5 w-100">
                <span className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px gap-1 flex items-center">
                  <ReceiptIcon sx={{ fontSize: '14px' }} />{row.original.salesAmount || '0'}
                </span>
                <div className='flex justify-between gap-3' style={{ width: '90px' }}>
                  <span className="text-xs text-gray-700 font-normal hover:text-primary-active gap-1 flex items-center">
                    <PaymentsIcon sx={{ fontSize: '14px' }} />{row.original.paymentAmount || '0'}
                  </span>
                  <span className="text-xs text-success font-bold hover:text-success-active flex items-center">
                    {row.original.paymentStatus || 'N/A'}
                  </span>
                </div>
                <span className="text-xs text-gray-700 font-normal hover:text-primary-active w-64 gap-1 flex items-center">
                  <LocalGroceryStoreIcon sx={{ fontSize: '14px' }} />{row.original.gateway || 'N/A'}
                </span>
                <span className="text-xs text-gray-700 font-normal hover:text-primary-active gap-1 flex items-center">
                  <CorporateFareIcon sx={{ fontSize: '14px' }} />{row.original.brand || 'N/A'}
                </span>
              </div>
            </div>
          );
        },
        meta: { className: 'min-w-[190px]', cellClassName: 'text-gray-800 font-normal' },
      },
      {
        accessorFn: (row) => row.PaymentDate,
        id: 'PaymentDetails',
        header: () => ({ props: { title: "Payment Details" } }),
        enableSorting: true,
        cell: ({ row }) => {
          const { paymentType, cardNumber, transactionId, accountNo, routingNo } = row.original;

          return (
            <div className="flex items-center gap-4 overflow-hidden" style={{ width: '130px' }}>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px">
                  {paymentType || 'N/A'}
                </span>
                {['card', 'paypal'].includes(paymentType?.toLowerCase()) && (
                  <>
                    <span className="text-xs text-gray-700 font-normal hover:text-primary-active gap-1 flex items-center">
                      <PaymentIcon sx={{ fontSize: '14px' }} />{cardNumber || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-700 font-normal hover:text-primary-active gap-1 flex items-center">
                      <ReceiptIcon sx={{ fontSize: '14px' }} />{transactionId || 'N/A'}
                    </span>
                  </>
                )}

                {paymentType?.toLowerCase() === 'cheque' && (
                  <>
                    <span className="text-xs text-gray-700 font-normal hover:text-primary-active gap-1 flex items-center">
                      <AccountBalanceIcon sx={{ fontSize: '14px' }} />{accountNo || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-700 font-normal hover:text-primary-active gap-1 flex items-center">
                      <ReceiptIcon sx={{ fontSize: '14px' }} />{routingNo || 'N/A'}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        },
        meta: { headerClassName: 'min-w-[120px]', cellClassName: 'text-gray-800 font-normal' },
      },
      {
        accessorFn: (row) => row.PaymentDate,
        id: 'PaymentDate',
        header: () => ({ props: { title: "Date" } }),
        enableSorting: true,
        cell: ({ row }) => {
          const paymentDate = row.original.paymentDate ? new Date(row.original.paymentDate) : null;
          const salesDate = row.original.salesDate ? new Date(row.original.salesDate) : null;

          const formattedPaymentDate = paymentDate ? format(paymentDate, 'dd MMM yyyy hh:mm a') : 'N/A';
          const formattedSalesDate = salesDate ? format(salesDate, 'dd MMM yyyy hh:mm a') : 'N/A';

          return (
            <div className="rounded-lg border border-gray-200 p-4 shadow-sm bg-white dark:bg-gray-200">
              <div className="flex flex-col space-y-3 w-[200px]">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                    <CreditCard size={16} className="text-green-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-green-600">Payment</span>
                    <span className="text-sm text-gray-700">{formattedPaymentDate}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100">
                    <ShoppingBag size={16} className="text-amber-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-amber-500">Sale</span>
                    <span className="text-sm text-gray-700">{formattedSalesDate}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        },
        meta: { headerClassName: 'min-w-[180px]', cellClassName: 'font-normal' },
      }
    ],
    []
  );
  return (
    <div className="card shadow-md bg-white rounded-lg overflow-hidden">
      <div className="px-3 md:px-5 py-4 border-b border-gray-200 dark:bg-gray-100 dark:border-gray-300">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-800">Sales</h2>
        <p className="text-sm text-gray-500 dark:text-gray-600 mt-1">
          Track your sales data across all companies
        </p>
      </div>
      <Toolbar
        searchInput={searchInput}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
        searchField={searchField}
        onChangeSearchField={handleSearchFieldChange}
        salespersonOptions={salespersonOptions}
        salespersonsLoading={salespersonsLoading}
        selectedSalesperson={selectedSalesperson}
        onSelectSalesperson={handleSelectSalesperson}
        onOpenUserDropdown={handleOpenUserDropdown}
        selectedCompany={selectedCompany}
        handleCompanyChange={(value) => handleFilterChange('company', value)}
        selectedDate={selectedDate}
        handleDateChange={handleDateChange}
        dateRange={dateRange}
        handleDateRangeChange={handleDateRangeChange}
        calendarMode={calendarMode}
        toggleCalendarMode={toggleCalendarMode}
        filteredData={userData}
        totalUsers={totalUsers}
        companyOptions={companyOptions}
        onReset={handleReset} // Pass reset handler
        onSelectSuggestion={handleSelectSuggestion}
        userTotals={userTotals}
        userTotalsLoading={userTotalsLoading}
        totalsEnabled={totalsEnabled}
        onToggleTotals={handleToggleTotals}
      />
      <div className="grid gap-5 lg:gap-7.5">
        <CommonTable
          columns={columns}
          data={userData}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          isLoading={isLoading}
          emptyMessage="No sales data found. Try adjusting your filters or search criteria."
          pageNo={pageNo}
          pageSize={pageSize}
          total={totalUsers}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
};

export { SalesTable };