import { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { addMonths, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ChannelStats = ({ dateRange, loading, onLoadingChange = () => {}, selectedCompany, setSelectedCompany }) => {
  const [items, setItems] = useState([]);
  const [currentMonthItems, setCurrentMonthItems] = useState([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [showChart, setShowChart] = useState(false);
  const [currentDateParams, setCurrentDateParams] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const navigate = useNavigate();

  const goToPreviousMonth = () => setMonthOffset(prev => prev - 1);
  const goToNextMonth = () => setMonthOffset(prev => prev + 1);

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
      setUnauthorized(false);
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
      if (error.response && error.response.status === 401) {
        setUnauthorized(true);
      }
      console.error('Error fetching month data:', error);
    }
  };

  useEffect(() => {
    fetchMonthData();
  }, [monthOffset]);

  useEffect(() => {
    if (!dateRange || !dateRange.from) return;

    const calculateDateParams = () => {
      const fromDate = formatDateForApi(dateRange.from);
      const toDate = dateRange.to ? formatDateForApi(dateRange.to) : fromDate;
      return { fromDate, toDate };
    };

    const newDateParams = calculateDateParams();
    if (!currentDateParams ||
      newDateParams.fromDate !== currentDateParams.fromDate ||
      newDateParams.toDate !== currentDateParams.toDate) {

      setCurrentDateParams(newDateParams);

      const fetchData = async () => {
        try {
          setUnauthorized(false);
          onLoadingChange(true);
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/DashBoard`,
            {
              params: { fromDate: newDateParams.fromDate, toDate: newDateParams.toDate },
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            }
          );
          setItems(response.data);
        } catch (error) {
          if (error.response && error.response.status === 401) {
            setUnauthorized(true);
          }
          console.error('Error fetching dashboard data:', error);
        } finally {
          onLoadingChange(false);
        }
      };

      fetchData();
    }
  }, [dateRange, currentDateParams, onLoadingChange]);

  const handleLeadsClick = (item) => {
    if (!currentDateParams) return;
    navigate(`/AllLeads?FromDate=${currentDateParams.fromDate}&ToDate=${currentDateParams.toDate}&Company=${encodeURIComponent(item.company || '')}&PageNo=1&PageSize=10&SortColumn=entDate&SortDirection=desc`);
  };
  
  const handleSalesClick = (item) => {
    if (!currentDateParams) return;
    navigate(`/Sales?FromDate=${currentDateParams.fromDate}&ToDate=${currentDateParams.toDate}&Company=${encodeURIComponent(item.company || '')}&PageNo=1&PageSize=10&SortColumn=entDate&SortDirection=desc`);
  };

  const getColorClass = (index) => {
    switch (index % 4) {
      case 0: return "card-blue";
      case 1: return "card-yellow";
      case 2: return "card-green";
      case 3: return "card-light-blue";
      default: return "";
    }
  };

  return (
    <Fragment>
      {unauthorized && (
        <div className="text-center py-4 px-4 bg-red-100 text-red-700 rounded mb-4">
          Unauthorized: Please log in again or check your access token.
        </div>
      )}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-7.5">
          {items.map((item, index) => {
            const currentMonthItem = currentMonthItems.find(monthItem =>
              monthItem.company === item.company
            ) || { leads: 0, sales: 0, payments: 0 };
            const today = new Date();
            const targetMonth = addMonths(today, monthOffset);
            const monthYearDisplay = format(targetMonth, 'MMMM yyyy');

            const handleCompanyClick = () => {
              setSelectedCompany(item.company);
              setShowChart(true);
            };

            return (
              <div
                key={index}
                className={`cardColor ${getColorClass(index)} flex flex-col lg:flex-row w-full bg-transparent justify-between h-full bg-cover rtl:bg-[left_top_-1.7rem] bg-[right_top_-1.7rem] bg-no-repeat channel-stats-bg transition-all duration-300 hover:shadow-lg ${
                  selectedCompany === item.company ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className='flex w-full lg:w-3/4 justify-between' onClick={handleCompanyClick}>
                  <div className="flex flex-col justify-between items-center px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex items-center cursor-pointer" >
                      <img src={item.logo} alt="" className="w-auto h-8 sm:h-10 filter drop-shadow-sm" />
                    </div>
                    <div className="my-2 sm:my-3 mx-2 sm:mx-6 border-t border-gray-100 dark:border-gray-700 opacity-60 w-full"></div>
                    <div
                      className="flex flex-col cursor-pointer hover:opacity-80 sm:text-left"
                      onClick={() => handleLeadsClick(item)}
                    >
                      <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-900">{item.leads}</div>
                      <div className="text-xs font-medium text-blue-500">Leads</div>
                      <div className="mt-1 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {item.leads !== 0 ? (item.payments / item.leads).toFixed(2) : '0.00'}%
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex flex-col items-end cursor-pointer" onClick={() => handleSalesClick(item)}>
                      <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-900">{item.sales}</div>
                      <div className="text-xs font-medium text-emerald-500">Sales</div>
                    </div>
                    <div className="my-2 sm:my-3 mx-2 sm:mx-6 border-t border-gray-100 dark:border-gray-700 opacity-60 w-full"></div>
                    <div className="flex flex-col items-end">
                      <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-900">{item.payments}</div>
                      <div className="text-xs font-medium text-amber-500">Payments</div>
                    </div>
                  </div>
                </div>

                <div className="border-t lg:border-t-0 lg:border-l border-gray-400 dark:border-gray-700 mx-4 sm:mx-6 lg:mx-3 my-0 lg:my-6 h-0 lg:h-32 opacity-60"></div>

                <div className='flex w-full lg:w-64 items-center justify-center'>
                  <div className="flex flex-col items-center justify-center w-full px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex items-center justify-between w-full gap-1 sm:gap-1.5 mb-3 sm:mb-4 lg:mb-5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToPreviousMonth();
                        }}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-1"
                      >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <h2 className='font-bold text-xs sm:text-sm text-center whitespace-nowrap'>{monthYearDisplay}</h2>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToNextMonth();
                        }}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-1"
                      >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                    <table className="table-auto w-full text-left">
                      <tbody>
                        <tr>
                          <td></td>
                          <td className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 text-right">
                            {currentMonthItem.leads !== 0 ? (currentMonthItem.payments / currentMonthItem.leads).toFixed(2) : '0.00'}%
                          </td>
                        </tr>
                        <tr className="cursor-pointer">
                          <td className="text-blue-500 font-medium text-xs">Leads</td>
                          <td className='font-bold text-gray-900 dark:text-white text-xs sm:text-sm text-right'>
                            {currentMonthItem.leads}
                          </td>
                        </tr>
                        <tr className="cursor-pointer">
                          <td className="text-emerald-500 font-medium text-xs">Sales</td>
                          <td className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm text-right">{currentMonthItem.sales}</td>
                        </tr>
                        <tr className="cursor-pointer">
                          <td className="font-medium text-xs text-amber-500">Payments</td>
                          <td className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm text-right">{currentMonthItem.payments}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-10 md:py-14 px-4 sm:px-5 bg-gray-50 dark:bg-gray-100 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2 sm:mb-3 dark:text-gray-800 sm:w-12 sm:h-12">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-800">No Data Available</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {dateRange.from && dateRange.to && format(dateRange.from, 'yyyy-MM-dd') === format(dateRange.to, 'yyyy-MM-dd')
                ? 'Try selecting a different date'
                : 'Try selecting a different date range'}
            </p>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export { ChannelStats };