import React from "react";
import type { ExtendedClient } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Eye, Pencil, UserX, FileText, Calendar, Users, 
  Laptop, Heart, Layers
} from "lucide-react";

export function SubscriptionsTab({ client }: { client: ExtendedClient }) {
  const subscriptionCount = client.subscriptions?.length || 0;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Subscriptions</h3>
          <p className="text-xs text-slate-500 mt-1">{subscriptionCount} subscription{subscriptionCount !== 1 ? 's' : ''} for {client.name}</p>
        </div>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white mt-2">
          <FileText className="h-3.5 w-3.5 mr-1.5" />
          New Subscription
        </Button>
      </div>

      {/* Subscription Cards */}
      {client.subscriptions && client.subscriptions.length > 0 ? (
        client.subscriptions.map((subscription) => (
          <Card key={subscription.id} className="border border-slate-200 bg-white shadow-sm">
        <div className="p-6">
          {/* Card Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Layers className="h-5 w-5 text-slate-900" />
                <h4 className="text-xl font-semibold text-slate-900">{subscription.planName}</h4>
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
              <p className="text-sm text-slate-500 mt-1">Created {subscription.createdDate}</p>
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
              <p className="text-base font-semibold text-slate-900">${subscription.eorFee.toLocaleString()}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs text-slate-500">Billing</span>
              </div>
              <p className="text-base font-semibold text-slate-900">{subscription.billing}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Users className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs text-slate-500">Employees</span>
              </div>
              <p className="text-base font-semibold text-slate-900">{subscription.employees}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs text-slate-500">Monthly Payroll</span>
              </div>
              <p className="text-base font-semibold text-slate-900">{subscription.monthlyPayroll}</p>
            </div>
          </div>

          {/* FX Configuration */}
          <div className="mb-6 rounded-lg bg-slate-50 p-4">
            <h5 className="text-sm font-semibold text-slate-900 mb-3">FX Configuration</h5>
            <div className="flex items-center gap-6">
              <div>
                <span className="text-sm text-slate-600">Base Rate: </span>
                <span className="text-sm font-semibold text-slate-900">{subscription.fxConfig.baseRate}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600">FX Spread: </span>
                <span className="text-sm font-semibold text-slate-900">{subscription.fxConfig.fxSpread}%</span>
              </div>
              <div>
                <span className="text-sm text-slate-600">GST on EOR Fee: </span>
                <span className="text-sm font-semibold text-slate-900">{subscription.fxConfig.gstOnEorFee ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Equipment and Benefits */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Laptop className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-900">Equipment ({subscription.equipment})</span>
              </div>
              <p className="text-sm text-slate-500">{subscription.equipment === 0 ? 'No equipment assigned' : `${subscription.equipment} item(s) assigned`}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-900">Benefits ({subscription.benefits})</span>
              </div>
              <p className="text-sm text-slate-500">{subscription.benefits === 0 ? 'No benefits assigned' : `${subscription.benefits} benefit(s) assigned`}</p>
            </div>
          </div>
        </div>
      </Card>
        ))
      ) : (
        <Card className="border border-slate-200 bg-white shadow-sm p-8 text-center">
          <p className="text-slate-500">No subscriptions found</p>
        </Card>
      )}
    </div>
  );
}


