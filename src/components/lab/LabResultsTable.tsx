import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLabResults } from '@/hooks/useLabResults';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Eye,
  TestTube
} from 'lucide-react';

interface LabResult {
  id: string;
  test_name: string;
  value: number | string;
  unit: string;
  reference_range?: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  test_date: string;
  category: string;
}

interface LabResultsTableProps {
  results?: LabResult[];
  isLoading?: boolean;
  error?: string;
}

export const LabResultsTable: React.FC<LabResultsTableProps> = ({
  results: propResults = [],
  isLoading: propIsLoading = false,
  error: propError
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  // Use real lab results from API
  const { 
    results: apiResults, 
    isLoading: apiIsLoading, 
    error: apiError,
    refreshResults
  } = useLabResults();

  // Only use real API data - no mock data  
  const dataToUse = apiResults.length > 0 ? apiResults : propResults;
  
  // Use API loading state if available, otherwise prop loading state
  const isLoading = apiIsLoading || propIsLoading;
  
  // Use API error if available, otherwise prop error
  const error = apiError || propError;

  // Filter and sort results with memoization to prevent infinite loops
  const filteredResults = useMemo(() => {
    console.log('🔄 LabResultsTable: Filtering/sorting data:', {
      dataLength: dataToUse?.length || 0,
      searchTerm,
      statusFilter,
      categoryFilter,
      sortBy
    });

    let filtered = Array.isArray(dataToUse) ? [...dataToUse] : [];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.test_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(result => result.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(result => result.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.test_date || 0).getTime() - new Date(a.test_date || 0).getTime();
        case 'name':
          return (a.test_name || '').localeCompare(b.test_name || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    console.log('✅ LabResultsTable: Filtered results:', filtered.length);
    return filtered;
  }, [dataToUse, searchTerm, statusFilter, categoryFilter, sortBy]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'high':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'low':
        return <TrendingDown className="w-4 h-4 text-orange-600" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-700" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'normal':
        return 'default';
      case 'high':
      case 'critical':
        return 'destructive';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const categories = [...new Set((Array.isArray(dataToUse) ? dataToUse : []).map(result => result.category))];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lab Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Results</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Lab Results ({filteredResults.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshResults}>
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              Export Results
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tests or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Test Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Table */}
        <ScrollArea className="h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Reference Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <TableRow key={result.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {result.test_name}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{result.value}</span>
                      {result.unit && (
                        <span className="text-gray-500 ml-1">{result.unit}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {result.reference_range || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <Badge variant={getStatusBadgeVariant(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {result.category}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(result.test_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="text-gray-500">
                      {!Array.isArray(dataToUse) || dataToUse.length === 0 ? (
                        <div>
                          <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Lab Results</h3>
                          <p className="text-gray-600">Upload your first lab report to see results here.</p>
                        </div>
                      ) : (
                        "No results match your current filters"
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Summary Stats */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {filteredResults.length} of {Array.isArray(dataToUse) ? dataToUse.length : 0} results
          </div>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Normal: {filteredResults.filter(r => r.status === 'normal').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              High: {filteredResults.filter(r => r.status === 'high').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              Low: {filteredResults.filter(r => r.status === 'low').length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};