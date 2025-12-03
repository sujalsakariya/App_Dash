import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { format, parse } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon, CalendarRange as CalendarRangeIcon, Calendar as CalendarAllIcon, X, ChevronRight, ChevronLeft, RotateCcw, Trash2, Plus, Edit, Search, Save, Upload, Download } from 'lucide-react';
import authService from '@/services/authService';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal';
import CommonTable from '@/components/common/CommonTable';

const API_URL = import.meta.env.VITE_APP_API_URL;

const AddPaymentModal = ({ isOpen, onClose, onSubmit, gateways = [], brands = [], companies = [] }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    cxName: '',
    amount: '',
    paymentType: 'Credit Card',
    cardNo: '',
    chequeNo: '',
    transId: '',
    authCode: '',
    refundAmount: '',
    isVoid: false,
    isCb: false,
    isRetrival: false,
    isAlert: false,
    fees: '',
    extraFees: '',
    refundFees: '',
    refundDate: '',
    alertDate: '',
    cbDate: '',
    retrivalDate: '',
    reserve: '',
    company: '',
    gatewayId: '',
    brand: '',
    salesPerson: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter gateways based on selected brand
  const filteredGateways = useMemo(() => {
    if (!formData.brand) return gateways;
    return gateways.filter(gateway => {
      const gatewayName = gateway.label.toLowerCase();
      const selectedBrand = formData.brand.toLowerCase();
      return gatewayName.endsWith(`-${selectedBrand}`);
    });
  }, [gateways, formData.brand]);

  const handleInputChange = (field, value) => {
    if (field === 'brand') {
      // Reset gateway when brand changes
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        gatewayId: '' // Reset gateway selection when brand changes
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.cxName.trim() || !formData.amount || !formData.date) {
        toast.error('Please fill in all required fields');
        return;
      }

      const paymentData = {
        id: 0,
        date: new Date(formData.date).toISOString(),
        cxName: formData.cxName.trim(),
        amount: parseFloat(formData.amount) || 0,
        paymentType: formData.paymentType,
        cardNo: formData.cardNo.trim(),
        chequeNo: formData.chequeNo.trim(),
        transId: formData.transId.trim(),
        authCode: formData.authCode.trim(),
        refundAmount: parseFloat(formData.refundAmount) || 0,
        isVoid: formData.isVoid,
        isCb: formData.isCb,
        isRetrival: formData.isRetrival,
        isAlert: formData.isAlert,
        fees: parseFloat(formData.fees) || 0,
        extraFees: parseFloat(formData.extraFees) || 0,
        refundFees: parseFloat(formData.refundFees) || 0,
        refundDate: formData.refundDate ? new Date(formData.refundDate).toISOString() : null,
        alertDate: formData.alertDate ? new Date(formData.alertDate).toISOString() : null,
        cbDate: formData.cbDate ? new Date(formData.cbDate).toISOString() : null,
        retrivalDate: formData.retrivalDate ? new Date(formData.retrivalDate).toISOString() : null,
        reserve: parseFloat(formData.reserve) || 0,
        company: formData.company.trim(),
        gatewayId: parseInt(formData.gatewayId) || 0,
        brand: formData.brand.trim(),
        salesPerson: formData.salesPerson.trim()
      };

      await onSubmit(paymentData);
      onClose();

      // Reset form
      setFormData({
        date: new Date().toISOString().slice(0, 16),
        cxName: '',
        amount: '',
        paymentType: 'Credit Card',
        cardNo: '',
        transId: '',
        company: '',
        salesPerson: ''
      });

    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to add payment');
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-800">Add New Payment</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500 dark:text-gray-700" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form id="add-payment-form" onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 p-6">
              <div className="space-y-8">
            {/* Step 1: Customer Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-200 dark:to-gray-300 rounded-xl p-5 border border-blue-100 dark:border-gray-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800">Customer Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.cxName}
                    onChange={(e) => handleInputChange('cxName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Company
                  </label>
                  <Select
                    key={`add-company-${formData.company}-${isOpen}`}
                    value={formData.company}
                    onValueChange={(value) => handleInputChange('company', value)}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400">
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {companies.filter(company => company.value && company.value !== '').map((company) => (
                          <SelectItem key={company.value} value={company.value}>
                            {company.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Sales Person
                  </label>
                  <input
                    type="text"
                    value={formData.salesPerson}
                    onChange={(e) => handleInputChange('salesPerson', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="Sales person name"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Details */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-200 dark:to-gray-300 rounded-xl p-5 border border-green-100 dark:border-gray-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800">Payment Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Payment Type
                  </label>
                  <Select value={formData.paymentType} onValueChange={(value) => handleInputChange('paymentType', value)}>
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400">
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Zelle">Zelle</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Total Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Payment Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Card/Bank Number
                  </label>
                  <input
                    type="text"
                    value={formData.cardNo}
                    onChange={(e) => handleInputChange('cardNo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="**** **** **** 1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Cheque Number
                  </label>
                  <input
                    type="text"
                    value={formData.chequeNo}
                    onChange={(e) => handleInputChange('chequeNo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="Enter cheque number"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Transaction Information */}
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-gray-200 dark:to-gray-300 rounded-xl p-5 border border-purple-100 dark:border-gray-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800">Transaction Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    value={formData.transId}
                    onChange={(e) => handleInputChange('transId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="Transaction ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Authorization Code
                  </label>
                  <input
                    type="text"
                    value={formData.authCode}
                    onChange={(e) => handleInputChange('authCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="Enter authorization code"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Brand
                  </label>
                  <Select
                    key={`add-brand-${formData.brand}-${isOpen}`}
                    value={formData.brand}
                    onValueChange={(value) => handleInputChange('brand', value)}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400">
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {brands.filter(brand => brand.value && brand.value !== '').map((brand) => (
                          <SelectItem key={brand.value} value={brand.value}>
                            {brand.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Gateway
                  </label>
                  <Select
                    key={`add-gateway-${formData.gatewayId}-${isOpen}`}
                    value={formData.gatewayId}
                    onValueChange={(value) => handleInputChange('gatewayId', value)}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400">
                      <SelectValue placeholder="Select Gateway" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {filteredGateways.length > 0 ? (
                          filteredGateways.map((gateway) => (
                            <SelectItem key={gateway.value} value={gateway.value}>
                              {gateway.label}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-gray-500">
                            {formData.brand ? `No gateways available for ${formData.brand}` : 'No gateways available'}
                          </div>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Step 4: Financial Breakdown */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-200 dark:to-gray-300 rounded-xl p-5 border border-amber-100 dark:border-gray-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800">Financial Breakdown</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Fees
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fees}
                    onChange={(e) => handleInputChange('fees', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Extra Fees
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.extraFees}
                    onChange={(e) => handleInputChange('extraFees', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Reserve
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.reserve}
                    onChange={(e) => handleInputChange('reserve', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Refund Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.refundAmount}
                    onChange={(e) => handleInputChange('refundAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Refund Fees
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.refundFees}
                    onChange={(e) => handleInputChange('refundFees', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Step 5: Status & Flags */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-gray-200 dark:to-gray-300 rounded-xl p-5 border border-red-100 dark:border-gray-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  5
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800">Status & Flags</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center space-x-3 cursor-pointer bg-white dark:bg-gray-100 p-3 rounded-lg border border-gray-200 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isVoid}
                    onChange={(e) => handleInputChange('isVoid', e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-800">Void</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer bg-white dark:bg-gray-100 p-3 rounded-lg border border-gray-200 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isCb}
                    onChange={(e) => handleInputChange('isCb', e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-800">Chargeback</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer bg-white dark:bg-gray-100 p-3 rounded-lg border border-gray-200 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isRetrival}
                    onChange={(e) => handleInputChange('isRetrival', e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-800">Retrieval</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer bg-white dark:bg-gray-100 p-3 rounded-lg border border-gray-200 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isAlert}
                    onChange={(e) => handleInputChange('isAlert', e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-800">Alert</span>
                </label>
              </div>
            </div>

            {/* Step 6: Event Dates */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-200 dark:to-gray-300 rounded-xl p-5 border border-cyan-100 dark:border-gray-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  6
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800">Event Dates</h3>
                <p className="text-sm text-gray-600 dark:text-gray-700">(Optional)</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Refund Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.refundDate}
                    onChange={(e) => handleInputChange('refundDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Alert Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.alertDate}
                    onChange={(e) => handleInputChange('alertDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Chargeback Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.cbDate}
                    onChange={(e) => handleInputChange('cbDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Retrieval Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.retrivalDate}
                    onChange={(e) => handleInputChange('retrivalDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

            </div>
          </form>
        </div>

        {/* Fixed Footer - moved outside form for better positioning */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-gray-200 dark:border-gray-300 bg-gray-50 dark:bg-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium shadow-sm dark:bg-gray-100 dark:text-gray-800 dark:border-gray-400 dark:hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-payment-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2 min-w-[140px] shadow-sm"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add Payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditPaymentModal = ({ isOpen, onClose, onSubmit, paymentData, gateways = [], brands = [], companies = [] }) => {
  const [formData, setFormData] = useState({
    id: 0,
    date: new Date().toISOString().slice(0, 16),
    cxName: '',
    amount: '',
    paymentType: 'Credit Card',
    cardNo: '',
    chequeNo: '',
    transId: '',
    authCode: '',
    refundAmount: '',
    isVoid: false,
    isCb: false,
    isRetrival: false,
    isAlert: false,
    fees: '',
    extraFees: '',
    refundFees: '',
    refundDate: '',
    alertDate: '',
    cbDate: '',
    retrivalDate: '',
    reserve: '',
    company: '',
    gatewayId: '',
    brand: '',
    salesPerson: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (paymentData && isOpen) {
      setFormData({
        id: paymentData.id,
        date: formatDateForInput(paymentData.date),
        cxName: paymentData.cxName || '',
        amount: paymentData.amount?.toString() || '',
        paymentType: paymentData.paymentType || 'Credit Card',
        cardNo: paymentData.cardNo || '',
        chequeNo: paymentData.chequeNo || '',
        transId: paymentData.transId || '',
        authCode: paymentData.authCode || '',
        refundAmount: paymentData.refundAmount?.toString() || '',
        isVoid: paymentData.isVoid || false,
        isCb: paymentData.isCb || false,
        isRetrival: paymentData.isRetrival || false,
        isAlert: paymentData.isAlert || false,
        fees: paymentData.fees?.toString() || '',
        extraFees: paymentData.extraFees?.toString() || '',
        refundFees: paymentData.refundFees?.toString() || '',
        refundDate: formatDateForInput(paymentData.refundDate),
        alertDate: formatDateForInput(paymentData.alertDate),
        cbDate: formatDateForInput(paymentData.cbDate),
        retrivalDate: formatDateForInput(paymentData.retrivalDate),
        reserve: paymentData.reserve?.toString() || '',
        company: paymentData.company || '',
        gatewayId: paymentData.gatewayId?.toString() || '',
        brand: paymentData.brand || '',
        salesPerson: paymentData.salesPerson || ''
      });
    }
  }, [paymentData, isOpen]);

  // Additional effect to ensure gateway selection works properly when gateways are loaded
  useEffect(() => {
    if (paymentData && isOpen && gateways.length > 0 && formData.gatewayId) {
      const gatewayId = paymentData.gatewayId?.toString() || '';
      // Verify that the gateway ID exists in the options
      const gatewayExists = gateways.some(gateway => gateway.value === gatewayId);
    }
  }, [paymentData, isOpen, gateways, formData.gatewayId]);

  // Filter gateways based on selected brand
  const filteredGateways = useMemo(() => {
    if (!formData.brand) return gateways;
    return gateways.filter(gateway => {
      const gatewayName = gateway.label.toLowerCase();
      const selectedBrand = formData.brand.toLowerCase();
      return gatewayName.endsWith(`-${selectedBrand}`);
    });
  }, [gateways, formData.brand]);

  const handleInputChange = (field, value) => {
    if (field === 'brand') {
      // Reset gateway when brand changes
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        gatewayId: '' // Reset gateway selection when brand changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.cxName.trim() || !formData.amount || !formData.date) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Prepare data for API
      const paymentUpdateData = {
        id: formData.id,
        date: new Date(formData.date).toISOString(),
        cxName: formData.cxName.trim(),
        amount: parseFloat(formData.amount) || 0,
        paymentType: formData.paymentType,
        cardNo: formData.cardNo.trim(),
        chequeNo: formData.chequeNo.trim(),
        transId: formData.transId.trim(),
        authCode: formData.authCode.trim(),
        refundAmount: parseFloat(formData.refundAmount) || 0,
        isVoid: formData.isVoid,
        isCb: formData.isCb,
        isRetrival: formData.isRetrival,
        isAlert: formData.isAlert,
        fees: parseFloat(formData.fees) || 0,
        extraFees: parseFloat(formData.extraFees) || 0,
        refundFees: parseFloat(formData.refundFees) || 0,
        refundDate: formData.refundDate ? new Date(formData.refundDate).toISOString() : null,
        alertDate: formData.alertDate ? new Date(formData.alertDate).toISOString() : null,
        cbDate: formData.cbDate ? new Date(formData.cbDate).toISOString() : null,
        retrivalDate: formData.retrivalDate ? new Date(formData.retrivalDate).toISOString() : null,
        reserve: parseFloat(formData.reserve) || 0,
        company: formData.company.trim(),
        gatewayId: parseInt(formData.gatewayId) || 0,
        brand: formData.brand.trim(),
        salesPerson: formData.salesPerson.trim(),
        isDeleted: paymentData.isDeleted || false
      };

      await onSubmit(paymentUpdateData);
      onClose();

    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment');
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-800">Edit Payment</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500 dark:text-gray-700" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form id="edit-payment-form" onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 p-6">
              <div className="space-y-8">
            {/* Step 1: Customer Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-200 dark:to-gray-300 rounded-xl p-5 border border-blue-100 dark:border-gray-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800">Customer Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.cxName}
                    onChange={(e) => handleInputChange('cxName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Company
                  </label>
                  <Select
                    key={`edit-company-${formData.company}-${isOpen}`}
                    value={formData.company}
                    onValueChange={(value) => handleInputChange('company', value)}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400">
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {companies.filter(company => company.value && company.value !== '').map((company) => (
                          <SelectItem key={company.value} value={company.value}>
                            {company.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Sales Person
                  </label>
                  <input
                    type="text"
                    value={formData.salesPerson}
                    onChange={(e) => handleInputChange('salesPerson', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="Sales person name"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Details */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-200 dark:to-gray-300 rounded-xl p-5 border border-green-100 dark:border-gray-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800">Payment Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Payment Type
                  </label>
                  <Select value={formData.paymentType} onValueChange={(value) => handleInputChange('paymentType', value)}>
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400">
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Zelle">Zelle</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Total Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Payment Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Card/Bank Number
                  </label>
                  <input
                    type="text"
                    value={formData.cardNo}
                    onChange={(e) => handleInputChange('cardNo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="**** **** **** 1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Cheque Number
                  </label>
                  <input
                    type="text"
                    value={formData.chequeNo}
                    onChange={(e) => handleInputChange('chequeNo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="Enter cheque number"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Transaction Information */}
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-gray-200 dark:to-gray-300 rounded-xl p-5 border border-purple-100 dark:border-gray-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800">Transaction Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    value={formData.transId}
                    onChange={(e) => handleInputChange('transId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="Transaction ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Authorization Code
                  </label>
                  <input
                    type="text"
                    value={formData.authCode}
                    onChange={(e) => handleInputChange('authCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="Enter authorization code"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Brand
                  </label>
                  <Select
                    key={`edit-brand-${formData.brand}-${isOpen}`}
                    value={formData.brand}
                    onValueChange={(value) => handleInputChange('brand', value)}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400">
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {brands.filter(brand => brand.value && brand.value !== '').map((brand) => (
                          <SelectItem key={brand.value} value={brand.value}>
                            {brand.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Gateway
                  </label>
                  <Select
                    key={`edit-gateway-${formData.gatewayId}-${isOpen}`}
                    value={formData.gatewayId}
                    onValueChange={(value) => handleInputChange('gatewayId', value)}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400">
                      <SelectValue placeholder="Select Gateway" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {filteredGateways.length > 0 ? (
                          filteredGateways.map((gateway) => (
                            <SelectItem key={gateway.value} value={gateway.value}>
                              {gateway.label}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-gray-500">
                            {formData.brand ? `No gateways available for ${formData.brand}` : 'No gateways available'}
                          </div>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Step 4: Financial Breakdown */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-200 dark:to-gray-300 rounded-xl p-5 border border-amber-100 dark:border-gray-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800">Financial Breakdown</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Fees
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fees}
                    onChange={(e) => handleInputChange('fees', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Extra Fees
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.extraFees}
                    onChange={(e) => handleInputChange('extraFees', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Reserve
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.reserve}
                    onChange={(e) => handleInputChange('reserve', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Refund Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.refundAmount}
                    onChange={(e) => handleInputChange('refundAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Refund Fees
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.refundFees}
                    onChange={(e) => handleInputChange('refundFees', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Step 5: Status & Flags */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-gray-200 dark:to-gray-300 rounded-xl p-5 border border-red-100 dark:border-gray-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  5
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800">Status & Flags</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center space-x-3 cursor-pointer bg-white dark:bg-gray-100 p-3 rounded-lg border border-gray-200 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isVoid}
                    onChange={(e) => handleInputChange('isVoid', e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-800">Void</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer bg-white dark:bg-gray-100 p-3 rounded-lg border border-gray-200 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isCb}
                    onChange={(e) => handleInputChange('isCb', e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-800">Chargeback</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer bg-white dark:bg-gray-100 p-3 rounded-lg border border-gray-200 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isRetrival}
                    onChange={(e) => handleInputChange('isRetrival', e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-800">Retrieval</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer bg-white dark:bg-gray-100 p-3 rounded-lg border border-gray-200 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isAlert}
                    onChange={(e) => handleInputChange('isAlert', e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-800">Alert</span>
                </label>
              </div>
            </div>

            {/* Step 6: Event Dates */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-200 dark:to-gray-300 rounded-xl p-5 border border-cyan-100 dark:border-gray-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  6
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800">Event Dates</h3>
                <p className="text-sm text-gray-600 dark:text-gray-700">(Optional)</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Refund Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.refundDate}
                    onChange={(e) => handleInputChange('refundDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Alert Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.alertDate}
                    onChange={(e) => handleInputChange('alertDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Chargeback Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.cbDate}
                    onChange={(e) => handleInputChange('cbDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Retrieval Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.retrivalDate}
                    onChange={(e) => handleInputChange('retrivalDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-gray-200 dark:border-gray-300 bg-gray-50 dark:bg-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium shadow-sm dark:bg-gray-100 dark:text-gray-800 dark:border-gray-400 dark:hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-payment-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2 min-w-[140px] shadow-sm"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </>
            ) : (
              <>
                <Save size={16} />
                Update Payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


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
  selectedBrand,
  handleBrandChange,
  selectedDate,
  handleDateChange,
  dateRange,
  handleDateRangeChange,
  calendarMode,
  toggleCalendarMode,
  filteredData,
  totalUsers,
  brandOptions,
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
        Showing {displayedRows} of {totalUsers} Payments
        {(() => {
          const text = getDateDisplayText(calendarMode, selectedDate, dateRange);
          return text ? <> : <span className="font-normal">{text}</span></> : null;
        })()}
      </h3>
      <div className="flex flex-col sm:flex-row flex-wrap w-full sm:w-auto gap-2 lg:gap-3 min-w-0">
        <div className="flex items-center gap-2 border rounded-lg px-2 py-1 w-full sm:w-64 dark:bg-gray-200 relative min-w-0">
          <Search size={16} className="dark:text-gray-800 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search Payments"
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
                <SelectItem value="all">All Company</SelectItem>
                {customerOptions.map((customer) => (
                  <SelectItem key={customer.value} value={customer.value}>
                    {customer.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={selectedBrand} onValueChange={handleBrandChange}>
            <SelectTrigger className="w-full sm:w-36 dark:text-gray-800 dark:bg-gray-200 min-w-0">
              <SelectValue placeholder="All Brand" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-100 dark:text-gray-800">
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
          {/* date data  */}
          {/* <div className="flex gap-0.5 justify-between items-center flex-wrap min-w-0">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleCalendarMode}
              className="w-10 h-10 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300 flex-shrink-0"
              title={
                calendarMode === 'single'
                  ? "Switch to date range"
                  : calendarMode === 'range'
                    ? "Switch to all payments"
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
                      "All Payments"
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
                    All Payments
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
          </div> */}
        </div>
      </div>
    </div>
  );
};

const PaymentTable = () => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [calendarMode, setCalendarMode] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [displayData, setDisplayData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  const [brandOptions, setBrandOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);

  const [sorting, setSorting] = useState([{ id: 'date', desc: true }]);

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);
  const fileInputRef = useRef(null);
  const [paymentFormData, setPaymentFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    cxName: '',
    amount: '',
    paymentType: '',
    cardNo: '',
    chequeNo: '',
    transId: '',
    authCode: '',
    refundAmount: '',
    isVoid: false,
    isCb: false,
    isRetrival: false,
    isAlert: false,
    fees: '',
    extraFees: '',
    refundFees: '',
    refundDate: '',
    alertDate: '',
    cbDate: '',
    retrivalDate: '',
    reserve: '',
    company: '',
    gatewayId: '',
    brand: '',
    salesPerson: ''
  });

  // Gateway options state
  const [gateways, setGateways] = useState([]);
  
  // Brand options state
  const [brands, setBrands] = useState([]);
  
  // Company options state
  const [companies, setCompanies] = useState([]);

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
        fetchGatewayOptions(),
        fetchBrandOptions()
      ]);

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
      const sortColumn = sorting.length > 0 ? sorting[0].id : 'date';
      const sortDirection = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc';

      authService.setupAxios();

      const queryParams = {
        Text: searchText !== undefined ? searchText : searchInput,
        cname: effectiveCustomer !== 'all' ? effectiveCustomer : '',
        bname: selectedBrand !== 'all' ? selectedBrand : '',
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

      const response = await axios.get(`${API_URL}/Payment/GetPaymentDetails`, { params: queryParams });

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
              date: response.data.date,
              cxName: response.data.cxName,
              amount: response.data.amount,
              paymentType: response.data.paymentType,
              cardNo: response.data.cardNo,
              chequeNo: response.data.chequeNo,
              transId: response.data.transId,
              authCode: response.data.authCode,
              refundAmount: response.data.refundAmount,
              isVoid: response.data.isVoid,
              isCb: response.data.isCb,
              isRetrival: response.data.isRetrival,
              isAlert: response.data.isAlert,
              fees: response.data.fees,
              extraFees: response.data.extraFees,
              refundFees: response.data.refundFees,
              refundDate: response.data.refundDate,
              alertDate: response.data.alertDate,
              cbDate: response.data.cbDate,
              retrivalDate: response.data.retrivalDate,
              reserve: response.data.reserve,
              company: response.data.company,
              gatewayId: response.data.gatewayId,
              brand: response.data.brand,
              isDeleted: response.data.isDeleted,
              salesPerson: response.data.salesPerson
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
      console.error('Error fetching payment data:', error);
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
        toast.error('Failed to fetch payment data');
      }

      setDisplayData([]);
      setTotalUsers(0);
    } finally {
      shouldFetchRef.current = false;
      apiCallInProgressRef.current = false;
      setIsLoading(false);
    }
  }, [selectedCustomer, selectedBrand, pageNo, pageSize, sorting]);

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

      const response = await axios.get(`${API_URL}/Leads/GetAllCompany`);

      if (response.data && Array.isArray(response.data)) {
        const options = response.data
          .filter(customer => customer !== null && customer !== undefined && customer.company)
          .map(customer => ({
            value: customer.company,
            label: customer.company
          }))
          .filter(option => option.value !== '' && option.label !== 'null' && option.label !== 'undefined' && option.label !== null);
        setCustomerOptions(options);
      } else if (response.data && typeof response.data === 'object') {
        const customerData = response.data.items || response.data.data || [];
        const options = customerData
          .filter(customer => customer !== null && customer !== undefined && customer.company)
          .map(customer => ({
            value: customer.company,
            label: customer.company
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

  const fetchGatewayOptions = useCallback(async () => {
    try {
      authService.setupAxios();

      const response = await axios.get(`${API_URL}/Payment/GetGateways`);

      if (response.data && Array.isArray(response.data)) {
        const options = response.data
          .filter(gateway => gateway !== null && gateway !== undefined)
          .map(gateway => ({
            value: String(gateway.id || ''),
            label: gateway.name || 'Unknown'
          }))
          .filter(option => option.value !== '' && option.label !== 'Unknown');
        setGateways(options);
      } else if (response.data && typeof response.data === 'object') {
        const gatewayData = response.data.items || response.data.data || [];
        const options = gatewayData
          .filter(gateway => gateway !== null && gateway !== undefined)
          .map(gateway => ({
            value: String(gateway.id || ''),
            label: gateway.name || 'Unknown'
          }))
          .filter(option => option.value !== '' && option.label !== 'Unknown');
        setGateways(options);
      } else {
        console.error('Unexpected gateway data format:', response.data);
        setGateways([]);
      }
    } catch (error) {
      console.error('Error fetching gateway options:', error);
      toast.error('Failed to fetch gateway options');
      setGateways([]);

      if (error.response && error.response.status === 401) {
        toast.error('Session expired. Please log in again.');
        authService.logout();
        window.location.href = '/login';
      }
    }
  }, []);

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
        // Fallback for direct array response
        const options = response.data
          .filter(brand => brand !== null && brand !== undefined)
          .map(brand => ({
            value: brand.brand || '',
            label: brand.brand || 'Unknown'
          }))
          .filter(option => option.value !== '' && option.label !== 'Unknown');
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
        toast.error('Session expired. Please log in again.');
        authService.logout();
        window.location.href = '/login';
      }
    }
  }, []);

  const fetchCompanyOptions = useCallback(async () => {
    try {
      authService.setupAxios();

      const response = await axios.get(`${API_URL}/Leads/GetAllCompany`);

      if (response.data && Array.isArray(response.data)) {
        const options = response.data
          .filter(company => company !== null && company !== undefined)
          .map(company => ({
            value: company.company || '',
            label: company.company || 'Unknown'
          }))
          .filter(option => option.value !== '' && option.label !== 'Unknown');
        setCompanies(options);
      } else if (response.data && typeof response.data === 'object') {
        const companyData = response.data.items || response.data.data || [];
        const options = companyData
          .filter(company => company !== null && company !== undefined)
          .map(company => ({
            value: company.company || '',
            label: company.company || 'Unknown'
          }))
          .filter(option => option.value !== '' && option.label !== 'Unknown');
        setCompanies(options);
      } else {
        console.error('Unexpected company data format:', response.data);
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching company options:', error);
      toast.error('Failed to fetch company options');
      setCompanies([]);

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
    setSelectedBrand('all');
    shouldFetchRef.current = true;
  }, []);

  const handleBrandChange = useCallback((value) => {
    setSelectedBrand(value);
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

  // Effect to handle filter changes (customer, brand, dates, sorting)
  useEffect(() => {
    if (initializedRef.current && shouldFetchRef.current && !apiCallInProgressRef.current) {
      fetchData();
    }
  }, [selectedCustomer, selectedBrand, selectedDate, dateRange, calendarMode, sorting, fetchData]);

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.id,
        id: 'id',
        header: () => <div className="w-full text-center">ID</div>,
        cell: ({ row }) => (
          <div className="text-center w-full">{row.original.id || 'N/A'}</div>
        ),
        meta: { headerClassName: 'min-w-[70px] w-20 text-center', cellClassName: 'text-center' },
      },
      {
        accessorFn: (row) => row.cxName,
        id: 'cxName',
        header: () => ({ props: { title: "Customer Name" } }),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4 overflow-hidden" style={{ width: '200px' }}>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-primary hover:text-primary-active mb-px">
                  {row.original.cxName || 'N/A'}
                </span>
                <span className="text-xs text-gray-700 font-normal">
                  {row.original.company || 'N/A'}
                </span>
                {row.original.salesPerson && (
                  <span className="text-xs text-blue-600 font-normal">
                    Sales: {row.original.salesPerson}
                  </span>
                )}
              </div>
            </div>
          );
        },
        meta: { className: 'min-w-[200px]', cellClassName: 'text-gray-800 font-normal' },
      },
      {
        accessorFn: (row) => row.paymentType,
        id: 'paymentType',
        header: () => <div className="w-full text-center">Payment Type</div>,
        cell: ({ row }) => {
          const paymentType = row.original.paymentType;
          const cardNo = row.original.cardNo;
          const chequeNo = row.original.chequeNo;
          const transId = row.original.transId;

          return (
            <div className="text-center w-full">
              <div className="text-sm font-medium">{paymentType || 'N/A'}</div>
              {cardNo && (
                <div className="text-xs text-gray-600">Card: ****{cardNo.slice(-4)}</div>
              )}
              {chequeNo && (
                <div className="text-xs text-gray-600">Cheque: {chequeNo}</div>
              )}
              {transId && (
                <div className="text-xs text-gray-600">Trans: {transId}</div>
              )}
            </div>
          );
        },
        meta: { headerClassName: 'min-w-[140px] text-center', cellClassName: 'text-center' },
      },
      {
        accessorFn: (row) => row.date,
        id: 'date',
        header: () => <div className="w-full text-center">Date</div>,
        cell: ({ row }) => {
          const date = row.original.date ? new Date(row.original.date) : null;
          return <div className="text-center w-full">{date ? format(date, 'dd MMM yyyy hh:mm a') : 'N/A'}</div>;
        },
        meta: { headerClassName: 'min-w-[180px] text-center', cellClassName: 'text-center' },
      },
      {
        accessorFn: (row) => `${row.brand}-${row.gatewayId}`,
        id: 'brandGateway',
        header: () => <div className="w-full text-center">Brand & Gateway</div>,
        cell: ({ row }) => {
          const brandValue = row.original.brand;
          const gatewayId = row.original.gatewayId;
          
          const brand = brands.find(b => b.value === brandValue);
          const gateway = gateways.find(g => g.value === String(gatewayId));
          
          const brandLabel = brand ? brand.label : (brandValue || 'N/A');
          const gatewayLabel = gateway ? gateway.label : (gatewayId || 'N/A');
          
          return (
            <div className="text-center w-full">
              <div className="text-sm font-semibold text-blue-600 mb-1">
                {brandLabel}
              </div>
              <div className="text-xs text-gray-600">
                {gatewayLabel}
              </div>
            </div>
          );
        },
        meta: { headerClassName: 'min-w-[140px] text-center', cellClassName: 'text-center' },
      },
      {
        accessorFn: (row) => row.amount,
        id: 'amount',
        header: () => <div className="w-full text-center">Amount</div>,
        cell: ({ row }) => {
          const amount = row.original.amount;
          const refundAmount = row.original.refundAmount;
          return (
            <div className="text-center w-full">
              <div className="text-sm font-semibold text-green-600">
                ${amount ? amount.toFixed(2) : '0.00'}
              </div>
              {refundAmount > 0 && (
                <div className="text-xs text-red-600">
                  Refund: ${refundAmount.toFixed(2)}
                </div>
              )}
            </div>
          );
        },
        meta: { headerClassName: 'min-w-[100px] text-center', cellClassName: 'text-center' },
      },
      {
        accessorFn: (row) => row.fees,
        id: 'fees',
        header: () => <div className="w-full text-center">Fees</div>,
        cell: ({ row }) => {
          const fees = row.original.fees || 0;
          const extraFees = row.original.extraFees || 0;
          const refundFees = row.original.refundFees || 0;
          const totalFees = fees + extraFees + refundFees;

          return (
            <div className="w-full">
              <div className="text-sm text-red-600 font-bold flex justify-between items-center">
                <span className="whitespace-nowrap">Total:</span>
                <span className="font-bold">${totalFees.toFixed(2)}</span>
              </div>
                {fees > 0 && (
                  <div className="text-gray-700 flex justify-between items-center">
                    <span className="whitespace-nowrap">Fees:</span>
                    <span className="text-right">${fees.toFixed(2)}</span>
                  </div>
                )}
                {refundFees > 0 && (
                  <div className="text-gray-700 flex justify-between items-center">
                    <span className="whitespace-nowrap">Refund:</span>
                    <span className="text-right">${refundFees.toFixed(2)}</span>
                  </div>
                )}
                {extraFees > 0 && (
                  <div className="text-gray-700 flex justify-between items-center">
                    <span className="whitespace-nowrap">Extra:</span>
                    <span className="text-right">${extraFees.toFixed(2)}</span>
                  </div>
                )}
            </div>
          );
        },
        meta: { headerClassName: 'min-w-[80px] text-center', cellClassName: 'text-center' },
      },
      {
        accessorFn: (row) => row.reserve,
        id: 'reserve',
        header: () => <div className="w-full text-center">Reserve</div>,
        cell: ({ row }) => {
          const reserve = row.original.reserve || 0;
          return (
            <div className="text-center w-full text-sm">
              ${reserve.toFixed(2)}
            </div>
          );
        },
        meta: { headerClassName: 'min-w-[80px] text-center', cellClassName: 'text-center' },
      },
      {
        accessorFn: (row) => {
          // Create a status based on various flags - collect all active statuses
          const statuses = [];
          if (row.isVoid) statuses.push('Void');
          if (row.isCb) statuses.push('Chargeback');
          if (row.isRetrival) statuses.push('Retrieval');
          if (row.isAlert) statuses.push('Alert');
          return statuses.length > 0 ? statuses.join(', ') : 'Active';
        },
        id: 'status',
        header: () => <div className="w-full text-center">Status</div>,
        cell: ({ row }) => {
          const { isVoid, isCb, isRetrival, isAlert } = row.original;
          const statuses = [];

          if (isVoid) {
            statuses.push(
              <span key="void" className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                Void
              </span>
            );
          }
          if (isCb) {
            statuses.push(
              <span key="chargeback" className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                Chargeback
              </span>
            );
          }
          if (isRetrival) {
            statuses.push(
              <span key="retrieval" className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                Retrieval
              </span>
            );
          }
          if (isAlert) {
            statuses.push(
              <span key="alert" className="px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-700">
                Alert
              </span>
            );
          }

          if (statuses.length === 0) {
            statuses.push(
              <span key="active" className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                Active
              </span>
            );
          }

          return (
            <div className="text-center w-full">
              <div className="flex flex-col gap-1 items-center">
                {statuses}
              </div>
            </div>
          );
        },
        meta: { headerClassName: 'min-w-[100px] text-center', cellClassName: 'text-center' },
      },
      {
        id: 'action',
        header: () => <div className="w-full text-center">Action</div>,
        cell: ({ row }) => (
          <div className="flex justify-center items-center gap-2 w-full">
            <button
              className="p-2 rounded flex items-center justify-center text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => handleEditPayment(row.original)}
              title="Edit"
              style={{ lineHeight: 0, background: 'none' }}
            >
              <Edit size={18} className="text-blue-600 hover:text-blue-700" />
            </button>
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
        meta: { headerClassName: 'min-w-[150px] text-center', cellClassName: 'text-center' },
      },
    ],
    [gateways, brands]
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
    setSelectedBrand('all');
    setSelectedDate(null);
    setDateRange({ from: undefined, to: undefined });
    setCalendarMode('all');
    setSorting([{ id: 'date', desc: true }]);
    fetchParamsRef.current = {
      date: null,
      range: { from: undefined, to: undefined },
      mode: 'all',
      searchText: '',
      customerFromURL: null
    };
    shouldFetchRef.current = true;

    // Re-fetch options and data
    Promise.all([fetchCustomerOptions(), fetchGatewayOptions(), fetchBrandOptions()]).then(() => {
      if (resettingRef.current) resettingRef.current = false;
    });
  }, [fetchCustomerOptions, fetchGatewayOptions, fetchBrandOptions]);

  const handleDeleteClick = (row) => {
    setRowToDelete(row);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (rowToDelete) {
      try {
        setIsLoading(true);
        // Call the API to delete the payment with ID parameter
        await axios.get(`${API_URL}/Payment/DeletePaymentDetails?id=${rowToDelete.id}`);
        toast.success('Payment deleted successfully');
        // Optionally, you may want to refresh the data after deletion
        shouldFetchRef.current = true;
        fetchData();
      } catch (error) {
        toast.error('Failed to delete payment');
        console.error('DeletePayment error:', error);
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

  const handleAddPayment = async () => {
    // Reset form data to initial state when opening Add modal
    setPaymentFormData({
      date: new Date().toISOString().slice(0, 16),
      cxName: '',
      amount: '',
      paymentType: '',
      cardNo: '',
      chequeNo: '',
      transId: '',
      authCode: '',
      refundAmount: '',
      isVoid: false,
      isCb: false,
      isRetrival: false,
      isAlert: false,
      fees: '',
      extraFees: '',
      refundFees: '',
      refundDate: '',
      alertDate: '',
      cbDate: '',
      retrivalDate: '',
      reserve: '',
      company: '',
      gatewayId: '',
      brand: '',
      salesPerson: ''
    });
    
    // Fetch company data when opening Add modal
    await fetchCompanyOptions();
    setShowAddModal(true);
  };

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

      const response = await axios.post(`${API_URL}/Payment/upload-excel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Check for success in response data or status
      if (response.status === 200 || response.status === 201 || response.data?.success !== false) {
        toast.success(response.data?.message || 'Excel file uploaded successfully!');

        // Force refresh the data after successful upload
        console.log('Refreshing data after successful upload...');
        await fetchData();

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
        await fetchData();
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
    link.href = '/ExcelDemo/TransactionData.xlsx';
    link.download = 'TransactionData_Demo.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Demo Excel file downloaded successfully!');
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setPaymentFormData({
      date: new Date().toISOString().slice(0, 16),
      cxName: '',
      amount: '',
      paymentType: '',
      cardNo: '',
      chequeNo: '',
      transId: '',
      authCode: '',
      refundAmount: '',
      isVoid: false,
      isCb: false,
      isRetrival: false,
      isAlert: false,
      fees: '',
      extraFees: '',
      refundFees: '',
      refundDate: '',
      alertDate: '',
      cbDate: '',
      retrivalDate: '',
      reserve: '',
      company: '',
      gatewayId: '',
      brand: '',
      salesPerson: ''
    });
  };

  const handleFormChange = (field, value) => {
    setPaymentFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitPayment = async () => {
    try {
      authService.setupAxios();

      // Prepare the data for submission
      const submitData = {
        ...paymentFormData,
        amount: parseFloat(paymentFormData.amount) || 0,
        refundAmount: parseFloat(paymentFormData.refundAmount) || 0,
        fees: parseFloat(paymentFormData.fees) || 0,
        extraFees: parseFloat(paymentFormData.extraFees) || 0,
        refundFees: parseFloat(paymentFormData.refundFees) || 0,
        reserve: parseFloat(paymentFormData.reserve) || 0,
        gatewayId: parseInt(paymentFormData.gatewayId) || 0,
        date: new Date(paymentFormData.date).toISOString(),
        refundDate: paymentFormData.refundDate ? new Date(paymentFormData.refundDate).toISOString() : null,
        alertDate: paymentFormData.alertDate ? new Date(paymentFormData.alertDate).toISOString() : null,
        cbDate: paymentFormData.cbDate ? new Date(paymentFormData.cbDate).toISOString() : null,
        retrivalDate: paymentFormData.retrivalDate ? new Date(paymentFormData.retrivalDate).toISOString() : null,
        // Boolean fields as per API schema
        isVoid: paymentFormData.isVoid,
        isCb: paymentFormData.isCb,
        isRetrival: paymentFormData.isRetrival,
        isAlert: paymentFormData.isAlert,
        isDeleted: false,
        id: 0 // New payment, so ID is 0
      };

      await axios.post(`${API_URL}/Payment/PostPaymentDetails`, submitData);

      toast.success('Payment added successfully');
      handleCloseAddModal();

      // Refresh the data
      shouldFetchRef.current = true;
      fetchData();

    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Failed to add payment');
    }
  };

  const handleEditPayment = async (payment) => {
    // Fetch company data when opening Edit modal
    await fetchCompanyOptions();
    setEditingPayment(payment);
    setShowEditModal(true);
  };

  const handleUpdatePayment = async (updateData) => {
    try {
      authService.setupAxios();

      // The data is already properly formatted from the EditPaymentModal
      const response = await axios.post(`${API_URL}/Payment/UpdatePaymentDetails`, updateData);

      toast.success('Payment updated successfully');
      handleCloseEditModal();

      // Refresh the data
      shouldFetchRef.current = true;
      fetchData(); 

    } catch (error) {
      console.error('Error updating payment:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        // Provide more specific error messages
        if (error.response.status === 400) {
          toast.error(`Validation error: ${error.response.data.message || 'Invalid data provided'}`);
        } else if (error.response.status === 404) {
          toast.error('Payment not found. It may have been deleted.');
        } else if (error.response.status === 401) {
          toast.error('Session expired. Please log in again.');
          authService.logout();
          window.location.href = '/login';
        } else {
          toast.error(`Server error: ${error.response.data.message || 'Failed to update payment'}`);
        }
      } else if (error.request) {
        console.error('Network error:', error.request);
        toast.error('Network error. Please check your connection and try again.');
      } else {
        console.error('Error:', error.message);
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPayment(null);
  };

  return (
    <div className="card shadow-md bg-white rounded-lg overflow-hidden dark:bg-gray-100">
      <div className="px-3 sm:px-5 py-4 border-b border-gray-200 dark:bg-gray-100 dark:border-gray-300">
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0'>
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-800">Payments</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-600 mt-1">
              Track your payment data across all companies and all brands.
            </p>
          </div>
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto sm:justify-end'>
            <Button
              onClick={handleDownloadDemo}
              className="btn btn-info flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 hover:text-white text-white border-blue-600 hover:border-blue-700"
            >
              <Download size={16} />
              <span>Demo Excel</span>
            </Button>
            <Button
              onClick={handleUploadExcel}
              disabled={isUploadingExcel}
              className="btn btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 hover:text-white text-white border-green-600 hover:border-green-700"
            >
              <Upload size={16} />
              <span>{isUploadingExcel ? 'Uploading...' : 'Upload Excel'}</span>
            </Button>
            <Button
              onClick={handleAddPayment}
              className="btn btn-primary flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-medium"
            >
              <Plus size={16} />
              <span>Add Payment</span>
            </Button>

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
      <div className="flex flex-col w-full">
        <Toolbar
          searchInput={searchInput}
          handleSearch={handleSearch}
          clearSearch={clearSearch}
          selectedCustomer={selectedCustomer}
          handleCustomerChange={handleCustomerChange}
          selectedBrand={selectedBrand}
          handleBrandChange={handleBrandChange}
          selectedDate={selectedDate}
          handleDateChange={handleDateChange}
          dateRange={dateRange}
          handleDateRangeChange={handleDateRangeChange}
          calendarMode={calendarMode}
          toggleCalendarMode={toggleCalendarMode}
          filteredData={displayData}
          totalUsers={totalUsers}
          brandOptions={brandOptions}
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
            emptyMessage="No payment data found. Try adjusting your filters or search criteria."
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
          fields={[
            { label: 'ID', key: 'id' },
            { label: 'Customer Name', key: 'cxName' },
            { label: 'Amount', key: 'amount' },
            { label: 'Payment Type', key: 'paymentType' },
          ]}
          title="Delete Payment"
          description="Are you sure you want to delete this payment? This action cannot be undone."
        />
      )}

      <AddPaymentModal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        onSubmit={handleSubmitPayment}
        gateways={gateways}
        brands={brands}
        companies={companies}
      />

      <EditPaymentModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdatePayment}
        paymentData={editingPayment}
        gateways={gateways}
        brands={brands}
        companies={companies}
      />
    </div>
  );
};

export { PaymentTable };