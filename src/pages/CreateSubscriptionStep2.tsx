import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Star, ChevronDown, Check, Info } from "lucide-react";

interface Currency {
  code: string;
  name: string;
  isPreferred?: boolean;
}

const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", isPreferred: true },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "INR", name: "Indian Rupee" },
  { code: "GBP", name: "British Pound" },
  { code: "EUR", name: "Euro" },
];

export default function CreateSubscriptionStep2() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const sourcePage = location.state?.from || "clients";
  const fallbackPath =
    sourcePage === "prospects" ? "/prospects" : id ? `/clients/${id}` : "/clients";
  const confirmExit = () => window.confirm("Are you sure? Your changes will be lost.");
  const handleExit = () => {
    if (confirmExit()) {
      navigate(fallbackPath);
    }
  };
  
interface EmployeeSummary {
  id: string;
  name: string;
  role: string;
  salaryInr: number;
  startDate?: string | null;
  eorFee: number;
  billable?: boolean;
}

// Form state
  const [billingCycle, setBillingCycle] = useState<string>("Monthly");
  const [billDay, setBillDay] = useState<string>("1st");
  const [invoiceCurrency, setInvoiceCurrency] = useState<string>("USD");
  const [fxBaseRate, setFxBaseRate] = useState<number>(83.2500);
  const [fxSpread, setFxSpread] = useState<number>(2.0);
  const [gstOnEorFee, setGstOnEorFee] = useState<boolean>(true);
  
  // UI state
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState<Currency | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [employeeSummary, setEmployeeSummary] = useState<EmployeeSummary[]>([]);
  const [summaryTotals, setSummaryTotals] = useState({
    employeeCount: 0,
    monthlyPayrollInr: 0,
    monthlyEorFeeUsd: 0,
  });

  // Initialize invoice currency to match selected currency
  useEffect(() => {
    setInvoiceCurrency(selectedCurrency.code);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!id) return;
    const stored = localStorage.getItem(`subscription_step1_${id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.employees)) {
          setEmployeeSummary(parsed.employees);

          const billableEmployees = parsed.employees.filter(
            (emp: EmployeeSummary) => emp.billable !== false
          );

          setSummaryTotals({
            employeeCount: billableEmployees.length,
            monthlyPayrollInr: billableEmployees.reduce(
              (sum: number, emp: EmployeeSummary) => sum + (emp.salaryInr || 0),
              0
            ),
            monthlyEorFeeUsd: billableEmployees.reduce(
              (sum: number, emp: EmployeeSummary) => sum + (emp.eorFee || 0),
              0
            ),
          });
        }
      } catch (err) {
        console.error("Error parsing Step 1 employee data:", err);
      }
    }
  }, [id]);

  const formatInr = (value: number) => {
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const formatUsd = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const handleCurrencySelect = (currency: Currency) => {
    if (currency.code !== "USD") {
      setPendingCurrency(currency);
      setShowConfirmModal(true);
      setIsDropdownOpen(false);
    } else {
      setSelectedCurrency(currency);
      setInvoiceCurrency(currency.code);
      setIsDropdownOpen(false);
    }
  };

  const confirmCurrencyChange = () => {
    if (pendingCurrency) {
      setSelectedCurrency(pendingCurrency);
      setInvoiceCurrency(pendingCurrency.code);
      setPendingCurrency(null);
    }
    setShowConfirmModal(false);
  };

  const cancelCurrencyChange = () => {
    setPendingCurrency(null);
    setShowConfirmModal(false);
  };

  const handleContinue = () => {
    // Save Step 2 data to localStorage for Step 3 to access
    const step2Data = {
      billing_cycle: billingCycle,
      bill_day: billDay,
      invoice_currency: invoiceCurrency,
      fx_base_rate: fxBaseRate,
      fx_spread: fxSpread,
      gst_on_eor_fee: gstOnEorFee,
    };
    
    localStorage.setItem(`subscription_step2_${id}`, JSON.stringify(step2Data));
    console.log("Step 2 Data saved:", step2Data);
    
    // Navigate to Step 3
    navigate(`/clients/${id}/new-subscription/step3`, {
      state: location.state,
    });
  };

  const billableEmployees = employeeSummary.filter(
    (employee) => employee.billable !== false
  );

  return (
    <div className="mx-auto max-w-5xl px-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Create Subscription</h1>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleExit}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Indicator */}
        <Card className="border border-slate-200 bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-center gap-4 pb-4 mb-4 border-b border-slate-200">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-sm font-semibold">
                  1
                </div>
                <span className="mt-1.5 text-xs font-medium text-slate-500">CLIENT DETAILS</span>
              </div>

              {/* Connector Line */}
              <div className="h-0.5 w-12 bg-slate-200"></div>

              {/* Step 2 - Active */}
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-semibold">
                  2
                </div>
                <span className="mt-1.5 text-xs font-medium text-indigo-600">CREATE SUBSCRIPTION</span>
              </div>

              {/* Connector Line */}
              <div className="h-0.5 w-12 bg-slate-200"></div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-sm font-semibold">
                  3
                </div>
                <span className="mt-1.5 text-xs font-medium text-slate-500">GENERATE INVOICE</span>
              </div>
            </div>

            {/* Subscription Configuration */}
            <div className="space-y-8">
              <div>
                <h3 className="text-base font-semibold text-black mb-3">Subscription Configuration</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-black mb-1.5 block">Billing Cycle</label>
                    <select 
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value)}
                      className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annual">Annual</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black mb-1.5 block">Bill Day</label>
                    <select 
                      value={billDay}
                      onChange={(e) => setBillDay(e.target.value)}
                      className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="1st">1st</option>
                      <option value="5th">5th</option>
                      <option value="10th">10th</option>
                      <option value="15th">15th</option>
                      <option value="20th">20th</option>
                      <option value="25th">25th</option>
                      <option value="EOM">End of Month</option>
                    </select>
                  </div>
                  <div ref={dropdownRef}>
                    <label className="text-sm font-medium text-black mb-1.5 block">Invoice Currency</label>
                    {/* Custom Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Star className="h-3.5 w-3.5 text-blue-600 fill-blue-600" />
                          <span>{selectedCurrency.code} - {selectedCurrency.name}</span>
                          {selectedCurrency.isPreferred && (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                              Preferred
                            </span>
                          )}
                        </div>
                        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Options */}
                      {isDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {currencies.map((currency) => (
                            <button
                              key={currency.code}
                              type="button"
                              onClick={() => handleCurrencySelect(currency)}
                              className={`w-full px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                                selectedCurrency.code === currency.code 
                                  ? 'bg-indigo-600 text-white' 
                                  : 'hover:bg-indigo-600 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {selectedCurrency.code === currency.code && (
                                  <Check className="h-4 w-4 text-white" />
                                )}
                                {currency.isPreferred && (
                                  <Star className={`h-3.5 w-3.5 fill-current ${
                                    selectedCurrency.code === currency.code ? 'text-white' : 'text-blue-600'
                                  }`} />
                                )}
                                <span className={selectedCurrency.code === currency.code ? 'font-medium' : ''}>
                                  {currency.code} - {currency.name}
                                </span>
                              </div>
                              {currency.isPreferred && (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  selectedCurrency.code === currency.code 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  Preferred
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
                      <Info className="h-3.5 w-3.5" />
                      <span>Client preference: USD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Separator Line */}
              <div className="border-t border-slate-200"></div>

              <div>
                <h3 className="text-base font-semibold text-black mb-3">Foreign Exchange Configuration</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-black mb-1.5 block">FX Base Rate</label>
                    <input 
                      type="number"
                      step="0.0001"
                      value={fxBaseRate}
                      onChange={(e) => setFxBaseRate(parseFloat(e.target.value) || 0)}
                      className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                    <div className="text-xs text-slate-500 mt-1">INR per CAD</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black mb-1.5 block">FX Spread (%)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={fxSpread}
                      onChange={(e) => setFxSpread(parseFloat(e.target.value) || 0)}
                      className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black mb-1.5 block">GST on EOR Fee</label>
                    <div className="flex items-center gap-2 h-9">
                      <button 
                        type="button"
                        onClick={() => setGstOnEorFee(!gstOnEorFee)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          gstOnEorFee ? 'bg-indigo-600' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                          gstOnEorFee ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </button>
                      <span className="text-sm text-slate-700">{gstOnEorFee ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    {gstOnEorFee && (
                      <div className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 mt-1">
                        GST Applicable
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Separator Line */}
              <div className="border-t border-slate-200"></div>

              {/* Payroll & EOR Fee Summary */}
              <div>
                <div className="rounded-lg border border-indigo-200 bg-indigo-50">
                  <div className="px-4 py-3 flex items-center justify-between border-b border-indigo-100">
                    <div className="text-sm font-semibold text-black uppercase">PAYROLL & EOR FEE SUMMARY</div>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                      GST Applicable
                    </span>
                  </div>
                  <div>
                    {/* Table Header */}
                    <div className="grid grid-cols-5 px-4 py-3 text-xs font-medium text-slate-500 border-b border-indigo-100">
                      <div>EMPLOYEE</div>
                      <div>ROLE</div>
                      <div>MONTHLY CTC (INR)</div>
                      <div>CTC (USD)</div>
                      <div>EOR FEE (USD)</div>
                    </div>
                    {billableEmployees.length > 0 ? (
                      <>
                        {billableEmployees.map((employee) => (
                          <div
                            key={employee.id}
                            className="grid grid-cols-5 px-4 py-3 text-sm border-b border-indigo-100"
                          >
                            <div className="font-semibold text-slate-900">{employee.name}</div>
                            <div className="text-slate-700">{employee.role}</div>
                            <div className="text-slate-900">{formatInr(employee.salaryInr || 0)}</div>
                            <div className="text-slate-500">-</div>
                            <div className="text-indigo-600 font-semibold">
                              {formatUsd(employee.eorFee || 0)}
                            </div>
                          </div>
                        ))}
                        {/* Total Row */}
                        <div className="grid grid-cols-5 px-4 py-3 border-t-2 border-indigo-200 bg-white/50">
                          <div className="col-span-2 font-semibold text-slate-900">
                            Total ({summaryTotals.employeeCount} billable{" "}
                            {summaryTotals.employeeCount === 1 ? "employee" : "employees"})
                          </div>
                          <div className="font-semibold text-slate-900">
                            {formatInr(summaryTotals.monthlyPayrollInr)}
                          </div>
                          <div className="text-slate-500">-</div>
                          <div className="text-indigo-600 font-semibold">
                            {formatUsd(summaryTotals.monthlyEorFeeUsd)}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="px-4 py-6 text-sm text-slate-600">
                        No billable employee data available. Please go back to Step 1 to review employee information.
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-indigo-100 text-xs text-slate-500">
                    EOR fees include GST.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            size="default"
            className="border-slate-200 text-slate-600 hover:bg-slate-50 px-6"
          onClick={handleExit}
          >
            Cancel
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="default"
              className="border-slate-200 text-slate-600 hover:bg-slate-50 px-6"
            onClick={() =>
              navigate(`/clients/${id}/new-subscription`, {
                state: location.state,
              })
            }
            >
              Back
            </Button>
            <Button
              size="default"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
              onClick={handleContinue}
            >
              Continue
            </Button>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <p className="text-sm text-slate-700 mb-6">
                  Changing the invoice currency will reset pass-through lines. Are you sure you want to continue?
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelCurrencyChange}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={confirmCurrencyChange}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    OK
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

