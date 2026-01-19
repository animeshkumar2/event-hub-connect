import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { 
  Activity, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  Zap,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Server,
  Globe,
  Loader2,
  User,
  Store,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface ApiTestResult {
  name: string;
  endpoint: string;
  method: string;
  category: string;
  duration: number;
  status: 'success' | 'error' | 'pending' | 'idle';
  statusCode?: number;
  error?: string;
}

// Define all APIs to test - Optimized list (removed slow findAll queries)
const API_DEFINITIONS: Omit<ApiTestResult, 'duration' | 'status' | 'statusCode' | 'error'>[] = [
  // Public APIs - No auth required (fast, cached)
  { name: 'Get Stats', endpoint: '/public/stats', method: 'GET', category: 'Public' },
  { name: 'Get Event Types', endpoint: '/public/event-types', method: 'GET', category: 'Public' },
  { name: 'Get Categories', endpoint: '/public/categories', method: 'GET', category: 'Public' },
  { name: 'Get Cities', endpoint: '/public/cities', method: 'GET', category: 'Public' },
  
  // Admin APIs - Admin role required (only fast ones)
  { name: 'Admin Dashboard Stats', endpoint: '/admin/dashboard/stats', method: 'GET', category: 'Admin' },
  
  // Vendor APIs - Requires X-Vendor-Id header
  { name: 'Vendor Profile', endpoint: '/vendors/profile', method: 'GET', category: 'Vendor' },
  { name: 'Vendor Listings', endpoint: '/vendors/listings', method: 'GET', category: 'Vendor' },
  { name: 'Vendor Dashboard Stats', endpoint: '/vendors/dashboard/stats', method: 'GET', category: 'Vendor' },
  { name: 'Vendor Leads', endpoint: '/vendors/leads', method: 'GET', category: 'Vendor' },
  { name: 'Vendor Bookings', endpoint: '/vendors/bookings?page=0&size=5', method: 'GET', category: 'Vendor' },
  { name: 'Vendor Orders', endpoint: '/vendors/orders?page=0&size=5', method: 'GET', category: 'Vendor' },
  { name: 'Vendor Reviews', endpoint: '/vendors/reviews?page=0&size=5', method: 'GET', category: 'Vendor' },
  { name: 'Vendor FAQs', endpoint: '/vendors/faqs', method: 'GET', category: 'Vendor' },
  { name: 'Vendor Wallet', endpoint: '/vendors/wallet', method: 'GET', category: 'Vendor' },
  { name: 'Vendor Availability', endpoint: '/vendors/availability', method: 'GET', category: 'Vendor' },
  
  // Customer APIs - Requires X-User-Id header
  { name: 'Customer Cart', endpoint: '/customers/cart', method: 'GET', category: 'Customer' },
  { name: 'Customer Orders', endpoint: '/customers/orders', method: 'GET', category: 'Customer' },
  { name: 'Customer Leads', endpoint: '/customers/leads', method: 'GET', category: 'Customer' },
];

export default function AdminApiPerformance() {
  const navigate = useNavigate();
  const [results, setResults] = useState<ApiTestResult[]>(
    API_DEFINITIONS.map(api => ({ ...api, duration: 0, status: 'idle' as const }))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  // Test user IDs - constant for consistent testing
  // Customer: customer@gmail.com - ID: 2860cf36-145c-442a-886b-29ec4571b2b8
  // Vendor: b750411e-10d2-4bd8-9484-4f250fe7d33b (first active vendor)
  const [testUserId, setTestUserId] = useState('2860cf36-145c-442a-886b-29ec4571b2b8');
  const [testVendorId, setTestVendorId] = useState('b750411e-10d2-4bd8-9484-4f250fe7d33b');
  const [showConfig, setShowConfig] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

  // Fetch test user ID on mount (customer@gmail.com)
  useEffect(() => {
    fetchTestUserIds();
  }, []);

  const fetchTestUserIds = async () => {
    const token = localStorage.getItem('auth_token');
    
    try {
      // Fetch first vendor for testing - get the actual vendor ID (not user ID)
      const vendorsResponse = await fetch(`${API_BASE_URL}/admin/vendors?page=0&size=1`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      });
      if (vendorsResponse.ok) {
        const data = await vendorsResponse.json();
        console.log('Vendors response:', data);
        // The vendor ID is in the response - extract it
        if (data.data?.content?.[0]?.id) {
          setTestVendorId(data.data.content[0].id);
          console.log('Set vendor ID:', data.data.content[0].id);
        } else if (data.data?.[0]?.id) {
          setTestVendorId(data.data[0].id);
          console.log('Set vendor ID:', data.data[0].id);
        }
      }
    } catch (e) {
      console.log('Could not fetch test vendor ID:', e);
    }
  };

  const testSingleApi = async (api: typeof API_DEFINITIONS[0], index: number): Promise<ApiTestResult> => {
    const token = localStorage.getItem('auth_token');
    const startTime = performance.now();
    
    // Update status to pending
    setResults(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status: 'pending' };
      return updated;
    });

    // Build headers based on API category
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };

    // Add X-User-Id for Customer APIs
    if (api.category === 'Customer' && testUserId) {
      headers['X-User-Id'] = testUserId;
    }

    // Add X-Vendor-Id for Vendor APIs
    if (api.category === 'Vendor' && testVendorId) {
      headers['X-Vendor-Id'] = testVendorId;
    }

    try {
      // Create abort controller for timeout (5 seconds - reduced to fail fast)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}${api.endpoint}`, {
        method: api.method,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const duration = Math.round(performance.now() - startTime);
      
      const result: ApiTestResult = {
        ...api,
        duration,
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };

      setResults(prev => {
        const updated = [...prev];
        updated[index] = result;
        return updated;
      });

      return result;
    } catch (error: any) {
      const duration = Math.round(performance.now() - startTime);
      
      // Check if it was a timeout
      const isTimeout = error.name === 'AbortError';
      
      const result: ApiTestResult = {
        ...api,
        duration: isTimeout ? 5000 : duration,
        status: 'error',
        error: isTimeout ? 'Timeout (>5s)' : (error.message || 'Network error'),
      };

      setResults(prev => {
        const updated = [...prev];
        updated[index] = result;
        return updated;
      });

      return result;
    }
  };

  // Test a single API by clicking on it
  const testSingleApiByIndex = async (index: number) => {
    await testSingleApi(API_DEFINITIONS[index], index);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    // Reset all results
    setResults(API_DEFINITIONS.map(api => ({ ...api, duration: 0, status: 'idle' as const })));

    const totalApis = API_DEFINITIONS.length;
    
    for (let i = 0; i < totalApis; i++) {
      await testSingleApi(API_DEFINITIONS[i], i);
      setProgress(Math.round(((i + 1) / totalApis) * 100));
      // Wait 1.5 seconds between requests to allow DB connections to be released
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setIsRunning(false);
    toast.success('All API tests completed!');
  };

  const getSpeedColor = (duration: number) => {
    if (duration < 200) return 'text-green-400';
    if (duration < 500) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSpeedBadge = (duration: number) => {
    if (duration < 200) return <Badge className="bg-green-500/20 text-green-400">Fast</Badge>;
    if (duration < 500) return <Badge className="bg-yellow-500/20 text-yellow-400">Medium</Badge>;
    return <Badge className="bg-red-500/20 text-red-400">Slow</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Public': return <Globe className="h-4 w-4" />;
      case 'Admin': return <Server className="h-4 w-4" />;
      case 'Vendor': return <BarChart3 className="h-4 w-4" />;
      case 'Customer': return <Activity className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Public': return 'bg-blue-500/20 text-blue-400';
      case 'Admin': return 'bg-purple-500/20 text-purple-400';
      case 'Vendor': return 'bg-orange-500/20 text-orange-400';
      case 'Customer': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Calculate summary stats
  const completedTests = results.filter(r => r.status === 'success' || r.status === 'error');
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const avgDuration = completedTests.length > 0 
    ? Math.round(completedTests.reduce((sum, r) => sum + r.duration, 0) / completedTests.length)
    : 0;
  const slowCount = completedTests.filter(r => r.duration > 500).length;
  const fastestApi = completedTests.length > 0 
    ? completedTests.reduce((a, b) => a.duration < b.duration ? a : b)
    : null;
  const slowestApi = completedTests.length > 0 
    ? completedTests.reduce((a, b) => a.duration > b.duration ? a : b)
    : null;

  // Group by category
  const categories = ['Public', 'Admin', 'Vendor', 'Customer'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  API Performance Monitor
                </h1>
                <p className="text-sm text-muted-foreground">Test all APIs and measure response times</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowConfig(!showConfig)}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Config
              </Button>
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="gap-2"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Testing... {progress}%
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run All Tests
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Test Configuration */}
        {showConfig && (
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Test Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    Test User ID (for Customer APIs)
                  </Label>
                  <Input
                    value={testUserId}
                    onChange={(e) => setTestUserId(e.target.value)}
                    placeholder="UUID of test customer user"
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for X-User-Id header in Customer API calls
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Store className="h-4 w-4" />
                    Test Vendor ID (for Vendor APIs)
                  </Label>
                  <Input
                    value={testVendorId}
                    onChange={(e) => setTestVendorId(e.target.value)}
                    placeholder="UUID of test vendor"
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for X-Vendor-Id header in Vendor API calls
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3 text-green-500" />
                IDs are auto-fetched on page load. You can override them if needed.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Bar */}
        {isRunning && (
          <Card className="border-primary/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div className="flex-1">
                  <Progress value={progress} className="h-2" />
                </div>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        {completedTests.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs">Total APIs</span>
                </div>
                <p className="text-2xl font-bold">{API_DEFINITIONS.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-500 mb-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">Success</span>
                </div>
                <p className="text-2xl font-bold text-green-500">{successCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-500 mb-1">
                  <XCircle className="h-4 w-4" />
                  <span className="text-xs">Errors</span>
                </div>
                <p className="text-2xl font-bold text-red-500">{errorCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">Avg Time</span>
                </div>
                <p className={`text-2xl font-bold ${getSpeedColor(avgDuration)}`}>{avgDuration}ms</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-500 mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs">Slow (&gt;500ms)</span>
                </div>
                <p className="text-2xl font-bold text-orange-500">{slowCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs">Tested</span>
                </div>
                <p className="text-2xl font-bold">{completedTests.length}/{API_DEFINITIONS.length}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fastest & Slowest */}
        {fastestApi && slowestApi && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-500 font-medium mb-1">🚀 Fastest API</p>
                    <p className="font-semibold">{fastestApi.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{fastestApi.endpoint}</p>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{fastestApi.duration}ms</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-500 font-medium mb-1">🐢 Slowest API</p>
                    <p className="font-semibold">{slowestApi.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{slowestApi.endpoint}</p>
                  </div>
                  <p className="text-2xl font-bold text-red-400">{slowestApi.duration}ms</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* API Results by Category */}
        {categories.map(category => {
          const categoryResults = results.filter(r => r.category === category);
          if (categoryResults.length === 0) return null;

          return (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge className={getCategoryColor(category)}>
                    {getCategoryIcon(category)}
                    <span className="ml-1">{category}</span>
                  </Badge>
                  <span className="text-muted-foreground text-sm font-normal">
                    ({categoryResults.length} APIs)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">API Name</th>
                        <th className="text-left p-3 font-medium">Endpoint</th>
                        <th className="text-center p-3 font-medium">Method</th>
                        <th className="text-center p-3 font-medium">Status</th>
                        <th className="text-center p-3 font-medium">Duration</th>
                        <th className="text-center p-3 font-medium">Speed</th>
                        <th className="text-center p-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryResults.map((result, idx) => {
                        // Find the actual index in the full results array
                        const actualIndex = results.findIndex(r => r.endpoint === result.endpoint);
                        return (
                        <tr key={idx} className="border-t border-border/50 hover:bg-muted/30">
                          <td className="p-3 font-medium">{result.name}</td>
                          <td className="p-3">
                            <code className="text-xs bg-muted px-2 py-1 rounded">{result.endpoint}</code>
                          </td>
                          <td className="text-center p-3">
                            <Badge variant="outline" className="text-xs">{result.method}</Badge>
                          </td>
                          <td className="text-center p-3">
                            {result.status === 'idle' && (
                              <Badge variant="outline" className="text-xs">Idle</Badge>
                            )}
                            {result.status === 'pending' && (
                              <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" />
                            )}
                            {result.status === 'success' && (
                              <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                            )}
                            {result.status === 'error' && (
                              <div className="flex flex-col items-center">
                                <XCircle className="h-5 w-5 text-red-500" />
                                {result.error && (
                                  <span className="text-xs text-red-400 mt-1">{result.error}</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="text-center p-3">
                            {result.status !== 'idle' && result.status !== 'pending' && (
                              <span className={`font-mono font-semibold ${getSpeedColor(result.duration)}`}>
                                {result.duration}ms
                              </span>
                            )}
                          </td>
                          <td className="text-center p-3">
                            {result.status === 'success' && getSpeedBadge(result.duration)}
                          </td>
                          <td className="text-center p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => testSingleApiByIndex(actualIndex)}
                              disabled={result.status === 'pending' || isRunning}
                              className="h-7 px-2 text-xs"
                            >
                              {result.status === 'pending' ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      );})}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Empty State */}
        {completedTests.length === 0 && !isRunning && (
          <Card>
            <CardContent className="p-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tests Run Yet</h3>
              <p className="text-muted-foreground mb-4">
                Click "Run All Tests" to test all {API_DEFINITIONS.length} APIs and measure their response times.
              </p>
              <Button onClick={runAllTests} className="gap-2">
                <Play className="h-4 w-4" />
                Run All Tests
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
