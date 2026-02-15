// ============================================
// COMPONENTS INDEX
// File: src/components/index.ts
// Centralized exports for easy imports
// ============================================

// UI Components
export { Button } from './ui/button';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
export { Badge } from './ui/badge';
export { Input } from './ui/input';
export { Label } from './ui/label';
export { Select } from './ui/select';
export { Textarea } from './ui/textarea';
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './ui/table';

// Layout Components
export { default as Sidebar } from './layouts/Sidebar';
export { default as Header } from './layouts/Header';
export { default as DashboardLayout } from './layouts/DashboardLayout';

// Table Components
export { default as QuotationsTable } from './tables/QuotationsTable';
export { default as ComponentsTable } from './tables/ComponentsTable';

// Shared Components
export { default as Loading, PageLoading, InlineLoading } from './shared/Loading';
export { default as EmptyState } from './shared/EmptyState';

// AI Components
export { default as AIRecommendations } from './ai/AIRecommendations';