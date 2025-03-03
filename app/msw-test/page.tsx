'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function MswTestPage() {
  const [loginResult, setLoginResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing login API...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'password123',
        }),
      });
      
      console.log('Login API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Login failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Login API response data:', data);
      setLoginResult(data);
    } catch (err: any) {
      console.error('Login test error:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">MSW Test Page</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Login API</CardTitle>
          <CardDescription>
            This will test if MSW is correctly intercepting the login API request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testLogin} 
            disabled={loading}
            className="mb-4"
          >
            {loading ? 'Testing...' : 'Test Login API'}
          </Button>
          
          {error && (
            <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}
          
          {loginResult && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <p className="font-bold">Success! MSW is working correctly.</p>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                {JSON.stringify(loginResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">
            If MSW is working correctly, you should see a successful response from the login API.
          </p>
        </CardFooter>
      </Card>
      
      <div className="p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
        <h2 className="font-bold text-lg mb-2">Debugging Information</h2>
        <p>Check the browser console for detailed logs about the MSW initialization and API requests.</p>
        <p className="mt-2">
          If you see a 404 error, it means MSW is not intercepting the request properly. Make sure the service worker is registered and the handler pattern matches the request URL.
        </p>
      </div>
    </div>
  );
} 