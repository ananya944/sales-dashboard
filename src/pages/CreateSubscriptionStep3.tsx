import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, DollarSign, Plus, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { addSubscriptionToClient } from "@/services/mockClientService";
import type { Subscription } from "@/types/client";

interface LineItem {
  id: string;
  description: string;
  amount: number;
  evidenceUrl: string;
  taxable: boolean;
}

export default function CreateSubscriptionStep3() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [isDepositTaxable, setIsDepositTaxable] = useState(false);
  const [isEORFeeTaxable, setIsEORFeeTaxable] = useState(true);
  
  // State for each section's items
  const [reimbursementItems, setReimbursementItems] = useState<LineItem[]>([]);
  const [equipmentItems, setEquipmentItems] = useState<LineItem[]>([]);
  const [officeSpaceItems, setOfficeSpaceItems] = useState<LineItem[]>([]);
  const [benefitsItems, setBenefitsItems] = useState<LineItem[]>([]);
  const [miscellaneousItems, setMiscellaneousItems] = useState<LineItem[]>([]);

  const addItem = (setter: React.Dispatch<React.SetStateAction<LineItem[]>>) => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      amount: 0,
      evidenceUrl: "",
      taxable: false,
    };
    setter((prev) => [...prev, newItem]);
  };

  const deleteItem = (
    id: string,
    setter: React.Dispatch<React.SetStateAction<LineItem[]>>
  ) => {
    setter((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (
    id: string,
    field: keyof LineItem,
    value: string | number | boolean,
    setter: React.Dispatch<React.SetStateAction<LineItem[]>>
  ) => {
    setter((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const renderItemSection = (
    items: LineItem[],
    setter: React.Dispatch<React.SetStateAction<LineItem[]>>
  ) => {
    if (items.length === 0) {
      return (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
          <p className="text-sm text-slate-500">No items added yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-slate-500 pb-2 border-b border-slate-200">
          <div className="col-span-4">Description</div>
          <div className="col-span-2">Amount (USD)</div>
          <div className="col-span-4">Evidence URL</div>
          <div className="col-span-1">Taxable</div>
          <div className="col-span-1"></div>
        </div>

        {/* Item Rows */}
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-4">
              <input
                type="text"
                placeholder="Enter description"
                value={item.description}
                onChange={(e) =>
                  updateItem(item.id, "description", e.target.value, setter)
                }
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                step="0.01"
                value={item.amount}
                onChange={(e) =>
                  updateItem(item.id, "amount", parseFloat(e.target.value) || 0, setter)
                }
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="col-span-4">
              <input
                type="text"
                placeholder="https://..."
                value={item.evidenceUrl}
                onChange={(e) =>
                  updateItem(item.id, "evidenceUrl", e.target.value, setter)
                }
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="col-span-1">
              <button
                onClick={() => updateItem(item.id, "taxable", !item.taxable, setter)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  item.taxable ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                    item.taxable ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="col-span-1 flex justify-end">
              <button
                onClick={() => deleteItem(item.id, setter)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
            onClick={() => navigate(`/clients/${id}`)}
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

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-sm font-semibold">
                  2
                </div>
                <span className="mt-1.5 text-xs font-medium text-slate-500">CREATE SUBSCRIPTION</span>
              </div>

              {/* Connector Line - Active */}
              <div className="h-0.5 w-12 bg-indigo-600"></div>

              {/* Step 3 - Active */}
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-semibold">
                  3
                </div>
                <span className="mt-1.5 text-xs font-medium text-indigo-600">GENERATE INVOICE</span>
              </div>
            </div>

            {/* Main Content Card */}
            <div className="mt-6">
              <Card className="border border-slate-200 bg-white shadow-sm">
                <div className="p-6 flex items-center justify-between border-b border-slate-200">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-6 w-6 text-indigo-600" />
                    </div>
                    
                    {/* Content */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        Draft Invoice & Totals
                      </h3>
                      <p className="text-sm text-slate-500">
                        Generate invoice with security deposit, EOR fees, and pass-through items
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4"
                    onClick={() => {
                      setShowInvoiceForm(true);
                      setShowInvoicePreview(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Invoice Draft
                  </Button>
                </div>

                {/* Invoice Form - Shows after clicking Generate */}
                {showInvoiceForm && (
                  <div className="p-6 space-y-6">
                    {/* Security Deposit Section */}
                    <div>
                      <h4 className="text-base font-semibold text-black mb-4">1) Security Deposit</h4>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm font-medium text-black mb-1.5 block">Months of Deposit</label>
                          <input 
                            type="number"
                            className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                            defaultValue="2" 
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-black mb-1.5 block">Deposit in INR</label>
                          <input 
                            type="text"
                            readOnly
                            className="w-full h-9 rounded-md border border-slate-300 bg-slate-50 px-3 text-sm text-slate-700 cursor-not-allowed" 
                            defaultValue="₹3,60,000" 
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-black mb-1.5 block">Deposit Amount (CAD)</label>
                          <input 
                            type="text"
                            readOnly
                            className="w-full h-9 rounded-md border border-slate-300 bg-slate-50 px-3 text-sm text-slate-700 cursor-not-allowed" 
                            defaultValue="CA$180,000.00" 
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-black mb-1.5 block">Taxable</label>
                          <div className="flex items-center gap-2 h-9">
                            <button 
                              onClick={() => setIsDepositTaxable(!isDepositTaxable)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                isDepositTaxable ? 'bg-indigo-600' : 'bg-slate-300'
                              }`}
                            >
                              <span className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                                isDepositTaxable ? 'translate-x-5' : 'translate-x-1'
                              }`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* EOR Fee Section */}
                    <div>
                      <h4 className="text-base font-semibold text-black mb-4">2) EOR Fee</h4>
                      <div className="border border-slate-200 rounded-lg p-4">
                        <div className="grid grid-cols-4 gap-4 mb-3">
                          <div className="col-span-1">
                            <div className="text-xs text-slate-500 mb-1">Description</div>
                            <div className="text-sm font-medium text-slate-900">EOR Fee - plan1 × 2</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 mb-1">Unit Price</div>
                            <div className="text-sm text-slate-900">CA$0.00</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 mb-1">Quantity</div>
                            <div className="text-sm text-slate-900">2 employees</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 mb-1">Line Total</div>
                            <div className="text-sm font-semibold text-slate-900">CA$250.00</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                          <button 
                            onClick={() => setIsEORFeeTaxable(!isEORFeeTaxable)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              isEORFeeTaxable ? 'bg-indigo-600' : 'bg-slate-300'
                            }`}
                          >
                            <span className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                              isEORFeeTaxable ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                          </button>
                          <span className="text-sm text-slate-700">Taxable (GST)</span>
                          {isEORFeeTaxable && (
                            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                              GST Applied
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reimbursements Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-semibold text-black">3) Reimbursements</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-300 text-slate-700 hover:bg-slate-50"
                          onClick={() => addItem(setReimbursementItems)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      {renderItemSection(reimbursementItems, setReimbursementItems)}
                    </div>

                    {/* Equipment - Laptops Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-semibold text-black">4) Equipment - Laptops</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-300 text-slate-700 hover:bg-slate-50"
                          onClick={() => addItem(setEquipmentItems)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      {renderItemSection(equipmentItems, setEquipmentItems)}
                    </div>

                    {/* Office Spaces Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-semibold text-black">5) Office Spaces</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-300 text-slate-700 hover:bg-slate-50"
                          onClick={() => addItem(setOfficeSpaceItems)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      {renderItemSection(officeSpaceItems, setOfficeSpaceItems)}
                    </div>

                    {/* Benefits - Insurance/Goodies Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-semibold text-black">6) Benefits - Insurance/Goodies</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-300 text-slate-700 hover:bg-slate-50"
                          onClick={() => addItem(setBenefitsItems)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      {renderItemSection(benefitsItems, setBenefitsItems)}
                    </div>

                    {/* Miscellaneous Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-semibold text-black">7) Miscellaneous</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-300 text-slate-700 hover:bg-slate-50"
                          onClick={() => addItem(setMiscellaneousItems)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      {renderItemSection(miscellaneousItems, setMiscellaneousItems)}
                    </div>
                  </div>
                )}
              </Card>

              {/* Invoice Preview Section */}
              {showInvoicePreview && (
                <Card className="border border-slate-200 bg-white shadow-sm mt-6">
                  <div className="p-8">
                    <h3 className="text-xl font-semibold text-black mb-6">Invoice Preview</h3>
                    
                    {/* Invoice Header */}
                    <div className="border-b border-slate-200 pb-6 mb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold text-black mb-2">Storypeach Technologies Private Limited</h2>
                          <p className="text-sm text-slate-700">Wisemonk</p>
                          <p className="text-sm text-slate-700">43, 4th Main Rd, Nehru Nagar</p>
                          <p className="text-sm text-slate-700">Bengaluru Karnataka 560020, India</p>
                          <p className="text-sm text-slate-700 mt-2">GSTIN: 29ABHCS9314G1Z0</p>
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold text-indigo-600">INVOICE</h1>
                        </div>
                      </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="border-b border-slate-200 pb-6 mb-6">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <div className="mb-4">
                            <p className="text-sm text-slate-600">Invoice No.</p>
                            <p className="text-base font-bold text-black">INV/25-26/1486</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Payment Terms</p>
                            <p className="text-base font-bold text-black">Within 5 days</p>
                          </div>
                        </div>
                        <div>
                          <div className="mb-4">
                            <p className="text-sm text-slate-600">Invoice Date</p>
                            <p className="text-base font-bold text-black">02/11/2025</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Due Date</p>
                            <p className="text-base font-bold text-black">07/11/2025</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bill To / Ship To */}
                    <div className="border-b border-slate-200 pb-6 mb-6">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Bill To:</p>
                          <p className="text-base font-bold text-black mb-1">Client CL-002</p>
                          <p className="text-sm text-slate-700">123 Business Street,</p>
                          <p className="text-sm text-slate-700">Commercial District,</p>
                          <p className="text-sm text-slate-700">City 10001</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Ship To:</p>
                          <p className="text-base font-bold text-black mb-1">Client CL-002</p>
                          <p className="text-sm text-slate-700">123 Business Street,</p>
                          <p className="text-sm text-slate-700">Commercial District,</p>
                          <p className="text-sm text-slate-700">City 10001</p>
                        </div>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-6">
                      <table className="w-full">
                        <thead className="border-b-2 border-slate-300">
                          <tr className="text-left">
                            <th className="text-xs font-semibold text-slate-700 pb-3 w-12">#</th>
                            <th className="text-xs font-semibold text-slate-700 pb-3">Item & Description</th>
                            <th className="text-xs font-semibold text-slate-700 pb-3 text-center w-24">HSN/SAC</th>
                            <th className="text-xs font-semibold text-slate-700 pb-3 text-right w-20">Qty</th>
                            <th className="text-xs font-semibold text-slate-700 pb-3 text-right w-32">Rate</th>
                            <th className="text-xs font-semibold text-slate-700 pb-3 text-right w-32">Total Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-200">
                            <td className="py-3 text-sm text-slate-900">1</td>
                            <td className="py-3 text-sm text-slate-900">September month salary of Anjali Verma (INR 1,80,000)</td>
                            <td className="py-3 text-sm text-slate-900 text-center">998399</td>
                            <td className="py-3 text-sm text-slate-900 text-right">1.00</td>
                            <td className="py-3 text-sm text-slate-900 text-right">58,823.53</td>
                            <td className="py-3 text-sm text-slate-900 text-right">58,823.53</td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="py-3 text-sm text-slate-900">2</td>
                            <td className="py-3 text-sm text-slate-900">September month salary of Rahul Joshi (INR 1,40,000)</td>
                            <td className="py-3 text-sm text-slate-900 text-center">998399</td>
                            <td className="py-3 text-sm text-slate-900 text-right">1.00</td>
                            <td className="py-3 text-sm text-slate-900 text-right">45,751.63</td>
                            <td className="py-3 text-sm text-slate-900 text-right">45,751.63</td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="py-3 text-sm text-slate-900">3</td>
                            <td className="py-3 text-sm text-slate-900">September month salary of Kavya Menon (INR 1,00,000)</td>
                            <td className="py-3 text-sm text-slate-900 text-center">998399</td>
                            <td className="py-3 text-sm text-slate-900 text-right">1.00</td>
                            <td className="py-3 text-sm text-slate-900 text-right">32,679.74</td>
                            <td className="py-3 text-sm text-slate-900 text-right">32,679.74</td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="py-3 text-sm text-slate-900">4</td>
                            <td className="py-3 text-sm text-slate-900">One month EOR fee for Anjali Verma (USD 0)</td>
                            <td className="py-3 text-sm text-slate-900 text-center">998399</td>
                            <td className="py-3 text-sm text-slate-900 text-right">1.00</td>
                            <td className="py-3 text-sm text-slate-900 text-right">0.00</td>
                            <td className="py-3 text-sm text-slate-900 text-right">0.00</td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="py-3 text-sm text-slate-900">5</td>
                            <td className="py-3 text-sm text-slate-900">One month EOR fee for Rahul Joshi (USD 0)</td>
                            <td className="py-3 text-sm text-slate-900 text-center">998399</td>
                            <td className="py-3 text-sm text-slate-900 text-right">1.00</td>
                            <td className="py-3 text-sm text-slate-900 text-right">0.00</td>
                            <td className="py-3 text-sm text-slate-900 text-right">0.00</td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="py-3 text-sm text-slate-900">6</td>
                            <td className="py-3 text-sm text-slate-900">One month EOR fee for Kavya Menon (USD 0)</td>
                            <td className="py-3 text-sm text-slate-900 text-center">998399</td>
                            <td className="py-3 text-sm text-slate-900 text-right">1.00</td>
                            <td className="py-3 text-sm text-slate-900 text-right">0.00</td>
                            <td className="py-3 text-sm text-slate-900 text-right">0.00</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex-1">
                        <p className="text-sm text-slate-600 mb-2">Total in Words:</p>
                        <p className="text-sm font-bold text-black leading-relaxed">
                          One Hundred Thirty Seven Thousand Eight Hundred Seventy Seven and Ninety Four Cents USD Only
                        </p>
                      </div>
                      <div className="w-80 ml-8">
                        <div className="space-y-3">
                          <div className="flex justify-between pb-2 border-b border-slate-300">
                            <span className="text-sm text-slate-600">Sub Total:</span>
                            <span className="text-sm text-slate-700">$137,782.90</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Total:</span>
                            <span className="text-sm font-bold text-indigo-600">$137,877.94</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Balance Due:</span>
                            <span className="text-sm font-bold text-indigo-600">$137,877.94</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bank Details and FX Rate */}
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-black mb-4">Bank Details</h4>
                      <div className="flex justify-between">
                        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm flex-1">
                          <div>
                            <span className="text-slate-600">Account Name: </span>
                            <span className="text-slate-900 font-semibold">Storypeach Technologies Private Limited</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Bank Name: </span>
                            <span className="text-slate-900 font-semibold">HDFC Bank</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Branch: </span>
                            <span className="text-slate-900 font-semibold">Koramangala, Bengaluru</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Account Number: </span>
                            <span className="text-slate-900 font-semibold">50200078431847</span>
                          </div>
                          <div>
                            <span className="text-slate-600">IFSC Code: </span>
                            <span className="text-slate-900 font-semibold">HDFC0000060</span>
                          </div>
                          <div>
                            <span className="text-slate-600">SWIFT Code: </span>
                            <span className="text-slate-900 font-semibold">HDFCINBB</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* FX Rate - Aligned to right */}
                      <div className="mt-4 flex justify-end">
                        <div>
                          <p className="text-sm text-slate-600 mb-2">FX Rate Applied:</p>
                          <div className="bg-slate-100 px-4 py-2 rounded flex items-center justify-between min-w-[200px]">
                            <span className="text-sm text-slate-700">USD 1 = INR 3.0600</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8 pt-6 border-t border-slate-200">
                      <p className="text-sm font-bold text-slate-900 mb-1">Thank you for your business!</p>
                      <p className="text-sm text-slate-600">For any queries, please contact: billing@wisemonk.io</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            size="default"
            className="border-slate-200 text-slate-600 hover:bg-slate-50 px-6"
            onClick={() => navigate(`/clients/${id}`)}
          >
            Cancel
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="default"
              className="border-slate-200 text-slate-600 hover:bg-slate-50 px-6"
              onClick={() => navigate(`/clients/${id}/new-subscription/step2`)}
            >
              Back
            </Button>
            <Button
              size="default"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
              onClick={() => {
                // Create new subscription object
                const newSubscription: Subscription = {
                  id: `SUB-${Date.now()}`,
                  name: "subscription",
                  planName: "PLAN1 Plan",
                  price: 0,
                  status: "active",
                  createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                  eorFee: 0, // This should come from form data
                  billing: "Monthly",
                  employees: 3, // This should come from form data
                  monthlyPayroll: "₹420,000", // This should come from form data
                  fxConfig: {
                    baseRate: 3, // This should come from form data
                    fxSpread: 2, // This should come from form data
                    gstOnEorFee: true
                  },
                  equipment: 0,
                  benefits: 0
                };
                
                // Add subscription to client
                if (id) {
                  addSubscriptionToClient(id, newSubscription);
                  toast.success("Subscription created successfully!");
                  navigate(`/clients/${id}?tab=subscriptions`);
                }
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete & Create Subscription
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

