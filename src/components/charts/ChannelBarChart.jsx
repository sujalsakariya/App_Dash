import React, { useEffect, useState, useRef } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import { format, addMonths } from 'date-fns';
import './ChannelBarChart.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ChannelBarChart = ({
  monthOffset,
  selectedCompany,
  setSelectedCompany,
  currentMonthItems,
  fetchMonthData,
  goToPreviousMonth,
  goToNextMonth
}) => {
  const [dailyData, setDailyData] = useState([]);
  // Loader state
  const [loading, setLoading] = useState(false);
  // Selected days state for multiple day selection
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedDaysData, setSelectedDaysData] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    // Determine the date range for the current month
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
    setLoading(true);
    // Fetch both month data (for companies) and daily data (for chart)
    Promise.all([
      fetchMonthData(),
      fetchDailyData(firstDayOfMonth, lastDayOfMonth)
    ]).finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [monthOffset]);

  const formatDateForApi = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchDailyData = async (startDate, endDate) => {
    try {
      const token = localStorage.getItem('token');
      const days = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      // Parallelize all daily requests
      const requests = days.map(day => {
        const dateStr = formatDateForApi(day);
        return axios.get(
          `${import.meta.env.VITE_APP_API_URL}/DashBoard`,
          {
            params: { fromDate: dateStr, toDate: dateStr },
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        ).then(response => ({
          date: dateStr,
          data: response.data,
          day: day.getDate()
        })).catch(() => ({
          date: dateStr,
          data: [],
          day: day.getDate()
        }));
      });
      const dailyDataArray = await Promise.all(requests);
      // Fill missing days if any
      const lastDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
      const filledDailyData = [];
      for (let day = 1; day <= lastDayOfMonth; day++) {
        const existingData = dailyDataArray.find(item => item.day === day);
        if (existingData) {
          filledDailyData.push(existingData);
        } else {
          const dayDate = new Date(startDate.getFullYear(), startDate.getMonth(), day);
          filledDailyData.push({
            date: formatDateForApi(dayDate),
            data: [],
            day: day
          });
        }
      }
      setDailyData(filledDailyData);
    } catch (error) {
      console.error('Error fetching daily data:', error);
    }
  };

  const getTooltipHtml = (dayItem, selectedCompany) => {
    if (!dayItem) return '';
    let sales = 0, payments = 0, leads = 0, conversion = '0.00', label = 'RPL';
    if (selectedCompany) {
      const companyData = dayItem.data.find(item => item.company === selectedCompany);
      if (companyData) {
        sales = typeof companyData.sales === 'number' ? companyData.sales : parseFloat(companyData.sales) || 0;
        payments = companyData.payments !== undefined ? parseFloat(companyData.payments) : 0;
        leads = typeof companyData.leads === 'number' ? companyData.leads : parseFloat(companyData.leads) || 0;
      }
      label = 'RPL';
    } else {
      sales = dayItem.data.reduce((sum, item) => sum + (typeof item.sales === 'number' ? item.sales : parseFloat(item.sales) || 0), 0);
      payments = dayItem.data.reduce((sum, item) => sum + (typeof item.payments === 'number' ? item.payments : parseFloat(item.payments) || 0), 0);
      leads = dayItem.data.reduce((sum, item) => sum + (typeof item.leads === 'number' ? item.leads : parseFloat(item.leads) || 0), 0);
    }
    conversion = leads > 0 ? ((payments / leads)).toFixed(2) : '0.00';
    return `<div style="padding:4px 8px; font-weight: bold;">
      <b>Sales:</b> ${sales.toFixed(2)}<br/><b>Payments:</b> ${payments.toFixed(2)}<br/><b>Leads:</b> ${leads}<br/><b>${label}:</b> ${conversion}%
    </div>`;
  };

  // Handle chart click events for multiple day selection
  const handleChartClick = (event, chartContext, config) => {
    if (config.dataPointIndex !== undefined && config.dataPointIndex >= 0) {
      const dayIndex = config.dataPointIndex;
      const dayData = dailyData[dayIndex];
      
      if (dayData) {
        const dayNumber = dayData.day;
        
        // Check if day is already selected
        if (selectedDays.includes(dayNumber)) {
          // Remove from selection
          setSelectedDays(prev => prev.filter(day => day !== dayNumber));
          setSelectedDaysData(prev => prev.filter(data => data.day !== dayNumber));
        } else {
          // Add to selection
          setSelectedDays(prev => [...prev, dayNumber].sort((a, b) => a - b));
          setSelectedDaysData(prev => [...prev, dayData].sort((a, b) => a.day - b.day));
        }
      }
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedDays([]);
    setSelectedDaysData([]);
  };

  // Remove specific day from selection
  const removeDayFromSelection = (dayNumber) => {
    setSelectedDays(prev => prev.filter(day => day !== dayNumber));
    setSelectedDaysData(prev => prev.filter(data => data.day !== dayNumber));
  };

  const getChartData = () => {
    if (dailyData.length === 0) return { series: [], options: {} };
    const days = dailyData.map(item => `${item.day}`);
    let salesData, paymentsData, leadsData;
    if (selectedCompany) {
      salesData = dailyData.map(dayItem => {
        const companyData = dayItem.data.find(item => item.company === selectedCompany);
        return companyData ? (typeof companyData.sales === 'number' ? companyData.sales : parseFloat(companyData.sales) || 0) : 0;
      });
      paymentsData = dailyData.map(dayItem => {
        const companyData = dayItem.data.find(item => item.company === selectedCompany);
        return companyData ? (companyData.payments !== undefined ? parseFloat(companyData.payments).toFixed(2) * 1 : 0) : 0;
      });
      leadsData = dailyData.map(dayItem => {
        const companyData = dayItem.data.find(item => item.company === selectedCompany);
        return companyData ? (typeof companyData.leads === 'number' ? companyData.leads : parseFloat(companyData.leads) || 0) : 0;
      });
    } else {
      salesData = dailyData.map(dayItem => dayItem.data.reduce((sum, item) => sum + (typeof item.sales === 'number' ? item.sales : parseFloat(item.sales) || 0), 0));
      paymentsData = dailyData.map(dayItem => dayItem.data.reduce((sum, item) => sum + (typeof item.payments === 'number' ? item.payments : parseFloat(item.payments) || 0), 0).toFixed(2) * 1);
      leadsData = dailyData.map(dayItem => dayItem.data.reduce((sum, item) => sum + (typeof item.leads === 'number' ? item.leads : parseFloat(item.leads) || 0), 0));
    }
    // Define the tooltip custom function here to always use latest state
    const tooltipCustom = ({ series, seriesIndex, dataPointIndex, w }) => {
      const dayItem = dailyData && dailyData[dataPointIndex];
      return getTooltipHtml(dayItem, selectedCompany);
    };
    // Prepare annotations for leads, centered above both bars
    const annotations = days.map((day, idx) => {
      const maxY = Math.max(salesData[idx], paymentsData[idx]);
      // Only show if leads > 0
      if (!leadsData[idx] || leadsData[idx] === 0) return null;
      return {
        x: day,
        y: maxY + (maxY * 0.0),
        marker: { size: 0, fillColor: 'transparent', strokeColor: 'transparent', strokeWidth: 0 },
        label: {
          text: leadsData[idx].toString(),
          style: {
            background: 'rgb(59 130 246 / var(--tw-text-opacity, 1))',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 600,
            borderRadius: '4px',
            padding: {
              left: 6,
              right: 6,
              top: 2,
              bottom: 3
            }
          }
        }
      };
    }).filter(Boolean);
    // Generate colors for bars based on selection
    const getBarColors = () => {
      const defaultColors = ['#10b981', '#f59e0b']; // Green for Sales, Amber for Payments
      const selectedColors = ['#059669', '#d97706']; // Darker shades for selected
      
      const salesColors = days.map((day, index) => 
        selectedDays.includes(parseInt(day)) ? selectedColors[0] : defaultColors[0]
      );
      const paymentsColors = days.map((day, index) => 
        selectedDays.includes(parseInt(day)) ? selectedColors[1] : defaultColors[1]
      );
      
      return [salesColors, paymentsColors];
    };

    const [salesColors, paymentsColors] = getBarColors();

    return {
      series: [
        { name: 'Sales', data: salesData },
        { name: 'Payments', data: paymentsData }
      ],
      options: {
        chart: { 
          type: 'bar', 
          height: 350, 
          toolbar: { show: true },
          events: {
            dataPointSelection: handleChartClick
          }
        },
        plotOptions: { 
          bar: { 
            horizontal: false, 
            columnWidth: '55%', 
            endingShape: 'rounded',
            distributed: false
          } 
        },
        states: {
          active: {
            allowMultipleDataPointsSelection: true,
            filter: {
              type: 'none'
            }
          }
        },
        dataLabels: {
          enabled: false // Disable default dataLabels
        },
        annotations: {
          points: annotations
        },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        xaxis: {
          categories: days,
          labels: { style: { fontSize: '12px', fontFamily: 'inherit' }, rotate: -45 },
          crosshairs: {
            show: true,
            width: 0, // Hide the black line
            position: 'back',
            opacity: 0.2,
            stroke: { color: 'transparent', width: 0, dashArray: 0 }, // Hide the black line
            fill: { type: 'solid', color: '#b3c2ef', opacity: 0.1 }
          }
        },
        yaxis: {
          title: { text: 'Count' },
          labels: {
            formatter: function (val) {
              if (val >= 1000000000000) return (val / 1000000000000).toFixed(1) + 'T';
              else if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'B';
              else if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
              else if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
              else return Math.round(val).toString();
            }
          }
        },
        fill: { opacity: 1 },
        tooltip: {
          x: { show: false },
          custom: tooltipCustom,
          shared: true,
          intersect: false
        },
        colors: ['#10b981', '#f59e0b'],
        legend: {
          position: 'bottom',
          horizontalAlign: 'center',
          floating: false,
          offsetY: 0,
          offsetX: 0,
          itemMargin: { horizontal: 15, vertical: 5 },
          markers: { width: 12, height: 12, radius: 2 }
        }
      }
    };
  };

  const today = new Date();
  const targetMonth = addMonths(today, monthOffset);
  const monthYearDisplay = format(targetMonth, 'MMMM yyyy');
  const chartData = getChartData();
  const chartOptions = { ...chartData.options };
  const companies = currentMonthItems.map(item => item.company || 'Unknown');

  // Update chart options on company change (no remount)
  useEffect(() => {
    if (chartRef.current && chartData.options && chartData.series) {
      chartRef.current.chart && chartRef.current.chart.updateOptions(chartData.options, false, true);
      chartRef.current.chart && chartRef.current.chart.updateSeries(chartData.series, true);
    }
  }, [selectedCompany, monthOffset, JSON.stringify(chartData.options), JSON.stringify(chartData.series)]);

  // Clear selection when month or company changes
  useEffect(() => {
    clearSelection();
  }, [monthOffset, selectedCompany]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 channel-bar-chart-wrapper">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Daily Performance - {monthYearDisplay}
          {selectedCompany && (
            <span className="ml-2 text-sm font-normal text-blue-600 dark:text-blue-400">
              ({selectedCompany})
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-1"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-1"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCompany(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCompany === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All Companies
          </button>
          {companies.map((company, index) => (
            <button
              type="button"
              key={index}
              onClick={() => setSelectedCompany(company)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCompany === company
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {company}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading chart data...</p>
        </div>
      ) : chartData.series.length > 0 ? (
        <Chart
          ref={chartRef}
          options={chartOptions}
          series={chartData.series}
          type="bar"
          height={350}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No data available for the selected period</p>
        </div>
      )}
      
      {/* Selected Days Details */}
      {selectedDaysData.length > 0 && (
        <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Selected Dates: {selectedDays.join(', ')} 
              {selectedDays.length > 1 && (
                <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                  ({selectedDays.length} days selected)
                </span>
              )}
            </h4>
            <button
              onClick={clearSelection}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium"
            >
              ✕ Clear All
            </button>
          </div>
          
          {/* Selected Days Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedDays.map(day => (
              <span
                key={day}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                Day {day}
                <button
                  onClick={() => removeDayFromSelection(day)}
                  className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          
          {selectedCompany ? (
            // Show selected company aggregated data
            (() => {
              let totalSales = 0, totalPayments = 0, totalLeads = 0;
              
              selectedDaysData.forEach(dayData => {
                const companyData = dayData.data.find(item => item.company === selectedCompany);
                if (companyData) {
                  totalSales += typeof companyData.sales === 'number' ? companyData.sales : parseFloat(companyData.sales) || 0;
                  totalPayments += companyData.payments !== undefined ? parseFloat(companyData.payments) : 0;
                  totalLeads += typeof companyData.leads === 'number' ? companyData.leads : parseFloat(companyData.leads) || 0;
                }
              });
              
              const avgConversion = totalLeads > 0 ? ((totalPayments / totalLeads) ).toFixed(2) : '0.00';
              
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Sales</div>
                    <div className="text-xl font-bold text-green-600">{totalSales.toFixed(2)}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Payments</div>
                    <div className="text-xl font-bold text-amber-600">{totalPayments.toFixed(2)}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Leads</div>
                    <div className="text-xl font-bold text-blue-600">{totalLeads}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Avg Conversion %</div>
                    <div className="text-xl font-bold text-purple-600">{avgConversion}%</div>
                  </div>
                </div>
              );
            })()
          ) : (
            // Show all companies aggregated data
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(() => {
                let totalSales = 0, totalPayments = 0, totalLeads = 0;
                
                selectedDaysData.forEach(dayData => {
                  totalSales += dayData.data.reduce((sum, item) => sum + (typeof item.sales === 'number' ? item.sales : parseFloat(item.sales) || 0), 0);
                  totalPayments += dayData.data.reduce((sum, item) => sum + (typeof item.payments === 'number' ? item.payments : parseFloat(item.payments) || 0), 0);
                  totalLeads += dayData.data.reduce((sum, item) => sum + (typeof item.leads === 'number' ? item.leads : parseFloat(item.leads) || 0), 0);
                });
                
                const avgConversion = totalLeads > 0 ? ((totalPayments / totalLeads)).toFixed(2) : '0.00';
                
                return (
                  <>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Sales</div>
                      <div className="text-xl font-bold text-green-600">{totalSales.toFixed(2)}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Payments</div>
                      <div className="text-xl font-bold text-amber-600">{totalPayments.toFixed(2)}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Leads</div>
                      <div className="text-xl font-bold text-blue-600">{totalLeads}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Avg Conversion %</div>
                      <div className="text-xl font-bold text-purple-600">{avgConversion}%</div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChannelBarChart;