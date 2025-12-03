import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { KeenIcon } from '@/components';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';
import { X, Plus, Save, Calendar, Edit, Pencil, Trash2, Upload, Download } from 'lucide-react';
import authService from '@/services/authService';
import CommonTable from '@/components/common/CommonTable';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_URL = import.meta.env.VITE_APP_API_URL;

const Toolbar = ({
    searchInput,
    handleSearch,
    clearSearch,
    selectedBrand,
    handleBrandChange,
    brandOptions,
    filteredData,
    totalExpenses
}) => {
    const displayedRows = filteredData.length;

    return (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 border-b border-gray-200 px-4 py-3 items-start sm:items-center justify-between dark:bg-gray-100 dark:border-gray-300">
            <h3 className="font-medium text-sm dark:text-gray-800 w-full sm:w-auto min-w-0 break-words">
                Showing {displayedRows} of {totalExpenses} Expenses
            </h3>
            <div className="flex flex-col sm:flex-row flex-wrap w-full sm:w-auto gap-2 lg:gap-3 min-w-0">
                <div className="flex items-center gap-2 border rounded-lg px-2 pr-7 py-1 w-full sm:w-64 dark:bg-gray-200 relative min-w-0 focus-within:ring-1 focus-within:ring-gray-300">
                    <KeenIcon icon="magnifier" className="dark:text-gray-800 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search Expenses"
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

                <Select value={selectedBrand} onValueChange={handleBrandChange}>
                    <SelectTrigger className="w-full sm:w-36 min-w-0 shrink-0 dark:text-gray-800 dark:bg-gray-200">
                        <SelectValue placeholder="All Brand" />
                    </SelectTrigger>
                    <SelectContent className="z-50 dark:bg-gray-100 dark:text-gray-800">
                        <SelectGroup>
                            <SelectItem value="all">All Brand</SelectItem>
                            {brandOptions.map((brand) => (
                                <SelectItem key={brand.value} value={brand.value}>
                                    {brand.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

const ExpenseSharesDetail = ({ expenseShares }) => {
    return (
        <div className="space-y-2">
            {expenseShares?.map((share, index) => (
                <div key={share.id || index} className="bg-gray-50 p-2 rounded text-xs">
                    <div className="font-medium">{share.company}</div>
                    <div className="text-gray-600">${share.amount?.toFixed(2)}</div>
                </div>
            ))}
        </div>
    );
};

const AddExpenseModal = ({ isOpen, onClose, onSubmit, brands = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        amount: '',
        date: new Date().toISOString().slice(0, 16), // Format for datetime-local input
        source: '',
        cardOrBankNumber: '',
        isRefund: false,
        isDeleted: false,
        expenseShares: [
            { company: 'QS', amount: '' },
            { company: 'SO', amount: '' },
            { company: 'RR', amount: '' },
            { company: 'D9', amount: '' }
        ]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleShareChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            expenseShares: prev.expenseShares.map((share, i) =>
                i === index ? { ...share, amount: value } : share
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate required fields
            if (!formData.name.trim() || !formData.amount || !formData.date) {
                toast.error('Please fill in all required fields');
                return;
            }

            // Calculate total shares amount
            const sharesTotal = formData.expenseShares.reduce((total, share) => {
                return total + (parseFloat(share.amount) || 0);
            }, 0);

            // Validate that shares total matches amount
            const mainAmount = parseFloat(formData.amount);
            if (Math.abs(sharesTotal - mainAmount) > 0.01) {
                toast.error(`Expense shares total ($${sharesTotal.toFixed(2)}) must equal the main amount ($${mainAmount.toFixed(2)})`);
                return;
            }

            // Prepare data for API
            const expenseData = {
                id: 0,
                name: formData.name.trim(),
                brand: formData.brand.trim(),
                amount: parseFloat(formData.amount),
                date: new Date(formData.date).toISOString(),
                isDeleted: formData.isDeleted,
                source: formData.source.trim(),
                cardOrBankNumber: formData.cardOrBankNumber.trim(),
                isRefund: formData.isRefund,
                expenseShares: formData.expenseShares
                    .filter(share => parseFloat(share.amount) > 0)
                    .map((share, index) => ({
                        id: 0,
                        expId: 0,
                        company: share.company,
                        amount: parseFloat(share.amount)
                    }))
            };

            await onSubmit(expenseData);
            onClose();

            // Reset form
            setFormData({
                name: '',
                brand: '',
                amount: '',
                date: new Date().toISOString().slice(0, 16),
                source: '',
                cardOrBankNumber: '',
                isRefund: false,
                isDeleted: false,
                expenseShares: [
                    { company: 'QS', amount: '' },
                    { company: 'SO', amount: '' },
                    { company: 'RR', amount: '' },
                    { company: 'D9', amount: '' }
                ]
            });

        } catch (error) {
            console.error('Error submitting expense:', error);
            toast.error('Failed to add expense');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-300 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-800">Add New Expense</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500 dark:text-gray-700" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
                                Expense Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                                placeholder="Enter expense name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
                                Brand
                            </label>
                            <Select
                                key={`add-expense-brand-${formData.brand}-${isOpen}`}
                                value={formData.brand}
                                onValueChange={(value) => handleInputChange('brand', value)}
                            >
                                <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400">
                                    <SelectValue placeholder="Select Brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.value} value={brand.value}>
                                                {brand.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
                                Total Amount *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => handleInputChange('amount', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
                                Date *
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.date}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
                                Card/Bank Source
                            </label>
                            <input
                                type="text"
                                value={formData.source}
                                onChange={(e) => handleInputChange('source', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                                placeholder="Payment source"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
                                Card/Bank Number
                            </label>
                            <input
                                type="text"
                                value={formData.cardOrBankNumber}
                                onChange={(e) => handleInputChange('cardOrBankNumber', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                                placeholder="**** **** **** 1234"
                            />
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.isRefund}
                                onChange={(e) => handleInputChange('isRefund', e.target.checked)}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-800">Is Refund</span>
                        </label>
                    </div>

                    {/* Expense Shares */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                            Expense Shares Distribution
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {formData.expenseShares.map((share, index) => (
                                <div key={index}>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-700 mb-1">
                                        {share.company}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={share.amount}
                                        onChange={(e) => handleShareChange(index, e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400 text-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-600">
                            Total shares: ${formData.expenseShares.reduce((total, share) => total + (parseFloat(share.amount) || 0), 0).toFixed(2)}
                        </div>
                    </div>
                    </div>

                    {/* Fixed Footer */}
                    <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-300 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-300 dark:text-gray-800 dark:hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Add Expense
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditExpenseModal = ({ isOpen, onClose, onSubmit, expenseData, brands = [] }) => {
    const [formData, setFormData] = useState({
        id: 0,
        name: '',
        brand: '',
        amount: '',
        date: new Date().toISOString().slice(0, 16),
        source: '',
        cardOrBankNumber: '',
        isRefund: false,
        isDeleted: false,
        expenseShares: [
            { id: 0, expId: 0, company: 'QS', amount: '' },
            { id: 0, expId: 0, company: 'SO', amount: '' },
            { id: 0, expId: 0, company: 'RR', amount: '' },
            { id: 0, expId: 0, company: 'D9', amount: '' }
        ]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Populate form when expenseData changes
    useEffect(() => {
        if (expenseData && isOpen) {
            const existingShares = expenseData.expenseShares || [];

            // Create shares array with existing data
            const sharesData = [
                { id: 0, expId: expenseData.id, company: 'QS', amount: '' },
                { id: 0, expId: expenseData.id, company: 'SO', amount: '' },
                { id: 0, expId: expenseData.id, company: 'RR', amount: '' },
                { id: 0, expId: expenseData.id, company: 'D9', amount: '' }
            ];

            // Fill in existing share amounts
            existingShares.forEach(share => {
                const company = share.company?.toUpperCase();
                if (company?.includes('QS') || company?.includes('QUICKSOLUTION')) {
                    const qsIndex = sharesData.findIndex(s => s.company === 'QS');
                    if (qsIndex !== -1) {
                        sharesData[qsIndex] = { ...share, company: 'QS' };
                    }
                } else if (company?.includes('SO') || company?.includes('SALES')) {
                    const soIndex = sharesData.findIndex(s => s.company === 'SO');
                    if (soIndex !== -1) {
                        sharesData[soIndex] = { ...share, company: 'SO' };
                    }
                } else if (company?.includes('RR') || company?.includes('REVENUE')) {
                    const rrIndex = sharesData.findIndex(s => s.company === 'RR');
                    if (rrIndex !== -1) {
                        sharesData[rrIndex] = { ...share, company: 'RR' };
                    }
                } else if (company?.includes('D9') || company?.includes('DIGITAL')) {
                    const d9Index = sharesData.findIndex(s => s.company === 'D9');
                    if (d9Index !== -1) {
                        sharesData[d9Index] = { ...share, company: 'D9' };
                    }
                }
            });

            setFormData({
                id: expenseData.id,
                name: expenseData.name || '',
                brand: expenseData.brand || '',
                amount: expenseData.amount?.toString() || '',
                date: expenseData.date ? new Date(expenseData.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                source: expenseData.source || '',
                cardOrBankNumber: expenseData.cardOrBankNumber || '',
                isRefund: expenseData.isRefund || false,
                isDeleted: expenseData.isDeleted || false,
                expenseShares: sharesData
            });
        }
    }, [expenseData, isOpen]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleShareChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            expenseShares: prev.expenseShares.map((share, i) =>
                i === index ? { ...share, amount: value } : share
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate required fields
            if (!formData.name.trim() || !formData.amount || !formData.date) {
                toast.error('Please fill in all required fields');
                return;
            }

            // Calculate total shares amount
            const sharesTotal = formData.expenseShares.reduce((total, share) => {
                return total + (parseFloat(share.amount) || 0);
            }, 0);

            // Validate that shares total matches amount
            const mainAmount = parseFloat(formData.amount);
            if (Math.abs(sharesTotal - mainAmount) > 0.01) {
                toast.error(`Expense shares total ($${sharesTotal.toFixed(2)}) must equal the main amount ($${mainAmount.toFixed(2)})`);
                return;
            }

            // Prepare data for API
            const expenseUpdateData = {
                id: formData.id,
                name: formData.name.trim(),
                brand: formData.brand.trim(),
                amount: parseFloat(formData.amount),
                date: new Date(formData.date).toISOString(),
                isDeleted: formData.isDeleted,
                source: formData.source.trim(),
                cardOrBankNumber: formData.cardOrBankNumber.trim(),
                isRefund: formData.isRefund,
                expenseShares: formData.expenseShares
                    .filter(share => parseFloat(share.amount) > 0)
                    .map((share) => ({
                        id: share.id || 0,
                        expId: formData.id,
                        company: share.company,
                        amount: parseFloat(share.amount)
                    }))
            };

            await onSubmit(expenseUpdateData);
            onClose();

        } catch (error) {
            console.error('Error updating expense:', error);
            toast.error('Failed to update expense');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-300 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-800">Edit Expense</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500 dark:text-gray-700" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
                                Expense Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                                placeholder="Enter expense name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
                                Brand
                            </label>
                            <Select
                                key={`edit-expense-brand-${formData.brand}-${isOpen}`}
                                value={formData.brand}
                                onValueChange={(value) => handleInputChange('brand', value)}
                            >
                                <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400">
                                    <SelectValue placeholder="Select Brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.value} value={brand.value}>
                                                {brand.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
                                Total Amount *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => handleInputChange('amount', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
                                Date *
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.date}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
                                Card/Bank Source
                            </label>
                            <input
                                type="text"
                                value={formData.source}
                                onChange={(e) => handleInputChange('source', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                                placeholder="Payment source"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
                                Card/Bank Number
                            </label>
                            <input
                                type="text"
                                value={formData.cardOrBankNumber}
                                onChange={(e) => handleInputChange('cardOrBankNumber', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                                placeholder="**** **** **** 1234"
                            />
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.isRefund}
                                onChange={(e) => handleInputChange('isRefund', e.target.checked)}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-800">Is Refund</span>
                        </label>
                    </div>

                    {/* Expense Shares */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                            Expense Shares Distribution
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {formData.expenseShares.map((share, index) => (
                                <div key={index}>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-700 mb-1">
                                        {share.company}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={share.amount}
                                        onChange={(e) => handleShareChange(index, e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400 text-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-600">
                            Total shares: ${formData.expenseShares.reduce((total, share) => total + (parseFloat(share.amount) || 0), 0).toFixed(2)}
                        </div>
                    </div>
                    </div>

                    {/* Fixed Footer */}
                    <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-300 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-300 dark:text-gray-800 dark:hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Update Expense
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, expenseName, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-300">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-800">Delete Expense</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-200 rounded-full transition-colors"
                        disabled={isDeleting}
                    >
                        <X size={20} className="text-gray-500 dark:text-gray-700" />
                    </button>
                </div>

                <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Trash2 size={20} className="text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-800">
                                Are you sure?
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-600">
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-800 mb-6">
                        You are about to delete the expense: <span className="font-semibold">"{expenseName}"</span>
                    </p>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-300 dark:text-gray-800 dark:hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                    Delete
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Table = () => {
    // State
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('all');
    const [totalCount, setTotalCount] = useState(0);
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sorting, setSorting] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingExpense, setDeletingExpense] = useState(null);
    
    // Ref to track search debounce timer
    const searchTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUploadingExcel, setIsUploadingExcel] = useState(false);
    const [brands, setBrands] = useState([]);
    const [brandOptions, setBrandOptions] = useState([]);

    // Fetch brand options
    const fetchBrandOptions = useCallback(async () => {
        try {
            authService.setupAxios();

            const response = await axios.get(`${API_URL}/Payment/GetBrands`);

            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                const options = response.data.data
                    .filter(brand => brand !== null && brand !== undefined && brand.brand)
                    .map(brand => ({
                        value: brand.brand,
                        label: brand.brand
                    }))
                    .filter(option => option.value !== '' && option.label !== '');
                setBrands(options);
                setBrandOptions(options); // Also set for the dropdown
            } else if (response.data && Array.isArray(response.data)) {
                const options = response.data
                    .filter(brand => brand !== null && brand !== undefined && brand.brand)
                    .map(brand => ({
                        value: brand.brand,
                        label: brand.brand
                    }))
                    .filter(option => option.value !== '' && option.label !== '');
                setBrands(options);
                setBrandOptions(options); // Also set for the dropdown
            } else {
                console.error('Unexpected brand data format:', response.data);
                setBrands([]);
                setBrandOptions([]);
            }
        } catch (error) {
            console.error('Error fetching brand options:', error);
            toast.error('Failed to fetch brand options');
            setBrands([]);
            setBrandOptions([]);

            if (error.response && error.response.status === 401) {
                authService.logout();
            }
        }
    }, []);

    // Fetch data
    const fetchExpenses = async (searchText = '', brandFilter = selectedBrand, currentPageNo = pageNo, currentPageSize = pageSize) => {
        try {
            setLoading(true);
            authService.setupAxios();

            const params = {
                pageNumber: currentPageNo,
                pageSize: currentPageSize
            };

            // Add search text parameter if provided
            if (searchText && searchText.trim()) {
                params.text = searchText.trim();
            }

            // Add brand filter parameter if provided (using bname)
            if (brandFilter && brandFilter !== 'all') {
                params.bname = brandFilter;
            }

            const response = await axios.get(`${API_URL}/Expense/GetExpenseList`, {
                params: params
            });

            if (response.data) {
                setData(response.data.data || []);
                setTotalCount(response.data.totalCount || 0);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
            toast.error('Failed to fetch expenses');
        } finally {
            setLoading(false);
        }
    };

    // Single effect for data fetching with debounced search
    useEffect(() => {
        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // If there's a search input, debounce it
        if (searchInput && searchInput.trim()) {
            searchTimeoutRef.current = setTimeout(() => {
                fetchExpenses(searchInput, selectedBrand, pageNo, pageSize);
            }, 300);
        } else {
            // If no search input, fetch immediately
            fetchExpenses('', selectedBrand, pageNo, pageSize);
        }

        // Cleanup timeout on unmount or dependency change
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [pageNo, pageSize, searchInput, selectedBrand]);

    // Effect for brand options (only on mount)
    useEffect(() => {
        fetchBrandOptions();
    }, [fetchBrandOptions]);

    // Since we're using server-side search, filteredData is just the data from server
    const filteredData = data;

    // Handlers
    const handleSearch = useCallback((e) => {
        setSearchInput(e.target.value);
        // Reset to page 1 when searching
        if (pageNo !== 1) {
            setPageNo(1);
        }
    }, [pageNo]);

    const clearSearch = useCallback(() => {
        setSearchInput('');
        // Reset to page 1 when clearing search
        if (pageNo !== 1) {
            setPageNo(1);
        }
    }, [pageNo]);

    const handlePageChange = useCallback((newPage) => {
        setPageNo(newPage);
    }, []);

    const handlePageSizeChange = useCallback((e) => {
        setPageSize(Number(e.target.value));
        setPageNo(1);
    }, []);

    const handleSortingChange = useCallback((newSorting) => {
        setSorting(newSorting);
    }, []);

    const handleBrandChange = useCallback((value) => {
        setSelectedBrand(value);
        setPageNo(1);
    }, []);

    const handleAddExpense = useCallback(() => {
        setIsAddModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsAddModalOpen(false);
    }, []);

    const handleCloseEditModal = useCallback(() => {
        setIsEditModalOpen(false);
        setEditingExpense(null);
    }, []);

    const handleEditExpense = useCallback((expense) => {
        setEditingExpense(expense);
        setIsEditModalOpen(true);
    }, []);

    const handleDeleteExpense = useCallback((expense) => {
        setDeletingExpense(expense);
        setIsDeleteModalOpen(true);
    }, []);

    const handleCloseDeleteModal = useCallback(() => {
        setIsDeleteModalOpen(false);
        setDeletingExpense(null);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!deletingExpense) return;

        setIsDeleting(true);
        try {
            authService.setupAxios();

            const response = await axios.get(`${API_URL}/Expense/DeleteExpenseDetails`, {
                params: {
                    id: deletingExpense.id
                }
            });

            if (response.status === 200 || response.status === 204) {
                toast.success('Expense deleted successfully!');
                // Refresh the data
                fetchExpenses(searchInput, selectedBrand, pageNo, pageSize);
                // Close modal
                setIsDeleteModalOpen(false);
                setDeletingExpense(null);
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error('Failed to delete expense. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    }, [deletingExpense, fetchExpenses]);

    const handleSubmitExpense = useCallback(async (expenseData) => {
        try {
            authService.setupAxios();

            const response = await axios.post(`${API_URL}/Expense/PostExpenseDetails`, expenseData);

            if (response.status === 200 || response.status === 201) {
                toast.success('Expense added successfully!');
                // Refresh the data
                fetchExpenses(searchInput, selectedBrand, pageNo, pageSize);
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            toast.error('Failed to add expense. Please try again.');
            throw error; // Re-throw to handle in modal
        }
    }, [fetchExpenses]);

    const handleUpdateExpense = useCallback(async (expenseData) => {
        try {
            authService.setupAxios();

            const response = await axios.post(`${API_URL}/Expense/UpdateExpenseDetails`, expenseData);

            if (response.status === 200 || response.status === 201) {
                toast.success('Expense updated successfully!');
                // Refresh the data
                fetchExpenses(searchInput, selectedBrand, pageNo, pageSize);
            }
        } catch (error) {
            console.error('Error updating expense:', error);
            toast.error('Failed to update expense. Please try again.');
            throw error; // Re-throw to handle in modal
        }
    }, [fetchExpenses]);

    const handleUploadExcel = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv' // .csv
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error('Please select a valid Excel file (.xlsx, .xls) or CSV file.');
            return;
        }

        setIsUploadingExcel(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(`${API_URL}/Expense/upload-excel`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Check for success in response data or status
            if (response.status === 200 || response.status === 201 || response.data?.success !== false) {
                toast.success(response.data?.message || 'Excel file uploaded successfully!');

                // Force refresh the data after successful upload
                console.log('Refreshing data after successful upload...');
                await fetchExpenses(searchInput, selectedBrand, pageNo, pageSize);

                // Reset page to 1 to see new data
                setPageNo(1);

            } else {
                toast.error(response.data?.message || 'Failed to upload Excel file.');
            }
        } catch (error) {
            console.error('Error uploading Excel file:', error);
            if (error.response?.status === 200 || error.response?.status === 201) {
                // Sometimes a 200 response is caught as an error due to response format
                toast.success('Excel file uploaded successfully!');
                console.log('Refreshing data after upload...');
                await fetchExpenses(searchInput, selectedBrand, pageNo, pageSize);
                setPageNo(1);
                toast.success('Data refreshed successfully!');
            } else {
                toast.error(error.response?.data?.message || error.message || 'Error uploading Excel file. Please try again.');
            }
        } finally {
            setIsUploadingExcel(false);
            // Reset the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDownloadDemo = () => {
        const link = document.createElement('a');
        link.href = '/ExcelDemo/ExpenseData.xlsx';
        link.download = 'ExpenseData_Demo.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Demo Excel file downloaded successfully!');
    };

    // Column definitions
    const columns = useMemo(() => [
        {
            id: 'name',
            header: 'Expense Name',
            enableSorting: false,
            cell: ({ row }) => (
                <div className="font-medium text-gray-900 dark:text-gray-800">
                    {row.original.name || 'N/A'}
                </div>
            ),
            meta: {
                headerClassName: 'w-48',
                cellClassName: 'min-w-[12rem]'
            }
        },
        {
            id: 'brand',
            header: ({ column } = {}) => (
                <div className="flex items-center justify-center gap-1 w-full">
                    <span>Brand</span>
                </div>
            ),
            enableSorting: false,
            cell: ({ row }) => {
                const brandValue = row.original.brand;
                const brand = brands.find(b => b.value === brandValue);
                return (
                    <div className="text-gray-700 dark:text-gray-700 text-center">
                        {brand ? brand.label : (brandValue || 'N/A')}
                    </div>
                );
            },
            meta: {
                headerClassName: 'w-32 text-center',
                cellClassName: 'min-w-[8rem] text-center'
            }
        },
        {
            id: 'source',
            header: ({ column } = {}) => (
                <div className="flex items-center justify-center gap-1 w-full">
                    <span>Source</span>
                </div>
            ),
            enableSorting: false,
            cell: ({ row }) => (
                <div className="text-center">
                    <div className="text-gray-700 dark:text-gray-700">
                        {row.original.source || 'N/A'}
                    </div>
                    <div className="text-gray-700 dark:text-gray-700 font-mono">
                        {row.original.cardOrBankNumber || 'N/A'}
                    </div>
                </div>
            ),
            meta: {
                headerClassName: 'w-36 text-center',
                cellClassName: 'min-w-[9rem] text-center'
            }
        },
        {
            id: 'qs',
            header: ({ column } = {}) => (
                <div className="flex items-center justify-center gap-1 w-full">
                    <span>QS</span>
                </div>
            ),
            enableSorting: false,
            cell: ({ row }) => {
                const shares = row.original.expenseShares;
                const qsTotal = shares?.reduce((total, share) => {
                    if (share.company?.toLowerCase().includes('qs') || share.company?.toLowerCase().includes('quicksolution')) {
                        return total + (share.amount || 0);
                    }
                    return total;
                }, 0) || 0;
                return (
                    <div className="text-gray-700 dark:text-gray-700 text-center">
                        ${qsTotal.toFixed(2)}
                    </div>
                );
            },
            meta: {
                headerClassName: 'w-24 text-center',
                cellClassName: 'min-w-[6rem] text-center'
            }
        },
        {
            id: 'so',
            header: ({ column } = {}) => (
                <div className="flex items-center justify-center gap-1 w-full">
                    <span>SO</span>
                </div>
            ),
            enableSorting: false,
            cell: ({ row }) => {
                const shares = row.original.expenseShares;
                const soTotal = shares?.reduce((total, share) => {
                    if (share.company?.toLowerCase().includes('so') || share.company?.toLowerCase().includes('sales')) {
                        return total + (share.amount || 0);
                    }
                    return total;
                }, 0) || 0;
                return (
                    <div className="text-gray-700 dark:text-gray-700 text-center">
                        ${soTotal.toFixed(2)}
                    </div>
                );
            },
            meta: {
                headerClassName: 'w-24 text-center',
                cellClassName: 'min-w-[6rem] text-center'
            }
        },
        {
            id: 'rr',
            header: ({ column } = {}) => (
                <div className="flex items-center justify-center gap-1 w-full">
                    <span>RR</span>
                </div>
            ),
            enableSorting: false,
            cell: ({ row }) => {
                const shares = row.original.expenseShares;
                const rrTotal = shares?.reduce((total, share) => {
                    if (share.company?.toLowerCase().includes('rr') || share.company?.toLowerCase().includes('revenue')) {
                        return total + (share.amount || 0);
                    }
                    return total;
                }, 0) || 0;
                return (
                    <div className="text-gray-700 dark:text-gray-700 text-center">
                        ${rrTotal.toFixed(2)}
                    </div>
                );
            },
            meta: {
                headerClassName: 'w-24 text-center',
                cellClassName: 'min-w-[6rem] text-center'
            }
        },
        {
            id: 'd9',
            header: ({ column } = {}) => (
                <div className="flex items-center justify-center gap-1 w-full">
                    <span>D9</span>
                </div>
            ),
            enableSorting: false,
            cell: ({ row }) => {
                const shares = row.original.expenseShares;
                const d9Total = shares?.reduce((total, share) => {
                    if (share.company?.toLowerCase().includes('d9') || share.company?.toLowerCase().includes('digital')) {
                        return total + (share.amount || 0);
                    }
                    return total;
                }, 0) || 0;
                return (
                    <div className="text-gray-700 dark:text-gray-700 text-center">
                        ${d9Total.toFixed(2)}
                    </div>
                );
            },
            meta: {
                headerClassName: 'w-24 text-center',
                cellClassName: 'min-w-[6rem] text-center'
            }
        },
        {
            id: 'amount',
            header: ({ column } = {}) => (
                <div className="flex items-center justify-center gap-1 w-full">
                    <span>Amount</span>
                </div>
            ),
            enableSorting: false,
            cell: ({ row }) => (
                <div className="font-semibold text-green-600 text-center">
                    ${row.original.amount?.toFixed(2) || '0.00'}
                </div>
            ),
            meta: {
                headerClassName: 'w-32 text-center',
                cellClassName: 'min-w-[8rem] text-center'
            }
        },
        {
            id: 'date',
            header: ({ column } = {}) => (
                <div className="flex items-center justify-center gap-1 w-full">
                    <span>Date</span>
                </div>
            ),
            enableSorting: false,
            cell: ({ row }) => {
                const date = row.original.date ? new Date(row.original.date) : null;
                return (
                    <div className="text-gray-700 dark:text-gray-700 text-center">
                        {date ? format(date, 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </div>
                );
            },
            meta: {
                headerClassName: 'w-40 text-center',
                cellClassName: 'min-w-[10rem] text-center'
            }
        },
        {
            id: 'isRefund',
            header: ({ column } = {}) => (
                <div className="flex items-center justify-center gap-1 w-full">
                    <span>Status</span>
                </div>
            ),
            enableSorting: false,
            cell: ({ row }) => (
                <div className="flex gap-2 justify-center">
                    {row.original.isRefund && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Refund
                        </span>
                    )}
                    {row.original.isDeleted && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Deleted
                        </span>
                    )}
                    {!row.original.isRefund && !row.original.isDeleted && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                        </span>
                    )}
                </div>
            ),
            meta: {
                headerClassName: 'w-32 text-center',
                cellClassName: 'min-w-[8rem] text-center'
            }
        },
        {
            id: 'actions',
            header: ({ column } = {}) => (
                <div className="flex items-center justify-center gap-1 w-full">
                    <span>Actions</span>
                </div>
            ),
            enableSorting: false,
            cell: ({ row }) => (
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => handleEditExpense(row.original)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors dark:hover:bg-blue-100"
                        title="Edit expense"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => handleDeleteExpense(row.original)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors dark:hover:bg-red-100"
                        title="Delete expense"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
            meta: {
                headerClassName: 'w-24 text-center',
                cellClassName: 'min-w-[6rem] text-center'
            }
        }
    ], [handleEditExpense, handleDeleteExpense, brands]);

    return (
        <>
            <div className="card shadow-md bg-white rounded-lg overflow-hidden dark:bg-gray-100">
                <div className="px-3 sm:px-5 py-4 border-b border-gray-200 dark:bg-gray-100 dark:border-gray-300">
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
                        <div className="flex-1">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-800">Expenses</h2>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-600 mt-1">
                                Track your expense data across all brands and categories.
                            </p>
                        </div>
                        <div className='flex items-center gap-2 w-full sm:w-auto flex-wrap'>
                            <button
                                onClick={handleDownloadDemo}
                                className="flex items-center justify-center gap-2 w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-blue-600 hover:bg-blue-700 hover:text-white text-white border-blue-600 hover:border-blue-700 rounded-lg transition-colors"
                            >
                                <Download size={16} />
                                <span>Demo Excel</span>
                            </button>
                            <button
                                onClick={handleUploadExcel}
                                disabled={isUploadingExcel}
                                className="flex items-center justify-center gap-2 w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-green-600 hover:bg-green-700 hover:text-white text-white border-green-600 hover:border-green-700 rounded-lg transition-colors"
                            >
                                <Upload size={16} />
                                <span>{isUploadingExcel ? 'Uploading...' : 'Upload Excel'}</span>
                            </button>
                            <button
                                onClick={handleAddExpense}
                                className="flex items-center justify-center gap-2 w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors"
                            >
                                <Plus size={16} />
                                <span>Add Expense</span>
                            </button>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>
                </div>
                <Toolbar
                    searchInput={searchInput}
                    handleSearch={handleSearch}
                    clearSearch={clearSearch}
                    selectedBrand={selectedBrand}
                    handleBrandChange={handleBrandChange}
                    brandOptions={brandOptions}
                    filteredData={filteredData}
                    totalExpenses={totalCount}
                />
                <div className="grid gap-5 lg:gap-7.5">
                    <CommonTable
                        columns={columns}
                        data={filteredData}
                        sorting={sorting}
                        onSortingChange={handleSortingChange}
                        isLoading={loading}
                        emptyMessage="No expenses found. Try adjusting your search criteria."
                        pageNo={pageNo}
                        pageSize={pageSize}
                        total={totalCount}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                </div>
            </div>

            <AddExpenseModal
                isOpen={isAddModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitExpense}
                brands={brands}
            />

            <EditExpenseModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onSubmit={handleUpdateExpense}
                expenseData={editingExpense}
                brands={brands}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                expenseName={deletingExpense?.name || ''}
                isDeleting={isDeleting}
            />
        </>
    );
};

export { Table };
