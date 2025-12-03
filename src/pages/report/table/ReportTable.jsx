import { useState, useEffect, useCallback, useMemo } from 'react';
import { KeenIcon } from '@/components';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon, CalendarRange as CalendarRangeIcon, ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, addDays, subDays, isValid } from "date-fns";

const extractVendorInfo = (vendor) => {
  if (typeof vendor === 'string') {
    return { id: vendor, name: vendor };
  }
  
  const vendorName = vendor?.vendor || vendor?.name || vendor?.vendorName || 'Unknown';
  const vendorId = vendor?.id || vendor?.vendorId || vendorName;
  
  return { id: String(vendorId), name: vendorName };
};

const Toolbar = ({ onSearch, onVendorChange, onDateChange, selectedDate, selectedVendor, onReset }) => {
  const [searchInput, setSearchInput] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarMode, setCalendarMode] = useState('single');
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/Leads/GetAllVendor`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch vendors');
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setVendors(data);
      } else if (data?.items) {
        setVendors(data.items);
      } else if (data?.data) {
        setVendors(data.data);
      } else {
        setVendors([]);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const currentVendorName = useMemo(() => {
    if (selectedVendor === "all") return "All Vendors";
    
    const vendor = vendors.find(v => {
      const info = extractVendorInfo(v);
      return info.id === selectedVendor;
    });
    
    return vendor ? extractVendorInfo(vendor).name : selectedVendor;
  }, [selectedVendor, vendors]);

  const getCalendarModeIcon = () => {
    return calendarMode === 'range' ? 
      <CalendarRangeIcon className="h-4 w-4" /> : 
      <CalendarIcon className="h-4 w-4" />;
  };

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchInput(value);
    onSearch(value);
  }, [onSearch]);

  const handleDateSelect = useCallback((date) => {
    if (calendarMode === 'single') {
      onDateChange(date);
      setCalendarOpen(false);
    } else if (calendarMode === 'range') {
      const newRange = { ...dateRange, ...date };
      setDateRange(newRange);
      
      if (newRange.from && newRange.to) {
        onDateChange(newRange);
        setCalendarOpen(false);
      }
    }
  }, [calendarMode, dateRange, onDateChange]);

  const getDateDisplayText = () => {
    if (calendarMode === 'single' && selectedDate) {
      return format(selectedDate, "dd MMM");
    } else if (calendarMode === 'range') {
      if (dateRange.from && dateRange.to) {
        return `${format(dateRange.from, "dd MMM")} - ${format(dateRange.to, "dd MMM")}`;
      } else if (dateRange.from) {
        return `${format(dateRange.from, "dd MMM")} - ?`;
      } else {
        return "Select date range";
      }
    }
    return "Select date";
  };

  const getHeadingText = () => {
    let dateText = "";
    if (calendarMode === 'single' && selectedDate) {
      dateText = `for ${format(selectedDate, "PPP")}`;
    } else if (calendarMode === 'range' && dateRange.from && dateRange.to) {
      dateText = `from ${format(dateRange.from, "PP")} to ${format(dateRange.to, "PP")}`;
    } else {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      dateText = `from ${format(firstDayOfMonth, "PP")} to ${format(today, "PP")}`;
    }
    
    let vendorText = selectedVendor !== "all" ? ` for ${currentVendorName}` : "";
    return `Showing : ${dateText}${vendorText}`;
  };

  // Sync dateRange with selectedDate when in range mode
  useEffect(() => {
    if (calendarMode === 'range') {
      if (selectedDate && selectedDate.from && selectedDate.to) {
        setDateRange({ from: selectedDate.from, to: selectedDate.to });
      } else {
        setDateRange({ from: undefined, to: undefined });
      }
    }
    // eslint-disable-next-line
  }, [selectedDate, calendarMode]);

  // Only enable prev/next in single mode and when all vendors selected
  const isPrevNextEnabled = calendarMode === 'single' && selectedVendor === 'all';

  // Handler for previous/next day navigation (only in single mode and all vendor)
  const handlePrev = useCallback(() => {
    if (calendarMode === 'single' && selectedVendor === 'all') {
      if (selectedDate && isValid(selectedDate)) {
        const prevDay = subDays(selectedDate, 1);
        onDateChange(prevDay);
      } else {
        // If no date selected, default to yesterday
        onDateChange(subDays(new Date(), 1));
      }
    }
  }, [calendarMode, selectedDate, selectedVendor, onDateChange]);

  const handleNext = useCallback(() => {
    if (calendarMode === 'single' && selectedVendor === 'all') {
      if (selectedDate && isValid(selectedDate)) {
        const nextDay = addDays(selectedDate, 1);
        onDateChange(nextDay);
      } else {
        // If no date selected, default to today
        onDateChange(new Date());
      }
    }
  }, [calendarMode, selectedDate, selectedVendor, onDateChange]);

  // Clear search input when reset is triggered
  useEffect(() => {
    setSearchInput('');
  }, [selectedVendor, selectedDate]); // This will clear on reset from parent

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2 border-b border-gray-200 px-2 sm:px-4 py-3 items-start sm:items-center justify-between dark:bg-gray-100 dark:border-gray-300">
      <h3 className="font-medium text-sm dark:text-gray-800 w-full sm:w-auto mb-2 sm:mb-0">
        {getHeadingText()}
      </h3>
      <div className="flex flex-col sm:flex-row flex-wrap w-full sm:w-auto gap-2 lg:gap-3">
        <div className="flex items-center gap-2 border rounded-lg px-2 py-1 w-full sm:w-64 dark:bg-gray-200 relative">
          <KeenIcon icon="magnifier" className="dark:text-gray-800 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search Dispositions"
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full outline-none bg-transparent dark:text-gray-800"
            style={{ fontSize: "14px" }}
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                onSearch('');
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
              aria-label="Clear search"
            >
              <X size={16} className="text-gray-500 dark:text-gray-700" />
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
          <Select 
            value={selectedVendor} 
            onValueChange={onVendorChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full sm:w-36 dark:text-gray-800 dark:bg-gray-200">
              <SelectValue placeholder="All Vendor" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-100 dark:text-gray-800">
              <SelectGroup>
                <SelectItem value="all">All Vendor</SelectItem>
                {vendors.map((vendor, index) => {
                  const info = extractVendorInfo(vendor);
                  return (
                    <SelectItem key={`vendor-${info.id}-${index}`} value={info.id}>
                      {info.name}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="flex flex-row gap-1 flex-wrap">
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300 flex-shrink-0"
              onClick={() => {
                if (calendarMode === 'single') {
                  setCalendarMode('range');
                  onDateChange(null);
                  setDateRange({ from: undefined, to: undefined });
                } else {
                  setCalendarMode('single');
                  onDateChange(null);
                }
              }}
              title={`Switch to ${calendarMode === 'single' ? 'range' : 'single date'} mode`}
            >
              {getCalendarModeIcon()}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300 flex-shrink-0"
              onClick={handlePrev}
              title="Previous"
              disabled={!isPrevNextEnabled}
            >
              <ChevronLeft />
            </Button>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-auto justify-start text-left font-normal dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300",
                    (!selectedDate && calendarMode !== 'range') && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{getDateDisplayText()}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 dark:bg-gray-100 dark:text-gray-800 dark:border-gray-300">
                <div className="p-2 border-b border-gray-100 dark:border-gray-300">
                  <button
                    className="w-full text-left p-2 text-sm rounded-md hover:bg-gray-100 transition-colors dark:hover:bg-gray-200 dark:text-gray-800"
                    onClick={() => {
                      onDateChange(null);
                      setDateRange({ from: undefined, to: undefined });
                      setCalendarOpen(false);
                    }}
                  >
                    Clear selection
                  </button>
                </div>
                <Calendar
                  mode={calendarMode}
                  selected={calendarMode === 'single' ? selectedDate : dateRange}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="dark:bg-gray-100 dark:text-gray-800"
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300 flex-shrink-0"
              onClick={handleNext}
              title="Next"
              disabled={!isPrevNextEnabled}
            >
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300 flex-shrink-0"
              onClick={onReset ? () => {
                setSearchInput('');
                onSearch('');
                onReset();
              } : undefined}
              title="Reset filters"
            >
              <RotateCcw />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NoDataMessage = ({ message = "No Dispositions data found. Try adjusting your filters or search criteria." }) => (
  <div className="py-16 px-4 flex justify-center items-center">
    <div className="text-center">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-600 mt-5">{message}</p>
    </div>
  </div>
);

const CustomTable = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full border-gray-200 dark:border-gray-300 relative scrollable-x-auto border">
        <div className="py-16 px-4 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mx-auto"></div>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-600">Loading report data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <NoDataMessage />;
  }

  const companies = useMemo(() => [...new Set(data.map(item => item.company))].sort(), [data]);
  
  const tableData = useMemo(() => {
    const groupedData = new Map();
    
    data.forEach(item => {
      const disposition = item.disposition;
      if (!groupedData.has(disposition)) {
        groupedData.set(disposition, {});
      }
      
      const dispositionData = groupedData.get(disposition);
      dispositionData[item.company] = {
        count: parseInt(item.count) || 0,
        percentage: parseFloat(item.percentage) || 0
      };
    });

    const result = Array.from(groupedData.entries()).map(([disposition, companyData]) => {
      let totalCount = 0;
      let totalPercentage = 0;
      let companiesWithData = 0;
      
      Object.values(companyData).forEach(data => {
        if (typeof data === 'object' && data !== null) {
          totalCount += data.count;
          if (data.percentage > 0) {
            totalPercentage += data.percentage;
            companiesWithData++;
          }
        }
      });
      
      return {
        disposition,
        ...companyData,
        totalCount,
        averagePercentage: companiesWithData > 0 ? totalPercentage / companiesWithData : 0
      };
    });
    
    return result.sort((a, b) => b.totalCount - a.totalCount);
  }, [data]);

  return (
    <div className="w-full border-gray-200 dark:border-gray-300 relative overflow-x-auto border rounded-md">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-300 text-xs sm:text-sm">
        <thead className="bg-gray-50 dark:bg-gray-200">
          <tr>
            <th
              rowSpan={2}
              scope="col"
              className="x-4 py-3 text-center border-l dark:border-gray-300 text-xs text-gray-800 font-bold dark:text-gray-900 uppercase tracking-wider"
              style={{ minWidth: '50px' }}
            >
              No.
            </th>
            <th
              rowSpan={2}
              scope="col"
              className="x-4 py-3 text-center border-l dark:border-gray-300 text-xs text-gray-800 font-bold dark:text-gray-900 uppercase tracking-wider"
              style={{ minWidth: '200px' }}
            >
              Disposition
            </th>
            {companies.map((company) => (
              <th
                key={company}
                colSpan={2}
                scope="col"
                className="px-4 py-3 text-center border-l dark:border-gray-300 text-xs text-gray-800 font-bold dark:text-gray-900 uppercase tracking-wider"
              >
                {company}
              </th>
            ))}
            <th
              colSpan={2}
              scope="col"
              className="px-4 py-3 text-center border-l dark:border-gray-300 text-xs text-gray-800 font-bold dark:text-gray-900 uppercase tracking-wider"
            >
              Total
            </th>
          </tr>
          <tr>
            {companies.flatMap((company) => [
              <th key={`${company}-count`} className="px-4 py-3 text-center border-l dark:border-gray-300 text-xs text-gray-800 font-bold dark:text-gray-900 uppercase tracking-wider">
                Count
              </th>,
              <th key={`${company}-percent`} className="px-4 py-3 text-center border-l dark:border-gray-300 text-xs text-gray-800 font-bold dark:text-gray-900 uppercase tracking-wider">
                %
              </th>
            ])}
            <th className="px-4 py-3 text-center border-l dark:border-gray-300 text-xs text-gray-800 font-bold dark:text-gray-900 uppercase tracking-wider">
              Count
            </th>
            <th className="px-4 py-3 text-center border-l dark:border-gray-300 text-xs text-gray-800 font-bold dark:text-gray-900 uppercase tracking-wider">
              Avg %
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-100 divide-y divide-gray-200 dark:divide-gray-300">
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-200">
              <td className="px-4 py-3 text-sm border-l text-center dark:border-gray-300 dark:text-gray-800 bg-white dark:bg-gray-100">
                {rowIndex + 1}
              </td>
              <td className="px-4 py-3 text-sm border-l dark:border-gray-300 dark:text-gray-800 font-medium left-[66px] bg-white dark:bg-gray-100">
                {row.disposition}
              </td>
              {companies.flatMap((company) => {
                const data = row[company] || { count: 0, percentage: 0 };
                return [
                  <td key={`${rowIndex}-${company}-count`} className="px-4 py-3 text-sm text-center border-l dark:border-gray-300 dark:text-gray-800">
                    {data.count || 0}
                  </td>,
                  <td key={`${rowIndex}-${company}-percent`} className="px-4 py-3 text-sm text-center border-l dark:border-gray-300 dark:text-gray-800">
                    {data.percentage ? data.percentage.toFixed(2) : '0.00'}%
                  </td>
                ];
              })}
              <td className="px-4 py-3 text-sm text-center border-l dark:border-gray-300 dark:text-gray-800 font-semibold">
                {row.totalCount || 0}
              </td>
              <td className="px-4 py-3 text-sm text-center border-l dark:border-gray-300 dark:text-gray-800 font-semibold">
                {row.averagePercentage.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ReportTable = () => {
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  
  // Clear any existing query string on initial mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location?.search) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (_) {}
  }, []);
  
  const fetchReportData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const params = new URLSearchParams();
      if (selectedDate) {
        if (selectedDate.from && selectedDate.to) {
          params.append("FromDate", format(selectedDate.from, "yyyy-MM-dd"));
          params.append("ToDate", format(selectedDate.to, "yyyy-MM-dd"));
        } else if (selectedDate instanceof Date) {
          const formattedDate = format(selectedDate, "yyyy-MM-dd");
          params.append("FromDate", formattedDate);
          params.append("ToDate", formattedDate);
        }
      } else {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        params.append("FromDate", format(firstDayOfMonth, "yyyy-MM-dd"));
        params.append("ToDate", format(today, "yyyy-MM-dd"));
      }
      
      if (selectedVendor && selectedVendor !== "all") {
        params.append("Vendor", selectedVendor);
      }
      
  // Removed URL query string updates to keep URL clean

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/Leads/GetDispositionsReport?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch report data: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data && (Array.isArray(data.items) || Array.isArray(data))) {
        const items = data.items || data;
        setReportData(items);
      } else {
        setReportData([]);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      setError(error.message);
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedVendor, selectedDate]);
  
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);
  
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);
  
  const filteredData = useMemo(() => {
    if (!searchQuery) return reportData;
    
    const query = searchQuery.toLowerCase();
    return reportData.filter(item => 
      item.disposition.toLowerCase().includes(query) ||
      item.company.toLowerCase().includes(query)
    );
  }, [reportData, searchQuery]);

  // Reset all filters and refresh data
  const handleReset = useCallback(() => {
    setSelectedVendor("all");
    setSelectedDate(null);
    setSearchQuery("");
  }, []);

  return (
    <div className="card shadow-md bg-white rounded-lg overflow-hidden dark:bg-gray-100">
      <div className="px-3 sm:px-5 py-4 border-b border-gray-200 dark:bg-gradient-to-r dark:from-gray-200 dark:to-gray-100 dark:border-gray-300">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-800">Dispositions</h2>
      </div>
      <div className="flex flex-col w-full">
        <Toolbar 
          onSearch={handleSearch}
          onVendorChange={setSelectedVendor}
          onDateChange={setSelectedDate}
          selectedDate={selectedDate}
          selectedVendor={selectedVendor}
          onReset={handleReset}
        />
        {error && (
          <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
            <p className="font-medium">Error loading data:</p>
            <p>{error}</p>
          </div>
        )}
        <div className="grid gap-3 sm:gap-5 lg:gap-7.5">
          <CustomTable data={filteredData} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export { ReportTable };