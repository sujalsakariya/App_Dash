import { Fragment, useState } from 'react';
import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading } from '@/layouts/demo1/toolbar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Demo1LightSidebarContent } from '.';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, CalendarRange as CalendarRangeIcon, ChevronLeft, ChevronRight, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChannelBarChart from '@/components/charts/ChannelBarChart';
import axios from 'axios';
import { addMonths } from 'date-fns';

const Demo1LightSidebarPage = () => {
  // Initialize with today's date to show today's data by default
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  // Add state for date range
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });

  // Add state for toggling between single date and date range
  const [isDateRange, setIsDateRange] = useState(false);

  const [calendarOpen, setCalendarOpen] = useState(false);

  // Add loading state
  const [loading, setLoading] = useState(false);

  // Chart logic state
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [currentMonthItems, setCurrentMonthItems] = useState([]);

  // Function to handle data loading state
  const handleLoadingState = (isLoading) => {
    setLoading(isLoading);
  };

  // Utility function for formatting dates for API
  const formatDateForApi = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // fetchMonthData for ChannelBarChart
  const fetchMonthData = async () => {
    try {
      const token = localStorage.getItem('token');
      const today = new Date();
      const targetMonth = addMonths(today, monthOffset);
      const firstDayOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
      let lastDayOfMonth;
      if (monthOffset === 0) {
        lastDayOfMonth = today;
      } else if (monthOffset > 0) {
        const nextMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
        lastDayOfMonth = nextMonth;
      } else {
        const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
        lastDayOfMonth = lastDay;
      }
      const fromDate = formatDateForApi(firstDayOfMonth);
      const toDate = formatDateForApi(lastDayOfMonth);
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/DashBoard`,
        {
          params: { fromDate, toDate },
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      setCurrentMonthItems(response.data);
    } catch (error) {
      console.error('Error fetching month data:', error);
    }
  };

  const goToPreviousMonth = () => setMonthOffset(prev => prev - 1);
  const goToNextMonth = () => setMonthOffset(prev => prev + 1);

  const formatDate = () => {
    if (isDateRange) {
      if (dateRange.from) {
        if (dateRange.to) {
          return `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`;
        }
        return `${format(dateRange.from, 'MMM dd')} - ?`;
      }
      return 'Select date range';
    } else {
      return selectedDate ? `${format(selectedDate, 'MMM dd')}` : 'Select date';
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setCalendarOpen(false);
  };

  const handleDateRangeSelect = (range) => {
    if (range?.from) {
      setDateRange(range);
      if (range.to) {
        setCalendarOpen(false);
      }
    }
  };

  const toggleDateRangeMode = () => {
    setIsDateRange(prev => !prev);
    if (isDateRange) {
      // When switching from range to single, use the "from" date as the selected date
      if (dateRange?.from) {
        setSelectedDate(dateRange.from);
      }
    } else {
      // When switching from single to range, use the selected date as the "from" date
      if (selectedDate) {
        setDateRange({ from: selectedDate, to: undefined });
      }
    }
  };

  // Add handlers for previous/next day
  const handlePrevDay = () => {
    if (!isDateRange && selectedDate) {
      const prev = new Date(selectedDate);
      prev.setDate(prev.getDate() - 1);
      setSelectedDate(prev);
    }
  };

  const handleNextDay = () => {
    if (!isDateRange && selectedDate) {
      const next = new Date(selectedDate);
      next.setDate(next.getDate() + 1);
      setSelectedDate(next);
    }
  };

  return (
    <Fragment>
      <div className="page-background">
        <div className="gradient-circle top-left"></div>
        <div className="gradient-circle middle-right"></div>
        <div className="gradient-circle bottom-right"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
        <div className="pattern-overlay"></div>
      </div>

      <Container className="dashboard-container px-2 sm:px-4 md:px-8">
        <Toolbar className="py-4 sm:py-6 bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-blue-100/30 flex flex-col sm:flex-row gap-4 sm:gap-0 items-start sm:items-center">
          <ToolbarHeading className="w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold page-title bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </ToolbarHeading>
          <ToolbarActions className="w-full sm:w-auto">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleDateRangeMode}
                className="w-9 h-9 bg-white/80 hover:bg-white/90 transition-all duration-300 dark:bg-gray-200"
                title={isDateRange ? "Switch to single date" : "Switch to date range"}
              >
                {isDateRange ? <CalendarIcon className="h-4 w-4 text-blue-500" /> : <CalendarRangeIcon className="h-4 w-4 text-blue-500" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevDay}
                disabled={isDateRange}
                className="w-9 h-9"
                title="Previous day"
              >
                <ChevronLeft />
              </Button>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    id="date"
                    className={cn(
                      'date-selector px-3 sm:px-4 py-2 flex items-center gap-2 dark:bg-gray-200 bg-white/80 backdrop-blur-md rounded-xl border border-blue-100/50 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300',
                      (!selectedDate && !dateRange.from) && 'text-gray-400'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                    <span className="text-xs sm:text-2sm font-medium">{formatDate()}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border border-gray-100 shadow-xl rounded-lg overflow-hidden" align="center">
                  {isDateRange ? (
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={handleDateRangeSelect}
                      initialFocus
                      className="rounded-lg border-0"
                    />
                  ) : (
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      className="rounded-lg border-0"
                    />
                  )}
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextDay}
                disabled={isDateRange}
                className="w-9 h-9"
                title="Next day"
              >
                <ChevronRight />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-9 h-9"
                title="Reset Date"
                onClick={() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  setSelectedDate(today);
                  setDateRange({ from: undefined, to: undefined });
                  setIsDateRange(false);
                  setCalendarOpen(false);
                  setMonthOffset(0); // Reset chart to current month
                  setSelectedCompany(null); // Optionally reset selected company
                }}
              >
                <RotateCcw />
              </Button>
              {/* End Reset Date Button */}
            </div>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container className="pb-10 relative px-2 sm:px-4 md:px-8">
        <div className="bg-transparent backdrop-blur-md rounded-xl shadow-lg border border-blue-100/30 p-3 sm:p-6">
          <Demo1LightSidebarContent
            dateRange={isDateRange ? dateRange : { from: selectedDate, to: selectedDate }}
            loading={loading}
            onLoadingChange={handleLoadingState}
            selectedCompany={selectedCompany}
            setSelectedCompany={setSelectedCompany}
          />
        </div>
        {/* Show chart under this container */}
      </Container>
        <div className="p-8">
          {selectedCompany !== undefined && (
            <ChannelBarChart
              dateRange={isDateRange ? dateRange : { from: selectedDate, to: selectedDate }}
              monthOffset={monthOffset}
              selectedCompany={selectedCompany}
              setSelectedCompany={setSelectedCompany}
              currentMonthItems={currentMonthItems}
              setCurrentMonthItems={setCurrentMonthItems}
              fetchMonthData={fetchMonthData}
              goToPreviousMonth={goToPreviousMonth}
              goToNextMonth={goToNextMonth}
            />
          )}
        </div>
    </Fragment>
  );
};

export { Demo1LightSidebarPage };