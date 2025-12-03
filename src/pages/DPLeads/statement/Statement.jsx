import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { KeenIcon } from '@/components';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon, Save, DollarSign, Trash2 } from 'lucide-react';
import authService from '@/services/authService';
import CommonTable from '@/components/common/CommonTable';

const API_URL = import.meta.env.VITE_APP_API_URL;

// Demo data
const demoTransactions = [
  { id: 1, date: new Date('2025-12-01'), amount: 1500.00 },
  { id: 2, date: new Date('2025-11-28'), amount: 2300.50 },
  { id: 3, date: new Date('2025-11-25'), amount: 1200.75 },
  { id: 4, date: new Date('2025-11-20'), amount: 3400.00 },
  { id: 5, date: new Date('2025-11-15'), amount: 1800.25 },
];

const demoWithdrawals = [
  { id: 1, date: new Date('2025-11-30'), amount: 850.00, leads: 120, rate: 7.08 },
  { id: 2, date: new Date('2025-11-27'), amount: 1200.00, leads: 150, rate: 8.00 },
  { id: 3, date: new Date('2025-11-23'), amount: 650.50, leads: 95, rate: 6.85 },
  { id: 4, date: new Date('2025-11-18'), amount: 1500.00, leads: 200, rate: 7.50 },
  { id: 5, date: new Date('2025-11-12'), amount: 920.75, leads: 130, rate: 7.08 },
];

const Statement = () => {
  // State for balance and leads count
  const [balance, setBalance] = useState(4230.50);
  const [leadsCount, setLeadsCount] = useState(695);

  // State for input controls
  const [moneyInput, setMoneyInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [setPriceInput, setSetPriceInput] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);

  // State for table data
  const [transactions, setTransactions] = useState(demoTransactions);
  const [withdrawals, setWithdrawals] = useState(demoWithdrawals);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination state
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(demoWithdrawals.length);

  // Sorting state
  const [sorting, setSorting] = useState([{ id: 'date', desc: true }]);

  useEffect(() => {
    authService.setupAxios();
    // Uncomment when API is ready
    // fetchBalanceAndCount();
    // fetchTransactions();
    // fetchWithdrawals();
  }, []);

  const fetchBalanceAndCount = useCallback(async () => {
    try {
      authService.setupAxios();
      // Replace with your actual API endpoints
      const balanceResponse = await axios.get(`${API_URL}/DPLeads/GetBalance`);
      const countResponse = await axios.get(`${API_URL}/DPLeads/GetLeadsCount`);
      
      setBalance(balanceResponse.data?.balance || 0);
      setLeadsCount(countResponse.data?.count || 0);
    } catch (error) {
      console.error('Error fetching balance and count:', error);
      // Don't show error toast for initial data fetch
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      authService.setupAxios();
      // Replace with your actual API endpoint
      const response = await axios.get(`${API_URL}/DPLeads/GetTransactions`, {
        params: {
          PageNo: pageNo,
          PageSize: pageSize,
          SortColumn: sorting.length > 0 ? sorting[0].id : 'date',
          SortDirection: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc'
        }
      });
      
      setTransactions(response.data?.items || response.data?.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [pageNo, pageSize, sorting]);

  const fetchWithdrawals = useCallback(async () => {
    try {
      authService.setupAxios();
      // Replace with your actual API endpoint
      const response = await axios.get(`${API_URL}/DPLeads/GetWithdrawals`, {
        params: {
          PageNo: pageNo,
          PageSize: pageSize,
          SortColumn: sorting.length > 0 ? sorting[0].id : 'date',
          SortDirection: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc'
        }
      });
      
      setWithdrawals(response.data?.items || response.data?.data || []);
      setTotalRecords(response.data?.totalRecords || 0);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  }, [pageNo, pageSize, sorting]);

  const handleSaveTransaction = async () => {
    if (!moneyInput || !selectedDate) {
      toast.error('Please fill in money amount and select a date');
      return;
    }

    try {
      setIsLoading(true);
      authService.setupAxios();
      
      // Replace with your actual API endpoint
      await axios.post(`${API_URL}/DPLeads/AddTransaction`, {
        amount: parseFloat(moneyInput),
        date: selectedDate.toISOString()
      });

      toast.success('Transaction added successfully');
      setMoneyInput('');
      setSelectedDate(new Date());
      fetchBalanceAndCount();
      fetchTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrice = async () => {
    if (!setPriceInput) {
      toast.error('Please enter a price');
      return;
    }

    try {
      setIsLoading(true);
      authService.setupAxios();
      
      // Replace with your actual API endpoint
      await axios.post(`${API_URL}/DPLeads/SetPrice`, {
        price: parseFloat(setPriceInput)
      });

      toast.success('Price updated successfully');
      setSetPriceInput('');
      fetchBalanceAndCount();
    } catch (error) {
      console.error('Error setting price:', error);
      toast.error('Failed to set price');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setCalendarOpen(false);
  };

  const handlePageChange = (newPage) => {
    setPageNo(newPage);
  };

  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    setPageSize(newPageSize);
    setPageNo(1);
  };

  const handleDeleteTransaction = async (id) => {
    try {
      setIsLoading(true);
      authService.setupAxios();
      
      // Replace with your actual API endpoint
      await axios.delete(`${API_URL}/DPLeads/DeleteTransaction/${id}`);
      
      toast.success('Transaction deleted successfully');
      // Remove from local state for demo
      setTransactions(transactions.filter(t => t.id !== id));
      fetchBalanceAndCount();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWithdrawal = async (id) => {
    try {
      setIsLoading(true);
      authService.setupAxios();
      
      // Replace with your actual API endpoint
      await axios.delete(`${API_URL}/DPLeads/DeleteWithdrawal/${id}`);
      
      toast.success('Withdrawal deleted successfully');
      // Remove from local state for demo
      setWithdrawals(withdrawals.filter(w => w.id !== id));
      fetchBalanceAndCount();
    } catch (error) {
      console.error('Error deleting withdrawal:', error);
      toast.error('Failed to delete withdrawal');
    } finally {
      setIsLoading(false);
    }
  };

  // Transaction columns
  const transactionColumns = useMemo(
    () => [
      {
        accessorFn: (row) => row.date,
        id: 'date',
        header: () => <div className="w-full text-center">Date</div>,
        cell: ({ row }) => {
          const date = row.original.date ? new Date(row.original.date) : null;
          return (
            <div className="text-center w-full">
              {date ? format(date, 'dd MMM yyyy') : 'N/A'}
            </div>
          );
        },
        meta: { headerClassName: 'min-w-[150px] text-center', cellClassName: 'text-center' },
      },
      {
        accessorFn: (row) => row.amount,
        id: 'amount',
        header: () => <div className="w-full text-center">Amount</div>,
        cell: ({ row }) => (
          <div className="text-center w-full font-medium text-green-600">
            ${row.original.amount?.toFixed(2) || '0.00'}
          </div>
        ),
        meta: { headerClassName: 'min-w-[120px] text-center', cellClassName: 'text-center' },
      },
      {
        id: 'action',
        header: () => <div className="w-full text-center">Action</div>,
        cell: ({ row }) => (
          <div className="flex justify-center items-center w-full">
            <button
              className="p-1 rounded hover:bg-red-100 text-red-600 flex items-center justify-center"
              onClick={() => handleDeleteTransaction(row.original.id)}
              title="Delete"
              style={{ background: 'none', border: 'none' }}
            >
              <Trash2 size={18} className="text-red-600 hover:text-red-700 font-bold" />
            </button>
          </div>
        ),
        meta: { headerClassName: 'min-w-[80px] text-center', cellClassName: 'text-center' },
      },
    ],
    [handleDeleteTransaction]
  );

  // Withdrawal columns
  const withdrawalColumns = useMemo(
    () => [
      {
        accessorFn: (row) => row.date,
        id: 'date',
        header: () => <div className="w-full text-center">Date</div>,
        cell: ({ row }) => {
          const date = row.original.date ? new Date(row.original.date) : null;
          return (
            <div className="text-center w-full">
              {date ? format(date, 'dd MMM yyyy') : 'N/A'}
            </div>
          );
        },
        meta: { headerClassName: 'min-w-[150px] text-center', cellClassName: 'text-center' },
      },
      {
        accessorFn: (row) => row.amount,
        id: 'amount',
        header: () => <div className="w-full text-center">Amount</div>,
        cell: ({ row }) => (
          <div className="text-center w-full font-medium text-red-600">
            ${row.original.amount?.toFixed(2) || '0.00'}
          </div>
        ),
        meta: { headerClassName: 'min-w-[120px] text-center', cellClassName: 'text-center' },
      },
      {
        accessorFn: (row) => row.leads,
        id: 'leads',
        header: () => <div className="w-full text-center">Leads</div>,
        cell: ({ row }) => (
          <div className="text-center w-full">
            {row.original.leads || 0}
          </div>
        ),
        meta: { headerClassName: 'min-w-[100px] text-center', cellClassName: 'text-center' },
      },
      {
        accessorFn: (row) => row.rate,
        id: 'rate',
        header: () => <div className="w-full text-center">Rate</div>,
        cell: ({ row }) => (
          <div className="text-center w-full font-medium">
            ${row.original.rate?.toFixed(2) || '0.00'}
          </div>
        ),
        meta: { headerClassName: 'min-w-[100px] text-center', cellClassName: 'text-center' },
      },
      {
        id: 'action',
        header: () => <div className="w-full text-center">Action</div>,
        cell: ({ row }) => (
          <div className="flex justify-center items-center w-full">
            <button
              className="p-1 rounded hover:bg-red-100 text-red-600 flex items-center justify-center"
              onClick={() => handleDeleteWithdrawal(row.original.id)}
              title="Delete"
              style={{ background: 'none', border: 'none' }}
            >
              <Trash2 size={18} className="text-red-600 hover:text-red-700 font-bold" />
            </button>
          </div>
        ),
        meta: { headerClassName: 'min-w-[80px] text-center', cellClassName: 'text-center' },
      },
    ],
    [handleDeleteWithdrawal]
  );

  return (
    <div className="w-full bg-white dark:bg-coal-500 p-4">
      <div className="card shadow-md bg-white rounded-lg overflow-hidden dark:bg-gray-100">
        {/* Header with Balance and Leads Count */}
        <div className="px-3 sm:px-5 py-4 border-b border-gray-200 dark:bg-gray-100 dark:border-gray-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-800">
              DP Leads Statement
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-600 mt-1">
              Track your DP leads transactions and withdrawals.
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto flex-wrap">
            <div className="flex flex-col items-center justify-center px-4 py-2 bg-green-50 dark:bg-green-100 rounded-lg border border-green-200 dark:border-green-300">
              <span className="text-xs text-gray-600 dark:text-gray-700">Balance</span>
              <span className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-700">
                ${balance.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center px-4 py-2 bg-blue-50 dark:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-300">
              <span className="text-xs text-gray-600 dark:text-gray-700">Leads</span>
              <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-700">
                {leadsCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Input Controls */}
      <div className="px-3 sm:px-5 py-4 border-b border-gray-200 dark:bg-gray-100 dark:border-gray-300">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end justify-between">
          {/* Left side: Money input, Date filter, and Add Transaction button */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto min-w-0">
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 w-full sm:w-40 dark:bg-gray-200 relative min-w-0">
              <DollarSign size={16} className="text-gray-600 dark:text-gray-800 flex-shrink-0" />
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={moneyInput}
                onChange={(e) => setMoneyInput(e.target.value)}
                className="w-full outline-none bg-transparent dark:text-gray-800 min-w-0"
                style={{ fontSize: "13px" }}
              />
            </div>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-44 justify-start text-left font-normal dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300 min-w-0 shrink-0 text-xs sm:text-sm"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {selectedDate ? format(selectedDate, "dd MMM yyyy") : "Select date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50 dark:bg-gray-100 dark:text-gray-800 dark:border-gray-300">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="dark:bg-gray-100 dark:text-gray-800"
                />
              </PopoverContent>
            </Popover>
            <Button
              onClick={handleSaveTransaction}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shrink-0"
            >
              <Save size={16} />
              <span>Add</span>
            </Button>
          </div>

          {/* Right side: Set price input and Save Price button */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto min-w-0">
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 w-full sm:w-40 dark:bg-gray-200 relative min-w-0">
              <DollarSign size={16} className="text-gray-600 dark:text-gray-800 flex-shrink-0" />
              <input
                type="number"
                step="0.01"
                placeholder="Set price"
                value={setPriceInput}
                onChange={(e) => setSetPriceInput(e.target.value)}
                className="w-full outline-none bg-transparent dark:text-gray-800 min-w-0"
                style={{ fontSize: "13px" }}
              />
            </div>
            <Button
              onClick={handleSavePrice}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shrink-0"
            >
              <Save size={16} />
              <span>Save</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Dual-section Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5 p-4">
        {/* Transaction Section */}
        <div className="flex flex-col">
          <div className="mb-3">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-800 mb-1">
              Transactions
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-600">
              Incoming funds and deposits
            </p>
          </div>
          <CommonTable
            columns={transactionColumns}
            data={transactions}
            sorting={sorting}
            isLoading={isLoading}
            onSortingChange={setSorting}
            emptyMessage="No transactions found."
            pageNo={pageNo}
            pageSize={pageSize}
            total={transactions.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>

        {/* Withdrawal Section */}
        <div className="flex flex-col">
          <div className="mb-3">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-800 mb-1">
              Withdrawals
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-600">
              Outgoing funds with lead details
            </p>
          </div>
          <CommonTable
            columns={withdrawalColumns}
            data={withdrawals}
            sorting={sorting}
            isLoading={isLoading}
            onSortingChange={setSorting}
            emptyMessage="No withdrawals found."
            pageNo={pageNo}
            pageSize={pageSize}
            total={totalRecords}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>
    </div>
    </div>
  );
};

export { Statement };