
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

const DataTable = ({ data, title, isDetailedView, onOrderDoubleClick, onClearOrderView, currentUser }: { data: OrderData[], title: string, isDetailedView: boolean, onOrderDoubleClick: (orderNo: string) => void, onClearOrderView: () => void, currentUser: string }) => {
    const [currentPage, setCurrentPage] = useState(1);
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

    const rowsPerPage = 10;
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
    }, [data, rowsPerPage, isDetailedView]);

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
                            {currentUser === 'admin' && <th>Customer</th>}
                            {currentUser === 'admin' && <th>Country</th>}
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
                                            <span className="status-text">{row.status}</span>
                                        </div>
                                    </td>
                                    <td className="order-no-cell">{row.orderNo}</td>
                                    <td className="product-image-cell">
                                        {row.imageLink && row.imageLink.toLowerCase() !== '#n/a' ? <img src={row.imageLink} alt={row.product} className="product-image" /> : <div className="product-image-placeholder">No Image</div>}
                                    </td>
                                    <td>{row.productCode}</td>
                                    <td>{formatNa(row.category)}</td>
                                    <td>{formatNa(row.product)}</td>
                                    {currentUser === 'admin' && <td>{row.customerName}</td>}
                                    {currentUser === 'admin' && <td>{row.country}</td>}
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
                                            <span className="status-text">{group.status}</span>
                                        </div>
                                    </td>
                                    <td className="order-no-cell">{group.orderNo}</td>
                                    <td className="product-image-cell">
                                        {group.imageLink && group.imageLink.toLowerCase() !== '#n/a' ? <img src={group.imageLink} alt={group.product} className="product-image" /> : <div className="product-image-placeholder">No Image</div>}
                                    </td>
                                    <td>{group.productCount > 1 ? 'Multiple Items' : formatNa(group.category)}</td>
                                    {currentUser === 'admin' && <td>{group.customerName}</td>}
                                    {currentUser === 'admin' && <td>{group.country}</td>}
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

const NeverBoughtDataTable = ({ data, currentUser }: { data: OrderData[], currentUser: string }) => {
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
              <th className="text-center">Status</th>
              <th className="text-center">Image</th>
              <th>Product Code</th>
              <th>Category</th>
              <th>Segment</th>
              <th>Product</th>
              {currentUser === 'admin' && <th>Customer</th>}
              {currentUser === 'admin' && <th>Country</th>}
              <th className="text-right">FOB Price</th>
              <th className="text-right">MOQ</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={row.productCode + index} className="catalog-row" style={{ animationDelay: `${index * 0.05}s`}}>
                <td className="text-center">
                  <div className="status-cell">
                      <span className={`status-dot ${row.status.toLowerCase()}`}></span>
                      <span className="status-text">{row.status}</span>
                  </div>
                </td>
                <td className="product-image-cell">
                  {row.imageLink && row.imageLink.toLowerCase() !== '#n/a' ? <img src={row.imageLink} alt={row.product} className="product-image" /> : <div className="product-image-placeholder">No Image</div>}
                </td>
                <td>{row.productCode}</td>
                <td>{formatNa(row.category)}</td>
                <td>{formatNa(row.segment)}</td>
                <td>{formatNa(row.product)}</td>
                {currentUser === 'admin' && <td>{row.customerName}</td>}
                {currentUser === 'admin' && <td>{row.country}</td>}
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

const ChatAssistant = ({ data, clientName, contextType = 'orders' }: { data: OrderData[], clientName: string, contextType?: 'orders' | 'catalog' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const placeholder = contextType === 'orders' ? "Ask about your orders..." : "Ask about the product catalog...";
    const initialMessage = contextType === 'orders' ? "Hello! How can I help you with your order data today?" : "Hello! How can I help you with the product catalog?";
    const dataDescription = contextType === 'orders' 
        ? "Analyze the following JSON data which contains all their recent orders and answer their question concisely."
        : "Analyze the following JSON data which contains product catalog information and answer their question concisely.";


    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const dataContext = JSON.stringify(data.slice(0, 50), null, 2); // Send a subset of data
            const prompt = `You are an expert data analyst for an international shipping company. A client is asking a question about their data.
            ${dataDescription}
            If the question is unrelated to the data, politely decline to answer.
            The current client's name is: ${clientName}.
            Data:
            ${dataContext}

            Client's Question: "${input}"`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const assistantMessage = { role: 'assistant', text: response.text };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            const errorMessage = { role: 'assistant', text: "Sorry, I'm having trouble connecting to my brain right now. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button className="chat-fab" onClick={() => setIsOpen(true)} aria-label="Open AI Assistant">
                <img src="https://lh3.googleusercontent.com/d/1u_pfsfaDqq9XiPhr6qUbVEX2HtWIrM6K" alt="AI Assistant" />
            </button>
            <div className={`chat-assistant ${isOpen ? 'open' : 'closed'}`}>
                <div className="chat-header">
                    <span>AI Data Assistant</span>
                    <button onClick={() => setIsOpen(false)}>&times;</button>
                </div>
                <div className="chat-body">
                    <div className="chat-message assistant">
                        {initialMessage}
                    </div>
                     {messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.role}`}>
                            {msg.text}
                        </div>
                    ))}
                    {isLoading && <div className="chat-message assistant thinking"><span></span><span></span><span></span></div>}
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

const NeverBoughtDashboard = ({ masterProductList, initialClientName, clientList, onClose }: { masterProductList: MasterProductData[], initialClientName: string, clientList: string[], onClose: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(initialClientName);

  const catalogData = useMemo(() => {
    if (masterProductList.length === 0) return [];

    const catalogForView = selectedUser === 'admin'
        ? masterProductList
        : masterProductList.filter(p => p.customerName === selectedUser);

    return catalogForView.map(p => ({
        status: 'CATALOG', orderDate: '', stuffingMonth: '', orderNo: 'N/A',
        customerName: p.customerName, country: p.country, productCode: p.productCode,
        qty: 0, exportValue: 0, logoUrl: '', category: p.category, segment: p.segment,
        product: p.product, imageLink: p.imageLink, unitPrice: 0, fobPrice: p.fobPrice,
        moq: p.moq,
    } as OrderData));
  }, [masterProductList, selectedUser]);


  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return catalogData;
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    return catalogData.filter(p =>
      (p.status && p.status.toLowerCase().includes(lowercasedQuery)) ||
      (p.orderNo && p.orderNo.toLowerCase().includes(lowercasedQuery)) ||
      (p.productCode && p.productCode.toLowerCase().includes(lowercasedQuery)) ||
      (p.category && p.category.toLowerCase().includes(lowercasedQuery)) ||
      (p.segment && p.segment.toLowerCase().includes(lowercasedQuery)) ||
      (p.product && p.product.toLowerCase().includes(lowercasedQuery)) ||
      (p.customerName && p.customerName.toLowerCase().includes(lowercasedQuery)) ||
      (p.country && p.country.toLowerCase().includes(lowercasedQuery))
    );
  }, [catalogData, searchQuery]);
  
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
                    <select id="nb-view-switcher" value={selectedUser} onChange={e => {setSelectedUser(e.target.value); setSearchQuery('')}}>
                      {clientList.map(client => <option key={client} value={client}>{client === 'admin' ? 'Admin' : client}</option>)}
                    </select>
                 </div>
                <button className="back-button" onClick={onClose}>
                    {Icons.prevArrow} Back to Dashboard
                </button>
            </div>
          </header>
          <main>
             <NeverBoughtDataTable data={filteredData} currentUser={selectedUser} />
          </main>
        </div>
        <ChatAssistant data={filteredData} clientName={selectedUser} contextType="catalog" />
    </>
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
                <Area type="monotone" dataKey="orders" stroke={false} fill="url(#colorOrders)" />
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

const App = () => {
  const [data, setData] = useState<OrderData[]>([]);
  const [masterProductList, setMasterProductList] = useState<MasterProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState('admin');
  const [activeFilter, setActiveFilter] = useState<Filter | null>(null);
  const [viewedOrder, setViewedOrder] = useState<string | null>(null);
  const [showNeverBought, setShowNeverBought] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const sheetId = '1JbxRqsZTDgmdlJ_3nrumfjPvjGVZdjJe43FPrh9kYw4';
      const liveSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Live`;
      const masterSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=MASTER`;
      
      try {
        const [liveResponse, masterResponse] = await Promise.all([
          fetch(liveSheetUrl),
          fetch(masterSheetUrl),
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
        const liveHeaderIndices = {};
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
        const masterHeaderIndices = {};
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

      } catch (e) {
        console.error("Failed to fetch or parse sheet data:", e);
        setError(`Failed to load live data. Please check sheet permissions and column headers. Error: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const clientLogos = useMemo(() => data.reduce((acc, row) => {
    if (row.customerName && row.logoUrl && !acc[row.customerName]) acc[row.customerName] = row.logoUrl;
    return acc;
  }, {}), [data]);

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
  
  const handleFilter = (filter: Filter, source: string) => {
      if (activeFilter && activeFilter.type === filter.type && activeFilter.value === filter.value) {
          setActiveFilter(null);
      } else {
          setActiveFilter({ ...filter, source });
      }
  };
  
  if (loading) return <SkeletonLoader />;
  if (error) return <div className="error">{error}</div>;

  if (showNeverBought) {
    return <NeverBoughtDashboard 
        masterProductList={masterProductList}
        initialClientName={currentUser}
        clientList={clientList}
        onClose={() => setShowNeverBought(false)} 
    />;
  }

  return (
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
                <select id="view-switcher" value={currentUser} onChange={e => {setCurrentUser(e.target.value); setActiveFilter(null); setViewedOrder(null); setSearchQuery('');}}>
                  {clientList.map(client => <option key={client} value={client}>{client === 'admin' ? 'Admin' : client}</option>)}
                </select>
             </div>
             <button className="never-bought-button" onClick={() => setShowNeverBought(true)}>
                {Icons.placeholder} Never Bought Products
             </button>
        </div>
      </header>
      <main>
        <div className="kpi-container">
            <KpiCard title={currentUser === 'admin' ? 'Total Export Value' : 'Total Order Value'} value={kpis.totalValue} icon="revenue" activeFilter={activeFilter} />
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
        <div className={`main-content ${currentUser !== 'admin' ? 'client-view' : ''}`}>
            {currentUser === 'admin' && (
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
            )}
            <DataTable 
                data={tableData} 
                title={viewedOrder ? `Order Summary: ${viewedOrder}` : 'Recent Orders'}
                isDetailedView={!!viewedOrder}
                onOrderDoubleClick={setViewedOrder}
                onClearOrderView={() => setViewedOrder(null)}
                currentUser={currentUser}
            />
        </div>
      </main>
      <ChatAssistant data={finalFilteredData} clientName={currentUser} />
    </div>
  );
};

// --- Render App ---
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<React.StrictMode><App /></React.StrictMode>);
}
