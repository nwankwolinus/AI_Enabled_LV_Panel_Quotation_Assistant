// ============================================
// HOME PAGE
// File: src/app/page.tsx
// ============================================

'use client';

import { Button } from '@/components';
import Link from 'next/link';
import { FileText, Package, Users, TrendingUp, Zap, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-ppl-navy via-ppl-navy-800 to-ppl-navy-900 text-white">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Power Projects Limited
            </h1>
            <p className="text-2xl md:text-3xl mb-4 text-gray-200">
              LV Panel Quotation System
            </p>
            <p className="text-lg md:text-xl mb-12 text-gray-300 max-w-2xl mx-auto">
              Professional quotation management system for electrical panel projects.
              Streamline your workflow with AI-powered recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login">
                <Button 
                  size="lg" 
                  className="bg-ppl-gold hover:bg-ppl-gold-600 text-ppl-navy-900 text-lg px-8"
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-ppl-navy text-lg px-8"
                >
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">Key Features</h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Everything you need to manage quotations efficiently and professionally
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="w-8 h-8" />}
              title="Smart Quotations"
              description="Create professional quotations with ease. Manage versions, track approvals, and export to PDF."
            />
            <FeatureCard
              icon={<Package className="w-8 h-8" />}
              title="Component Library"
              description="Comprehensive database of electrical components with pricing, specifications, and images."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Client Management"
              description="Track client preferences, history, and interactions. Build lasting relationships."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="AI Recommendations"
              description="Get intelligent suggestions based on patterns and historical data. Save time and improve accuracy."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Analytics & Insights"
              description="Track performance, conversion rates, and trends. Make data-driven decisions."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Role-Based Access"
              description="Secure access control with admin, manager, engineer, and viewer roles."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join Power Projects Limited in revolutionizing quotation management
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-ppl-navy hover:bg-ppl-navy-700 text-lg px-8">
              Create Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ppl-navy-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Power Projects Limited</h3>
              <p className="text-gray-400">
                Professional electrical panel solutions and quotation management.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">Login</Link></li>
                <li><Link href="/auth/register" className="hover:text-white">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Lagos, Nigeria</li>
                <li>info@powerprojects.ng</li>
                <li>+234 XXX XXX XXXX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Power Projects Limited. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="text-ppl-navy mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
