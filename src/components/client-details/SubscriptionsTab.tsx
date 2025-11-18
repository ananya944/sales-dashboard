import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ExtendedClient } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Eye, Pencil, UserX, FileText, Calendar, Users, 
  Laptop, Heart, Layers
} from "lucide-react";
import { getSubscriptionsByClient, type Subscription } from "@/services/subscriptionService";

export function SubscriptionsTab({ client }: { client: ExtendedClient }) {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubscriptions() {
      if (!client.id) {
        setError("Client ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getSubscriptionsByClient(client.id);
        setSubscriptions(data);
      } catch (err) {
        console.error("Error loading subscriptions:", err);
        setError(err instanceof Error ? err.message : "Failed to load subscriptions");
      } finally {
        setLoading(false);
      }
    }

    loadSubscriptions();
  }, [client.id]);

  const subscriptionCount = subscriptions.length;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format plan name
  const formatPlanName = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1) + " Plan";
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Subscriptions</h3>
          <p className="text-xs text-slate-500 mt-1">{subscriptionCount} subscription{subscriptionCount !== 1 ? 's' : ''} for {client.name}</p>
        </div>
        <Button 
          size="sm" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
          onClick={() => navigate(`/clients/${client.id}/new-subscription`)}
        >
          <FileText className="h-3.5 w-3.5 mr-1.5" />
          New Subscription
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="border border-slate-200 bg-white shadow-sm p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-600">Loading subscriptions...</p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="border border-red-200 bg-red-50 shadow-sm p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Card>
      )}

      {/* Subscription Cards */}
      {!loading && !error && subscriptions.length > 0 && (
        subscriptions.map((subscription) => (
          <Card key={subscription.id} className="border border-slate-200 bg-white shadow-sm">
            <div className="p-6">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="h-5 w-5 text-slate-900" />
                    <h4 className="text-xl font-semibold text-slate-900">{formatPlanName(subscription.plan)}</h4>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                      subscription.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        subscription.status === 'active' ? 'bg-green-600' :
                        subscription.status === 'paused' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}></span>
                      {subscription.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Created {subscription.start_date ? formatDate(subscription.start_date) : (subscription.created_at ? formatDate(subscription.created_at) : 'N/A')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs h-8 px-2.5">
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs h-8 px-2.5">
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs h-8 px-2.5">
                    <UserX className="h-3.5 w-3.5 mr-1" />
                    Terminate
                  </Button>
                </div>
              </div>

              {/* Key Metrics Row */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-xs text-slate-500">EOR Fee</span>
                  </div>
                  <p className="text-base font-semibold text-slate-900">
                    {formatCurrency(subscription.monthly_eor_fee, subscription.invoice_currency)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-xs text-slate-500">Billing</span>
                  </div>
                  <p className="text-base font-semibold text-slate-900">{subscription.billing_cycle}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-xs text-slate-500">Employees</span>
                  </div>
                  <p className="text-base font-semibold text-slate-900">{subscription.employee_count}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-xs text-slate-500">Monthly Payroll</span>
                  </div>
                  <p className="text-base font-semibold text-slate-900">
                    ₹{subscription.monthly_payroll_inr.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* FX Configuration */}
              <div className="mb-6 rounded-lg bg-slate-50 p-4">
                <h5 className="text-sm font-semibold text-slate-900 mb-3">FX Configuration</h5>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-sm text-slate-600">Base Rate: </span>
                    <span className="text-sm font-semibold text-slate-900">{subscription.fx_base_rate}</span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">FX Spread: </span>
                    <span className="text-sm font-semibold text-slate-900">{subscription.fx_spread}%</span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">GST on EOR Fee: </span>
                    <span className="text-sm font-semibold text-slate-900">{subscription.gst_on_eor_fee ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Equipment and Benefits - Placeholder for now */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Laptop className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-900">Equipment (0)</span>
                  </div>
                  <p className="text-sm text-slate-500">No equipment assigned</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-900">Benefits (0)</span>
                  </div>
                  <p className="text-sm text-slate-500">No benefits assigned</p>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}

      {/* Empty State */}
      {!loading && !error && subscriptions.length === 0 && (
        <Card className="border border-slate-200 bg-white shadow-sm p-8 text-center">
          <p className="text-slate-500">No subscriptions found</p>
        </Card>
      )}
    </div>
  );
}


