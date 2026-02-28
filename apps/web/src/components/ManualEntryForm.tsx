import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X, ChevronRight, ChevronLeft, Save } from 'lucide-react';

interface ManualEntryFormProps {
  onSubmit: (data: {
    date: string;
    total_sales: number;
    order_count?: number;
    notes?: string;
  }) => Promise<void>;
  submitting: boolean;
  result: { success: boolean; message: string } | null;
  onClearResult: () => void;
}

const TRANSACTION_TEMPLATES = [
  { label: 'GrabFood order', sales: 25, orders: 1 },
  { label: 'Shopee sale', sales: 150, orders: 3 },
  { label: 'Pasar malam day', sales: 400, orders: 20 },
  { label: 'Catering order', sales: 800, orders: 1 },
];

function formatCurrency(value: string): string {
  // Remove non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  
  // Format integer part with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Limit decimal places to 2
  if (parts[1]) {
    parts[1] = parts[1].substring(0, 2);
  }
  
  return parts.join('.');
}

function formatDateDDMMYYYY(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function ManualEntryForm({ onSubmit, submitting, result, onClearResult }: ManualEntryFormProps) {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  const [totalSales, setTotalSales] = useState('');
  const [orderCount, setOrderCount] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoSaved, setAutoSaved] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (date || totalSales || orderCount || notes) {
        localStorage.setItem('manualEntryDraft', JSON.stringify({
          date, totalSales, orderCount, notes
        }));
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [date, totalSales, orderCount, notes]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('manualEntryDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setDate(parsed.date || '');
        setTotalSales(parsed.totalSales || '');
        setOrderCount(parsed.orderCount || '');
        setNotes(parsed.notes || '');
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!date) {
        newErrors.date = 'Date is required';
      }
    }

    if (currentStep === 2) {
      if (!totalSales) {
        newErrors.totalSales = 'Total sales is required';
      } else if (parseFloat(totalSales.replace(/,/g, '')) <= 0) {
        newErrors.totalSales = 'Amount must be greater than RM 0.00';
      }

      if (orderCount && parseInt(orderCount) < 0) {
        newErrors.orderCount = 'Order count cannot be negative';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        setShowConfirmation(true);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleTotalSalesChange = (value: string) => {
    const formatted = formatCurrency(value);
    setTotalSales(formatted);
  };

  const applyTemplate = (template: typeof TRANSACTION_TEMPLATES[0]) => {
    setTotalSales(template.sales.toString());
    setOrderCount(template.orders.toString());
  };

  const handleFinalSubmit = async () => {
    if (!validateStep(2)) return;

    await onSubmit({
      date,
      total_sales: parseFloat(totalSales.replace(/,/g, '')),
      order_count: orderCount ? parseInt(orderCount) : undefined,
      notes: notes || undefined,
    });

    // Clear form and draft
    setDate('');
    setTotalSales('');
    setOrderCount('');
    setNotes('');
    setStep(1);
    setShowConfirmation(false);
    localStorage.removeItem('manualEntryDraft');
  };

  // Confirmation screen
  if (showConfirmation) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Your Entry</h3>
          <p className="text-sm text-gray-600">Please confirm the details before submitting</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Date:</span>
            <span className="text-sm font-medium text-gray-900">{formatDateDDMMYYYY(date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Sales:</span>
            <span className="text-sm font-medium text-gray-900">RM {totalSales}</span>
          </div>
          {orderCount && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Order Count:</span>
              <span className="text-sm font-medium text-gray-900">{orderCount}</span>
            </div>
          )}
          {notes && (
            <div>
              <span className="text-sm text-gray-600 block mb-1">Notes:</span>
              <p className="text-sm text-gray-900">{notes}</p>
            </div>
          )}
        </div>

        {result && (
          <div className={`flex items-start gap-2 p-4 rounded-lg text-sm ${
            result.success 
              ? 'bg-green-50 text-green-900 border border-green-200' 
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}>
            {result.success ? (
              <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <span className="flex-1">{result.message}</span>
            <button 
              type="button" 
              onClick={onClearResult} 
              className="p-1 hover:bg-black/5 rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowConfirmation(false)}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition min-h-[44px] font-medium"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] font-medium"
          >
            {submitting ? 'Submitting...' : 'Confirm & Submit'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {step} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Auto-save indicator */}
      {autoSaved && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Save size={14} />
          <span>Draft saved</span>
        </div>
      )}

      {/* Step 1: Date */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">When did this transaction happen?</h3>
            <p className="text-sm text-gray-600">Select the date of your sales</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none min-h-[44px] ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.date && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.date}
              </p>
            )}
            {date && (
              <p className="text-sm text-gray-500 mt-1">
                Display format: {formatDateDDMMYYYY(date)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Sales details */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">How much did you earn?</h3>
            <p className="text-sm text-gray-600">Enter your sales amount and order count</p>
          </div>

          {/* Quick templates */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Quick templates:</p>
            <div className="grid grid-cols-2 gap-2">
              {TRANSACTION_TEMPLATES.map((template, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-left min-h-[44px]"
                >
                  <div className="font-medium text-gray-900">{template.label}</div>
                  <div className="text-xs text-gray-500">RM {template.sales}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Sales (RM) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">RM</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="e.g. 350.00"
                value={totalSales}
                onChange={(e) => handleTotalSalesChange(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none min-h-[44px] ${
                  errors.totalSales ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.totalSales && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.totalSales}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Count <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="e.g. 15"
              value={orderCount}
              onChange={(e) => setOrderCount(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none min-h-[44px] ${
                errors.orderCount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.orderCount && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.orderCount}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Notes */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Any additional details?</h3>
            <p className="text-sm text-gray-600">Add notes to help remember this transaction</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              placeholder="e.g. Pasar malam Thursday, sold out by 8pm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              These notes are for your reference only
            </p>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition min-h-[44px] font-medium"
          >
            <ChevronLeft size={18} />
            Back
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition min-h-[44px] font-medium"
        >
          {step === totalSteps ? 'Review' : 'Next'}
          {step < totalSteps && <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  );
}
