import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { KeenIcon } from '@/components';
import { toast } from 'sonner';
import axios from 'axios';
import { format, parse } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon, CalendarRange as CalendarRangeIcon, Calendar as CalendarAllIcon, X, ChevronUp, ChevronDown, ChevronsRight, ChevronRight, ChevronLeft, ChevronsLeft, RotateCcw, Trash2 } from 'lucide-react';
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
import CommonTable from '@/components/common/CommonTable';

const API_URL = import.meta.env.VITE_APP_API_URL;

const getDateDisplayText = (calendarMode, selectedDate, dateRange) => {
  if (calendarMode === 'range' && dateRange?.from) {
    const from = dateRange.from;
    const to = dateRange.to || dateRange.from;
    const fromStr = format(from, "MMM d, yyyy");
    const toStr = format(to, "MMM d, yyyy");
    if (fromStr === toStr) {
      // fallback to single date
      return `for ${formatWithOrdinal(from)}`;
    }
    return `from ${fromStr} to ${toStr}`;
  }
  if (calendarMode === 'single' && selectedDate) {
    return `for ${formatWithOrdinal(selectedDate)}`;
  }
  return '';
};

// Helper to add ordinal suffix to day
function formatWithOrdinal(date) {
  const day = date.getDate();
  const ordinal =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th';
  return `${format(date, "MMM d")}${ordinal}, ${format(date, "yyyy")}`;
}

const Toolbar = ({
  searchInput,
  handleSearch,
  clearSearch,
  selectedCustomer,
  handleCustomerChange,
  selectedVendor,
  handleVendorChange,
  selectedDate,
  handleDateChange,
  dateRange,
  handleDateRangeChange,
  calendarMode,
  toggleCalendarMode,
  filteredData,
  totalUsers,
  vendorOptions,
  customerOptions,
  onPrevDay,
  onNextDay,
  handleReset // <-- add this line
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

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2 border-b border-gray-200 px-4 py-3 items-start sm:items-center justify-between dark:bg-gray-100 dark:border-gray-300">
      <h3 className="font-medium text-sm dark:text-gray-800 w-full sm:w-auto min-w-0">
        Showing {displayedRows} of {totalUsers} Leads
        {(() => {
          const text = getDateDisplayText(calendarMode, selectedDate, dateRange);
          return text ? <> : <span className="font-normal">{text}</span></> : null;
        })()}
      </h3>
      <div className="flex flex-col sm:flex-row flex-wrap w-full sm:w-auto gap-2 lg:gap-3 min-w-0">
        <div className="flex items-center gap-2 border rounded-lg px-2 py-1 w-full sm:w-64 dark:bg-gray-200 relative min-w-0">
          <KeenIcon icon="magnifier" className="dark:text-gray-800 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search Leads"
            value={searchInput}
            onChange={handleSearch}
            className="w-full outline-none bg-transparent dark:text-gray-800 min-w-0"
            style={{ fontSize: "14px" }}
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
              aria-label="Clear search"
            >
              <X size={16} className="text-gray-500 dark:text-gray-700" />
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto min-w-0">
          <Select value={selectedCustomer} onValueChange={handleCustomerChange}>
            <SelectTrigger className="w-full sm:w-36 dark:text-gray-800 dark:bg-gray-200 min-w-0">
              <SelectValue placeholder="All Customer" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-100 dark:text-gray-800">
              <SelectGroup>
                <SelectItem value="all">All Customer</SelectItem>
                {customerOptions.map((customer) => (
                  <SelectItem key={customer.value} value={customer.value}>
                    {customer.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={selectedVendor} onValueChange={handleVendorChange}>
            <SelectTrigger className="w-full sm:w-36 dark:text-gray-800 dark:bg-gray-200 min-w-0">
              <SelectValue placeholder="All Vendor" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-100 dark:text-gray-800">
              <SelectGroup>
                <SelectItem value="all">All Vendor</SelectItem>
                {vendorOptions.map((vendor) => (
                  <SelectItem key={vendor.value} value={vendor.value}>
                    {vendor.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="flex gap-0.5 justify-between items-center flex-wrap min-w-0">

            <Button
              variant="outline"
              size="icon"
              onClick={toggleCalendarMode}
              className="w-10 h-10 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300 flex-shrink-0"
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
              className="w-10 h-10 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300 flex-shrink-0"
              title="Previous Day"
              onClick={onPrevDay}
              disabled={calendarMode === 'range'}
            >
              <ChevronLeft />
            </Button>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-auto justify-start text-left font-normal dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300 min-w-0",
                    (calendarMode === 'all') && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
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
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 dark:bg-gray-100 dark:text-gray-800 dark:border-gray-300">
                <div className="p-2 border-b border-gray-100 dark:border-gray-300">
                  <button
                    className="w-full text-left p-2 text-sm rounded-md hover:bg-gray-100 transition-colors dark:hover:bg-gray-200 dark:text-gray-800"
                    onClick={() => {
                      handleDateChange(null);
                      setCalendarOpen(false);
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
                    className="dark:bg-gray-100 dark:text-gray-800"
                  />
                ) : (
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="dark:bg-gray-100 dark:text-gray-800"
                  />
                )}
              </PopoverContent>

              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300 flex-shrink-0"
                title="Next Day"
                onClick={onNextDay}
                disabled={calendarMode === 'range'}
              >
                <ChevronRight />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300 flex-shrink-0"
                title="Reset Filters"
                onClick={handleReset}
              >
                <RotateCcw />
              </Button>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};

const Table = () => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [calendarMode, setCalendarMode] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [displayData, setDisplayData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  const [vendorOptions, setVendorOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);

  const [sorting, setSorting] = useState([{ id: 'entDate', desc: true }]);

  const shouldFetchRef = useRef(false);
  const fetchParamsRef = useRef({
    date: null,
    range: { from: undefined, to: undefined },
    mode: 'all'
  });

  // Fix: declare refs with const
  const initializedRef = useRef(false);
  const apiCallInProgressRef = useRef(false);
  const customerFromURLRef = useRef(null);
  const resettingRef = useRef(false);
  const clearingSearchRef = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [toggleOn, setToggleOn] = useState(false);
  const [isToggleLoading, setIsToggleLoading] = useState(false);

  useEffect(() => {
    authService.setupAxios();
  }, []);

  useEffect(() => {
    // Initialize the component as ready to fetch data
    initializedRef.current = true;

    fetchParamsRef.current = {
      ...fetchParamsRef.current,
      searchText: searchInput,
      customerFromURL: null
    };

    shouldFetchRef.current = true;
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchCustomerOptions(),
        fetchVendorOptions()
      ]);
      
      // Fetch toggle status
      fetchToggleStatus();

      if (shouldFetchRef.current && !apiCallInProgressRef.current) {
        fetchData();
      }
    };

    initializeData();
  }, []);

  const fetchData = useCallback(async () => {
    if (apiCallInProgressRef.current) {
      return;
    }

    apiCallInProgressRef.current = true;
    setIsLoading(true);
    const { date, range, mode, searchText, customerFromURL } = fetchParamsRef.current;

    try {
      const effectiveCustomer = customerFromURL || selectedCustomer;
      const sortColumn = sorting.length > 0 ? sorting[0].id : 'entDate';
      const sortDirection = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc';

      authService.setupAxios();

      const queryParams = {
        Text: searchText !== undefined ? searchText : searchInput,
        Customer: effectiveCustomer !== 'all' ? effectiveCustomer : '',
        Vendor: selectedVendor !== 'all' ? selectedVendor : '',
        PageNo: pageNo,
        PageSize: pageSize,
        SortColumn: sortColumn,
        SortDirection: sortDirection
      };

      if (mode === 'range' && range.from) {
        queryParams.FromDate = new Date(range.from.getTime() - (range.from.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        if (range.to) {
          queryParams.ToDate = new Date(range.to.getTime() - (range.to.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        } else {
          queryParams.ToDate = queryParams.FromDate;
        }
      } else if (mode === 'single' && date) {
        const dateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        queryParams.FromDate = dateStr;
        queryParams.ToDate = dateStr;
      }

      const response = await axios.get(`${API_URL}/Leads/GetLLMLeads`, { params: queryParams });

      let responseData = [];
      let totalRecords = 0;

      if (response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          responseData = response.data.data;
          totalRecords = response.data.totalRecords || response.data.data.length;
        }
        else if (response.data.items && Array.isArray(response.data.items)) {
          responseData = response.data.items;
          totalRecords = response.data.totalRecords || response.data.items.length;
        }
        else if (response.data.data && response.data.data.items && Array.isArray(response.data.data.items)) {
          responseData = response.data.data.items;
          totalRecords = response.data.data.totalRecords || response.data.data.items.length;
        }
        else if (Array.isArray(response.data)) {
          if (response.data.length === 0) {
            responseData = [];
            totalRecords = 0;
          }
          else if (response.data.length > 0 && response.data[0].id) {
            responseData = response.data;
            totalRecords = response.data[0].totalRecords || response.data.length;
          }
          else {
            responseData = response.data;
            totalRecords = response.data.length;
          }
        }
        else if (typeof response.data === 'string' && response.data.includes('{"id":')) {
          try {
            const cleanedData = '[' + response.data.replace(/},\s*$/, '}]');
            const parsedData = JSON.parse(cleanedData);
            responseData = parsedData;
            totalRecords = parsedData[0]?.totalRecords || parsedData.length;
          } catch (e) {
            console.error('Error parsing data string:', e);
            responseData = [];
            totalRecords = 0;
          }
        }
        else if (response.data.totalRecords !== undefined) {
          const dataArray = [];

          if (response.data.id) {
            dataArray.push({
              id: response.data.id,
              name: response.data.name,
              email: response.data.email,
              phone: response.data.phone,
              customer: response.data.customer,
              vendor: response.data.vendor,
              entTerm: response.data.entTerm,
              assignDate: response.data.assignDate,
              entDate: response.data.entDate
            });
          }

          responseData = dataArray;
          totalRecords = response.data.totalRecords || dataArray.length;
        } else {
          responseData = [];
          totalRecords = 0;
        }
      } else {
        responseData = [];
        totalRecords = 0;
      }

      setDisplayData(responseData);

      setTotalUsers(totalRecords);

      if (customerFromURL) {
        fetchParamsRef.current = {
          ...fetchParamsRef.current,
          customerFromURL: null
        };
      }

    } catch (error) {
      console.error('Error fetching leads data:', error);
      console.error('API request failed with params:', fetchParamsRef.current);

      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }

      if (error.response && error.response.status === 401) {
        toast.error('Session expired. Please log in again.');
        authService.logout();
        window.location.href = '/login';
      } else {
        toast.error('Failed to fetch leads data');
      }

      setDisplayData([]);
      setTotalUsers(0);
    } finally {
      shouldFetchRef.current = false;
      apiCallInProgressRef.current = false;
      setIsLoading(false);
    }
  }, [selectedCustomer, selectedVendor, pageNo, pageSize, sorting]);

  useEffect(() => {
    if (initializedRef.current) {
      shouldFetchRef.current = true;
      fetchData();
    }
  }, [fetchData]);

  // Debounced search effect
  useEffect(() => {
    if (!initializedRef.current || clearingSearchRef.current) return;
    
    const timeoutId = setTimeout(() => {
      if (searchInput !== fetchParamsRef.current.searchText) {
        fetchParamsRef.current.searchText = searchInput;
        shouldFetchRef.current = true;
        fetchData();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchInput, fetchData]);

  const fetchCustomerOptions = useCallback(async () => {
    try {
      authService.setupAxios();

      const response = await axios.get(`${API_URL}/Leads/GetLMMCustomer`);

      if (response.data && Array.isArray(response.data)) {
        const options = response.data
          .filter(customer => customer !== null && customer !== undefined)
          .map(customer => ({
            value: customer?.id || customer?.code || customer?.value || String(customer) || '',
            label: customer?.name || customer?.label || String(customer) || 'Unknown'
          }))
          .filter(option => option.value !== '' && option.label !== 'null' && option.label !== 'undefined' && option.label !== null);
        setCustomerOptions(options);
      } else if (response.data && typeof response.data === 'object') {
        const customerData = response.data.items || response.data.data || [];
        const options = customerData
          .filter(customer => customer !== null && customer !== undefined)
          .map(customer => ({
            value: customer?.id || customer?.code || customer?.value || String(customer) || '',
            label: customer?.name || customer?.label || String(customer) || 'Unknown'
          }))
          .filter(option => option.value !== '' && option.label !== 'null' && option.label !== 'undefined' && option.label !== null);
        setCustomerOptions(options);
      } else {
        console.error('Unexpected customer data format:', response.data);
        setCustomerOptions([]);
      }
    } catch (error) {
      console.error('Error fetching customer options:', error);
      toast.error('Failed to fetch customer options');
      setCustomerOptions([]);

      if (error.response && error.response.status === 401) {
        toast.error('Session expired. Please log in again.');
        authService.logout();
        window.location.href = '/login';
      }
    }
  }, []);

  const fetchVendorOptions = useCallback(async () => {
    try {
      authService.setupAxios();

      const response = await axios.get(`${API_URL}/Leads/GetLMMVendor`);

      if (response.data && Array.isArray(response.data)) {
        const options = response.data
          .filter(vendor => vendor !== null && vendor !== undefined)
          .map(vendor => ({
            value: vendor?.id || vendor?.code || vendor?.value || String(vendor) || '',
            label: vendor?.name || vendor?.label || String(vendor) || 'Unknown'
          }))
          .filter(option => option.value !== '' && option.label !== 'null' && option.label !== 'undefined' && option.label !== null);
        setVendorOptions(options);
      } else if (response.data && typeof response.data === 'object') {
        const vendorData = response.data.items || response.data.data || [];
        const options = vendorData
          .filter(vendor => vendor !== null && vendor !== undefined)
          .map(vendor => ({
            value: vendor?.id || vendor?.code || vendor?.value || String(vendor) || '',
            label: vendor?.name || vendor?.label || String(vendor) || 'Unknown'
          }))
          .filter(option => option.value !== '' && option.label !== 'null' && option.label !== 'undefined' && option.label !== null);
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

  const fetchToggleStatus = useCallback(async () => {
    try {
      authService.setupAxios();
      
      const response = await axios.post(`${API_URL}/Leads/GetLLMLeadStatus`);
      
      if (response.data !== undefined) {
        setToggleOn(response.data.isActive || response.data.status || response.data || false);
      }
    } catch (error) {
      console.error('Error fetching LLM lead status:', error);
      // Don't show error toast for status fetch as it's not critical
      
      if (error.response && error.response.status === 401) {
        toast.error('Session expired. Please log in again.');
        authService.logout();
        window.location.href = '/login';
      }
    }
  }, []);

  const handleSearch = useCallback((e) => {
    const searchValue = e.target.value;
    setSearchInput(searchValue);
    setPageNo(1); // Reset to first page when searching
  }, []);

  const clearSearch = useCallback(() => {
    clearingSearchRef.current = true;
    setSearchInput('');
    setPageNo(1);
    // Immediately update fetchParamsRef and trigger fetch for clear search
    fetchParamsRef.current = {
      ...fetchParamsRef.current,
      searchText: ''
    };
    shouldFetchRef.current = true;
    fetchData().finally(() => {
      clearingSearchRef.current = false;
    });
  }, [fetchData]);

  const handleCustomerChange = useCallback((value) => {
    setSelectedCustomer(value);
    setPageNo(1);
    setSelectedVendor('all');
    shouldFetchRef.current = true;
  }, []);

  const handleVendorChange = useCallback((value) => {
    setSelectedVendor(value);
    setPageNo(1);
    shouldFetchRef.current = true;
  }, []);

  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);

    if (date === null) {
      setCalendarMode('all');
    } else {
      setCalendarMode('single');
    }

    setPageNo(1);

    fetchParamsRef.current = {
      ...fetchParamsRef.current,
      date,
      mode: date ? 'single' : 'all'
    };

    shouldFetchRef.current = true;
  }, []);

  const handleDateRangeChange = useCallback((range) => {
    setDateRange(range);
    if (range?.from && calendarMode === 'all') {
      setCalendarMode('range');
    }

    setPageNo(1);

    fetchParamsRef.current = {
      ...fetchParamsRef.current,
      range,
      mode: range?.from ? 'range' : 'all'
    };

    if ((range?.from && range?.to) || !range?.from) {
      shouldFetchRef.current = true;
    }
  }, [calendarMode]);

  const toggleCalendarMode = useCallback(() => {
    if (calendarMode === 'single') {
      setCalendarMode('range');
      if (selectedDate) {
        const newRange = { from: selectedDate, to: undefined };
        setDateRange(newRange);

        fetchParamsRef.current = {
          ...fetchParamsRef.current,
          range: newRange,
          mode: 'range'
        };
      }
    } else if (calendarMode === 'range') {
      setCalendarMode('all');
      setSelectedDate(null);
      setDateRange({ from: undefined, to: undefined });
      setPageNo(1);

      fetchParamsRef.current = {
        ...fetchParamsRef.current,
        date: null,
        range: { from: undefined, to: undefined },
        mode: 'all'
      };

      shouldFetchRef.current = true;
    } else {
      setCalendarMode('single');
    }
  }, [calendarMode, selectedDate]);

  useEffect(() => {
    if (initializedRef.current) {
      // Only trigger fetch if not just reset
      if (!shouldFetchRef.current && !resettingRef.current) {
        setPageNo(1);
        shouldFetchRef.current = true;
      }
      // Reset the flag after effect runs
      if (resettingRef.current) resettingRef.current = false;
    }
  }, [sorting]);

  // Add effect to fetch data when pageNo or pageSize changes
  useEffect(() => {
    if (initializedRef.current) {
      shouldFetchRef.current = true;
      fetchData();
    }
  }, [pageNo, pageSize, fetchData]);

  // Effect to handle filter changes (customer, vendor, dates, sorting)
  useEffect(() => {
    if (initializedRef.current && shouldFetchRef.current && !apiCallInProgressRef.current) {
      fetchData();
    }
  }, [selectedCustomer, selectedVendor, selectedDate, dateRange, calendarMode, sorting, fetchData]);

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.id || row.no,
        id: 'No',
        header: () => <div className="w-full text-center">No.</div>,
        cell: ({ row }) => (
          <div className="text-center w-full">{row.original.id || row.original.no || 'N/A'}</div>
        ),
        meta: { headerClassName: 'min-w-[10px] w-10 text-center', cellClassName: 'text-center' },
      },
      {
        accessorFn: (row) => row.name,
        id: 'Name',
        header: () => ({ props: { title: "Name" } }),
        cell: ({ row }) => {
          const isValid = row.original.isValid;
          const activityScore = row.original.activityScore;
          const showActivityScore = activityScore !== undefined && activityScore !== null && activityScore !== '';
          return (
            <div className="flex items-center gap-4 overflow-hidden" style={{ width: '250px' }}>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-primary hover:text-primary-active mb-px">
                  {row.original.name || 'N/A'}
                </span>
                <span className="text-xs text-gray-700 font-normal hover:text-primary-active">
                  {row.original.email || 'N/A'}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-700 font-normal hover:text-primary-active">
                    {row.original.phone || 'N/A'}
                  </span>
                  {showActivityScore && (
                    <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700" style={{ minWidth: 32, textAlign: 'center' }}>
                      {activityScore}
                    </span>
                  )}
                  {isValid === false && (
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
        meta: { className: 'min-w-[300px]', cellClassName: 'text-gray-800 font-normal' },
      },
      {
        accessorFn: (row) => row.country,
        id: 'country',
        header: () => <div className="w-full text-center">Country</div>,
        cell: ({ row }) => {
          const code = row.original.country;
          const activityScore = row.original.activityScore;
          const isProxy = row.original.isProxy;
          const ip = row.original.entTerm;
          if (!code) return 'N/A';
          const countryCode = code.toLowerCase();
          const flagUrl = `https://flagcdn.com/24x18/${countryCode}.png`;
          return (
            <span className="flex flex-row sm:flex-row items-start sm:items-center justify-center gap-1 sm:gap-2 w-full">
              <span className="flex items-center gap-1">
                <img
                  src={flagUrl}
                  alt={code.toUpperCase() + ' flag'}
                  style={{ width: 24, height: 18, objectFit: 'cover', borderRadius: 2, boxShadow: '0 0 1px #888' }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <span className="text-xs font-medium">{code.toUpperCase()}</span>
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
                <span className="ml-0 sm:ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700" style={{ minWidth: 48, textAlign: 'center' }}>
                  VPN
                </span>
              )}
            </span>
          );
        },
        meta: { headerClassName: 'min-w-[80px] text-center', cellClassName: 'text-center' },
      },
      {
        accessorFn: (row) => row.leadType,
        id: 'leadType',
        header: () => <div className="w-full text-center">Lead Type</div>,
        cell: ({ row }) => (
          <div className="text-center w-full">{row.original.leadType || 'N/A'}</div>
        ),
        meta: { headerClassName: 'min-w-[120px] text-center', cellClassName: 'text-center' },
      },
      {
        accessorFn: (row) => row.customer,
        id: 'customer',
        header: () => <div className="w-full text-center">Customer</div>,
        cell: ({ row }) => (
          <div className="text-center w-full">{row.original.customer || 'N/A'}</div>
        ),
        meta: { headerClassName: 'min-w-[120px] text-center', cellClassName: 'text-center' },
      },
      {
        accessorFn: (row) => row.vendor,
        id: 'vendor',
        header: () => <div className="w-full text-center">Vendor</div>,
        cell: ({ row }) => (
          <div className="text-center w-full">{row.original.vendor || 'N/A'}</div>
        ),
        meta: { headerClassName: 'min-w-[120px] text-center', cellClassName: 'text-center' },
      },
      {
        accessorFn: (row) => row.entDate,
        id: 'entDate',
        header: () => <div className="w-full text-center">Date</div>,
        cell: ({ row }) => {
          const date = row.original.entDate ? new Date(row.original.entDate) : null;
          return <div className="text-center w-full">{date ? format(date, 'dd MMM yyyy hh:mm a') : 'N/A'}</div>;
        },
        meta: { headerClassName: 'min-w-[180px] text-center', cellClassName: 'text-center' },
      },
      {
        id: 'action',
        header: () => <div className="w-full text-center">Action</div>,
        cell: ({ row }) => (
          <div className="flex justify-center items-center w-full">
            <button
              className="p-2 rounded flex items-center justify-center text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-400"
              onClick={() => handleDeleteClick(row.original)}
              title="Delete"
              style={{ lineHeight: 0, background: 'none' }}
            >
              <Trash2 size={18} className="text-red-600 hover:text-red-700 font-bold" />
            </button>
          </div>
        ),
        meta: { headerClassName: 'min-w-[80px] text-center', cellClassName: 'text-center' },
      },
    ],
    []
  );

  const handlePrevDay = useCallback(() => {
    if (calendarMode === 'single' && selectedDate) {
      const prev = new Date(selectedDate);
      prev.setDate(prev.getDate() - 1);
      setSelectedDate(prev);
      setPageNo(1);
      fetchParamsRef.current = {
        ...fetchParamsRef.current,
        date: prev,
        mode: 'single'
      };
      shouldFetchRef.current = true;
    } else if (calendarMode === 'range' && dateRange?.from) {
      // Move both from/to back by 1 day if both exist, else just from
      const from = new Date(dateRange.from);
      from.setDate(from.getDate() - 1);
      let to = dateRange.to ? new Date(dateRange.to) : undefined;
      if (to) {
        to.setDate(to.getDate() - 1);
      }
      const newRange = { from, to };
      setDateRange(newRange);
      setPageNo(1);
      fetchParamsRef.current = {
        ...fetchParamsRef.current,
        range: newRange,
        mode: 'range'
      };
      shouldFetchRef.current = true;
    } else if (calendarMode === 'all') {
      // Switch to single mode and show previous day from today
      const prev = new Date();
      prev.setDate(prev.getDate() - 1);
      setSelectedDate(prev);
      setCalendarMode('single');
      setPageNo(1);
      fetchParamsRef.current = {
        ...fetchParamsRef.current,
        date: prev,
        mode: 'single'
      };
      shouldFetchRef.current = true;
    }
  }, [calendarMode, selectedDate, dateRange]);

  const handleNextDay = useCallback(() => {
    if (calendarMode === 'single' && selectedDate) {
      const next = new Date(selectedDate);
      next.setDate(next.getDate() + 1);
      setSelectedDate(next);
      setPageNo(1);
      fetchParamsRef.current = {
        ...fetchParamsRef.current,
        date: next,
        mode: 'single'
      };
      shouldFetchRef.current = true;
    } else if (calendarMode === 'range' && dateRange?.from) {
      // Move both from/to forward by 1 day if both exist, else just from
      const from = new Date(dateRange.from);
      from.setDate(from.getDate() + 1);
      let to = dateRange.to ? new Date(dateRange.to) : undefined;
      if (to) {
        to.setDate(to.getDate() + 1);
      }
      const newRange = { from, to };
      setDateRange(newRange);
      setPageNo(1);
      fetchParamsRef.current = {
        ...fetchParamsRef.current,
        range: newRange,
        mode: 'range'
      };
      shouldFetchRef.current = true;
    }
  }, [calendarMode, selectedDate, dateRange]);

  const handleReset = useCallback(() => {
    resettingRef.current = true;
    setPageNo(1);
    setPageSize(10);
    setSearchInput('');
    setSelectedCustomer('all');
    setSelectedVendor('all');
    setSelectedDate(null);
    setDateRange({ from: undefined, to: undefined });
    setCalendarMode('all');
    setSorting([{ id: 'entDate', desc: true }]);
    fetchParamsRef.current = {
      date: null,
      range: { from: undefined, to: undefined },
      mode: 'all',
      searchText: '',
      customerFromURL: null
    };
    shouldFetchRef.current = true;
    
    // Re-fetch options and data
    Promise.all([fetchCustomerOptions(), fetchVendorOptions()]).then(() => {
      if (resettingRef.current) resettingRef.current = false;
    });
  }, [fetchCustomerOptions, fetchVendorOptions]);

  const handleToggleStatus = async () => {
    try {
      setIsToggleLoading(true);
      authService.setupAxios();
      
      // Call the API to update the LLM leads status
      await axios.post(`${API_URL}/Leads/LLMLeadOnOff`, null, {
        params: { 
          isActive: !toggleOn // Send the new status value
        }
      });
      
      // Update the local state only after successful API call
      setToggleOn(!toggleOn);
      toast.success(`LLM Leads ${!toggleOn ? 'activated' : 'deactivated'} successfully`);
      
      // Optionally refresh the data after status change
      shouldFetchRef.current = true;
      fetchData();
    } catch (error) {
      toast.error('Failed to update LLM leads status');
      console.error('LLMLeadsOnOff error:', error);
      
      if (error.response && error.response.status === 401) {
        toast.error('Session expired. Please log in again.');
        authService.logout();
        window.location.href = '/login';
      }
    } finally {
      setIsToggleLoading(false);
    }
  };

  const handleDeleteClick = (row) => {
    setRowToDelete(row);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (rowToDelete) {
      try {
        setIsLoading(true);
        // Call the API to delete the lead (POST method)
        await axios.post(`${API_URL}/Leads/DeleteLMMLeads`, null, {
          params: { id: rowToDelete.id }
        });
        toast.success('Lead deleted successfully');
        // Optionally, you may want to refresh the data after deletion
        shouldFetchRef.current = true;
        fetchData();
      } catch (error) {
        toast.error('Failed to delete lead');
        console.error('DeleteLeads error:', error);
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

  const handlePageChange = useCallback((newPageNo) => {
    setPageNo(newPageNo);
  }, []);

  const handlePageSizeChange = useCallback((e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setPageNo(1);
  }, []);

  return (
    <div className="card shadow-md bg-white rounded-lg overflow-hidden dark:bg-gray-100">
      <div className="px-5 py-4 border-b border-gray-200 dark:bg-gray-100 dark:border-gray-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-800">Leads</h2>
            <p className="text-sm text-gray-500 dark:text-gray-600 mt-1">
              Track your Leads data across all companies and all vendors.
            </p>
          </div>
          {/* Toggle Button for LLM Leads On/Off - Moved to right side */}
          <div className="flex items-center flex-shrink-0">
            <span className="mr-2 text-sm text-gray-700 dark:text-gray-800 whitespace-nowrap">LLM Leads Status:</span>
            <button
              type="button"
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${toggleOn ? 'bg-green-500' : 'bg-gray-300'}`}
              onClick={handleToggleStatus}
              disabled={isToggleLoading}
              title={`Click to ${toggleOn ? 'deactivate' : 'activate'} LLM leads`}
            >
              {isToggleLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${toggleOn ? 'translate-x-6' : 'translate-x-1'}`}
                />
              )}
            </button>
            <span className={`ml-2 text-sm font-medium ${toggleOn ? 'text-green-600' : 'text-gray-500'} dark:text-gray-700`}>
              {toggleOn ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

      </div>
      <div className="flex flex-col w-full">
        <Toolbar
          searchInput={searchInput}
          handleSearch={handleSearch}
          clearSearch={clearSearch}
          selectedCustomer={selectedCustomer}
          handleCustomerChange={handleCustomerChange}
          selectedVendor={selectedVendor}
          handleVendorChange={handleVendorChange}
          selectedDate={selectedDate}
          handleDateChange={handleDateChange}
          dateRange={dateRange}
          handleDateRangeChange={handleDateRangeChange}
          calendarMode={calendarMode}
          toggleCalendarMode={toggleCalendarMode}
          filteredData={displayData}
          totalUsers={totalUsers}
          vendorOptions={vendorOptions}
          customerOptions={customerOptions}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          handleReset={handleReset} // <-- add this line
        />

        <div className="grid gap-5 lg:gap-7.5">
          <CommonTable
            columns={columns}
            data={displayData}
            sorting={sorting}
            isLoading={isLoading}
            onSortingChange={(newSorting) => {
              setSorting(newSorting);
            }}
            emptyMessage="No Leads data found. Try adjusting your filters or search criteria."
            pageNo={pageNo}
            pageSize={pageSize}
            total={totalUsers}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>
      {showDeleteConfirm && rowToDelete && (
        <DeleteConfirmModal
          open={showDeleteConfirm}
          item={rowToDelete}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          loading={isLoading}
        />
      )}
    </div>
  );
};

export { Table };