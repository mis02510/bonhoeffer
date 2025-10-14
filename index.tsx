import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, ResponsiveContainer, LabelList, Cell } from 'recharts';

// --- Gemini API Initialization ---
// IMPORTANT: This assumes process.env.API_KEY is set in the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- SVG Icons ---
const Icons = {
  revenue: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125-1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  orders: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25l3.807-3.262a4.502 4.502 0 0 1 6.384 0L20.25 18" /></svg>,
  clients: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962a3.752 3.752 0 0 1-4.493 0L5 11.529m10.232 2.234a3.75 3.75 0 0 0-4.493 0L10.5 11.529m-2.258 4.515a3.753 3.753 0 0 1-4.493 0L3 16.25m10.232-2.234a3.75 3.75 0 0 1-4.493 0L7.5 13.763m7.5-4.515a3.753 3.753 0 0 0-4.493 0L10.5 6.5m-2.258 4.515a3.753 3.753 0 0 1-4.493 0L3 11.25m10.232-2.234a3.75 3.75 0 0 0-4.493 0L7.5 8.763m7.5 4.515a3.75 3.75 0 0 1-4.493 0L10.5 13.75m5.007-4.515a3.75 3.75 0 0 0-4.493 0L13.5 8.763" /></svg>,
  countries: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.893 13.393l-1.135-1.135a2.252 2.252 0 0 1-.421-.585l-1.08-2.16a2.25 2.25 0 0 0-1.898-1.302h-1.148a2.25 2.25 0 0 0-1.898 1.302l-1.08 2.16a2.252 2.252 0 0 1-.421.585l-1.135 1.135a2.25 2.25 0 0 0 0 3.182l1.135 1.135a2.252 2.252 0 0 1 .421.585l1.08 2.16a2.25 2.25 0 0 0 1.898 1.302h1.148a2.25 2.25 0 0 0 1.898-1.302l1.08-2.16a2.252 2.252 0 0 1 .421-.585l1.135-1.135a2.25 2.25 0 0 0 0-3.182zM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z" /></svg>,
  placeholder: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
  prevArrow: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>,
  nextArrow: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>,
  chevron: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>,
  chat: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 0 1-2.53-.388A5.864 5.864 0 0 1 5.4 12.006c.482.55.994.995 1.524 1.372a11.942 11.942 0 0 0 7.26-1.742 1.25 1.25 0 0 0 .332-.307 12.448 12.448 0 0 0-1.618-1.579 11.912 11.912 0 0 0-6.064-1.785 1.25 1.25 0 0 0-.97.242 12.45 12.45 0 0 0-1.328 1.28c-.318.332-.637.672-.94 1.018a5.864 5.864 0 0 1-.42-2.32C3 7.444 7.03 3.75 12 3.75s9 3.694 9 8.25z" /></svg>,
  robot: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H13.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5A2.25 2.25 0 0 1 18.75 19.5H5.25A2.25 2.25 0 0 1 3 17.25V6.75A2.25 2.25 0 0 1 5.25 4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h7.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 16.5h6" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 9.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 9.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0z" /></svg>,
  plan: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" /></svg>,
  shipped: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
  shoppingCart: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l1.823-6.836a.75.75 0 0 0-.44-.898l-7.458-2.61a.75.75 0 0 0-.915.658l-1.006 5.031c-.12.603-.635 1.036-1.254 1.036H3.75" /></svg>,
  search: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>,
  dashboard: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg>,
  table: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504-1.125-1.125-1.125m-17.25 0h.008v.015h-.008v-.015Zm0 0v-2.25m17.25-10.5h-17.25a1.125 1.125 0 0 0-1.125 1.125v1.5c0 .621.504 1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v-1.5c0-.621-.504-1.125-1.125-1.125m-17.25 0v2.25m17.25 0h.008v.015h-.008v-.015Zm-17.25 0v-2.25m0 5.25h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504-1.125-1.125-1.125m-17.25 0h.008v.015h-.008v-.015Z" /></svg>,
  user: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>,
  key: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" /></svg>,
  copy: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H9.75" /></svg>,
  logout: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3h12" /></svg>,
  checkCircle: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  clock: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  circle: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
};

// --- Data Types ---
interface OrderData {
  status: string;
  orderDate: string;
  stuffingMonth: string;
  orderNo: string;
  customerName: string;
  country: string;
  productCode: string;
  qty: number;
  exportValue: number;
  logoUrl: string;
  category: string;
  segment: string;
  product: string;
  imageLink: string;
  unitPrice: number;
  fobPrice: number;
  moq: number;
}

interface MasterProductData {
  category: string;
  segment: string;
  product: string;
  productCode: string;
  imageLink: string;
  customerName: string;
  country: string;
  fobPrice: number;
  moq: number;
}

interface StepData {
  orderNo: string;
  productionDate: string;
  productionStatus: string;
  sobDate: string;
  sobStatus: string;
  paymentPlannedDate: string;
  paymentStatus: string;
  qualityCheckPlannedDate: string;
  qualityCheckInspection: string;
  qualityCheckStatus: string;
}

interface Filter {
    type: 'status' | 'country' | 'month';
    value: string;
    source?: string;
}

// --- Helper Functions ---
const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
const formatCompactNumber = (value: number) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value);
const formatNa = (value: string) => (value && value.toLowerCase() !== '#n/a' ? value : '~');

// --- Components ---
const LoginScreen = ({ onLogin, onClearSavedUser }: { onLogin: (name: string, key: string) => boolean, onClearSavedUser: () => void }) => {
    const [name, setName] = useState('');
    const [key, setKey] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [savedUsername, setSavedUsername] = useState<string | null>(null);

    useEffect(() => {
        const user = localStorage.getItem('dashboard_username');
        if (user) {
            setSavedUsername(user);
        }
    }, []);

    const handleLoginAttempt = (e: React.FormEvent, loginName?: string, loginKey?: string) => {
        e.preventDefault();
        const finalName = loginName || name;
        const finalKey = loginKey || key;
        
        if (isLoading || !finalName || !finalKey) return;

        setIsLoading(true);
        setError('');

        setTimeout(() => {
            const loginSuccess = onLogin(finalName.trim(), finalKey.trim());
            if (!loginSuccess) {
                setError('Invalid name or secret key. Please try again.');
                setIsLoading(false);
            }
        }, 500);
    };
    
    const handleWelcomeBackLogin = (e: React.FormEvent) => {
        const savedKey = localStorage.getItem('dashboard_apikey');
        if (savedUsername && savedKey) {
            handleLoginAttempt(e, savedUsername, savedKey);
        } else {
            setError('Could not find saved credentials. Please log in manually.');
            handleUseDifferentAccount();
        }
    };
    
    const handleUseDifferentAccount = () => {
        onClearSavedUser();
        setSavedUsername(null);
        setName('');
        setKey('');
        setError('');
    };

    if (savedUsername) {
        return (
            <div className="login-container">
                <div className="login-box">
                    <h1 className="login-title">Welcome Back!</h1>
                    <p className="login-subtitle">Continue as <strong>{savedUsername}</strong> or log in as a different user.</p>
                    <form className="login-form" onSubmit={handleWelcomeBackLogin}>
                         {error && <p className="login-error">{error}</p>}
                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? 'Logging In...' : `Login as ${savedUsername}`}
                        </button>
                        <button type="button" className="secondary-login-button" onClick={handleUseDifferentAccount} disabled={isLoading}>
                            Use a Different Account
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-title">Client Dashboard Access</h1>
                <p className="login-subtitle">Please enter your credentials to continue</p>
                <form className="login-form" onSubmit={handleLoginAttempt}>
                    <div className="input-group">
                        <label htmlFor="name">{Icons.user} Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., admin"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="key">{Icons.key} Secret Key</label>
                        <input
                            id="key"
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="••••••••••••"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    {error && <p className="login-error">{error}</p>}
                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const KpiCard = ({ title, value, icon, onFilter = null, filterType = null, filterValue = null, activeFilter, onClick = null, className = '' }) => {
    const isFilterable = !!filterType || !!onClick;
    const isActive = activeFilter && activeFilter.type === filterType && activeFilter.value === filterValue;
    
    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (filterType && onFilter) {
            onFilter({ type: filterType, value: filterValue }, 'kpi');
        }
    };

    return (
        <div 
          className={`kpi-card ${isFilterable ? 'filterable' : ''} ${isActive ? 'active' : ''} ${className || ''}`}
          onClick={handleClick}
        >
            <div className="icon">{Icons[icon]}</div>
            <div className="kpi-card-content">
                <h3>{title}</h3>
                <p>{value}</p>
            </div>
        </div>
    );
};

const DataTable = ({ data, title, isDetailedView, onOrderDoubleClick, onClearOrderView, currentUser, authenticatedUser, onShowTracking }: { data: OrderData[], title: string, isDetailedView: boolean, onOrderDoubleClick: (orderNo: string) => void, onClearOrderView: () => void, currentUser: string, authenticatedUser: string, onShowTracking: (orderNo: string) => void }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10; // Use a fixed number of rows per page
    const tableWrapperRef = useRef<HTMLDivElement>(null);

    const groupedData = useMemo(() => {
        if (isDetailedView) return []; // Don't group in detailed view
        
        const groups: { [key: string]: OrderData[] } = data.reduce((acc, row) => {
            if (!acc[row.orderNo]) {
                acc[row.orderNo] = [];
            }
            acc[row.orderNo].push(row);
            return acc;
        }, {});

        return Object.values(groups).map(products => {
            const firstProduct = products[0];
            return {
                orderNo: firstProduct.orderNo,
                products: products,
                productCount: products.length,
                totalQty: products.reduce((sum, p) => sum + p.qty, 0),
                totalExportValue: products.reduce((sum, p) => sum + p.exportValue, 0),
                customerName: firstProduct.customerName,
                country: firstProduct.country,
                status: firstProduct.status,
                imageLink: firstProduct.imageLink,
                productCode: firstProduct.productCode,
                category: firstProduct.category,
                segment: firstProduct.segment,
                product: firstProduct.product,
            };
        });
    }, [data, isDetailedView]);

    const totalItems = isDetailedView ? data.length : groupedData.length;
    const totalPages = useMemo(() => Math.ceil(totalItems / rowsPerPage), [totalItems, rowsPerPage]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const items = isDetailedView ? data : groupedData;
        return items.slice(startIndex, startIndex + rowsPerPage);
    }, [data, groupedData, isDetailedView, currentPage, rowsPerPage]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (totalPages === 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);
    
    useEffect(() => {
        setCurrentPage(1); // Reset page on data change
    }, [data, isDetailedView]);

    return (
        <div className="data-table-container">
            <div className="data-table-header">
                <h3>{title}</h3>
                {isDetailedView && (
                    <button className="back-button" onClick={onClearOrderView}>
                        {Icons.prevArrow} All Orders
                    </button>
                )}
            </div>
            {!isDetailedView && (
                <div className="instruction-container">
                    <p>Tip: Double-click on any order to see a detailed summary. Single-click an Order Number to track its progress.</p>
                </div>
            )}
            <div className="table-wrapper" ref={tableWrapperRef}>
                <table>
                    <thead>
                        <tr>
                            <th className="text-center">Status</th>
                            <th>Order No</th>
                            <th className="text-center">Image</th>
                            {isDetailedView && <th>Product Code</th>}
                            <th>Category</th>
                            {isDetailedView && <th>Product</th>}
                            {authenticatedUser === 'admin' && <th>Customer</th>}
                            {authenticatedUser === 'admin' && <th>Country</th>}
                            <th className="text-right">Qty</th>
                            <th className="text-right">Export Value</th>
                            {isDetailedView && (
                                <>
                                    <th className="text-right">Unit Price</th>
                                    <th className="text-right">Fob Price</th>
                                    <th className="text-right">MOQ</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {isDetailedView ? (
                            (paginatedData as OrderData[]).map((row, index) => (
                                <tr key={row.productCode + index} className="detail-row" style={{ animationDelay: `${index * 0.05}s` }}>
                                    <td className="text-center">
                                        <div className="status-cell">
                                            <span className={`status-dot ${row.status.toLowerCase()}`}></span>
                                            <span className="status-text">{formatNa(row.status)}</span>
                                        </div>
                                    </td>
                                    <td className="order-no-cell clickable" onClick={(e) => { e.stopPropagation(); onShowTracking(row.orderNo); }}>{formatNa(row.orderNo)}</td>
                                    <td className="product-image-cell">
                                        {row.imageLink && row.imageLink.toLowerCase() !== '#n/a' ? <img src={row.imageLink} alt={row.product} className="product-image" /> : <div className="product-image-placeholder">No Image</div>}
                                    </td>
                                    <td>{formatNa(row.productCode)}</td>
                                    <td>{formatNa(row.category)}</td>
                                    <td>{formatNa(row.product)}</td>
                                    {authenticatedUser === 'admin' && <td>{formatNa(row.customerName)}</td>}
                                    {authenticatedUser === 'admin' && <td>{formatNa(row.country)}</td>}
                                    <td className="text-right">{formatCompactNumber(row.qty)}</td>
                                    <td className="value-text text-right">{row.exportValue > 0 ? formatCurrency(row.exportValue) : '-'}</td>
                                    <td className="value-text text-right">{row.unitPrice > 0 ? formatCurrency(row.unitPrice) : '-'}</td>
                                    <td className="value-text text-right">{row.fobPrice > 0 ? formatCurrency(row.fobPrice) : '-'}</td>
                                    <td className="text-right">{row.moq > 0 ? formatCompactNumber(row.moq) : '-'}</td>
                                </tr>
                            ))
                        ) : (
                            (paginatedData as any[]).map((group, index) => (
                                <tr 
                                    key={group.orderNo}
                                    className="summary-row" 
                                    onDoubleClick={() => onOrderDoubleClick(group.orderNo)}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <td className="text-center">
                                        <div className="status-cell">
                                            <span className={`status-dot ${group.status.toLowerCase()}`}></span>
                                            <span className="status-text">{formatNa(group.status)}</span>
                                        </div>
                                    </td>
                                    <td className="order-no-cell clickable" onClick={(e) => { e.stopPropagation(); onShowTracking(group.orderNo); }}>{formatNa(group.orderNo)}</td>
                                    <td className="product-image-cell">
                                        {group.imageLink && group.imageLink.toLowerCase() !== '#n/a' ? <img src={group.imageLink} alt={group.product} className="product-image" /> : <div className="product-image-placeholder">No Image</div>}
                                    </td>
                                    <td>{group.productCount > 1 ? 'Multiple Items' : formatNa(group.category)}</td>
                                    {authenticatedUser === 'admin' && <td>{formatNa(group.customerName)}</td>}
                                    {authenticatedUser === 'admin' && <td>{formatNa(group.country)}</td>}
                                    <td className="text-right">{formatCompactNumber(group.totalQty)}</td>
                                    <td className="value-text text-right">{formatCurrency(group.totalExportValue)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="pagination">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>{Icons.prevArrow} Previous</button>
                <span>Page {currentPage} of {totalPages || 1}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>Next {Icons.nextArrow}</button>
            </div>
        </div>
    );
};

const NeverBoughtDataTable = ({ data, currentUser, authenticatedUser }: { data: OrderData[], currentUser: string, authenticatedUser: string }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const rowsPerPage = 10;

  const totalPages = useMemo(() => Math.ceil(data.length / rowsPerPage), [data, rowsPerPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return data.slice(startIndex, startIndex + rowsPerPage);
  }, [data, currentPage, rowsPerPage]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [data, rowsPerPage]);

  return (
    <div className="data-table-container never-bought-table">
      <div className="table-wrapper" ref={tableWrapperRef}>
        <table>
          <thead>
            <tr>
              <th className="text-center">Image</th>
              <th>Product Code</th>
              <th>Category</th>
              <th>Segment</th>
              <th>Product</th>
              {authenticatedUser === 'admin' && <th>Customer</th>}
              {authenticatedUser === 'admin' && <th>Country</th>}
              <th className="text-right">FOB Price</th>
              <th className="text-right">MOQ</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={row.productCode + index} className="catalog-row" style={{ animationDelay: `${index * 0.05}s`}}>
                <td className="product-image-cell">
                  {row.imageLink && row.imageLink.toLowerCase() !== '#n/a' ? <img src={row.imageLink} alt={row.product} className="product-image" /> : <div className="product-image-placeholder">No Image</div>}
                </td>
                <td>{formatNa(row.productCode)}</td>
                <td>{formatNa(row.category)}</td>
                <td>{formatNa(row.segment)}</td>
                <td>{formatNa(row.product)}</td>
                {authenticatedUser === 'admin' && <td>{formatNa(row.customerName)}</td>}
                {authenticatedUser === 'admin' && <td>{formatNa(row.country)}</td>}
                <td className="value-text text-right">{row.fobPrice > 0 ? formatCurrency(row.fobPrice) : '-'}</td>
                <td className="text-right">{row.moq > 0 ? formatCompactNumber(row.moq) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>{Icons.prevArrow} Previous</button>
        <span>Page {currentPage} of {totalPages || 1}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>Next {Icons.nextArrow}</button>
      </div>
    </div>
  );
};

// --- START: AI Chat Assistant & Helpers ---

const SimpleMarkdown = ({ text }: { text: string }) => {
    // This is a very basic markdown renderer.
    // It handles: **bold**, and lists starting with "- ".
    const html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/((<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>') // Wrap consecutive LIs in a UL
        .replace(/\n/g, '<br />')
        .replace(/<br \/><ul>/g, '<ul>') // Cleanup
        .replace(/<\/ul><br \/>/g, '</ul>'); // Cleanup

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};


const ChatAssistant = ({ orderData, catalogData, clientName, kpis }: { orderData: OrderData[], catalogData: any[], clientName: string, kpis: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const [showHelpPopup, setShowHelpPopup] = useState(false);

    const placeholder = "Ask about orders or products...";
    const initialMessage = "Hello! I am a real-time AI assistant. How can I help you with your orders and our product catalog today?";

    useEffect(() => {
        let intervalId: number;
        let timeoutId: number;

        // Helper function to show the popup and set a timer to hide it
        const showAndHide = () => {
            setShowHelpPopup(true);
            timeoutId = window.setTimeout(() => {
                setShowHelpPopup(false);
            }, 10000); // Hide after 10 seconds
        };

        if (isOpen) {
            setShowHelpPopup(false);
        } else {
            // Show popup immediately when the component is ready and chat is closed
            showAndHide();
            // Then set an interval to show it periodically
            intervalId = window.setInterval(showAndHide, 60000); // Every minute
        }

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [isOpen]);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage, { role: 'assistant', text: '' }]);
        setInput('');
        setIsLoading(true);

        try {
            // Limit the data sent to the API to improve performance
            const orderDataContext = JSON.stringify(orderData.slice(0, 100));
            const catalogDataContext = JSON.stringify(catalogData.slice(0, 100));
            const kpiContext = JSON.stringify(kpis);

            const roleInstructions = clientName === 'admin'
                ? "The user is an admin and can see all data. You can answer questions about any client or perform cross-client analysis based on the provided data."
                : `The user is the client named '${clientName}'. You MUST only answer questions related to this specific client's data. Do not reveal any information about other clients. If asked about another client, politely decline and state that you can only provide information about their own account.`;

            const systemInstruction = `You are an expert data analyst for an international shipping company. 
Your goal is to provide accurate, concise, and helpful answers based on the context provided.
Analyze the user's dashboard KPIs and the detailed order/catalog data to answer questions.
${roleInstructions}
Always be polite and professional. Keep your answers short and to the point unless the user asks for more detail. Respond using simple Markdown for formatting (bolding, lists).`;
            
            const prompt = `
                **CONTEXT - Dashboard KPIs Summary:**
                ${kpiContext}

                **CONTEXT - Detailed Order Data (A sample of up to 100 rows):**
                ${orderDataContext}

                **CONTEXT - Detailed Product Catalog Data (A sample of up to 100 rows):**
                ${catalogDataContext}

                **User's Question:** "${input}"
            `;

            const responseStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction,
                    thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster responses
                }
            });

            let fullResponse = '';
            for await (const chunk of responseStream) {
                fullResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = fullResponse;
                    return newMessages;
                });
            }

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            const errorMessage = "Sorry, I'm having trouble connecting to my brain right now. Please try again later.";
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = errorMessage;
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {showHelpPopup && !isOpen && (
                <div className="chat-help-popup">
                    How may I help you?
                    <div className="chat-help-popup-arrow"></div>
                </div>
            )}
            <button className="chat-fab" onClick={() => { setIsOpen(true); setShowHelpPopup(false); }} aria-label="Open AI Assistant">
                <img src="https://lh3.googleusercontent.com/d/1u_pfsfaDqq9XiPhr6qUbVEX2HtWIrM6K" alt="AI Assistant" />
            </button>
            <div className={`chat-assistant ${isOpen ? 'open' : 'closed'}`}>
                <div className="chat-header">
                    <span>AI Data Assistant</span>
                    <button onClick={() => setIsOpen(false)}>&times;</button>
                </div>
                <div className="chat-body" ref={chatBodyRef}>
                    <div className="chat-message assistant">
                        <SimpleMarkdown text={initialMessage} />
                    </div>
                     {messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.role}`}>
                            {msg.role === 'user' ? msg.text : <SimpleMarkdown text={msg.text} />}
                            {isLoading && msg.role === 'assistant' && index === messages.length - 1 && msg.text.length > 0 && <span className="blinking-cursor"></span>}
                        </div>
                    ))}
                </div>
                <div className="chat-input">
                    <input 
                        type="text" 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={placeholder}
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading}>Send</button>
                </div>
            </div>
        </>
    );
};

// --- END: AI Chat Assistant & Helpers ---

const NeverBoughtDashboard = ({ allOrderData, masterProductList, initialClientName, clientList, onClose, authenticatedUser }: { allOrderData: OrderData[], masterProductList: MasterProductData[], initialClientName: string, clientList: string[], onClose: () => void, authenticatedUser: string }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(initialClientName);

  const catalogForUser = useMemo(() => {
    return selectedUser === 'admin'
        ? masterProductList
        : masterProductList.filter(p => p.customerName === selectedUser);
  }, [masterProductList, selectedUser]);
  
  const filteredCatalogData = useMemo(() => { // This is MasterProductData[]
    if (!searchQuery.trim()) return catalogForUser;
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    return catalogForUser.filter(p =>
      (p.productCode && p.productCode.toLowerCase().includes(lowercasedQuery)) ||
      (p.category && p.category.toLowerCase().includes(lowercasedQuery)) ||
      (p.segment && p.segment.toLowerCase().includes(lowercasedQuery)) ||
      (p.product && p.product.toLowerCase().includes(lowercasedQuery)) ||
      (p.customerName && p.customerName.toLowerCase().includes(lowercasedQuery)) ||
      (p.country && p.country.toLowerCase().includes(lowercasedQuery))
    );
  }, [catalogForUser, searchQuery]);

  // Data formatted for the NeverBoughtDataTable component
  const tableData = useMemo(() => {
    return filteredCatalogData.map(p => ({
        status: 'CATALOG', orderDate: '', stuffingMonth: '', orderNo: 'N/A',
        customerName: p.customerName, country: p.country, productCode: p.productCode,
        qty: 0, exportValue: 0, logoUrl: '', category: p.category, segment: p.segment,
        product: p.product, imageLink: p.imageLink, unitPrice: 0, fobPrice: p.fobPrice,
        moq: p.moq,
    } as OrderData));
  }, [filteredCatalogData]);

  const relevantOrderData = useMemo(() => {
    if (selectedUser === 'admin') {
        return allOrderData;
    }
    return allOrderData.filter(o => o.customerName === selectedUser);
  }, [allOrderData, selectedUser]);
  
  return (
    <>
        <div className="dashboard-container never-bought-dashboard">
          <header>
            <div className="header-title">
              <h1>Full Product Catalog</h1>
            </div>
            <div className="filters">
                <div className="search-bar-container">
                    {Icons.search}
                    <input
                        type="text"
                        placeholder="Search by Product, Customer, Country..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                 <label className="view-switcher-label" htmlFor="nb-view-switcher">Current View:</label>
                 <div className="select-container">
                    <select id="nb-view-switcher" value={selectedUser} onChange={e => {setSelectedUser(e.target.value); setSearchQuery('')}} disabled={authenticatedUser !== 'admin'}>
                      {authenticatedUser === 'admin' ? 
                          clientList.map(client => <option key={client} value={client}>{client === 'admin' ? 'Admin' : client}</option>)
                          : <option value={authenticatedUser}>{authenticatedUser}</option>
                      }
                    </select>
                 </div>
                <button className="back-button" onClick={onClose}>
                    {Icons.prevArrow} Back to Dashboard
                </button>
            </div>
          </header>
          <main>
             <NeverBoughtDataTable data={tableData} currentUser={selectedUser} authenticatedUser={authenticatedUser}/>
          </main>
        </div>
        <ChatAssistant 
          orderData={relevantOrderData} 
          catalogData={filteredCatalogData} 
          clientName={selectedUser} 
          kpis={{}}
        />
    </>
  );
};

const OrderTrackingModal = ({ orderNo, stepData, onClose }: { orderNo: string, stepData: StepData | undefined, onClose: () => void }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    const getStepState = (status: string, date: string): 'completed' | 'pending' | 'upcoming' => {
        const s = status.toLowerCase();
        if (s === 'yes' || s === 'done') {
            return 'completed';
        }
        if (date && date.toLowerCase() !== '#n/a' && date.trim() !== '') {
            return 'pending';
        }
        return 'upcoming';
    };

    const steps = stepData ? [
        {
            title: "Production Date Follow-up",
            date: stepData.productionDate,
            status: stepData.productionStatus,
            state: getStepState(stepData.productionStatus, stepData.productionDate),
            details: `Date: ${formatNa(stepData.productionDate)}`
        },
        {
            title: "Final SOB",
            date: stepData.sobDate,
            status: stepData.sobStatus,
            state: getStepState(stepData.sobStatus, stepData.sobDate),
            details: `SOB/ETD: ${formatNa(stepData.sobDate)}`
        },
        {
            title: "Payment Follow-up",
            date: stepData.paymentPlannedDate,
            status: stepData.paymentStatus,
            state: getStepState(stepData.paymentStatus, stepData.paymentPlannedDate),
            details: `Planned: ${formatNa(stepData.paymentPlannedDate)}`
        },
        {
            title: "Quality Check",
            date: stepData.qualityCheckPlannedDate,
            status: stepData.qualityCheckStatus,
            state: getStepState(stepData.qualityCheckStatus, stepData.qualityCheckPlannedDate),
            details: `Planned: ${formatNa(stepData.qualityCheckPlannedDate)} | Inspection: ${formatNa(stepData.qualityCheckInspection)}`
        },
    ] : [];

    const getIconForState = (state: 'completed' | 'pending' | 'upcoming') => {
        switch (state) {
            case 'completed': return Icons.checkCircle;
            case 'pending': return Icons.clock;
            case 'upcoming': return Icons.circle;
            default: return Icons.circle;
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Order Tracking: <span className="modal-order-no">{orderNo}</span></h2>
                    <button className="modal-close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {stepData ? (
                        <ul className="tracking-timeline">
                            {steps.map((step, index) => (
                                <li key={index} className={`tracking-step ${step.state}`}>
                                    <div className="step-icon">{getIconForState(step.state)}</div>
                                    <div className="step-content">
                                        <h4 className="step-title">{step.title}</h4>
                                        <p className="step-details">{step.details}</p>
                                        <span className="step-status">{formatNa(step.status)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-tracking-info">No tracking information available for this order.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


const SalesByCountryChart = ({ data, onFilter, activeFilter }: { data: OrderData[], onFilter: (filter: Filter, source: string) => void, activeFilter: Filter | null }) => {
    const chartData = useMemo(() => {
        const countryData = data.reduce<Record<string, number>>((acc, curr) => {
            acc[curr.country] = (acc[curr.country] || 0) + curr.exportValue;
            return acc;
        }, {});
        return Object.entries(countryData)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [data]);

    const handleClick = (payload: any) => {
        if (payload && onFilter) {
            onFilter({ type: 'country', value: payload.name }, 'countryChart');
        }
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 30, right: 20, left: 30, bottom: 40 }} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke={'var(--text-color-muted)'} tick={{ fontSize: 12 }} interval={0} angle={-35} textAnchor="end" />
                <YAxis stroke={'var(--text-color-muted)'} tickFormatter={formatCompactNumber}/>
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--card-border)' }} formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" onClick={handleClick} animationDuration={800} animationEasing="ease-out">
                    {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          cursor="pointer"
                          fill={activeFilter?.type === 'country' && activeFilter?.value === entry.name ? '#FFB86C' : '#F99C1E'} 
                        />
                    ))}
                    <LabelList dataKey="value" position="top" formatter={formatCompactNumber} fill="var(--text-color)" fontSize={16} fontWeight="bold" />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
};

const CustomDot = (props: any) => {
    const { cx, cy, stroke, payload, onFilter, activeFilter } = props;
    if (payload.orders === 0) return null;
    
    const isActive = activeFilter && activeFilter.type === 'month' && activeFilter.value === payload.name;
    
    const handleClick = () => {
        if (onFilter) {
            onFilter({ type: 'month', value: payload.name }, 'monthChart');
        }
    };

    return (
        <circle 
            cx={cx} 
            cy={cy} 
            r={isActive ? 8 : 5} 
            fill={stroke} 
            stroke={isActive ? 'rgba(255,255,255,0.8)' : 'none'}
            strokeWidth={2}
            onClick={handleClick} 
            style={{ cursor: 'pointer', transition: 'r 0.2s ease, stroke 0.2s ease' }} 
        />
    );
};

const OrdersOverTimeChart = ({ data, onFilter, activeFilter }: { data: OrderData[], onFilter: (filter: Filter, source: string) => void, activeFilter: Filter | null }) => {
    const chartData = useMemo(() => {
        const monthData = data.reduce((acc, curr) => {
            const month = new Date(curr.orderDate).toLocaleString('default', { month: 'short' });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
         const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthOrder.map(month => ({ name: month, orders: monthData[month] || 0 })).filter(d => d.orders > 0);
    }, [data]);

     return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 30, right: 20, left: -10, bottom: 5 }}>
                 <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#36C5F0" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#36C5F0" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke={'var(--text-color-muted)'} />
                <YAxis stroke={'var(--text-color-muted)'} tickFormatter={(value) => formatCompactNumber(value)} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--card-border)' }}/>
                <Line type="monotone" dataKey="orders" stroke="#36C5F0" strokeWidth={3} animationDuration={800} animationEasing="ease-out" dot={<CustomDot onFilter={onFilter} activeFilter={activeFilter} />} activeDot={{ r: 8 }}>
                    <LabelList dataKey="orders" position="top" fill="var(--text-color)" fontSize={16} fontWeight="bold" />
                </Line>
                {/* FIX: The 'stroke' prop for the Area component expects a string, but was receiving a boolean (false). Changed to "none" to correctly disable the stroke and fix the type error. */}
                <Area type="monotone" dataKey="orders" stroke="none" fill="url(#colorOrders)" />
            </LineChart>
        </ResponsiveContainer>
    )
}

const SkeletonLoader = () => (
    <div className="dashboard-container skeleton-loader">
      <header>
        <div className="header-title">
           <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0 }}></div>
           <div className="skeleton" style={{ width: '250px', height: '36px' }}></div>
        </div>
        <div className="filters">
           <div className="skeleton" style={{ width: '200px', height: '40px' }}></div>
           <div className="skeleton" style={{ width: '200px', height: '40px' }}></div>
           <div className="skeleton" style={{ width: '150px', height: '40px' }}></div>
        </div>
      </header>
      <main>
        <div className="kpi-container">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '110px' }}></div>)}
        </div>
        <div className="main-content">
          <div className="charts-container-skeleton">
              <div className="skeleton chart-skeleton"></div>
              <div className="skeleton chart-skeleton"></div>
          </div>
          <div className="skeleton table-skeleton"></div>
        </div>
      </main>
    </div>
  );

const UserManagement = ({ allClientNames, currentCredentials, onClose }: { allClientNames: string[], currentCredentials: Record<string, string>, onClose: () => void }) => {
    const [selectedClient, setSelectedClient] = useState<string>('');
    const [apiKey, setApiKey] = useState<string>('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        if (selectedClient && currentCredentials[selectedClient]) {
            setApiKey(currentCredentials[selectedClient]);
        } else {
            setApiKey('');
        }
         // Do not reset status here to allow success message to persist until a new client is selected
        if (saveStatus !== 'success') {
            setSaveStatus('idle');
            setSaveMessage('');
        }
    }, [selectedClient, currentCredentials]);

    const handleGenerateKey = () => {
        if (!selectedClient) {
            setSaveStatus('error');
            setSaveMessage('Please select a client first.');
            return;
        }
        const randomPart = Math.random().toString(36).substring(2, 10);
        const newKey = `${selectedClient.toLowerCase().replace(/\s/g, '-')}-key-${randomPart}`;
        setApiKey(newKey);
        setSaveStatus('idle');
        setSaveMessage('');
    };

    const handleSave = async () => {
        if (!selectedClient || !apiKey) {
            setSaveStatus('error');
            setSaveMessage('Please select a client and generate a key before saving.');
            return;
        }

        setSaveStatus('saving');
        setSaveMessage('');
        const webAppUrl = 'https://script.google.com/macros/s/AKfycbx39vRct-ETat-z56_KLr3ubBC2usHWqZKwYF2Fr9wmJYRxQkltk8oaaoJGG3kCfh6f/exec';
        
        const dataToSave = {
            "name": selectedClient,
            "apiKey": apiKey
        };

        try {
            const response = await fetch(webAppUrl, {
                method: 'POST',
                // Sending as text/plain is a common workaround for Google Apps Script to avoid CORS pre-flight issues.
                body: JSON.stringify(dataToSave),
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
            });
    
            const result = await response.json();

            if (result.status !== 'success') {
                throw new Error(result.message || 'An unknown error occurred on the server.');
            }

            setSaveStatus('success');
            setSaveMessage(result.message || 'Credentials saved successfully! Please refresh the dashboard to see changes.');
            
            // Clear the form after a delay so the user can read the success message
            setTimeout(() => {
                setSelectedClient('');
                setApiKey('');
                setSaveStatus('idle');
                setSaveMessage('');
            }, 3000);
    
        } catch (error) {
            console.error('Failed to save credentials:', error);
            setSaveStatus('error');
            const errorMessage = (error instanceof TypeError)
                ? 'A network error occurred. This could be a CORS issue. Please check the browser console.'
                : error.message;
            setSaveMessage(`Save failed: ${errorMessage}`);
        }
    };

    return (
        <div className="dashboard-container user-management-dashboard">
            <header>
                <div className="header-title">
                    <h1>User &amp; API Key Management</h1>
                </div>
                <div className="user-management-actions">
                     <button className="back-button" onClick={onClose} disabled={saveStatus === 'saving'}>
                        {Icons.prevArrow} Back to Dashboard
                    </button>
                </div>
            </header>
            <main>
                <div className="user-management-form-container">
                    <h2>Add/Update User API Key</h2>
                    <p>Select a client to view, generate, or update their API key.</p>
                    <div className="form-group">
                        <label htmlFor="client-select">Client Name</label>
                        <div className="select-container">
                             <select 
                                id="client-select" 
                                value={selectedClient} 
                                onChange={e => setSelectedClient(e.target.value)}
                                disabled={saveStatus === 'saving'}
                             >
                                <option value="">-- Select a Client --</option>
                                {allClientNames.map(client => (
                                    <option key={client} value={client}>{client}</option>
                                ))}
                             </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="api-key-input">API Key</label>
                        <div className="api-key-input-wrapper">
                             <input 
                                id="api-key-input"
                                type="text" 
                                value={apiKey || 'Select a client to view or generate a key'} 
                                readOnly 
                                disabled={!apiKey}
                             />
                             <button 
                                className="generate-key-button" 
                                onClick={handleGenerateKey}
                                disabled={!selectedClient || saveStatus === 'saving'}
                             >
                                {currentCredentials[selectedClient] || apiKey ? 'Regenerate Key' : 'Generate Key'}
                             </button>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button
                            className="save-button"
                            onClick={handleSave}
                            disabled={saveStatus === 'saving' || !selectedClient || !apiKey}
                        >
                            {saveStatus === 'saving' ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                    {saveMessage && (
                        <div className={`save-status-container ${saveStatus}`}>
                            {saveMessage}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};


const App = () => {
  const [data, setData] = useState<OrderData[]>([]);
  const [masterProductList, setMasterProductList] = useState<MasterProductData[]>([]);
  const [stepData, setStepData] = useState<StepData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(null);
  const [userCredentials, setUserCredentials] = useState<Record<string, string>>({
      "admin": "admin-secret-key-123" // Hardcoded fallback for admin access
  });
  const [currentUser, setCurrentUser] = useState('admin');
  const [activeFilter, setActiveFilter] = useState<Filter | null>(null);
  const [viewedOrder, setViewedOrder] = useState<string | null>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<string | null>(null);
  const [showNeverBought, setShowNeverBought] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminViewMode, setAdminViewMode] = useState<'dashboard' | 'table'>('dashboard');

  useEffect(() => {
    const fetchData = async () => {
      const sheetId = '1JbxRqsZTDgmdlJ_3nrumfjPvjGVZdjJe43FPrh9kYw4';
      const liveSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Live`;
      const masterSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=MASTER`;
      const apiKeySheetGid = '817322209';
      const apiKeySheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${apiKeySheetGid}`;
      const stepSheetGid = '2023445010';
      const stepSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${stepSheetGid}`;

      try {
        const [liveResponse, masterResponse, apiKeyResponse, stepResponse] = await Promise.all([
          fetch(liveSheetUrl),
          fetch(masterSheetUrl),
          fetch(apiKeySheetUrl).catch(e => { console.warn("API Key sheet fetch failed, proceeding without it."); return null; }),
          fetch(stepSheetUrl).catch(e => { console.warn("Step sheet fetch failed, proceeding without it."); return null; }),
        ]);

        if (!liveResponse.ok) throw new Error(`HTTP error! status: ${liveResponse.status} on Live sheet`);
        if (!masterResponse.ok) throw new Error(`HTTP error! status: ${masterResponse.status} on MASTER sheet`);

        // Parse Live Data
        const liveCsvText = await liveResponse.text();
        const liveLines = liveCsvText.trim().split('\n');
        const liveHeadersRaw = liveLines.shift().slice(1, -1).split('","');
        
        const liveHeaderMapping = {
            'Status': 'status', 'ORDER FORWARDING DATE': 'orderDate', 'Stuffing Month': 'stuffingMonth',
            'Order Number': 'orderNo', 'Client': 'customerName', 'Country': 'country',
            'Products Code': 'productCode', 'Qty': 'qty', 'Export Value': 'exportValue',
            'Logo Image': 'logoUrl', 'Category': 'category', 'Segment': 'segment',
            'Product': 'product', 'Image Link': 'imageLink', 'Unit Price': 'unitPrice',
            'Fob Price': 'fobPrice', 'MOQ': 'moq'
        };
        const liveRequiredHeaders = Object.keys(liveHeaderMapping);
        const liveHeaderIndices: {[key: string]: number} = {};
        liveHeadersRaw.forEach((h, i) => { if (liveRequiredHeaders.includes(h.trim())) liveHeaderIndices[h.trim()] = i; });
        if (liveRequiredHeaders.some(h => !liveHeaderIndices.hasOwnProperty(h))) throw new Error('Live CSV is missing required columns. Please check sheet headers.');

        const parsedLiveData = liveLines.map(line => {
          const values = line.slice(1, -1).split('","');
          const row: any = {};
          for (const [header, key] of Object.entries(liveHeaderMapping)) {
            const value = values[liveHeaderIndices[header]] || '';
            if (['qty', 'moq'].includes(key)) row[key] = parseInt(String(value).replace(/,/g, ''), 10) || 0;
            else if (['exportValue', 'unitPrice', 'fobPrice'].includes(key)) row[key] = parseFloat(String(value).replace(/,/g, '')) || 0;
            else row[key] = value.trim();
          }
          return row as OrderData;
        }).filter(row => row.orderNo);
        setData(parsedLiveData);

        // Parse Master Data
        const masterCsvText = await masterResponse.text();
        const masterLines = masterCsvText.trim().split('\n');
        const masterHeadersRaw = masterLines.shift().slice(1, -1).split('","');
        const masterHeaderMapping = {
            'Category': 'category', 'Segment': 'segment', 'Product': 'product',
            'Products Code': 'productCode', 'Image Link': 'imageLink', 'Customer Name': 'customerName',
            'Country': 'country', 'Fob Price': 'fobPrice', 'Moq Qty': 'moq'
        };
        const masterRequiredHeaders = Object.keys(masterHeaderMapping);
        const masterHeaderIndices: {[key: string]: number} = {};
        masterHeadersRaw.forEach((h, i) => { if (masterRequiredHeaders.includes(h.trim())) masterHeaderIndices[h.trim()] = i; });
        if (masterRequiredHeaders.some(h => !masterHeaderIndices.hasOwnProperty(h))) throw new Error('MASTER CSV is missing required columns. Please check sheet headers.');
        
        const parsedMasterData = masterLines.map(line => {
          const values = line.slice(1, -1).split('","');
          const row: any = {};
          for (const [header, key] of Object.entries(masterHeaderMapping)) {
              const value = values[masterHeaderIndices[header]] || '';
              if (key === 'fobPrice') row[key] = parseFloat(String(value).replace(/,/g, '')) || 0;
              else if (key === 'moq') row[key] = parseInt(String(value).replace(/,/g, ''), 10) || 0;
              else row[key] = value.trim();
          }
          return row as MasterProductData;
        }).filter(row => row.productCode);
        setMasterProductList(parsedMasterData);

        // Parse Step Data
        if (stepResponse && stepResponse.ok) {
            const stepCsvText = await stepResponse.text();
            const stepLines = stepCsvText.trim().split('\n');
            const dataStartIndex = stepLines.findIndex(line => line.toLowerCase().includes('bg-0002'));
            const dataLines = dataStartIndex !== -1 ? stepLines.slice(dataStartIndex) : [];
            
            const parsedStepData = dataLines.map(line => {
                const values = line.slice(1, -1).split('","');
                return {
                    orderNo: values[0]?.trim() || '',
                    productionDate: values[1]?.trim() || '',
                    productionStatus: values[2]?.trim() || '',
                    sobDate: values[3]?.trim() || '',
                    sobStatus: values[4]?.trim() || '',
                    paymentPlannedDate: values[5]?.trim() || '',
                    paymentStatus: values[6]?.trim() || '',
                    qualityCheckPlannedDate: values[7]?.trim() || '',
                    qualityCheckInspection: values[8]?.trim() || '',
                    qualityCheckStatus: values[9]?.trim() || '',
                } as StepData;
            }).filter(row => row.orderNo && row.orderNo.toLowerCase() !== '#n/a');
            setStepData(parsedStepData);
        }

        // Parse API Key Data
        const fetchedCredentials: Record<string, string> = {};
        if (apiKeyResponse && apiKeyResponse.ok) {
            const apiKeyCsvText = await apiKeyResponse.text();
            const apiKeyLines = apiKeyCsvText.trim().split('\n').slice(1); // Skip header row
            apiKeyLines.forEach(line => {
                const values = line.slice(1, -1).split('","');
                if (values.length >= 2) {
                    const name = values[0]?.trim();
                    const key = values[1]?.trim();
                    if (name && key) {
                        fetchedCredentials[name] = key;
                    }
                }
            });
        }
        const allCredentials = { ...userCredentials, ...fetchedCredentials };
        setUserCredentials(allCredentials);
        
        // Auto-login validation
        const savedName = localStorage.getItem('dashboard_username');
        const savedKey = localStorage.getItem('dashboard_apikey');
        if (savedName && savedKey && allCredentials[savedName] === savedKey) {
            setAuthenticatedUser(savedName);
            setCurrentUser(savedName);
        } else {
            localStorage.removeItem('dashboard_username');
            localStorage.removeItem('dashboard_apikey');
        }

      } catch (e) {
        console.error("Failed to fetch or parse sheet data:", e);
        setError(`Failed to load live data. Please check sheet permissions and column headers. Error: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const handleLogin = (name: string, key: string): boolean => {
      const expectedKey = userCredentials[name];
      if (expectedKey && expectedKey === key) {
          localStorage.setItem('dashboard_username', name);
          localStorage.setItem('dashboard_apikey', key);
          setAuthenticatedUser(name);
          setCurrentUser(name);
          return true;
      }
      return false;
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
  };

  const clientLogos = useMemo(() => data.reduce((acc, row) => {
    if (row.customerName && row.logoUrl && !acc[row.customerName]) acc[row.customerName] = row.logoUrl;
    return acc;
    // FIX: Explicitly type the initial value for the reduce function to avoid TypeScript inference issues.
  }, {} as Record<string, string>), [data]);

  const clientList = useMemo(() => ['admin', ...new Set(data.map(d => d.customerName))], [data]);
  
  const clientFilteredData = useMemo(() => {
      return currentUser === 'admin' ? data : data.filter(d => d.customerName === currentUser);
  }, [data, currentUser]);
  
  const searchedData = useMemo(() => {
    if (!searchQuery.trim()) return clientFilteredData;
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    return clientFilteredData.filter(d =>
      d.status.toLowerCase().includes(lowercasedQuery) ||
      d.orderNo.toLowerCase().includes(lowercasedQuery) ||
      d.productCode.toLowerCase().includes(lowercasedQuery) ||
      d.category.toLowerCase().includes(lowercasedQuery) ||
      d.segment.toLowerCase().includes(lowercasedQuery) ||
      d.product.toLowerCase().includes(lowercasedQuery) ||
      d.customerName.toLowerCase().includes(lowercasedQuery) ||
      d.country.toLowerCase().includes(lowercasedQuery)
    );
  }, [clientFilteredData, searchQuery]);

  const finalFilteredData = useMemo(() => {
    if (!activeFilter) return searchedData;
    const { type, value } = activeFilter;
    
    return searchedData.filter(item => {
        if (type === 'status') return item.status.toUpperCase() === value;
        if (type === 'country') return item.country === value;
        if (type === 'month') {
            const itemMonth = new Date(item.orderDate).toLocaleString('default', { month: 'short' });
            return itemMonth === value;
        }
        return true;
    });
  }, [searchedData, activeFilter]);
  
  const tableData = useMemo(() => {
    if (viewedOrder) {
        return finalFilteredData.filter(d => d.orderNo === viewedOrder);
    }
    return finalFilteredData;
  }, [finalFilteredData, viewedOrder]);
  
  // Data for the "Never Bought" KPI card, which is client-specific
  const neverBoughtForClientData = useMemo(() => {
    if (masterProductList.length === 0) return [];

    if (currentUser === 'admin') {
        // For admin, KPI shows the total unique products in the catalog.
        const uniqueProducts = new Map<string, MasterProductData>();
        masterProductList.forEach(p => {
            if (p.productCode && !uniqueProducts.has(p.productCode)) {
                uniqueProducts.set(p.productCode, p);
            }
        });
        return Array.from(uniqueProducts.values());
    }

    // For a specific client, calculate products they have not bought from their assigned catalog.
    const boughtCodes = new Set(clientFilteredData.map(item => item.productCode));

    const clientSpecificProducts = masterProductList.filter(p => p.customerName === currentUser);
    const uniqueClientProducts = new Map<string, MasterProductData>();
    clientSpecificProducts.forEach(p => {
        if (p.productCode && !uniqueClientProducts.has(p.productCode)) {
            uniqueClientProducts.set(p.productCode, p);
        }
    });
    const availableCatalog = Array.from(uniqueClientProducts.values());

    return availableCatalog.filter(p => !boughtCodes.has(p.productCode));
  }, [masterProductList, currentUser, clientFilteredData]);

  const kpis = useMemo(() => ({
    totalValue: formatCurrency(finalFilteredData.reduce((acc, item) => acc + item.exportValue, 0)),
    totalOrders: new Set(finalFilteredData.map(item => item.orderNo)).size,
    totalInProcess: finalFilteredData.filter(item => item.status.toUpperCase() === 'PLAN').length,
    totalShipped: finalFilteredData.filter(item => item.status.toUpperCase() === 'SHIPPED').length,
    boughtProducts: new Set(finalFilteredData.map(item => item.productCode)).size,
    activeClients: new Set(finalFilteredData.map(item => item.customerName)).size,
    countries: new Set(finalFilteredData.map(item => item.country)).size,
    neverBoughtCount: neverBoughtForClientData.length,
  }), [finalFilteredData, neverBoughtForClientData]);
  
  const singleCountryName = useMemo(() => {
    const countries = [...new Set(clientFilteredData.map(item => item.country))];
    return countries.length === 1 ? countries[0] : null;
  }, [clientFilteredData]);
  
  const relevantCatalogData = useMemo(() => {
    if (currentUser === 'admin') {
        return masterProductList;
    }
    return masterProductList.filter(p => p.customerName === currentUser);
  }, [masterProductList, currentUser]);

  const handleFilter = (filter: Filter, source: string) => {
      if (activeFilter && activeFilter.type === filter.type && activeFilter.value === filter.value) {
          setActiveFilter(null);
      } else {
          setActiveFilter({ ...filter, source });
      }
  };
  
  if (loading) return <SkeletonLoader />;
  if (error) return <div className="error">{error}</div>;

  if (!authenticatedUser) {
    const clearSavedUser = () => {
        localStorage.removeItem('dashboard_username');
        localStorage.removeItem('dashboard_apikey');
    };
    return <LoginScreen onLogin={handleLogin} onClearSavedUser={clearSavedUser} />;
  }

  if (showUserManagement) {
      return <UserManagement 
        allClientNames={clientList.filter(c => c !== 'admin')}
        currentCredentials={userCredentials}
        onClose={() => setShowUserManagement(false)}
      />
  }

  if (showNeverBought) {
    return <NeverBoughtDashboard 
        allOrderData={data}
        masterProductList={masterProductList}
        initialClientName={currentUser}
        clientList={clientList}
        onClose={() => setShowNeverBought(false)} 
        authenticatedUser={authenticatedUser}
    />;
  }

  return (
    <>
      <div className="dashboard-container" onDoubleClick={() => {setActiveFilter(null); setSearchQuery('');}}>
        <header>
          <div className="header-title">
              {currentUser === 'admin' ? (
                  <img src="https://lh3.googleusercontent.com/d/1IPYJixe4KjQ3oY-9oOPdDyag98LND-qw" alt="Admin Logo" className="client-logo" />
              ) : (
                  clientLogos[currentUser] ? (
                      <img src={clientLogos[currentUser]} alt={`${currentUser} Logo`} className="client-logo" />
                  ) : (
                      <div className="client-logo-placeholder">No Logo</div>
                  )
              )}
              <h1>{currentUser === 'admin' ? 'Global Operations Dashboard' : `Welcome, ${currentUser}`}</h1>
          </div>
          <div className="filters">
              <div className="search-bar-container">
                  {Icons.search}
                  <input
                      type="text"
                      placeholder="Search by Order, Product, Customer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>
              <label className="view-switcher-label" htmlFor="view-switcher">Current View:</label>
               <div className="select-container">
                  <select id="view-switcher" value={currentUser} onChange={e => {setCurrentUser(e.target.value); setActiveFilter(null); setViewedOrder(null); setSearchQuery(''); setAdminViewMode('dashboard');}} disabled={authenticatedUser !== 'admin'}>
                    {authenticatedUser === 'admin' ?
                      clientList.map(client => <option key={client} value={client}>{client === 'admin' ? 'Admin' : client}</option>)
                      : <option value={authenticatedUser}>{authenticatedUser}</option>
                    }
                  </select>
               </div>
               <button className="never-bought-button" onClick={() => setShowNeverBought(true)}>
                  {Icons.placeholder} Never Bought Products
               </button>
               {authenticatedUser === 'admin' && (
                  <button className="user-management-button" onClick={() => setShowUserManagement(true)}>
                      {Icons.clients} User Management
                  </button>
               )}
               {authenticatedUser && (
                  <button className="logout-button" onClick={handleLogout}>
                      {Icons.logout} Logout
                  </button>
               )}
          </div>
        </header>
        <main>
          <div className="kpi-container">
              <KpiCard title="Total Order Value" value={kpis.totalValue} icon="revenue" activeFilter={activeFilter} />
              <KpiCard title="Total Orders" value={formatCompactNumber(kpis.totalOrders)} icon="orders" activeFilter={activeFilter} />
              <KpiCard title="In Process" value={formatCompactNumber(kpis.totalInProcess)} icon="plan" onFilter={handleFilter} filterType="status" filterValue="PLAN" activeFilter={activeFilter}/>
              <KpiCard title="Shipped Orders" value={formatCompactNumber(kpis.totalShipped)} icon="shipped" onFilter={handleFilter} filterType="status" filterValue="SHIPPED" activeFilter={activeFilter}/>
              <KpiCard 
                title="Bought Products" 
                value={formatCompactNumber(kpis.boughtProducts)} 
                icon="shoppingCart" 
                activeFilter={activeFilter}
                className="bought-products-kpi"
              />
              <KpiCard 
                title="Never Bought Products"
                value={formatCompactNumber(kpis.neverBoughtCount)} 
                icon="placeholder" 
                onClick={() => setShowNeverBought(true)}
                activeFilter={activeFilter}
                className="never-bought-kpi"
              />
              {currentUser === 'admin' && <KpiCard title="Active Clients" value={formatCompactNumber(kpis.activeClients)} icon="clients" activeFilter={activeFilter}/>}
          </div>
          {currentUser === 'admin' && (
              <div className="view-toggle-buttons">
                  <button 
                      className={adminViewMode === 'dashboard' ? 'active' : ''}
                      onClick={() => setAdminViewMode('dashboard')}
                      aria-label="Switch to Dashboard View"
                  >
                      {Icons.dashboard} Dashboard
                  </button>
                  <button 
                      className={adminViewMode === 'table' ? 'active' : ''}
                      onClick={() => setAdminViewMode('table')}
                      aria-label="Switch to Table View"
                  >
                      {Icons.table} Table
                  </button>
              </div>
          )}
          <div className={`main-content ${
              // FIX: Refactored nested ternary to an IIFE to prevent a potential linter error.
              (() => {
                  if (currentUser !== 'admin') {
                      return 'client-view';
                  }
                  if (adminViewMode === 'table') {
                      return 'table-only-view';
                  }
                  return 'dashboard-only-view';
              })()
          }`}>
              {currentUser === 'admin' && adminViewMode === 'dashboard' ? (
                <div className="charts-container">
                  <div className={`chart-container ${activeFilter?.source === 'countryChart' ? 'active-filter-source' : ''}`}>
                    <h3>{singleCountryName ? `Total Export Value to ${singleCountryName}` : 'Export Value by Country'}</h3>
                    <SalesByCountryChart data={finalFilteredData} onFilter={handleFilter} activeFilter={activeFilter} />
                  </div>
                  <div className={`chart-container ${activeFilter?.source === 'monthChart' ? 'active-filter-source' : ''}`}>
                    <h3>Monthly Order Volume</h3>
                    <OrdersOverTimeChart data={finalFilteredData} onFilter={handleFilter} activeFilter={activeFilter} />
                  </div>
                </div>
              ) : (
                  <DataTable 
                      data={tableData} 
                      title={viewedOrder ? `Order Summary: ${viewedOrder}` : 'All Orders'}
                      isDetailedView={!!viewedOrder}
                      onOrderDoubleClick={setViewedOrder}
                      onClearOrderView={() => setViewedOrder(null)}
                      currentUser={currentUser}
                      authenticatedUser={authenticatedUser}
                      onShowTracking={setSelectedOrderForTracking}
                  />
              )}
          </div>
        </main>
        <ChatAssistant 
          orderData={finalFilteredData} 
          catalogData={relevantCatalogData} 
          clientName={currentUser} 
          kpis={kpis}
        />
      </div>
      {selectedOrderForTracking && (
        <OrderTrackingModal
          orderNo={selectedOrderForTracking}
          stepData={stepData.find(d => d.orderNo === selectedOrderForTracking)}
          onClose={() => setSelectedOrderForTracking(null)}
        />
      )}
    </>
  );
};

// --- Render App ---
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<React.StrictMode><App /></React.StrictMode>);
}
