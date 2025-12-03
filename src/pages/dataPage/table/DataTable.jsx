import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { KeenIcon } from '@/components';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon, CalendarRange as CalendarRangeIcon, Calendar as CalendarAllIcon, X, ChevronUp, ChevronDown, ChevronsLeft, ChevronLeft, ChevronsRight, ChevronRight, RotateCcw } from 'lucide-react';
import authService from '@/services/authService';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal';
import { Trash2 } from 'lucide-react';
import CommonTable from '@/components/common/CommonTable';

const API_URL = import.meta.env.VITE_APP_API_URL;

const Toolbar = ({
  searchInput,
  handleSearch,
  clearSearch,
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
  vendorOptions,
  selectedVendor,
  handleVendorChange,
  onPrevDay,
  onNextDay,
  onReset, // add this prop
}) => {
  const displayedRows = filteredData.length;

  const [calendarOpen, setCalendarOpen] = useState(false);

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

  // Helper to format the date display
  const getDateDisplay = () => {
    if (calendarMode === 'range' && dateRange?.from) {
      const from = dateRange.from;
      const to = dateRange.to;
      if (to) {
        // e.g. May 1, 2025 to May 13, 2025
        return `: ${format(from, "MMM d, yyyy")} to ${format(to, "MMM d, yyyy")}`;
      } else {
        // Only from date selected
        return `: from ${format(from, "MMM d, yyyy")}`;
      }
    }
    if (calendarMode === 'single' && selectedDate) {
      // e.g. for May 7th, 2025
      const day = format(selectedDate, "do");
      const monthYear = format(selectedDate, "MMM, yyyy");
      return ` : for ${format(selectedDate, "MMM")} ${day}, ${format(selectedDate, "yyyy")}`;
    }
    return '';
  };

  return (
    <div className="w-full max-w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 px-2 py-3 border-gray-200 dark:border-gray-700 dark:bg-gray-100 dark:text-gray-800">
      <h3 className="font-medium text-sm break-words max-w-full">
        Showing {displayedRows} of {totalUsers} Leads{getDateDisplay()}
      </h3>
      <div className="w-full flex flex-col sm:flex-row flex-wrap items-stretch gap-2 sm:gap-3">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 w-full sm:flex-1 sm:min-w-[220px] md:min-w-[280px] bg-white dark:bg-gray-200 relative min-w-0">
          <KeenIcon icon="magnifier" className="dark:text-gray-800" />
          <input
            type="text"
            placeholder="Search All Leads"
            value={searchInput}
            onChange={handleSearch}
            className="w-full outline-none bg-transparent dark:text-gray-800 dark:placeholder-gray-700 min-w-0"
            style={{ fontSize: "14px" }}
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Clear search"
            >
              <X size={16} className="text-gray-500 dark:text-gray-800" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-stretch gap-2.5 w-full sm:w-auto">
          <Select value={selectedCompany} onValueChange={handleCompanyChange}>
            <SelectTrigger className="w-full sm:w-40 dark:text-gray-800 dark:bg-gray-200 shrink-0">
              <SelectValue placeholder="SO" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {companyOptions.map((company, index) => (
                  <SelectItem key={`company-${index}-${company.value}`} value={company.value}>
                    {company.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={selectedVendor} onValueChange={handleVendorChange}>
            <SelectTrigger className="w-full sm:w-40 dark:text-gray-800 dark:bg-gray-200 shrink-0">
              <SelectValue placeholder="All Vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Vendor</SelectItem>
                {vendorOptions.map((vendor, index) => {
                  const vendorValue = typeof vendor.value === 'object'
                    ? JSON.stringify(vendor.value)
                    : String(vendor.value || '');

                  const vendorLabel = typeof vendor.label === 'object'
                    ? '[Object]'
                    : String(vendor.label || '');

                  return (
                    <SelectItem key={`vendor-${index}-${vendorValue}`} value={vendorValue}>
                      {vendorLabel}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="flex gap-2 flex-wrap items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleCalendarMode}
              className="h-9 w-9 sm:h-10 sm:w-10 dark:text-gray-800 dark:bg-gray-200 shrink-0"
              title={
                calendarMode === 'single'
                  ? "Switch to date range"
                  : calendarMode === 'range'
                    ? "Switch to all leads"
                    : "Switch to single date"
              }
            >
              {getCalendarModeIcon()}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 dark:text-gray-800 dark:bg-gray-200 shrink-0"
              onClick={onPrevDay}
              disabled={calendarMode === 'range'}
              title="Previous Day"
            >
              <ChevronLeft />
            </Button>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-auto justify-start text-left font-normal dark:text-gray-800 dark:bg-gray-200 shrink-0",
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
                    "All Leads"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50 dark:bg-gray-100">
                <div className="p-2 border-b border-gray-100">
                  <button
                    className="w-full text-left p-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-800 transition-colors"
                    onClick={() => {
                      handleDateChange(null);
                    }}
                  >
                    All Leads
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
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 dark:text-gray-800 dark:bg-gray-200 shrink-0"
              onClick={onNextDay}
              disabled={calendarMode === 'range'}
              title="Next Day"
            >
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 dark:text-gray-800 dark:bg-gray-200 shrink-0"
              onClick={onReset}
              title="Reset Filters"
            >
              <RotateCcw />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DataTable = () => {
  const location = useLocation();
  const [searchInput, setSearchInput] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('SO');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [calendarMode, setCalendarMode] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [userData, setUserData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [companyOptions, setCompanyOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [sorting, setSorting] = useState([{ id: 'entDate', desc: true }]);
  const [paramsReady, setParamsReady] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const initialLoadRef = useRef(true);

  useEffect(() => {
    authService.setupAxios();
    fetchCompanyOptions();
    fetchVendorOptions();
  }, []);

  // Initialize component state from URL query params (if present)
  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    const fromDateParam = params.get('FromDate');
    const toDateParam = params.get('ToDate');
    const companyParam = params.get('Company') || params.get('Customer');
    const pageNoParam = params.get('PageNo');
    const pageSizeParam = params.get('PageSize');
    const sortColumnParam = params.get('SortColumn');
    const sortDirectionParam = params.get('SortDirection');

    // Company preselect
    if (companyParam) {
      setSelectedCompany(companyParam);
    } else {
      setSelectedCompany('SO');
    }

    // Dates preselect
    const parseDate = (val) => {
      if (!val) return undefined;
      // If format is yyyy-mm-dd, parse as local date to avoid UTC shift
      const ymdMatch = /^\d{4}-\d{2}-\d{2}$/.test(val);
      if (ymdMatch) {
        const [y, m, d] = val.split('-').map(Number);
        return new Date(y, m - 1, d);
      }
      const dObj = new Date(val);
      return isNaN(dObj.getTime()) ? undefined : dObj;
    };
    const from = parseDate(fromDateParam);
    const to = parseDate(toDateParam);

    if (from && to) {
      if (from.toDateString() === to.toDateString()) {
        setCalendarMode('single');
        setSelectedDate(from);
      } else {
        setCalendarMode('range');
        setDateRange({ from, to });
      }
    } else if (from && !to) {
      setCalendarMode('single');
      setSelectedDate(from);
    } else {
      setCalendarMode('all');
      setSelectedDate(null);
      setDateRange({ from: undefined, to: undefined });
    }

    // Pagination
    if (pageNoParam && !Number.isNaN(Number(pageNoParam))) {
      setPageNo(Number(pageNoParam));
    }
    if (pageSizeParam && !Number.isNaN(Number(pageSizeParam))) {
      setPageSize(Number(pageSizeParam));
    }

    // Sorting
    if (sortColumnParam) {
      const desc = (sortDirectionParam || 'desc').toLowerCase() !== 'asc';
      setSorting([{ id: sortColumnParam, desc }]);
    }

    setParamsReady(true);
  }, [location.search]);

  const handleSearch = useCallback((e) => {
    setSearchInput(e.target.value);

    // Set pageNo to 1, but do NOT call fetchData directly here
    setPageNo(1);
    // Mark that this is no longer initial load
    initialLoadRef.current = false;
    // Let the useEffect on [pageNo, ...] handle the fetch
  }, []);

  const clearSearch = useCallback(() => {
    setSearchInput('');
    setPageNo(1);
    // Mark that this is no longer initial load
    initialLoadRef.current = false;
  }, []);

  const getAuthToken = () => {
    // Try to get token from localStorage or your authService
    // Adjust this logic to match your actual token storage
    return localStorage.getItem('token') || authService.getToken?.() || '';
  };

  const fetchCompanyOptions = useCallback(async () => {
    try {
      authService.setupAxios && authService.setupAxios();
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/Leads/GetAllCompany`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && Array.isArray(response.data)) {
        // Expecting each company to have id and name (adjust if API returns different fields)
        const options = response.data
          .filter(company => company && (company.id || company.companyId || company.company))
          .map(company => ({
            value: company.id || company.companyId || company.company, // prefer id, fallback to companyId or company
            label: company.name || company.company || String(company)
          }));
        setCompanyOptions(options);
      } else {
        console.error('Unexpected company data format:', response.data);
        setCompanyOptions([]);
      }
    } catch (error) {
      console.error('Error fetching company options:', error);
      toast.error('Failed to fetch company options');
      setCompanyOptions([]);
      if (error.response && error.response.status === 401) {
        toast.error('Session expired. Please log in again.');
        authService.logout();
        window.location.href = '/login';
      }
    }
  }, []);

  const fetchVendorOptions = useCallback(async () => {
    try {
      authService.setupAxios && authService.setupAxios();
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/Leads/GetAllVendor`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && Array.isArray(response.data)) {
        const options = response.data
          .filter(vendor => vendor !== null && vendor !== undefined) // Filter out null values
          .map(vendor => ({
            value: typeof vendor === 'object' && vendor.vendor ? vendor.vendor : String(vendor),
            label: typeof vendor === 'object' && vendor.vendor ? vendor.vendor : String(vendor)
          }));
        setVendorOptions(options);
      } else {
        console.error('Unexpected vendor data format:', response.data);
        setVendorOptions([]);
      }
    } catch (error) {
      console.error('Error fetching vendor options:', error);
      toast.error('Failed to fetch vendor options');
      setVendorOptions([]);

      if (error.response && error.response.status === 401) {
        toast.error('Session expired. Please log in again.');
        authService.logout();
        window.location.href = '/login';
      }
    }
  }, []);

  const handleCompanyChange = useCallback((value) => {
    setSelectedCompany(value);
    setPageNo(1);
    // Mark that this is no longer initial load to prevent URL params from overriding user selection
    initialLoadRef.current = false;
  }, []);

  const handleVendorChange = useCallback((value) => {
    setSelectedVendor(value);
    setPageNo(1);
    // Mark that this is no longer initial load
    initialLoadRef.current = false;
  }, []);

  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);
    if (date === null && calendarMode !== 'all') {
      setCalendarMode('all');
    } else if (date !== null && calendarMode === 'all') {
      setCalendarMode('single');
    }

    setPageNo(1);
    // Mark that this is no longer initial load
    initialLoadRef.current = false;
  }, [calendarMode]);

  const handleDateRangeChange = useCallback((range) => {
    setDateRange(range);
    if (range?.from && calendarMode === 'all') {
      setCalendarMode('range');
    }

    if ((range?.from && range?.to) || !range?.from) {
      setPageNo(1);
    }
    // Mark that this is no longer initial load
    initialLoadRef.current = false;
  }, [calendarMode]);

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
      setPageNo(1);
    } else { // 'all'
      setCalendarMode('single');
    }
    // Mark that this is no longer initial load
    initialLoadRef.current = false;
  }, [calendarMode, selectedDate]);

  const fetchData = useCallback(async (searchText = '', company = 'SO', page = 1, size = 10) => {
    try {
      setIsLoading(true);
      const sortColumn = sorting.length > 0 ? sorting[0].id : 'entDate';
      const sortDirection = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc';

      authService.setupAxios && authService.setupAxios();
      const token = getAuthToken();

      const pageNumber = parseInt(page, 10);
      const queryParams = {};
      if (searchText && searchText.trim() !== '') queryParams.Text = searchText.trim();
      
      // Handle company parameter - prioritize dropdown selection over URL params after initial load
      if (company && company !== 'all') {
        queryParams.Company = company;
      }
      
      queryParams.PageNo = pageNumber;
      queryParams.PageSize = parseInt(size, 10);
      queryParams.SortColumn = sortColumn;
      queryParams.SortDirection = sortDirection;

      if (selectedVendor && selectedVendor !== 'all') {
        queryParams.Vendor = selectedVendor;
      }

      if (calendarMode === 'range' && dateRange.from) {
        queryParams.FromDate = new Date(dateRange.from.getTime() - (dateRange.from.getTimezoneOffset() * 60000)).toISOString();
        if (dateRange.to) {
          queryParams.ToDate = new Date(dateRange.to.getTime() - (dateRange.to.getTimezoneOffset() * 60000)).toISOString();
        } else {
          queryParams.ToDate = queryParams.FromDate;
        }
      } else if (calendarMode === 'single' && selectedDate) {
        const dateStr = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString();
        queryParams.FromDate = dateStr;
        queryParams.ToDate = dateStr;
      }

      const response = await axios.get(`${API_URL}/Leads/GetAllLeads`, {
        params: queryParams,
        headers: { Authorization: `Bearer ${token}` }
      });
      let records = [];
      let totalRecordsCount = 0;

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        records = response.data;
        if (records[0].totalRecords !== undefined) {
          totalRecordsCount = records[0].totalRecords;
        } else {
          totalRecordsCount = records.length;
        }
      } else {
        if (response.data && typeof response.data === 'object' && response.data.totalRecords !== undefined) {
          totalRecordsCount = response.data.totalRecords;
          if (response.data.id) {
            records.push(response.data);
          }
        } else if (response.data && Array.isArray(response.data)) {
          records = response.data;
          totalRecordsCount = records.length;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          records = response.data.data;
          totalRecordsCount = response.data.totalRecords || records.length;
        } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
          records = response.data.items;
          totalRecordsCount = response.data.totalRecords || records.length;
        }
      }

      setUserData(records);
      setTotalUsers(totalRecordsCount);
      setIsLoading(false);
      initialLoadRef.current = false; // Mark initial load as done
    } catch (error) {
      console.error('Error fetching All Leads data:', error);
      if (error.config) console.error('Axios config:', error.config);
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
        toast.error(`Failed to fetch All Leads data: ${error.response.status}`);
        if (error.response.status === 401) {
          toast.error('Session expired. Please log in again.');
          authService.logout();
          window.location.href = '/login';
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        toast.error('Network error while fetching All Leads data');
      } else {
        toast.error(`Error: ${error.message}`);
      }
      setIsLoading(false);
    }
  }, [selectedDate, dateRange, calendarMode, sorting, selectedVendor]);

  useEffect(() => {
    if (!paramsReady) return;
    fetchData(searchInput, selectedCompany, pageNo, pageSize);
  }, [fetchData, pageNo, pageSize, searchInput, selectedCompany, sorting, selectedDate, dateRange, calendarMode, selectedVendor, paramsReady]);

  const handleDeleteClick = (row) => {
    setRowToDelete(row);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (rowToDelete) {
      try {
        setIsLoading(true);
        // Use the company value (id/code) for API, not the label
        let companyValue = '';
        if (rowToDelete.company) {
          companyValue = rowToDelete.company;
        } else {
          companyValue = selectedCompany;
        }
        // Call API to delete using query parameters
        await axios.post(`${API_URL}/Leads/DeleteAllLeads?id=${encodeURIComponent(rowToDelete.id)}&company=${encodeURIComponent(companyValue)}`);
        toast.success(`Lead deleted successfully`);
        // Refetch data after delete
        fetchData(searchInput, selectedCompany, pageNo, pageSize);
      } catch (error) {
        console.error('Error deleting lead:', error);
        toast.error('Failed to delete lead');
      } finally {
        setIsLoading(false);
        setShowDeleteConfirm(false);
        setRowToDelete(null);
      }
    } else {
      setShowDeleteConfirm(false);
      setRowToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setRowToDelete(null);
  };

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.no,
        id: 'No',
        header: () => ({ props: { title: "No." } }),
        cell: ({ row }) => row.original.id || 'N/A',
        meta: { headerClassName: 'min-w-[10px] w-10' },
      },
      {
        accessorFn: (row) => row.name,
        id: 'Name',
        header: () => ({ props: { title: "Name" } }),
        cell: ({ row }) => {
          const isValid = row.original.isValid;
          const activityScore = row.original.activityScore;
          return (
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-primary font-bold hover:text-primary-active mb-px">
                  {row.original.name || 'N/A'}
                </span>
                <span className="text-xs text-gray-700 font-normal hover:text-primary-active">
                  {row.original.email || 'N/A'}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-700 font-normal hover:text-primary-active">
                    {row.original.phone || 'N/A'}
                  </span>
                  {activityScore !== undefined && activityScore !== null && activityScore !== '' && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold" style={{ minWidth: 32, textAlign: 'center' }}>
                      {activityScore}
                    </span>
                  )}
                  {typeof isValid === 'boolean' && !isValid && (
                    <span
                      className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700"
                      style={{ minWidth: 48, textAlign: 'center' }}
                    >
                      Invalid
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
        meta: { className: 'min-w-[180px]', cellClassName: 'text-gray-800 font-normal' },
      },
      {
        accessorFn: (row) => row.country,
        id: 'country',
        header: () => ({ props: { title: "Country" } }),
        cell: ({ row }) => {
          const code = row.original.country ? row.original.country.toUpperCase() : null;
          const ip = row.original.entTerm;
          const isProxy = row.original.isProxy;
          const flagUrl = code ? `https://flagcdn.com/24x18/${code.toLowerCase()}.png` : null;
          return code ? (
            <span className="flex flex-row  
             sm:flex-row items-start sm:items-center justify-center gap-1 sm:gap-2 w-full">
              <span className="flex items-center gap-1">
                <img
                  src={flagUrl}
                  alt={code + ' flag'}
                  className="inline-block w-5 h-4 rounded-sm border border-gray-300 bg-white"
                  onError={e => { e.target.onerror = null; e.target.src = 'https://flagcdn.com/24x18/un.png'; }}
                />
                <span className="text-xs font-medium text-gray-800">{code}</span>
              </span>
              {ip && (
                <a
                  href={`https://www.ip2location.com/demo/${ip}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center ml-0 sm:ml-2"
                  title={ip}
                  style={{ minWidth: 18 }}
                >
                  <img
                    src="/media/app/ip-address.png"
                    alt="IP Address Icon"
                    width={18}
                    height={18}
                    style={{ display: 'inline-block' }}
                  />
                </a>
              )}
              {isProxy === true && (
                <span className="ml-0 sm:ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-700" style={{ minWidth: 48, textAlign: 'center' }}>
                  VPN
                </span>
              )}
            </span>
          ) : (
            <span className="text-xs text-gray-400">N/A</span>
          );
        },
        meta: { className: 'min-w-[80px]' },
      },
      {
        accessorFn: (row) => row.salesperson,
        id: 'salesperson',
        header: () => ({ props: { title: "Sales Person" } }),
        cell: ({ row }) => row.original.salesPerson || 'N/A',
        meta: { className: 'min-w-[100px]', cellClassName: 'text-gray-800 font-normal' },
      },
      {
        accessorFn: (row) => row.dispositions,
        id: 'dispositions',
        header: () => ({ props: { title: "dispositions" } }),
        cell: ({ row }) => row.original.dispositions || 'N/A',
        meta: { className: 'min-w-[100px]', cellClassName: 'text-gray-800 font-normal' },
      },
      {
        accessorFn: (row) => row.comments,
        id: 'comments',
        header: () => ({ props: { title: "comments" } }),
        cell: ({ row }) => (
          <div className="w-64 overflow-hidden text-ellipsis">
            {row.original.comments || 'N/A'}
          </div>
        ),
        meta: {
          headerClassName: 'w-64',
          cellClassName: 'text-gray-800 font-normal'
        },
      },
      {
        accessorFn: (row) => row.vendor,
        id: 'vendor',
        header: () => ({ props: { title: "vendor" } }),
        cell: ({ row }) => row.original.vendor || 'N/A',
        meta: { className: 'min-w-[100px]', cellClassName: 'text-gray-800 font-normal' },
      },
      {
        accessorFn: (row) => row.location,
        id: 'location',
        header: () => ({ props: { title: "Location" } }),
        cell: ({ row }) => row.original.location || 'N/A',
        meta: { className: 'min-w-[100px]', cellClassName: 'text-gray-800 font-normal' },
      },
      {
        accessorFn: (row) => row.group,
        id: 'group',
        header: () => ({ props: { title: "Group" } }),
        cell: ({ row }) => row.original.group || 'N/A',
        meta: { className: 'min-w-[100px]', cellClassName: 'text-gray-800 font-normal' },
      },
      {
        accessorFn: (row) => row.entDate,
        id: 'entDate',
        header: () => ({ props: { title: "Date" } }),
        cell: ({ row }) => {
          const date = row.original.entDate ? new Date(row.original.entDate) : null;
          return date ? format(date, 'dd MMM yyyy hh:mm a') : 'N/A';
        },
        meta: { headerClassName: 'min-w-[180px]', cellClassName: 'text-gray-800 font-normal' },
      },
      {
        id: 'action',
        header: () => ({ props: { title: "Action" } }),
        cell: ({ row }) => (
          <div className="flex justify-center items-center w-full">
            <button
              className="p-2 rounded flex items-center justify-center text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-400"
              onClick={() => handleDeleteClick(row.original)}
              title="Delete"
              style={{ lineHeight: 0, background: 'none' }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
        meta: { headerClassName: 'min-w-[80px]', cellClassName: 'text-center' },
      },
    ],
    []
  );
  const totalPages = Math.ceil(totalUsers / pageSize);

  const handlePageChange = (newPage) => {
    setPageNo(newPage);
    // Mark that this is no longer initial load
    initialLoadRef.current = false;
  };

  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    setPageSize(newPageSize);
    setPageNo(1);
    // Mark that this is no longer initial load
    initialLoadRef.current = false;
  };

  // Handlers for previous/next day navigation
  const handlePrevDay = useCallback(() => {
    if (calendarMode === 'single' && selectedDate) {
      const prev = new Date(selectedDate);
      prev.setDate(prev.getDate() - 1);
      setSelectedDate(prev);
      setPageNo(1);
    } else if (calendarMode === 'all') {
      // Switch to single mode and show previous day from today
      const prev = new Date();
      prev.setDate(prev.getDate() - 1);
      setSelectedDate(prev);
      setCalendarMode('single');
      setPageNo(1);
    }
    // Mark that this is no longer initial load
    initialLoadRef.current = false;
    // In range mode, do nothing (button is disabled)
  }, [calendarMode, selectedDate]);

  const handleNextDay = useCallback(() => {
    if (calendarMode === 'single' && selectedDate) {
      const next = new Date(selectedDate);
      next.setDate(next.getDate() + 1);
      setSelectedDate(next);
      setPageNo(1);
    } else if (calendarMode === 'all') {
      // Switch to single mode and show next day from today
      const next = new Date();
      next.setDate(next.getDate() + 1);
      setSelectedDate(next);
      setCalendarMode('single');
      setPageNo(1);
    }
    // Mark that this is no longer initial load
    initialLoadRef.current = false;
    // In range mode, do nothing (button is disabled)
  }, [calendarMode, selectedDate]);

  // Handler to reset all filters, dropdowns, date selections, and pagination
  const handleReset = useCallback(() => {
    setSearchInput('');
    setSelectedCompany('SO');
    setSelectedVendor('all');
    setSelectedDate(null);
    setDateRange({ from: undefined, to: undefined });
    setCalendarMode('all');
    setPageSize(10);
    setPageNo(1);
    setSorting([{ id: 'entDate', desc: true }]);
    setUserData([]);
    setTotalUsers(0);
    // Mark that this is no longer initial load
    initialLoadRef.current = false;
    // Refetch dropdowns
    fetchCompanyOptions();
    fetchVendorOptions();
    // Do NOT call fetchData here; let useEffect handle it after state updates
  }, [fetchCompanyOptions, fetchVendorOptions]);

  return (
    <div className="card shadow-md bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
      <div className="px-3 py-4 border-b border-gray-200 dark:bg-gray-100 dark:border-gray-300">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-800">All Leads</h2>
        <p className="text-sm text-gray-500 dark:text-gray-600 mt-1">
          Track your All Leads data across all companies and all vendors.
        </p>
      </div>
      <Toolbar
        searchInput={searchInput}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
        selectedCompany={selectedCompany}
        handleCompanyChange={handleCompanyChange}
        selectedVendor={selectedVendor}
        handleVendorChange={handleVendorChange}
        selectedDate={selectedDate}
        handleDateChange={handleDateChange}
        dateRange={dateRange}
        handleDateRangeChange={handleDateRangeChange}
        calendarMode={calendarMode}
        toggleCalendarMode={toggleCalendarMode}
        filteredData={userData}
        totalUsers={totalUsers}
        companyOptions={companyOptions}
        vendorOptions={vendorOptions}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onReset={handleReset}
      />
      <div className="grid gap-5 lg:gap-7.5">
        <CommonTable
          columns={columns}
          data={userData}
          sorting={sorting}
          onSortingChange={(newSorting) => {
            setSorting(newSorting);
            setPageNo(1);
            // Mark that this is no longer initial load
            initialLoadRef.current = false;
          }}
          isLoading={isLoading}
          emptyMessage="No All Leads data found. Try adjusting your filters or search criteria."
          pageNo={pageNo}
          pageSize={pageSize}
          total={totalUsers}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
      {showDeleteConfirm && (
        <DeleteConfirmModal
          open={showDeleteConfirm}
          item={{
            ...rowToDelete,
            company: (() => {
              const found = companyOptions.find(opt => String(opt.value) === String(rowToDelete?.company ?? selectedCompany));
              return found ? found.label : (rowToDelete?.company || selectedCompany || 'SO');
            })(),
          }}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          loading={isLoading}
          fields={[
            { label: 'Lead ID', key: 'id' },
            { label: 'Name', key: 'name' },
            { label: 'Company', key: 'company' },
            { label: 'Email', key: 'email' },
          ]}
          title="Confirm Delete"
          description="Are you sure you want to delete this lead? This action cannot be undone."
          confirmText="Delete Lead"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export { DataTable };