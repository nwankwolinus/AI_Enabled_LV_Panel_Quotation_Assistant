// ============================================
// DASHBOARD PAGE
// File: src/app/dashboard/page.tsx
// ============================================

'use client';

import { DashboardLayout, Card, CardHeader, CardTitle, CardContent, Button } from '@/components';
import { FileText, Package, Users, TrendingUp, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';


export default function DashboardPage() {
  // Mock data - replace with actual data from your API
  const stats = {
    totalQuotations: 124,
    pendingApproval: 8,
    thisMonth: 32,
    totalValue: 450000000,
    monthlyGrowth: 12.5,
    conversionRate: 68,
  };

  const recentQuotations = [
    { id: '1', quote_number: 'PPL/2024/001', project_name: 'Factory Main Panel', client_name: 'ABC Industries', total: 25000000, status: 'pending' },
    { id: '2', quote_number: 'PPL/2024/002', project_name: 'Office Distribution Board', client_name: 'XYZ Limited', total: 8500000, status: 'approved' },
    { id: '3', quote_number: 'PPL/2024/003', project_name: 'Warehouse Power System', client_name: 'DEF Company', total: 42000000, status: 'draft' },
  ];

  return (
    <DashboardLayout user={null} onLogout={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your overview</p>
          </div>
          <Link href="/dashboard/quotations/create">
            <Button className="bg-ppl-navy">
              <Plus className="w-4 h-4 mr-2" />
              New Quotation
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            title="Total Quotations"
            value={stats.totalQuotations.toString()}
            bgColor="bg-blue-500"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Pending Approval"
            value={stats.pendingApproval.toString()}
            bgColor="bg-yellow-500"
            badge="Needs attention"
          />
          <StatCard
            icon={<Package className="w-6 h-6" />}
            title="This Month"
            value={stats.thisMonth.toString()}
            bgColor="bg-green-500"
            trend={{ value: stats.monthlyGrowth, isPositive: true }}
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Total Value"
            value={`₦${(stats.totalValue / 1000000).toFixed(0)}M`}
            bgColor="bg-purple-500"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Rate */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="text-6xl font-bold text-ppl-navy mb-2">
                    {stats.conversionRate}%
                  </div>
                  <p className="text-gray-600">Quotes converted to sales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <QuickActionButton
                  href="/dashboard/quotations/create"
                  icon={<Plus className="w-5 h-5" />}
                  label="Create New Quotation"
                  description="Start a new quotation"
                />
                <QuickActionButton
                  href="/dashboard/components"
                  icon={<Package className="w-5 h-5" />}
                  label="Manage Components"
                  description="View component library"
                />
                <QuickActionButton
                  href="/dashboard/clients"
                  icon={<Users className="w-5 h-5" />}
                  label="Add Client"
                  description="Create new client"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Quotations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Quotations</CardTitle>
            <Link href="/dashboard/quotations">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQuotations.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-gray-600">{quote.quote_number}</span>
                      <StatusBadge status={quote.status} />
                    </div>
                    <h4 className="font-medium mt-1">{quote.project_name}</h4>
                    <p className="text-sm text-gray-600">{quote.client_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-ppl-navy">
                      ₦{(quote.total / 1000000).toFixed(1)}M
                    </p>
                    <Link href={`/dashboard/quotations/${quote.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  icon,
  title,
  value,
  bgColor,
  badge,
  trend,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  bgColor: string;
  badge?: string;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className={`${bgColor} text-white p-3 rounded-lg`}>
            {icon}
          </div>
          {badge && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              {badge}
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">{title}</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <span className={`flex items-center text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {trend.value}%
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="text-ppl-navy">{icon}</div>
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
  };

  const { label, className } = config[status] || config.draft;

  return (
    <span className={`text-xs px-2 py-1 rounded ${className}`}>
      {label}
    </span>
  );
}
