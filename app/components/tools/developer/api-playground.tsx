"use client";
import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { Input, Button, Textarea, LoadingSpinner } from '@/app/components/shared';
import { showToast } from '@/app/shared/Toast';

// Comprehensive SSRF prevention
function isInternalIP(hostname: string): boolean {
  // Check localhost variants
  const localhostVariants = [
    'localhost',
    '127.0.0.1',
    '::1',
    '0.0.0.0',
    'localhost.localdomain',
    'localhost6',
    'localhost6.localdomain6',
    'local',
  ];
  
  if (localhostVariants.includes(hostname.toLowerCase())) {
    return true;
  }

  // Check for localhost in hostname
  if (hostname.toLowerCase().includes('localhost')) {
    return true;
  }

  // Parse IPv4 addresses
  const parts = hostname.split('.').map(Number);
  if (parts.length === 4 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
    // RFC 1918 private addresses
    if (parts[0] === 10) return true; // 10.0.0.0/8
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12
    if (parts[0] === 192 && parts[1] === 168) return true; // 192.168.0.0/16
    
    // Link-local addresses (169.254.0.0/16)
    if (parts[0] === 169 && parts[1] === 254) return true;
    
    // Loopback (127.0.0.0/8)
    if (parts[0] === 127) return true;
    
    // Multicast (224.0.0.0/4)
    if (parts[0] >= 224 && parts[0] <= 239) return true;
    
    // Reserved (240.0.0.0/4)
    if (parts[0] >= 240) return true;
  }

  // Check for IPv6 localhost and private ranges
  if (hostname.startsWith('::1') || hostname.startsWith('fe80:') || hostname.startsWith('fc00:')) {
    return true;
  }

  return false;
}

// Validate URL to prevent DNS rebinding and other attacks
function validateURL(urlString: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(urlString);
    
    // Only allow HTTP and HTTPS
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }

    // Check for internal IPs
    if (isInternalIP(url.hostname)) {
      return { valid: false, error: 'Requests to internal IPs are not allowed for security reasons' };
    }

    // Block common internal hostnames
    const blockedHostnames = [
      'metadata.google.internal',
      '169.254.169.254', // AWS metadata
      'metadata.azure.com',
      'metadata.cloud.google.com',
    ];
    
    if (blockedHostnames.some(blocked => url.hostname.includes(blocked))) {
      return { valid: false, error: 'This hostname is blocked for security reasons' };
    }

    // Validate hostname format
    if (url.hostname.length > 253) {
      return { valid: false, error: 'Hostname too long' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

export const ApiPlayground = () => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);

  const send = async () => {
    setLoading(true);
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      // Validate URL
      if (!url || !url.trim()) {
        throw new Error('URL is required');
      }
      
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are allowed');
      }
      
      // SSRF protection
      if (isInternalIP(urlObj.hostname)) {
        throw new Error('Requests to internal IPs are not allowed for security reasons');
      }
      
      // Prepare request options
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const options: RequestInit = {
        method,
        mode: 'cors',
        signal: controller.signal,
      };
      
      // Add request body for POST/PUT with size limit
      if (['POST', 'PUT'].includes(method) && requestBody.trim()) {
        // Limit request body size (1MB)
        const bodySize = new Blob([requestBody]).size;
        if (bodySize > 1024 * 1024) {
          if (timeoutId) clearTimeout(timeoutId);
          showToast('Request body too large (max 1MB)', 'error');
          setLoading(false);
          return;
        }

        try {
          const parsedBody = JSON.parse(requestBody);
          options.body = JSON.stringify(parsedBody);
          options.headers = { 'Content-Type': 'application/json' };
        } catch (e) {
          if (timeoutId) clearTimeout(timeoutId);
          showToast('Invalid JSON in request body', 'error');
          setLoading(false);
          return;
        }
      }
      
      const res = await fetch(url, options);
      if (timeoutId) clearTimeout(timeoutId);
      
      // Handle response (may not be JSON)
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await res.json();
      } else {
        data = { text: await res.text() };
      }
      
      setResponse(data);
      setStatus(res.status);
    } catch (e: unknown) {
      if (timeoutId) clearTimeout(timeoutId);
      
      if (e instanceof Error && e.name === 'AbortError') {
        showToast('Request timed out after 10 seconds', 'error');
        setResponse({ error: 'Request timeout' });
        setStatus(408);
      } else {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
        showToast(errorMessage, 'error');
        setResponse({ error: errorMessage });
        setStatus(500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-6 max-w-6xl mx-auto gap-6">
       <div className="flex gap-0 shadow-lg rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <select value={method} onChange={e=>setMethod(e.target.value)} className={`px-6 font-bold text-white outline-none appearance-none text-center ${method==='GET'?'bg-blue-600':method==='POST'?'bg-emerald-600':method==='DELETE'?'bg-rose-600':'bg-amber-500'}`}>
             <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
          </select>
          <input value={url} onChange={e=>setUrl(e.target.value)} className="flex-1 px-4 py-4 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 font-mono text-sm outline-none  transition-all" placeholder="Enter Request URL..."/>
          <button onClick={send} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-bold flex items-center gap-2 disabled:opacity-50 transition-colors">{loading ? "..." : <><Play size={16}/> Send</>}</button>
       </div>

       <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
          <div className="w-full lg:w-1/3 bg-white dark:bg-slate-900 border rounded-2xl p-4 flex flex-col">
             <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-xs uppercase text-slate-500">Request Body</h3><span className="text-[10px] bg-slate-100 px-2 py-1 rounded">JSON</span></div>
             <textarea 
               value={requestBody}
               onChange={e => setRequestBody(e.target.value)}
               className="flex-1 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded-xl p-4 font-mono text-xs resize-none outline-none  transition-all" 
               placeholder='{ "key": "value" }'
             />
          </div>
          <div className="flex-1 bg-slate-950 text-emerald-400 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative shadow-2xl">
             <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
                <span className="text-xs font-bold text-slate-400 uppercase">Response</span>
                {status && (() => {
                  const getStatusText = (code: number) => {
                    if (code >= 200 && code < 300) return 'OK';
                    if (code >= 300 && code < 400) return 'Redirect';
                    if (code >= 400 && code < 500) return 'Client Error';
                    if (code >= 500) return 'Server Error';
                    return 'Unknown';
                  };
                  return (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${status<300?'bg-emerald-900/30 text-emerald-400':status<400?'bg-amber-900/30 text-amber-400':'bg-rose-900/30 text-rose-400'}`}>
                      {status} {getStatusText(status)}
                    </span>
                  );
                })()}
             </div>
             <pre className="flex-1 p-4 overflow-auto font-mono text-xs">{response ? JSON.stringify(response, null, 2) : "// Response will appear here..."}</pre>
          </div>
       </div>
    </div>
  );
};