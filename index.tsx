
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, ResponsiveContainer, LabelList, Cell, Legend } from 'recharts';

// --- Gemini API Initialization ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Announcements Data ---
const ANNOUNCEMENTS = [
  {
    id: '20240729-initial-release',
    title: 'Dashboard Launch!',
    description: `Welcome to the new International Client Dashboard. You can now track your orders, view product catalogs, and get insights into your business operations.`
  },
  {
    id: '20240730-ai-chat',
    title: 'Introducing the AI Data Assistant',
    description: `We've added a powerful new AI assistant to help you get answers faster.
- **Ask anything:** Ask questions about your orders, products, or sales data in any language.
- **Instant Answers:** Get immediate insights without searching through tables.
- **How to use:** Click the AI icon in the bottom right to start a conversation.`
  },
  {
    id: '20240731-order-tracking',
    title: 'Live Order Tracking',
    description: `You can now see the step-by-step progress of your orders.
- **How to track:** Single-click on any 'Order No' in the main table.
- **What you'll see:** A popup will show the status for Production, Quality Check, Shipping (SOB), and Payment.
- **Availability:** This feature is active for orders marked with a subtle blue background highlight in the table.`
  }
];


// --- SVG Icons ---
const Icons = {
  revenue: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125-1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125-1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  orders: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25l3.807-3.262a4.502 4.502 0 0 1 6.384 0L20.25 18" /></svg>,
  clients: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962a3.752 3.752 0 0 1-4.493 0L5 11.529m10.232 2.234a3.75 3.75 0 0 0-4.493 0L10.5 11.529m-2.258 4.515a3.753 3.753 0 0 1-4.493 0L3 16.25m10.232-2.234a3.75 3.75 0 0 1-4.493 0L7.5 13.763m7.5-4.515a3.753 3.753 0 0 0-4.493 0L10.5 6.5m-2.258 4.515a3.753 3.753 0 0 1-4.493 0L3 11.25m10.232-2.234a3.75 3.75 0 0 0-4.493 0L7.5 8.763m7.5 4.515a3.75 3.75 0 1 1-4.493 0L10.5 13.75m5.007-4.515a3.75 3.75 0 0 0-4.493 0L13.5 8.763" /></svg>,
  countries: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.893 13.393l-1.135-1.135a2.252-.421-.585l-1.08-2.16a2.25 2.25 0 0 0-1.898-1.302h-1.148a2.25 2.25 0 0 0-1.898 1.302l-1.08 2.16a2.252.421.585l-1.135 1.135a2.25 2.25 0 0 0 0 3.182l1.135 1.135a2.252.421.585l1.08 2.16a2.25 2.25 0 0 0 1.898 1.302h-1.148a2.25 2.25 0 0 0 1.898-1.302l1.08-2.16a2.252-.421-.585l-1.135-1.135a2.25 2.25 0 0 0 0-3.182zM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z" /></svg>,
  placeholder: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M9 21v-3.375c0-.621.504-1.125 1.125 1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
  prevArrow: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>,
  nextArrow: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>,
  chevron: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>,
  chat: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 0 1-2.53-.388A5.864 5.864 0 0 1 5.4 12.006c.482.55.994.995 1.524 1.372a11.942 11.942 0 0 0 7.26-1.742 1.25 1.25 0 0 0 .332-.307 12.448 12.448 0 0 0-1.618-1.579 11.912 11.912 0 0 0-6.064-1.785 1.25 1.25 0 0 0-.97.242 12.45 12.45 0 0 0-1.328 1.28c-.318.332-.637.672-.94 1.018a5.864 5.864 0 0 1-.42-2.32C3 7.444 7.03 3.75 12 3.75s9 3.694 9 8.25z" /></svg>,
  robot: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H13.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5A2.25 2.25 0 0 1 18.75 19.5H5.25A2.25 2.25 0 0 1 3 17.25V6.75A2.25 2.25 0 0 1 5.25 4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h7.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 16.5h6" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 9.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 9.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0z" /></svg>,
  plan: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" /></svg>,
  shipped: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125-1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
  shoppingCart: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l1.823-6.836a.75.75 0 0 0-.44-.898l-7.458-2.61a.75.75 0 0 0-.915.658l-1.006 5.031c-.12.603-.635 1.036-1.254 1.036H3.75" /></svg>,
  search: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>,
  dashboard: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg>,
  table: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M2.25 8.25h19.5M2.25 12h19.5m-19.5 3.75h19.5M4.5 4.5h15a2.25 2.25 0 0 1 2.25 2.25v10.5A2.25 2.25 0 0 1 19.5 19.5h-15A2.25 2.25 0 0 1 2.25 17.25V6.75A2.25 2.25 0 0 1 4.5 4.5Z" /></svg>,
  user: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>,
  key: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 1 1 21.75 8.25Z" /></svg>,
  copy: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125-1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H9.75" /></svg>,
  logout: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3h12" /></svg>,
  checkCircle: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  checkCircleFilled: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>,
  clock: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  circle: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  sun: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>,
  moon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 0 0 0 9.002-5.998Z" /></svg>,
  eye: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>,
  bell: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>,
  calendar: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" /></svg>,
  box: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>,
  truck: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125-1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
  bank: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>
};

// --- Data Types ---
interface PaymentTermData {
    client: string;
    country: string;
    paymentTerm: string;
    dueDateRule: string;
}

interface OrderData {
  status: string;
  originalStatus?: string;
  orderDate: string; // ORDER FORWARDING DATE
  stuffingMonth: string;
  forwardingMonth?: string; // Month
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
  fy: string;
  stuffingDate?: string;
  etd?: string; // ETD/ SOB
  eta?: string;
  commercialInvoiceNo?: string; 
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
  qualityCheckStatus: string;
  qualityCheck1Url: string;
  qualityCheck2Url: string;
  qualityCheck3Url: string;
  qualityCheck4Url: string;
}

interface Filter {
    type: 'status' | 'country' | 'month';
    value: string;
    source?: string;
}

interface BreakdownItem {
    orderNo: string;
    date: string;
    value: number;
    qty: number;
    customer: string;
    country: string;
}

// --- Constants ---
const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// --- Helper Functions ---
const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
const formatCurrencyNoDecimals = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
const formatCompactNumber = (value: number) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);
const formatNa = (value: string | undefined) => (value && value.toLowerCase() !== '#n/a' && value.trim() !== '' ? value : '~');

const parseDate = (dateString: string): Date | null => {
    if (!dateString || typeof dateString !== 'string' || dateString.toLowerCase() === '#n/a' || dateString.trim() === '') {
        return null;
    }

    const gvizMatch = dateString.match(/Date\((\d{4}),(\d{1,2}),(\d{1,2}).*?\)/);
    if (gvizMatch) {
        const year = parseInt(gvizMatch[1], 10);
        const month = parseInt(gvizMatch[2], 10);
        const day = parseInt(gvizMatch[3], 10);
        return new Date(year, month, day);
    }
    
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return date;
    }

    return null;
};

const formatDateDDMMMYY = (dateString: string | Date): string => {
    let date: Date | null;
    if (dateString instanceof Date) {
        date = dateString;
    } else {
        date = parseDate(dateString);
    }
    if (!date) {
        return '~';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
};

const getBaseOrderNo = (orderNo: string): string => {
    if (!orderNo) return '';
    const upperOrderNo = orderNo.toUpperCase();
    const match = upperOrderNo.match(/^(.*?)(\([A-Z]\)|-[A-Z]|-[IVXLCDM]+)$/i);
    if (match && match[1]) {
        return match[1];
    }
    return upperOrderNo;
};

// Helper to parse Google Visualization API response
const parseGvizResponse = (text: string, headerMapping: Record<string, string>, requiredFields: string[] = []): any[] => {
    const match = text.match(/{.*}/s);
    if (!match) return [];
    try {
        const json = JSON.parse(match[0]);
        if (json.status !== 'ok') {
            console.error("GViz response status not ok:", json.status);
            return [];
        }
        const labelToIndex = new Map<string, number>(json.table.cols.map((col: any, i: number) => [String(col.label || '').trim(), i]));
        
        return json.table.rows.map((r: any) => {
            const row: any = {};
            for (const [header, key] of Object.entries(headerMapping)) {
                const index = labelToIndex.get(header);
                if (index !== undefined) {
                    const cell = r.c[index];
                    const value = cell ? cell.v : null;

                    if (['qty', 'moq'].includes(key)) {
                        row[key] = parseInt(String(value || '0').replace(/,/g, ''), 10) || 0;
                    } else if (['exportValue', 'unitPrice', 'fobPrice', 'totalOrderValue', 'paymentReceived', 'balancePayment'].includes(key)) {
                        row[key] = parseFloat(String(value || '0').replace(/[$,]/g, '')) || 0;
                    } else {
                        row[key] = value !== null ? String(value).trim() : '';
                    }
                } else {
                    row[key] = '';
                }
            }
            return row;
        }).filter((row: any) => 
            requiredFields.every(f => row[f] !== null && row[f] !== undefined && String(row[f]).trim() !== '')
        );
    } catch (e) {
        console.error("Error parsing GViz response:", e);
        return [];
    }
};

// --- Payment Due Date Calculation ---
const calculateDueDate = (rule: string, sobDateStr?: string, etaDateStr?: string): Date | null => {
    if (!rule) return null;
    
    const sobDate = sobDateStr ? parseDate(sobDateStr) : null;
    const etaDate = etaDateStr ? parseDate(etaDateStr) : null;

    const lowerRule = rule.toLowerCase();

    // "within X days from the date of SOB"
    const withinDaysSobMatch = lowerRule.match(/within (\d+) days from the date of sob/);
    if (withinDaysSobMatch && sobDate) {
        const days = parseInt(withinDaysSobMatch[1], 10);
        const due = new Date(sobDate);
        due.setDate(due.getDate() + days);
        return due;
    }

    // "within X days"
    const genericWithinMatch = lowerRule.match(/within (\d+) days/);
    if (genericWithinMatch && sobDate) {
         const days = parseInt(genericWithinMatch[1], 10);
         const due = new Date(sobDate);
         due.setDate(due.getDate() + days);
         return due;
    }

    // "X days before ETA"
    const daysBeforeEtaMatch = lowerRule.match(/(\d+) days before eta/);
    if (daysBeforeEtaMatch && etaDate) {
        const days = parseInt(daysBeforeEtaMatch[1], 10);
        const due = new Date(etaDate);
        due.setDate(due.getDate() - days);
        return due;
    }

    return null;
};

// ### calendar view components
const CalendarKpiCard = ({ title, value, icon, variant, onClick, onDoubleClick, isDimmed, isActive }: any) => (
    <div 
        className={`calendar-kpi-card variant-${variant} ${isActive ? 'is-active-highlight' : ''}`} 
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        style={{ 
            cursor: 'pointer', 
            opacity: isDimmed ? 0.35 : 1,
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: isActive ? 'scale(1.05)' : (isDimmed ? 'scale(0.96)' : 'scale(1)'),
            boxShadow: isActive ? '0 12px 24px -8px rgba(0,0,0,0.3), 0 0 20px -2px currentColor' : 'none',
            zIndex: isActive ? 10 : 1
        }}
        title="Double-click for details"
    >
        <div className="calendar-kpi-icon">{icon}</div>
        <div className="calendar-kpi-content">
            <p>{value}</p>
            <h3>{title}</h3>
        </div>
    </div>
);

const MonthlyTrendChart = ({ data, xAxisDataKey = 'name', selectedMonth, selectedYear, activeMetric, isAggregateView, stacked }: { data: any[], xAxisDataKey?: string, selectedMonth?: number | null, selectedYear?: string, activeMetric?: string | null, isAggregateView?: boolean, stacked?: boolean }) => {
    const barLabelFormatter = (value: number) => (value > 0 ? value : '');

    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: any; }) => {
        if (active && payload && payload.length) {
            const isDailyView = xAxisDataKey === 'day';
            const dataPoint = payload[0].payload;
            let displayLabel = label;
    
            if (isDailyView && selectedMonth !== null) {
                const dayVal = String(dataPoint.day || label).padStart(2, '0');
                const mmm = MONTH_NAMES_SHORT[selectedMonth];
                if (isAggregateView) {
                    displayLabel = `${dayVal}-${mmm}`;
                } else {
                    const year = selectedYear && selectedYear.length >= 2 ? parseInt(selectedYear, 10) : new Date().getFullYear();
                    const dayValue = dataPoint.day || label;
                    const date = new Date(year, selectedMonth, dayValue);
                    const dd = String(date.getDate()).padStart(2, '0');
                    const mmmLabel = date.toLocaleString('en-US', { month: 'short' });
                    const yy = String(date.getFullYear()).slice(-2);
                    displayLabel = `${dd}-${mmmLabel}-${yy}`;
                }
            }
    
            const showReceived = activeMetric === 'received' || activeMetric === null;
            const showPlanned = activeMetric === 'planned' || activeMetric === null;
            const showShipped = activeMetric === 'shipped' || activeMetric === null;

            const hasReceivedTotals = showReceived && (dataPoint.totalValue > 0 || dataPoint.totalQty > 0 || dataPoint.received > 0);
            const hasPlannedTotals = showPlanned && (dataPoint.plannedValue > 0 || dataPoint.plannedQty > 0 || dataPoint.planned > 0);
            const hasShippedTotals = showShipped && (dataPoint.shippedValue > 0 || dataPoint.shippedQty > 0 || dataPoint.shipped > 0);
            
            const hasAnyTotals = hasReceivedTotals || hasPlannedTotals || hasShippedTotals;

            if (!hasAnyTotals) return null;

            return (
                <div className="recharts-default-tooltip" style={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '0.8rem 1.2rem', maxWidth: '350px', boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }}>
                    <p style={{ margin: '0 0 0.6rem 0', fontWeight: 'bold', fontSize: '1rem', color: 'var(--primary-accent)', borderBottom: '1px solid var(--grid-stroke)', paddingBottom: '4px' }}>{displayLabel}</p>
                    {payload.map((p: any) => {
                       if (p.value > 0 || (isDailyView && p.value >= 0)) {
                           if (p.dataKey === 'received' && !showReceived) return null;
                           if (p.dataKey === 'planned' && !showPlanned) return null;
                           if (p.dataKey === 'shipped' && !showShipped) return null;

                           let orderItems: any[] = [];
                           let val = 0;
                           let qty = 0;
                           let customLabel = p.name;

                           if (p.dataKey === 'received') {
                               orderItems = dataPoint.receivedOrderDetails || [];
                               val = dataPoint.totalValue || 0;
                               qty = dataPoint.totalQty || 0;
                               customLabel = "Received";
                           } else if (p.dataKey === 'planned') {
                               orderItems = dataPoint.plannedOrderDetails || [];
                               val = dataPoint.plannedValue || 0;
                               qty = dataPoint.plannedQty || 0;
                               customLabel = "In Process";
                           } else if (p.dataKey === 'shipped') {
                               orderItems = dataPoint.shippedOrderDetails || [];
                               val = dataPoint.shippedValue || 0;
                               qty = dataPoint.shippedQty || 0;
                               customLabel = "Shipped";
                           }

                           if (p.value === 0 && val === 0) return null;

                           const maxOrdersToShow = 15;
                           const displayItems = orderItems.slice(0, maxOrdersToShow);
                           const remaining = orderItems.length - maxOrdersToShow;

                           return (
                               <div key={p.dataKey} style={{ marginBottom: '0.75rem' }}>
                                   <p style={{ margin: 0, color: p.fill, fontWeight: 700, fontSize: '0.95rem' }}>{`${customLabel}:- ${p.value}`}</p>
                                   {orderItems.length > 0 && (
                                       <div style={{ margin: '0.1rem 0 0.2rem 0.5rem', color: p.fill, wordBreak: 'break-word', whiteSpace: 'normal', fontSize: '0.82em', lineHeight: '1.4' }}>
                                           <strong>Order Details: </strong>
                                           {displayItems.map((item, idx) => (
                                               <div key={idx}>
                                                   {item.no} {isAggregateView ? `(${formatDateDDMMMYY(item.date)})` : ''}
                                               </div>
                                           ))}
                                           {remaining > 0 && <div>{`+${remaining} more`}</div>}
                                       </div>
                                   )}
                                   <div style={{ marginLeft: '0.5rem', opacity: 0.9 }}>
                                       <p style={{ margin: 0, color: p.fill, fontSize: '0.85em' }}>{`Value: ${formatCurrency(val)}`}</p>
                                       <p style={{ margin: 0, color: p.fill, fontSize: '0.85em' }}>{`Qty: ${formatNumber(qty)}`}</p>
                                   </div>
                               </div>
                           );
                       }
                       return null;
                    })}
                </div>
            );
        }
        return null;
    };
    
    const stackId = stacked ? "yearlyStack" : undefined;
    const labelPosition = stacked ? "inside" : "top";

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" />
                <XAxis dataKey={xAxisDataKey} stroke={'var(--text-color-muted)'} interval={xAxisDataKey === 'day' ? 4 : 'preserveStartEnd'} />
                <YAxis stroke={'var(--text-color-muted)'} allowDecimals={false} />
                <Tooltip 
                    content={<CustomTooltip />} 
                    cursor={{fill: 'var(--tooltip-cursor)'}}
                />
                <Legend wrapperStyle={{fontSize: '0.8rem', paddingTop: '10px'}} />
                <Bar 
                    dataKey="received" 
                    fill="var(--calendar-received-color)" 
                    name="Received" 
                    stackId={stackId}
                    radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]} 
                    opacity={activeMetric === null || activeMetric === 'received' ? 1 : 0.2}
                >
                    <LabelList dataKey="received" position={labelPosition} formatter={barLabelFormatter} style={{ fontSize: '10px', fill: stacked ? '#fff' : 'var(--text-color-muted)', fontWeight: stacked ? 'bold' : 'normal' }} />
                </Bar>
                <Bar 
                    dataKey="planned" 
                    fill="var(--calendar-planned-color)" 
                    name="In Process" 
                    stackId={stackId}
                    radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    opacity={activeMetric === null || activeMetric === 'planned' ? 1 : 0.2}
                >
                    <LabelList dataKey="planned" position={labelPosition} formatter={barLabelFormatter} style={{ fontSize: '10px', fill: stacked ? '#fff' : 'var(--text-color-muted)', fontWeight: stacked ? 'bold' : 'normal' }} />
                </Bar>
                <Bar 
                    dataKey="shipped" 
                    fill="var(--calendar-shipped-color)" 
                    name="Shipped" 
                    stackId={stackId}
                    radius={stacked ? [4, 4, 0, 0] : [4, 4, 0, 0]}
                    opacity={activeMetric === null || activeMetric === 'shipped' ? 1 : 0.2}
                >
                    <LabelList dataKey="shipped" position={labelPosition} formatter={barLabelFormatter} style={{ fontSize: '10px', fill: stacked ? '#fff' : 'var(--text-color-muted)', fontWeight: stacked ? 'bold' : 'normal' }} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

const TopClientsList = ({ data }) => (
    <div className="top-clients-container">
        <h3>Top 5 Clients (by Order Value)</h3>
        {data.length > 0 ? (
            <div className="top-clients-list">
                {data.map((client, index) => (
                    <div key={client.name} className={`top-client-item rank-${index + 1}`}>
                        <div className="client-rank-bg">#{index + 1}</div>
                        <div className="client-info">
                            <span className="client-name">{client.name}</span>
                            <div className="client-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Value</span>
                                    <span className="stat-value">{formatCurrencyNoDecimals(client.value)}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Qty</span>
                                    <span className="stat-value">{formatCompactNumber(client.qty)}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Orders</span>
                                    <span className="stat-value">{client.orderCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="no-data-message">No orders found for the selected criteria.</p>
        )}
    </div>
);

interface CalendarViewDashboardProps {
    allOrderData: OrderData[];
    masterProductList: MasterProductData[];
    stepData: StepData[]; 
    clientList: string[];
    onClose: () => void;
    authenticatedUser: string | null;
    initialClientName: string;
    selectedPeriod: string;
    onPeriodChange: (period: string) => void;
    periodOptions: string[];
    selectedMonth: string;
    onMonthChange: (month: string) => void;
}

const CalendarViewDashboard = ({ allOrderData, masterProductList, stepData, clientList, onClose, authenticatedUser, initialClientName, selectedPeriod, onPeriodChange, periodOptions, selectedMonth, onMonthChange }: CalendarViewDashboardProps) => {
    const monthNames = useMemo(() => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], []);
    
    const [selectedCountry, setSelectedCountry] = useState('All');
    const [selectedClient, setSelectedClient] = useState(initialClientName === 'admin' ? 'All' : initialClientName);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activeMetric, setActiveMetric] = useState<'received' | 'planned' | 'shipped' | null>(null);
    const [valueBreakdown, setValueBreakdown] = useState<{ title: string, data: BreakdownItem[] } | null>(null);

    const numericSelectedMonthIndex = useMemo(() => {
        if (selectedMonth === 'All') return null;
        return monthNames.indexOf(selectedMonth);
    }, [selectedMonth, monthNames]);

    const clientLogos = useMemo(() => allOrderData.reduce<Record<string, string>>((acc, row) => {
        if (row.customerName && row.logoUrl && !acc[row.customerName]) {
          acc[row.customerName] = row.logoUrl;
        }
        return acc;
    }, {}), [allOrderData]);

    const sDate = useMemo(() => {
        if (!startDate) return null;
        const d = parseDate(startDate);
        if (d) d.setHours(0, 0, 0, 0);
        return d;
    }, [startDate]);

    const eDate = useMemo(() => {
        if (!endDate) return null;
        const d = parseDate(endDate);
        if (d) d.setHours(23, 59, 59, 999);
        return d;
    }, [endDate]);

    const isDateInRange = useCallback((checkDate: Date | null) => {
        if (!sDate && !eDate) return true; 
        if (!checkDate) return false;
        const isAfterStart = sDate ? checkDate >= sDate : true;
        const isBeforeEnd = eDate ? checkDate <= eDate : true;
        return isAfterStart && isBeforeEnd;
    }, [sDate, eDate]);


    const handleKpiClick = (metric: 'received' | 'planned' | 'shipped') => {
        setActiveMetric(prev => prev === metric ? null : metric);
    };

    const targetYearSuffix = useMemo(() => {
        if (selectedPeriod === 'All') return null;
        const match = selectedPeriod.match(/Dec-(.*)/);
        return match ? match[1] : null;
    }, [selectedPeriod]);

    const fullYearForDate = useMemo(() => {
        if (targetYearSuffix) return 2000 + parseInt(targetYearSuffix, 10);
        return new Date().getFullYear();
    }, [targetYearSuffix]);
    
    const baseFilteredData = useMemo(() => {
        return allOrderData.filter(d => {
            const countryMatch = selectedCountry === 'All' || d.country === selectedCountry;
            const clientMatch = selectedClient === 'All' || d.customerName === selectedClient;
            
            if (targetYearSuffix) {
                const orderDate = parseDate(d.orderDate);
                const stuffingMonth = parseDate(d.stuffingMonth);
                const orderYear = orderDate ? orderDate.getFullYear() : null;
                const stuffingYear = stuffingMonth ? stuffingMonth.getFullYear() : null;
                const targetYearNum = 2000 + parseInt(targetYearSuffix, 10);

                const fyMatch = (orderYear === targetYearNum || stuffingYear === targetYearNum);
                return countryMatch && clientMatch && fyMatch;
            }
            return countryMatch && clientMatch;
        });
    }, [allOrderData, selectedCountry, selectedClient, targetYearSuffix]);

    const dataForYear = useMemo(() => {
        return baseFilteredData;
    }, [baseFilteredData]);

    const getBreakdownData = useCallback((metric: 'received' | 'planned' | 'shipped' | 'all', monthIdx: number | null = null): BreakdownItem[] => {
        const resultsMap = new Map<string, BreakdownItem>();
        const metricsToProcess: ('received' | 'planned' | 'shipped')[] = 
            metric === 'all' ? ['received', 'shipped'] : [metric];

        const targetYearNum = targetYearSuffix ? 2000 + parseInt(targetYearSuffix, 10) : null;

        metricsToProcess.forEach(m => {
            dataForYear.forEach(d => {
                const status = (d.originalStatus || d.status || '').toUpperCase();
                const isPlan = status === 'PLAN';
                const isShipped = status === 'SHIPPED' || status === 'COMPLETE';

                const orderDate = parseDate(d.orderDate);
                const stuffingDate = parseDate(d.stuffingMonth);

                let match = false;
                let dateToUse = '';

                if (m === 'received') {
                    if ((isPlan || isShipped) && orderDate && isDateInRange(orderDate)) {
                        if (targetYearNum && orderDate.getFullYear() !== targetYearNum) return;
                        if (monthIdx === null || orderDate.getMonth() === monthIdx) {
                            match = true;
                            dateToUse = d.orderDate;
                        }
                    }
                } else if (m === 'planned') {
                    if (isPlan && orderDate && isDateInRange(orderDate)) {
                        if (targetYearNum && orderDate.getFullYear() !== targetYearNum) return;
                        if (monthIdx === null || orderDate.getMonth() === monthIdx) {
                            match = true;
                            dateToUse = d.orderDate;
                        }
                    }
                } else if (m === 'shipped') {
                    if (isShipped && stuffingDate && isDateInRange(stuffingDate)) {
                        if (targetYearNum && stuffingDate.getFullYear() !== targetYearNum) return;
                        if (monthIdx === null || stuffingDate.getMonth() === monthIdx) {
                            match = true;
                            dateToUse = d.stuffingMonth;
                        }
                    }
                }

                if (match) {
                    const uniqueKey = d.orderNo.toUpperCase();
                    if (!resultsMap.has(uniqueKey)) {
                        resultsMap.set(uniqueKey, {
                            orderNo: d.orderNo,
                            date: dateToUse,
                            value: 0,
                            qty: 0,
                            customer: d.customerName,
                            country: d.country
                        });
                    }
                    const item = resultsMap.get(uniqueKey)!;
                    item.value += d.exportValue;
                    item.qty += d.qty;
                }
            });
        });

        return Array.from(resultsMap.values()).sort((a, b) => b.value - a.value);
    }, [dataForYear, isDateInRange, targetYearSuffix]);

    const handleKpiDoubleClick = (metric: 'received' | 'planned' | 'shipped') => {
        const titleMap = {
            'received': 'Total Orders Received',
            'planned': 'Orders In Process',
            'shipped': 'Orders Shipped'
        };
        const breakdown = getBreakdownData(metric, numericSelectedMonthIndex);
        setValueBreakdown({
            title: titleMap[metric],
            data: breakdown
        });
    };

    const handleMonthDoubleClick = (monthIdx: number) => {
        const monthName = monthNames[monthIdx];
        const breakdown = getBreakdownData(activeMetric || 'all', monthIdx);
        setValueBreakdown({
            title: `Orders for ${monthName} ${selectedPeriod === 'All' ? '' : selectedPeriod} (${activeMetric || 'Combined'})`,
            data: breakdown
        });
    };
    
    const countries = useMemo(() => {
        let dataForCountryList = allOrderData;
        if (authenticatedUser !== 'admin') {
            dataForCountryList = allOrderData.filter(d => d.customerName === authenticatedUser);
        }
        return ['All', ...new Set(dataForCountryList.map(d => d.country).filter(Boolean).sort())];
    }, [allOrderData, authenticatedUser]);


    const clientsForPeriod = useMemo(() => {
        return ['All', ...new Set(allOrderData.map(d => d.customerName).filter(Boolean).sort())];
    }, [allOrderData]);

    const calendarData = useMemo(() => {
        const receivedOrdersByMonth: Set<string>[] = Array.from({ length: 12 }, () => new Set());
        const plannedOrdersByMonth: Set<string>[] = Array.from({ length: 12 }, () => new Set());
        const shippedOrdersByMonth: Set<string>[] = Array.from({ length: 12 }, () => new Set());
        const targetYearNum = targetYearSuffix ? 2000 + parseInt(targetYearSuffix, 10) : null;

        dataForYear.forEach(d => {
            const status = (d.originalStatus || d.status || '').toUpperCase();
            const isPlan = status === 'PLAN';
            const isShipped = status === 'SHIPPED' || status === 'COMPLETE';

            const orderDate = parseDate(d.orderDate);
            const stuffingDate = parseDate(d.stuffingMonth);
            const orderNo = d.orderNo.toUpperCase();

            if ((isPlan || isShipped) && orderDate && isDateInRange(orderDate)) {
                if (!targetYearNum || orderDate.getFullYear() === targetYearNum) {
                    receivedOrdersByMonth[orderDate.getMonth()].add(orderNo);
                }
            }

            if (isPlan && orderDate && isDateInRange(orderDate)) {
                if (!targetYearNum || orderDate.getFullYear() === targetYearNum) {
                    plannedOrdersByMonth[orderDate.getMonth()].add(orderNo);
                }
            }

            if (isShipped && stuffingDate && isDateInRange(stuffingDate)) {
                if (!targetYearNum || stuffingDate.getFullYear() === targetYearNum) {
                    shippedOrdersByMonth[stuffingDate.getMonth()].add(orderNo);
                }
            }
        });

        return monthNames.map((_, index) => ({
            name: monthNames[index],
            received: receivedOrdersByMonth[index].size,
            planned: plannedOrdersByMonth[index].size,
            shipped: shippedOrdersByMonth[index].size,
            receivedOrderNumbers: Array.from(receivedOrdersByMonth[index]),
        }));
    }, [dataForYear, monthNames, isDateInRange, targetYearSuffix]);

    const yearlyKpis = useMemo(() => {
        const received = new Set<string>();
        const planned = new Set<string>();
        const shipped = new Set<string>();
        const targetYearNum = targetYearSuffix ? 2000 + parseInt(targetYearSuffix, 10) : null;

        dataForYear.forEach(d => {
            const status = (d.originalStatus || d.status || '').toUpperCase();
            const isPlan = status === 'PLAN';
            const isShipped = status === 'SHIPPED' || status === 'COMPLETE';

            const orderDate = parseDate(d.orderDate);
            const stuffingDate = parseDate(d.stuffingMonth);
            const orderNo = d.orderNo.toUpperCase();

            if ((isPlan || isShipped) && orderDate && isDateInRange(orderDate)) {
                if (!targetYearNum || orderDate.getFullYear() === targetYearNum) {
                    received.add(orderNo);
                }
            }

            if (isPlan && orderDate && isDateInRange(orderDate)) {
                if (!targetYearNum || orderDate.getFullYear() === targetYearNum) {
                    planned.add(orderNo);
                }
            }

            if (isShipped && stuffingDate && isDateInRange(stuffingDate)) {
                if (!targetYearNum || stuffingDate.getFullYear() === targetYearNum) {
                    shipped.add(orderNo);
                }
            }
        });

        return {
            received: received.size,
            planned: planned.size,
            shipped: shipped.size,
        };
    }, [dataForYear, isDateInRange, targetYearSuffix]);

    const monthlyKpis = useMemo(() => {
        if (numericSelectedMonthIndex === null) {
            return null;
        }
        return calendarData[numericSelectedMonthIndex];
    }, [calendarData, numericSelectedMonthIndex]);

    const kpis = monthlyKpis || yearlyKpis;
    
    const maxMonthlyValue = useMemo(() => Math.max(1, ...calendarData.map(m => Math.max(m.received, m.planned, m.shipped))), [calendarData]);

    const monthlyTotals = useMemo(() => {
        const totals = Array.from({ length: 12 }, () => ({ 
            totalValue: 0, totalQty: 0, 
            plannedValue: 0, plannedQty: 0,
            shippedValue: 0, shippedQty: 0 
        }));
        const targetYearNum = targetYearSuffix ? 2000 + parseInt(targetYearSuffix, 10) : null;
        
        dataForYear.forEach(d => {
             const status = (d.originalStatus || d.status || '').toUpperCase();
             const isPlan = status === 'PLAN';
             const isShipped = status === 'SHIPPED' || status === 'COMPLETE';
             
             const orderDate = parseDate(d.orderDate);
             if ((isPlan || isShipped) && orderDate && isDateInRange(orderDate)) {
                if (!targetYearNum || orderDate.getFullYear() === targetYearNum) {
                    const monthIdx = orderDate.getMonth();
                    totals[monthIdx].totalValue += d.exportValue;
                    totals[monthIdx].totalQty += d.qty;
                    
                    if (isPlan) {
                        totals[monthIdx].plannedValue += d.exportValue;
                        totals[monthIdx].plannedQty += d.qty;
                    }
                }
             }

             const stuffingDate = parseDate(d.stuffingMonth);
             if (isShipped && stuffingDate && isDateInRange(stuffingDate)) {
                if (!targetYearNum || stuffingDate.getFullYear() === targetYearNum) {
                     const monthIdx = stuffingDate.getMonth();
                     totals[monthIdx].shippedValue += d.exportValue;
                     totals[monthIdx].shippedQty += d.qty;
                }
             }
        });
        return totals;
    }, [dataForYear, isDateInRange, targetYearSuffix]);

    const yearlyTrendChartData = useMemo(() => {
        const yearGroups: Record<string, { received: Set<string>, planned: Set<string>, shipped: Set<string>, totalValue: number, totalQty: number, plannedValue: number, plannedQty: number, shippedValue: number, shippedQty: number }> = {};
        
        dataForYear.forEach(d => {
            const status = (d.originalStatus || d.status || '').toUpperCase();
            const isPlan = status === 'PLAN';
            const isShipped = status === 'SHIPPED' || status === 'COMPLETE';

            const orderDate = parseDate(d.orderDate);
            const stuffingDate = parseDate(d.stuffingMonth);
            
            // Received & In Process year based on Order Date
            if (orderDate && isDateInRange(orderDate)) {
                const year = orderDate.getFullYear().toString();
                if (!yearGroups[year]) {
                    yearGroups[year] = { received: new Set(), planned: new Set(), shipped: new Set(), totalValue: 0, totalQty: 0, plannedValue: 0, plannedQty: 0, shippedValue: 0, shippedQty: 0 };
                }
                if (isPlan || isShipped) {
                    yearGroups[year].received.add(d.orderNo.toUpperCase());
                    yearGroups[year].totalValue += d.exportValue;
                    yearGroups[year].totalQty += d.qty;
                }
                if (isPlan) {
                    yearGroups[year].planned.add(d.orderNo.toUpperCase());
                    yearGroups[year].plannedValue += d.exportValue;
                    yearGroups[year].plannedQty += d.qty;
                }
            }

            // Shipped year based on Stuffing Date
            if (isShipped && stuffingDate && isDateInRange(stuffingDate)) {
                const year = stuffingDate.getFullYear().toString();
                if (!yearGroups[year]) {
                    yearGroups[year] = { received: new Set(), planned: new Set(), shipped: new Set(), totalValue: 0, totalQty: 0, plannedValue: 0, plannedQty: 0, shippedValue: 0, shippedQty: 0 };
                }
                yearGroups[year].shipped.add(d.orderNo.toUpperCase());
                yearGroups[year].shippedValue += d.exportValue;
                yearGroups[year].shippedQty += d.qty;
            }
        });

        return Object.keys(yearGroups).sort().map(year => ({
            name: year,
            received: yearGroups[year].received.size,
            planned: yearGroups[year].planned.size,
            shipped: yearGroups[year].shipped.size,
            totalValue: yearGroups[year].totalValue,
            totalQty: yearGroups[year].totalQty,
            plannedValue: yearGroups[year].plannedValue,
            plannedQty: yearGroups[year].plannedQty,
            shippedValue: yearGroups[year].shippedValue,
            shippedQty: yearGroups[year].shippedQty
        }));
    }, [dataForYear, isDateInRange]);

    const monthlyTrendChartData = monthNames.map((name, index) => ({
        name,
        ...calendarData[index],
        ...monthlyTotals[index]
    }));
    
    const monthOrders = useMemo(() => {
        if (numericSelectedMonthIndex === null) return [];
        const targetYearNum = targetYearSuffix ? 2000 + parseInt(targetYearSuffix, 10) : null;
        return dataForYear.filter(d => {
            const orderDate = parseDate(d.orderDate);
            if (orderDate && orderDate.getMonth() === numericSelectedMonthIndex && isDateInRange(orderDate)) {
                if (!targetYearNum || orderDate.getFullYear() === targetYearNum) {
                    return true;
                }
            }
            return false;
        });
    }, [dataForYear, numericSelectedMonthIndex, isDateInRange, targetYearSuffix]);

    const dailyChartData = useMemo(() => {
        if (numericSelectedMonthIndex === null) return [];
    
        const daysInMonth = new Date(fullYearForDate, numericSelectedMonthIndex + 1, 0).getDate();
        const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1,
            totalValue: 0, totalQty: 0,
            plannedValue: 0, plannedQty: 0,
            shippedValue: 0, shippedQty: 0,
            shippedOrderDetails: [] as any[],
            receivedOrderDetails: [] as any[],
            plannedOrderDetails: [] as any[],
            shippedOrdersUnique: new Set<string>(),
            receivedOrdersUnique: new Set<string>(),
            plannedOrdersUnique: new Set<string>(),
        }));
        const targetYearNum = targetYearSuffix ? 2000 + parseInt(targetYearSuffix, 10) : null;

        dataForYear.forEach(d => {
            const status = (d.originalStatus || d.status || '').toUpperCase();
            const isPlan = status === 'PLAN';
            const isShipped = status === 'SHIPPED' || status === 'COMPLETE';

            const stuffingDate = parseDate(d.stuffingMonth);
            if (isShipped && stuffingDate && stuffingDate.getMonth() === numericSelectedMonthIndex && isDateInRange(stuffingDate)) {
                if (!targetYearNum || stuffingDate.getFullYear() === targetYearNum) {
                     const dayIndex = stuffingDate.getDate() - 1;
                     if (dailyData[dayIndex]) {
                         const ordKey = d.orderNo.toUpperCase();
                         if (!dailyData[dayIndex].shippedOrdersUnique.has(ordKey)) {
                            dailyData[dayIndex].shippedOrdersUnique.add(ordKey);
                            dailyData[dayIndex].shippedOrderDetails.push({
                               no: d.orderNo.toUpperCase(),
                               date: d.stuffingMonth,
                               val: d.exportValue,
                               qty: d.qty
                            });
                         }
                         dailyData[dayIndex].shippedValue += d.exportValue;
                         dailyData[dayIndex].shippedQty += d.qty;
                     }
                }
            }
            
            const orderDate = parseDate(d.orderDate);
            if ((isPlan || isShipped) && orderDate && orderDate.getMonth() === numericSelectedMonthIndex && isDateInRange(orderDate)) {
                if (!targetYearNum || orderDate.getFullYear() === targetYearNum) {
                    const dayIndex = orderDate.getDate() - 1;
                    if (dailyData[dayIndex]) {
                         const ordKey = d.orderNo.toUpperCase();
                         if (!dailyData[dayIndex].receivedOrdersUnique.has(ordKey)) {
                            dailyData[dayIndex].receivedOrdersUnique.add(ordKey);
                            dailyData[dayIndex].receivedOrderDetails.push({
                               no: d.orderNo.toUpperCase(),
                               date: d.orderDate,
                               val: d.exportValue,
                               qty: d.qty
                            });
                         }
                         dailyData[dayIndex].totalValue += d.exportValue;
                         dailyData[dayIndex].totalQty += d.qty;

                         if (isPlan) {
                            if (!dailyData[dayIndex].plannedOrdersUnique.has(ordKey)) {
                                dailyData[dayIndex].plannedOrdersUnique.add(ordKey);
                                dailyData[dayIndex].plannedOrderDetails.push({
                                   no: d.orderNo.toUpperCase(),
                                   date: d.orderDate,
                                   val: d.exportValue,
                                   qty: d.qty
                                });
                             }
                             dailyData[dayIndex].plannedValue += d.exportValue;
                             dailyData[dayIndex].plannedQty += d.qty;
                         }
                    }
                }
            }
        });

        return dailyData.map(data => ({
            day: data.day,
            received: data.receivedOrdersUnique.size,
            planned: data.plannedOrdersUnique.size,
            shipped: data.shippedOrdersUnique.size,
            totalValue: data.totalValue,
            totalQty: data.totalQty,
            plannedValue: data.plannedValue,
            plannedQty: data.plannedQty,
            shippedValue: data.shippedValue,
            shippedQty: data.shippedQty,
            shippedOrderDetails: data.shippedOrderDetails,
            receivedOrderDetails: data.receivedOrderDetails,
            plannedOrderDetails: data.plannedOrderDetails,
        }));
    }, [dataForYear, numericSelectedMonthIndex, isDateInRange, targetYearSuffix, fullYearForDate]);

    const topClients = useMemo(() => {
        const dataToProcess = numericSelectedMonthIndex !== null ? monthOrders : dataForYear;

        const clientData: Record<string, {
            name: string;
            value: number;
            qty: number;
            orders: Set<string>;
        }> = {};

        dataToProcess.forEach(d => {
            if (!d.customerName) return;
            const orderDate = parseDate(d.orderDate);
            if (numericSelectedMonthIndex === null) {
                if (!orderDate || !isDateInRange(orderDate)) return;
            }

            if (!clientData[d.customerName]) {
                clientData[d.customerName] = {
                    name: d.customerName,
                    value: 0,
                    qty: 0,
                    orders: new Set(),
                };
            }
            clientData[d.customerName].value += d.exportValue;
            clientData[d.customerName].qty += d.qty;
            clientData[d.customerName].orders.add(d.orderNo);
        });
        
        return Object.values(clientData)
            .map(client => ({
                name: client.name,
                value: client.value,
                qty: client.qty,
                orderCount: client.orders.size,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [dataForYear, monthOrders, numericSelectedMonthIndex, isDateInRange]);

    const countryChartDataForChat = useMemo(() => {
        const countryData = baseFilteredData.reduce<Record<string, { name: string; value: number, qty: number }>>((acc, curr) => {
            if (curr.country && curr.exportValue) {
                const key = curr.country.trim().toLowerCase();
                if (!acc[key]) {
                    acc[key] = { name: curr.country.trim(), value: 0, qty: 0 };
                }
                acc[key].value += curr.exportValue;
                acc[key].qty += (curr.qty || 0);
            }
            return acc;
        }, {});
        return Object.values(countryData).sort((a, b) => b.value - a.value);
    }, [baseFilteredData]);

    const monthlyChartDataForChat = useMemo(() => {
        return monthlyTrendChartData.map(m => ({
            name: m.name,
            orders: m.received,
            value: m.totalValue,
            qty: m.totalQty
        }));
    }, [monthlyTrendChartData]);

    const aiData = useMemo(() => {
        if (authenticatedUser === 'admin') {
            if (selectedClient === 'All') return allOrderData;
            return allOrderData.filter(d => d.customerName === selectedClient);
        }
        return allOrderData.filter(d => d.customerName === authenticatedUser);
    }, [allOrderData, selectedClient, authenticatedUser]);

    const catalogDataForChat = useMemo(() => {
        if (selectedClient === 'All' || selectedClient === 'admin') {
            return masterProductList;
        }
        return masterProductList.filter(p => p.customerName === selectedClient);
    }, [masterProductList, selectedClient]);

    const showTopClients = authenticatedUser === 'admin' && selectedClient === 'All' && selectedCountry === 'All';

    return (
        <>
            <div className="dashboard-container calendar-view-dashboard">
                <header>
                    <div className="header-main">
                        <div className="header-title">
                             {selectedClient === 'All' ? (
                                <img src="https://lh3.googleusercontent.com/d/1IPYJixe4KjQ3oY-9oOPdDyag98LND-qw" alt="Admin Logo" className="client-logo" />
                            ) : (
                                clientLogos[selectedClient] ? (
                                    <img src={clientLogos[selectedClient]} alt={`${selectedClient} Logo`} className="client-logo" />
                                ) : (
                                    <div className="client-logo-placeholder">No Logo</div>
                                )
                            )}
                            <h1>Calendar Year Order Overview</h1>
                        </div>
                    </div>
                    <div className="filters">
                        <div className="date-filter-container">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                aria-label="Start Date"
                            />
                            <span>to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                aria-label="End Date"
                            />
                            {(startDate || endDate) && (
                                <button className="clear-date-button" onClick={() => { setStartDate(''); setEndDate(''); }}>
                                    &times;
                                </button>
                            )}
                        </div>
                        <label className="view-switcher-label" htmlFor="calendar-period-switcher">Period:</label>
                        <div className="select-container">
                            <select id="calendar-period-switcher" value={selectedPeriod} onChange={(e) => { onPeriodChange(e.target.value); onMonthChange('All'); }}>
                                {periodOptions.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        {selectedPeriod !== 'All' && (
                            <>
                                <label className="view-switcher-label" htmlFor="calendar-month-switcher">Month:</label>
                                <div className="select-container">
                                    <select id="calendar-month-switcher" value={selectedMonth} onChange={(e) => onMonthChange(e.target.value)}>
                                        {['All', ...monthNames].map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </>
                        )}
                        <div className="select-container">
                            <select value={selectedCountry} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCountry(e.target.value)}>
                                {countries.map(c => <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>)}
                            </select>
                        </div>
                        <div className="select-container">
                            <select value={selectedClient} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedClient(e.target.value)} disabled={authenticatedUser !== 'admin'}>
                                {authenticatedUser === 'admin' ? 
                                    clientsForPeriod.map(c => <option key={c} value={c}>{c}</option>) :
                                    <option value={authenticatedUser}>{authenticatedUser}</option>
                                }
                            </select>
                        </div>
                        <button className="back-button" onClick={onClose}>
                            {Icons.prevArrow} Back to Main Dashboard
                        </button>
                    </div>
                </header>
                <div className="calendar-view-main">
                    <div className="kpi-container">
                        <CalendarKpiCard 
                            title={authenticatedUser === 'admin' ? "Total Orders Received" : "Total Orders Placed"} 
                            value={formatNumber(kpis.received)} 
                            icon={"📦"} 
                            variant="received" 
                            onClick={() => handleKpiClick('received')}
                            onDoubleClick={() => handleKpiDoubleClick('received')}
                            isDimmed={activeMetric !== null && activeMetric !== 'received'}
                            isActive={activeMetric === 'received'}
                        />
                        <CalendarKpiCard 
                            title="Total Orders In Process" 
                            value={formatNumber(kpis.planned)} 
                            icon={"🗓️"} 
                            variant="planned" 
                            onClick={() => handleKpiClick('planned')}
                            onDoubleClick={() => handleKpiDoubleClick('planned')}
                            isDimmed={activeMetric !== null && activeMetric !== 'planned'}
                            isActive={activeMetric === 'planned'}
                        />
                        <CalendarKpiCard 
                            title="Total Orders Shipped" 
                            value={formatNumber(kpis.shipped)} 
                            icon={"🚚"} 
                            variant="shipped" 
                            onClick={() => handleKpiClick('shipped')}
                            onDoubleClick={() => handleKpiDoubleClick('shipped')}
                            isDimmed={activeMetric !== null && activeMetric !== 'shipped'}
                            isActive={activeMetric === 'shipped'}
                        />
                    </div>
                    
                    {/* Month Grid - Only visible for specific periods */}
                    {selectedPeriod !== 'All' && (
                        <div className="calendar-grid-container">
                            <div className="calendar-grid">
                                {monthNames.map((month, index) => (
                                    <div 
                                        key={month} 
                                        className={`calendar-month-cell ${numericSelectedMonthIndex === index ? 'active' : ''}`}
                                        onClick={() => onMonthChange(month)}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            handleMonthDoubleClick(index);
                                        }}
                                        title="Single-click to view daily chart, Double-click for breakdown"
                                    >
                                        <h3>{month}</h3>
                                        <div className="month-bars-container">
                                            <div className="month-bar received" style={{ height: `${(calendarData[index].received / (maxMonthlyValue || 1)) * 100}%`, opacity: activeMetric === null || activeMetric === 'received' ? 1 : 0.2 }}>
                                                {calendarData[index].received > 0 && <span className="month-bar-label">{calendarData[index].received}</span>}
                                            </div>
                                            <div className="month-bar planned" style={{ height: `${(calendarData[index].planned / (maxMonthlyValue || 1)) * 100}%`, opacity: activeMetric === null || activeMetric === 'received' ? 1 : 0.2 }}>
                                                {calendarData[index].planned > 0 && <span className="month-bar-label">{calendarData[index].planned}</span>}
                                            </div>
                                            <div className="month-bar shipped" style={{ height: `${(calendarData[index].shipped / (maxMonthlyValue || 1)) * 100}%`, opacity: activeMetric === null || activeMetric === 'received' ? 1 : 0.2 }}>
                                                {calendarData[index].shipped > 0 && <span className="month-bar-label">{calendarData[index].shipped}</span>}
                                            </div>
                                        </div>
                                        <div className="calendar-month-tooltip">
                                            <strong>{month} {targetYearSuffix ? `FY-${targetYearSuffix}` : ''}</strong>
                                            {(activeMetric === null || activeMetric === 'received') && <span><i style={{backgroundColor: 'var(--calendar-received-color)'}}></i>Received: {calendarData[index].received}</span>}
                                            {(activeMetric === null || activeMetric === 'planned') && <span><i style={{backgroundColor: 'var(--calendar-planned-color)'}}></i>In Process: {calendarData[index].planned}</span>}
                                            {(activeMetric === null || activeMetric === 'shipped') && <span><i style={{backgroundColor: 'var(--calendar-shipped-color)'}}></i>Shipped: {calendarData[index].shipped}</span>}
                                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '4px', paddingTop: '4px' }}>
                                                <p style={{margin:0, fontSize:'0.7rem', opacity:0.8}}>Total Value: {formatCurrencyNoDecimals(monthlyTotals[index].totalValue)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={`calendar-charts-section ${!showTopClients ? 'single-column' : ''}`}>
                        {selectedPeriod === 'All' ? (
                            <div className="chart-container">
                                <h3>Yearly Order Volume</h3>
                                <MonthlyTrendChart data={yearlyTrendChartData} activeMetric={activeMetric} stacked={true} />
                            </div>
                        ) : numericSelectedMonthIndex === null ? (
                            <div className="chart-container">
                                <h3>Monthly Order Volume</h3>
                                <MonthlyTrendChart data={monthlyTrendChartData} selectedYear={fullYearForDate.toString()} activeMetric={activeMetric}/>
                            </div>
                        ) : (
                            <div className="chart-container daily-view">
                                <div className="daily-chart-header">
                                    <h3>Daily Order Volume for {monthNames[numericSelectedMonthIndex]}</h3>
                                    <button className="back-to-monthly-button" onClick={() => onMonthChange('All')}>
                                        {Icons.prevArrow} Monthly View
                                    </button>
                                </div>
                                <MonthlyTrendChart 
                                    data={dailyChartData} 
                                    xAxisDataKey="day" 
                                    selectedMonth={numericSelectedMonthIndex} 
                                    selectedYear={fullYearForDate.toString()} 
                                    activeMetric={activeMetric} 
                                    isAggregateView={selectedPeriod === 'All'}
                                />
                            </div>
                        )}
                        {showTopClients && <TopClientsList data={topClients} />}
                    </div>
                </div>
            </div>
            <ChatAssistant
                orderData={aiData}
                catalogData={catalogDataForChat}
                stepData={stepData}
                clientName={selectedClient}
                kpis={kpis}
                countryChartData={countryChartDataForChat}
                monthlyChartData={monthlyChartDataForChat}
            />
            {valueBreakdown && 
                <ValueBreakdownModal 
                    title={valueBreakdown.title} 
                    data={valueBreakdown.data} 
                    onClose={() => setValueBreakdown(null)}
                    currentUser={selectedClient}
                />
            }
        </>
    );
};

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
        );
    }

    return (
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKey(e.target.value)}
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
    );
};

const KpiCard = ({ title, value, icon, onFilter = null, filterType = null, filterValue = null, activeFilters, onClick = null, onDoubleClick = null, className = '' }: any) => {
    const isFilterable = !!filterType || !!onClick || !!onDoubleClick;
    const isActive = activeFilters && activeFilters.some((f: any) => f.type === filterType && f.value === filterValue);
    
    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (filterType && onFilter) {
            onFilter({ type: filterType, value: filterValue, source: 'kpi' });
        }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (onDoubleClick) {
            e.stopPropagation();
            onDoubleClick();
        }
    };

    return (
        <div 
          className={`kpi-card ${isFilterable ? 'filterable' : ''} ${isActive ? 'active' : ''} ${className || ''}`}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          title={onDoubleClick ? "Double click for detailed summary" : ""}
        >
            <div className="icon">{(Icons as any)[icon]}</div>
            <div className="kpi-card-content">
                <h3>{title}</h3>
                <p>{value}</p>
            </div>
        </div>
    );
};

const DataTable = ({ data, globalData, currentUser, authenticatedUser, onShowTracking, stepData, drillDownState, onRowDoubleClick, onDrillUp, baseOrderHasSubOrders, activeFilters, paymentTerms }: { data: OrderData[], globalData: OrderData[], currentUser: string, authenticatedUser: string, onShowTracking: (orderNo: string) => void, stepData: StepData[], drillDownState: { level: number, baseOrder: string | null, subOrder: string | null }, onRowDoubleClick: (row: any) => void, onDrillUp: () => void, baseOrderHasSubOrders: boolean, activeFilters: Filter[], paymentTerms: PaymentTermData[] }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const tableWrapperRef = useRef<HTMLDivElement>(null);

    const stepDataOrderNos = useMemo(() => new Set(stepData.map(s => s.orderNo)), [stepData]);

    const { tableTitle, backButtonText } = useMemo(() => {
        if (drillDownState.level === 3) {
            const backText = baseOrderHasSubOrders
                ? `Back to Order ${drillDownState.baseOrder}`
                : 'Back to All Orders';
            return {
                tableTitle: `Products for Sub-Order: ${drillDownState.subOrder}`,
                backButtonText: backText
            };
        }
        if (drillDownState.level === 2) {
            return {
                tableTitle: `Sub-Orders for: ${drillDownState.baseOrder}`,
                backButtonText: 'Back to All Orders'
            };
        }
        return { tableTitle: 'All Orders', backButtonText: '' };
    }, [drillDownState, baseOrderHasSubOrders]);

    const processedData = useMemo(() => {
        if (drillDownState.level === 1) {
            const groups: { [key: string]: OrderData[] } = data.reduce((acc, row) => {
                const status = row.originalStatus?.toUpperCase();
                const isShipped = status === 'SHIPPED' || status === 'COMPLETE';
                const invoice = (row.commercialInvoiceNo && row.commercialInvoiceNo !== '#N/A' && row.commercialInvoiceNo !== '') ? row.commercialInvoiceNo : null;
                
                const key = (isShipped && invoice) ? invoice : getBaseOrderNo(row.orderNo);
                
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(row);
                return acc;
            }, {} as Record<string, OrderData[]>);

            return Object.entries(groups).map(([groupKey, products]) => {
                let finalStatus = 'PLAN';
                let latestShippedDate: Date | null = null;
                let latestEtaDate: Date | null = null;
                
                products.forEach(p => {
                    const status = p.originalStatus?.toUpperCase();
                    const shippedDate = parseDate(p.stuffingMonth);
                    const etaDate = parseDate(p.eta || '');

                    if (status === 'SHIPPED' || status === 'COMPLETE') {
                        finalStatus = 'SHIPPED';
                        if (shippedDate && (!latestShippedDate || shippedDate > latestShippedDate)) {
                            latestShippedDate = shippedDate;
                        }
                        if (etaDate && (!latestEtaDate || etaDate > latestEtaDate)) {
                            latestEtaDate = etaDate;
                        }
                    }
                });

                const uniqueOrderNos = [...new Set(products.map(p => p.orderNo.toUpperCase()))];
                const hasSubOrders = uniqueOrderNos.length > 1 || (uniqueOrderNos.length === 1 && uniqueOrderNos[0] !== groupKey);
                
                const firstProduct = products[0];
                const totalExportValue = products.reduce((sum, p) => sum + p.exportValue, 0);
                const shippedValue = products.reduce((sum, p) => {
                    const status = p.originalStatus?.toUpperCase();
                    if (status === 'SHIPPED' || status === 'COMPLETE') {
                        return sum + p.exportValue;
                    }
                    return sum;
                }, 0);
                const balanceValue = totalExportValue - shippedValue;
                const totalQty = products.reduce((sum, p) => sum + p.qty, 0);
                
                const shippedQty = products.reduce((sum, p) => {
                    const status = p.originalStatus?.toUpperCase();
                    if (status === 'SHIPPED' || status === 'COMPLETE') {
                        return sum + p.qty;
                    }
                    return sum;
                }, 0);
                const balanceQty = totalQty - shippedQty;

                const pt = paymentTerms.find(term => 
                    term.client.toUpperCase() === firstProduct.customerName.toUpperCase() && 
                    term.country.toUpperCase() === firstProduct.country.toUpperCase()
                );
                const dueDate = pt ? calculateDueDate(pt.dueDateRule, latestShippedDate?.toISOString(), latestEtaDate?.toISOString()) : null;

                return {
                    level: 1,
                    baseOrderNo: groupKey,
                    displayOrderNo: groupKey,
                    status: finalStatus,
                    originalStatus: finalStatus, 
                    stuffingMonth: latestShippedDate ? latestShippedDate.toISOString() : firstProduct.stuffingMonth,
                    customerName: firstProduct.customerName,
                    country: firstProduct.country,
                    totalQty,
                    shippedQty,
                    balanceQty,
                    totalExportValue,
                    shippedValue,
                    balanceValue,
                    hasSubOrders,
                    singleOrderNo: uniqueOrderNos.length === 1 ? products[0].orderNo : null,
                    hasTracking: products.some(p => stepDataOrderNos.has(p.orderNo)),
                    paymentDueDate: dueDate ? dueDate.toISOString() : null,
                    commercialInvoiceNo: products[0].commercialInvoiceNo
                };
            }).sort((a, b) => {
                const dateA = parseDate(a.stuffingMonth);
                const dateB = parseDate(b.stuffingMonth);
                if (dateA && dateB) return dateB.getTime() - dateA.getTime();
                if (dateA) return -1;
                if (dateB) return 1;
                return 0;
            });
        }

        if (drillDownState.level === 2) {
            const parentKey = drillDownState.baseOrder?.toUpperCase();
            const parentItems = globalData.filter(row => {
                const status = row.originalStatus?.toUpperCase();
                const isShipped = status === 'SHIPPED' || status === 'COMPLETE';
                const invoice = (row.commercialInvoiceNo && row.commercialInvoiceNo !== '#N/A' && row.commercialInvoiceNo !== '') ? row.commercialInvoiceNo : null;
                const key = (isShipped && invoice) ? invoice : getBaseOrderNo(row.orderNo);
                return key.toUpperCase() === parentKey;
            });
            const linkedOrderNos = new Set(parentItems.map(r => r.orderNo.toUpperCase()));
            const orderItems = globalData.filter(row => linkedOrderNos.has(row.orderNo.toUpperCase()));

            const subGroups: { [key: string]: OrderData[] } = orderItems.reduce((acc, row) => {
                const key = row.orderNo ? row.orderNo.trim().toUpperCase() : ''; 
                if (!key) return acc; 
                if (!acc[key]) acc[key] = [];
                acc[key].push(row);
                return acc;
            }, {} as Record<string, OrderData[]>);

            return Object.entries(subGroups).map(([key, products]) => {
                let finalStatus = 'PLAN';
                let latestShippedDate: Date | null = null;
                products.forEach(p => {
                    const status = p.originalStatus?.toUpperCase();
                    const shippedDate = parseDate(p.stuffingMonth);
                    if (status === 'SHIPPED' || status === 'COMPLETE') {
                        finalStatus = 'SHIPPED';
                        if (shippedDate && (!latestShippedDate || shippedDate > latestShippedDate)) latestShippedDate = shippedDate;
                    }
                });

                const firstProduct = products[0];
                const totalQty = products.reduce((sum, p) => sum + p.qty, 0);
                const totalExportValue = products.reduce((sum, p) => sum + p.exportValue, 0);
                const shippedValue = products.reduce((sum, p) => (p.originalStatus?.toUpperCase() === 'SHIPPED' || p.originalStatus?.toUpperCase() === 'COMPLETE' ? sum + p.exportValue : sum), 0);
                const shippedQty = products.reduce((sum, p) => (p.originalStatus?.toUpperCase() === 'SHIPPED' || p.originalStatus?.toUpperCase() === 'COMPLETE' ? sum + p.qty : sum), 0);

                return {
                    level: 2,
                    orderNo: firstProduct.orderNo,
                    displayOrderNo: firstProduct.orderNo,
                    status: finalStatus,
                    originalStatus: finalStatus,
                    stuffingMonth: latestShippedDate ? latestShippedDate.toISOString() : firstProduct.stuffingMonth,
                    imageLink: firstProduct.imageLink,
                    customerName: firstProduct.customerName,
                    country: firstProduct.country,
                    totalQty,
                    shippedQty,
                    balanceQty: totalQty - shippedQty,
                    totalExportValue,
                    shippedValue,
                    balanceValue: totalExportValue - shippedValue,
                    hasTracking: products.some(p => stepDataOrderNos.has(p.orderNo)),
                    commercialInvoiceNo: products[0].commercialInvoiceNo
                };
            }).sort((a, b) => {
                const dateA = parseDate(a.stuffingMonth);
                const dateB = parseDate(b.stuffingMonth);
                if (dateA && dateB) return dateB.getTime() - dateA.getTime();
                return 0;
            });
        }

        if (drillDownState.level === 3) {
            return globalData.filter(row => row.orderNo.toUpperCase() === drillDownState.subOrder?.toUpperCase()).map(row => ({ 
                ...row, 
                level: 3,
                hasTracking: stepDataOrderNos.has(row.orderNo)
            })).sort((a, b) => {
                const dateA = parseDate(a.stuffingMonth);
                const dateB = parseDate(b.stuffingMonth);
                if (dateA && dateB) return dateB.getTime() - dateA.getTime();
                return 0;
            });
        }
        return [];
    }, [data, globalData, drillDownState, stepDataOrderNos, paymentTerms]);

    const paymentReminders = useMemo(() => {
        if (drillDownState.level !== 1) return [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return (processedData as any[])
            .filter(d => d.paymentDueDate)
            .map(d => {
                const due = new Date(d.paymentDueDate!);
                const dueCheck = new Date(due);
                dueCheck.setHours(0, 0, 0, 0);
                const diffDays = Math.ceil((dueCheck.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return { 
                    order: d.displayOrderNo, 
                    due: d.paymentDueDate!, 
                    diff: diffDays 
                };
            })
            .filter(rem => rem.diff >= 0 && rem.diff <= 7)
            .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
    }, [processedData, drillDownState.level]);

    const totalItems = processedData.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const paginatedData = processedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [drillDownState]);

    const orderNoHeader = useMemo(() => {
        if (drillDownState.level === 1) {
            const visibleStatuses = new Set(paginatedData.map(d => d.originalStatus?.toUpperCase()));
            const isShippedOnly = (visibleStatuses.has('SHIPPED') || visibleStatuses.has('COMPLETE')) && !visibleStatuses.has('PLAN');
            return isShippedOnly ? 'Commercial Invoice No' : 'Order No';
        }
        return drillDownState.level === 3 ? 'Commercial Invoice No' : 'Order No';
    }, [drillDownState.level, paginatedData]);

    const getStatusKeyword = (status: string) => (status.split('(')[0] || '').trim().toLowerCase().replace(/\s+/g, '');

    return (
        <div className="data-table-container">
            <div className="data-table-header">
                <h3>{tableTitle}</h3>
                {drillDownState.level > 1 && (
                    <button className="back-button" onClick={onDrillUp}>
                        {Icons.prevArrow} {backButtonText}
                    </button>
                )}
            </div>
            {drillDownState.level === 1 && (
                 <div className="instruction-container">
                    <p>
                        {paymentReminders.length > 0 && (
                            <span style={{ color: '#36C5F0', fontWeight: 800, marginRight: '40px' }}>
                                <strong style={{ color: 'var(--text-color)', borderRight: '2px solid var(--card-border)', paddingRight: '12px', marginRight: '12px' }}>WEEKLY PAYMENT REMINDERS:</strong> 
                                {paymentReminders.map(r => (
                                    <span key={r.order} style={{ marginRight: '35px' }}>
                                        Order {r.order} {r.diff === 0 ? 'is due TODAY' : `due in ${r.diff} days`} ({formatDateDDMMMYY(r.due)})
                                    </span>
                                ))}
                            </span>
                        )}
                        <span style={{ color: 'var(--text-color-muted)' }}>
                            Tip: Double-click an order to see sub-orders. Single-click an Order/Invoice Number to track its progress.
                        </span>
                    </p>
                </div>
            )}
            <div className="table-wrapper" ref={tableWrapperRef}>
                <table>
                    <thead>
                        <tr>
                            <th className="text-center">Status</th>
                            <th>Shipped Date</th>
                            
                            {drillDownState.level === 3 ? (
                                <>
                                    <th>Commercial Invoice No</th>
                                    <th className="text-center">Image</th>
                                    <th>Product Code</th>
                                    <th>Category</th>
                                    <th>Product</th>
                                    <th>Customer</th>
                                    <th>Country</th>
                                    <th className="text-right">Qty</th>
                                    <th className="text-right">Shipped Qty</th>
                                    <th className="text-right">Order Value</th>
                                    <th className="text-right">Unit Price</th>
                                    <th className="text-right">Fob Price</th>
                                </>
                            ) : (
                                <>
                                    <th>{orderNoHeader}</th>
                                    {drillDownState.level === 1 && <th>Payment Due Date</th>}
                                    {drillDownState.level >= 2 && <th className="text-center">Image</th>}
                                    {currentUser === 'admin' && <th>Customer</th>}
                                    {currentUser === 'admin' && <th>Country</th>}
                                    <th className="text-right">Qty</th>
                                    <th className="text-right">Shipped Qty</th>
                                    {drillDownState.level < 3 && <th className="text-right">Balance Qty</th>}
                                    <th className="text-right">Order Value</th>
                                    <th className="text-right">Shipped Value</th>
                                    <th className="text-right">Balance Order Value</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row: any, idx: number) => (
                            <tr key={idx} onDoubleClick={() => onRowDoubleClick(row)} className={row.hasTracking ? 'has-tracking' : ''}>
                                <td className="text-center">
                                    <div className="status-cell">
                                        <span className={`status-dot ${getStatusKeyword(row.originalStatus || row.status)}`}></span>
                                        <span className="status-text">{formatNa(row.originalStatus || row.status)}</span>
                                    </div>
                                </td>
                                <td>{formatDateDDMMMYY(row.stuffingMonth)}</td>
                                
                                {drillDownState.level === 3 ? (
                                    <>
                                        <td className="order-no-cell">{formatNa(row.commercialInvoiceNo)}</td>
                                        <td className="product-image-cell">
                                            {row.imageLink && row.imageLink !== '#n/a' ? <img src={row.imageLink} alt={row.product} className="product-image" /> : <div className="product-image-placeholder">No Image</div>}
                                        </td>
                                        <td>{formatNa(row.productCode)}</td>
                                        <td>{formatNa(row.category)}</td>
                                        <td>{formatNa(row.product)}</td>
                                        <td>{formatNa(row.customerName)}</td>
                                        <td>{formatNa(row.country)}</td>
                                        <td className="text-right">{formatNumber(row.qty)}</td>
                                        <td className="text-right">{formatNumber(row.qty)}</td>
                                        <td className="text-right value-text">{formatCurrency(row.exportValue)}</td>
                                        <td className="text-right">{formatCurrency(row.unitPrice)}</td>
                                        <td className="text-right">{formatCurrency(row.fobPrice)}</td>
                                    </>
                                ) : (
                                    <>
                                        <td className={`order-no-cell ${row.hasTracking ? 'clickable' : ''}`} onClick={(e) => { if(row.hasTracking && drillDownState.level < 3) { e.stopPropagation(); onShowTracking(row.singleOrderNo || row.baseOrderNo || row.orderNo); } }}>
                                            {formatNa(row.displayOrderNo)}
                                        </td>

                                        {drillDownState.level === 1 && (
                                            <td className="font-medium" style={{ color: row.paymentDueDate ? 'var(--primary-accent)' : 'inherit' }}>
                                                {row.paymentDueDate ? formatDateDDMMMYY(row.paymentDueDate) : '~'}
                                            </td>
                                        )}
                                        {drillDownState.level >= 2 && (
                                            <td className="product-image-cell">
                                                {row.imageLink && row.imageLink !== '#n/a' ? <img src={row.imageLink} alt={row.product} className="product-image" /> : <div className="product-image-placeholder">No Image</div>}
                                            </td>
                                        )}
                                        {currentUser === 'admin' && <td>{formatNa(row.customerName)}</td>}
                                        {currentUser === 'admin' && <td>{formatNa(row.country)}</td>}
                                        <td className="text-right">{formatNumber(row.totalQty ?? row.qty)}</td>
                                        <td className="text-right">{formatNumber(row.shippedQty ?? (row.originalStatus?.startsWith('SHIPPED') || row.originalStatus?.startsWith('COMPLETE') ? row.qty : 0))}</td>
                                        {drillDownState.level < 3 && <td className="text-right">{formatNumber(row.balanceQty)}</td>}
                                        <td className="text-right value-text">{formatCurrency(row.totalExportValue ?? row.exportValue)}</td>
                                        <td className="text-right value-text">{formatCurrency(row.shippedValue)}</td>
                                        <td className="text-right value-text">{formatCurrency(row.balanceValue)}</td>
                                    </>
                                )}
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
        <table className={currentUser !== 'admin' ? 'client-view-table' : ''}>
          <thead>
            <tr>
              <th className="text-center">Image</th>
              <th>Product Code</th>
              <th>Category</th>
              <th>Product</th>
              {currentUser === 'admin' && <th>Customer</th>}
              {currentUser === 'admin' && <th>Country</th>}
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
                <td>{formatNa(row.product)}</td>
                {currentUser === 'admin' && <td>{formatNa(row.customerName)}</td>}
                {currentUser === 'admin' && <td>{formatNa(row.country)}</td>}
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

const SimpleMarkdown = ({ text }: { text: string }) => {
    const html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/((<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>') 
        .replace(/\n/g, '<br />')
        .replace(/<br \/><ul>/g, '<ul>') 
        .replace(/<\/ul><br \/>/g, '</ul>'); 

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};


const ChatAssistant = ({ orderData, catalogData, stepData, clientName, kpis, countryChartData, monthlyChartData }: { 
    orderData: OrderData[], 
    catalogData: any[], 
    stepData: StepData[], 
    clientName: string, 
    kpis: any, 
    countryChartData: {name: string, value: number, qty: number}[], 
    monthlyChartData: {name: string, orders: number, value: number, qty: number}[] 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const [showHelpPopup, setShowHelpPopup] = useState(false);

    const placeholder = "Ask about orders, products, or status...";
    const initialMessage = "Hello how may i help you today?";

    useEffect(() => {
        let intervalId: number;
        let timeoutId: number;

        const showAndHide = () => {
            setShowHelpPopup(true);
            timeoutId = window.setTimeout(() => {
                setShowHelpPopup(false);
            }, 10000);
        };

        if (isOpen) {
            setShowHelpPopup(false);
        } else {
            showAndHide();
            intervalId = window.setInterval(showAndHide, 60000);
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
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const stepMap = new Map(stepData.map(s => [s.orderNo, s]));
            
            const simplifyOrders = (rows: OrderData[]) => rows.map(r => {
                const step = stepMap.get(r.orderNo);
                return {
                    Status: r.status,
                    FY: r.fy,
                    OrderNo: r.orderNo,
                    Client: r.customerName,
                    Country: r.country,
                    Product: r.product,
                    Code: r.productCode,
                    Category: r.category,
                    Segment: r.segment,
                    Qty: r.qty,
                    Value: r.exportValue,
                    UnitPrice: r.unitPrice,
                    OrderDate: r.orderDate, 
                    StuffingMonth: r.stuffingMonth,
                    StuffingDate: r.stuffingDate,
                    ETD: r.etd,
                    ETA: r.eta,
                    ProductionDate: step?.productionDate,
                    ProductionStatus: step?.productionStatus,
                    SOBDate: step?.sobDate,
                    SOBStatus: step?.sobStatus,
                    PaymentDate: step?.paymentPlannedDate,
                    PaymentStatus: step?.paymentStatus,
                    QCDate: step?.qualityCheckPlannedDate,
                    QCStatus: step?.qualityCheckStatus,
                };
            });

            const simplifyCatalog = (rows: any[]) => rows.map(r => ({
                Code: r.productCode,
                Category: r.category,
                Product: r.product,
                Client: r.customerName,
                Country: r.country,
                MOQ: r.moq,
                FobPrice: r.fobPrice
            }));

            const toCSV = (arr: any[]) => {
                if (!arr || arr.length === 0) return "No Data";
                const headers = Object.keys(arr[0]);
                return [
                    headers.join(','),
                    ...arr.map(row => headers.map(h => {
                        const val = row[h];
                        const str = val === null || val === undefined ? '' : String(val);
                        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                            return `"${str.replace(/"/g, '""')}"`;
                        }
                        return str;
                    }).join(','))
                ].join('\n');
            };

            const orderNoRegex = /\b[A-Za-z0-9]+-[0-9]+(?:-[A-Za-z0-9]+)?\b/gi;
            const mentionedIds = (userMessage.text.match(orderNoRegex) || []).map(s => s.toUpperCase());

            let contextOrders = [...orderData];

            contextOrders.sort((a, b) => {
                 const dA = parseDate(a.orderDate)?.getTime() || 0;
                 const dB = parseDate(b.orderDate)?.getTime() || 0;
                 return dB - dA;
            });

            if (mentionedIds.length > 0) {
                const priority = contextOrders.filter(o => mentionedIds.some(id => o.orderNo.toUpperCase().includes(id)));
                const others = contextOrders.filter(o => !mentionedIds.some(id => o.orderNo.toUpperCase().includes(id)));
                contextOrders = [...priority, ...others];
            }

            const MAX_ORDERS = 5000;
            const MAX_CATALOG = 300;
            
            const truncatedOrders = contextOrders.slice(0, MAX_ORDERS);
            const truncatedCatalog = catalogData.slice(0, MAX_CATALOG);
            
            const ordersCSV = toCSV(simplifyOrders(truncatedOrders));
            const catalogCSV = toCSV(simplifyCatalog(truncatedCatalog));

            const countryChartSummary = countryChartData.map(c => `${c.name}: Total Value $${Math.round(c.value).toLocaleString()} (Total Qty ${c.qty} units)`).join(', ');
            const monthlyChartSummary = monthlyChartData.map(m => `${m.name}: ${m.orders} orders (Total Value $${Math.round(m.value).toLocaleString()}, Total Qty ${m.qty} units)`).join(', ');
            
            const roleInstructions = clientName === 'admin'
                ? "User is ADMIN. Access to ALL data."
                : `User is CLIENT: '${clientName}'. ONLY discuss data where Client column matches '${clientName}'. Do NOT reveal other clients' info.`;

            const systemInstruction = `You are an expert AI Data Analyst for the "Global Operations Dashboard".

**Dashboard Structure Awareness:**
You are integrated into a dashboard with the following components:
1. **KPI Cards** for values and order counts.
2. **Charts** for global and monthly volume.
3. **Table Structure (3 Layers):** Layer 1 (Invoices), Layer 2 (Orders), Layer 3 (Product details).

**Rules:**
1. **Privacy:** ${roleInstructions}
2. **Accuracy:** Use provided context for analysis.

**Current Context:**
- **KPI Values:** ${JSON.stringify(kpis)}
- **Chart Data:** ${countryChartSummary} / ${monthlyChartSummary}`;

            const prompt = `Data Context (CSV):
--- ORDERS START ---
${ordersCSV}
--- ORDERS END ---

--- CATALOG START ---
${catalogCSV}
--- CATALOG END ---

User Question: "${userMessage.text}"`;

            const responseStream = await ai.models.generateContentStream({
                model: 'gemini-3-flash-preview',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    systemInstruction: systemInstruction,
                },
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
            const errorMessage = "I'm having trouble analyzing the data right now.";
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
                        </div>
                    ))}
                </div>
                <div className="chat-input">
                    <input 
                        type="text" 
                        value={input} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
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


const NeverBoughtDashboard = ({ allOrderData, masterProductList, stepData, initialClientName, clientList, onClose, authenticatedUser }: { allOrderData: OrderData[], masterProductList: MasterProductData[], stepData: StepData[], initialClientName: string, clientList: string[], onClose: () => void, authenticatedUser: string }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(initialClientName);

  const catalogForUser = useMemo(() => {
    return selectedUser === 'admin'
        ? masterProductList
        : masterProductList.filter(p => p.customerName === selectedUser);
  }, [masterProductList, selectedUser]);
  
  const filteredCatalogData = useMemo(() => { 
    if (!searchQuery.trim()) return catalogForUser;
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    return catalogForUser.filter(p =>
      (p.productCode && p.productCode.toLowerCase().includes(lowercasedQuery)) ||
      (p.category && p.category.toLowerCase().includes(lowercasedQuery)) ||
      (p.product && p.product.toLowerCase().includes(lowercasedQuery)) ||
      (p.customerName && p.customerName.toLowerCase().includes(lowercasedQuery)) ||
      (p.country && p.country.toLowerCase().includes(lowercasedQuery))
    );
  }, [catalogForUser, searchQuery]);

  const tableData = useMemo(() => {
    return filteredCatalogData.map(p => ({
        status: 'CATALOG', orderDate: '', stuffingMonth: '', orderNo: 'N/A',
        customerName: p.customerName, country: p.country, productCode: p.productCode,
        qty: 0, exportValue: 0, logoUrl: '', category: p.category, segment: '',
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    />
                </div>
                 <label className="view-switcher-label" htmlFor="nb-view-switcher">Current View:</label>
                 <div className="select-container">
                    <select id="nb-view-switcher" value={selectedUser} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {setSelectedUser(e.target.value); setSearchQuery('')}} disabled={authenticatedUser !== 'admin'}>
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
          <div className="never-bought-main">
             <NeverBoughtDataTable data={tableData} currentUser={selectedUser} authenticatedUser={authenticatedUser}/>
          </div>
        </div>
        <ChatAssistant 
          orderData={relevantOrderData} 
          catalogData={filteredCatalogData} 
          stepData={stepData}
          clientName={selectedUser} 
          kpis={{}}
          countryChartData={[]}
          monthlyChartData={[]}
        />
    </>
  );
};

const OrderTrackingModal = ({ orderNo, stepData, orderDate, onClose, financialSummary }: { orderNo: string, stepData: StepData | undefined, orderDate?: string, onClose: () => void, financialSummary?: {orderQty: number, orderValue: number} }) => {
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

    const getIconForState = (state: 'completed' | 'pending' | 'upcoming') => {
        switch (state) {
            case 'completed': return Icons.checkCircleFilled;
            case 'pending': return Icons.clock;
            case 'upcoming': return Icons.circle;
            default: return Icons.circle;
        }
    };

    const FinancialCard = ({ title, value, colorClass }: { title: string, value: string, colorClass: string }) => (
        <div className={`financial-summary-card ${colorClass}`}>
            <span className="fin-title">{title}</span>
            <span className="fin-value">{value}</span>
        </div>
    );

    if (!stepData) {
        return (
            <div className="modal-backdrop" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Order Tracking: <span className="modal-order-no">{orderNo}</span></h2>
                        <button className="modal-close-button" onClick={onClose}>&times;</button>
                    </div>
                    <div className="modal-body">
                         <p className="no-tracking-info">No tracking information available for this order.</p>
                    </div>
                </div>
            </div>
        );
    }
    
    const productionState = getStepState(stepData.productionStatus, stepData.productionDate);
    const qcState = getStepState(stepData.qualityCheckStatus, stepData.qualityCheckPlannedDate);
    const sobState = getStepState(stepData.sobStatus, stepData.sobDate);
    const paymentState = getStepState(stepData.paymentStatus, stepData.paymentPlannedDate);

    const qualityCheckLinks = [
        { label: 'Quality check 1', url: stepData.qualityCheck1Url },
        { label: 'Quality check 2', url: stepData.qualityCheck2Url },
        { label: 'Quality check 3', url: stepData.qualityCheck3Url },
        { label: 'Quality check 4', url: stepData.qualityCheck4Url },
    ].filter(link => link.url && link.url.trim() && link.url.toLowerCase() !== '#n/a' && link.url.toLowerCase().startsWith('http'));

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Order Tracking: <span className="modal-order-no">{orderNo}</span></h2>
                    <button className="modal-close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {financialSummary && (
                        <div className="financial-summary-section">
                            <FinancialCard title="Order Qty" value={formatNumber(financialSummary.orderQty)} colorClass="neutral" />
                            <FinancialCard title="Order Value" value={formatCurrency(financialSummary.orderValue)} colorClass="neutral" />
                        </div>
                    )}
                    <ul className="tracking-timeline">
                        {orderDate && (
                            <li className="tracking-step completed">
                                <div className="step-icon">{getIconForState('completed')}</div>
                                <div className="step-content">
                                    <h4 className="step-title">Order Received</h4>
                                    <p className="step-details">Date:- {formatDateDDMMMYY(orderDate)}</p>
                                    <p className="step-details">Status:- Completed</p>
                                </div>
                            </li>
                        )}
                        <li className={`tracking-step ${productionState}`}>
                            <div className="step-icon">{getIconForState(productionState)}</div>
                            <div className="step-content">
                                <h4 className="step-title">Production</h4>
                                <p className="step-details">Planned:- {formatDateDDMMMYY(stepData.productionDate)}</p>
                                <p className="step-details">Status:- {formatNa(stepData.productionStatus) === '~' ? 'Pending' : formatNa(stepData.productionStatus)}</p>
                            </div>
                        </li>

                        <li className={`tracking-step ${qcState}`}>
                             <div className="step-icon">{getIconForState(qcState)}</div>
                             <div className="step-content">
                                <h4 className="step-title">Quality Check</h4>
                                <p className="step-details">Planned:- {formatDateDDMMMYY(stepData.qualityCheckPlannedDate)}</p>
                                {qualityCheckLinks.length > 0 && (
                                    <div className="quality-check-links">
                                        {qualityCheckLinks.map((link, idx) => (
                                            <a href={link.url} key={idx} target="_blank" rel="noopener noreferrer" className="quality-link-button">
                                                {Icons.plan} {link.label}
                                            </a>
                                        ))}
                                    </div>
                                )}
                                <p className="step-details">Status:- {formatNa(stepData.qualityCheckStatus) === '~' ? 'Pending' : formatNa(stepData.qualityCheckStatus)}</p>
                            </div>
                        </li>
                        
                        <li className={`tracking-step ${sobState}`}>
                            <div className="step-icon">{getIconForState(sobState)}</div>
                            <div className="step-content">
                                <h4 className="step-title">Final SOB</h4>
                                <p className="step-details">SOB/ETD:- {formatDateDDMMMYY(stepData.sobDate)}</p>
                                <p className="step-details">Status:- {formatNa(stepData.sobStatus) === '~' ? 'Pending' : formatNa(stepData.sobStatus)}</p>
                            </div>
                        </li>

                        <li className={`tracking-step ${paymentState}`}>
                            <div className="step-icon">{getIconForState(paymentState)}</div>
                            <div className="step-content">
                                <h4 className="step-title">Payment</h4>
                                <p className="step-details">Planned:- {formatDateDDMMMYY(stepData.paymentPlannedDate)}</p>
                                <p className="step-details">Status:- {formatNa(stepData.paymentStatus) === '~' ? 'Pending' : formatNa(stepData.paymentStatus)}</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

const ValueBreakdownModal = ({ title, data, onClose, currentUser }: { title: string, data: BreakdownItem[], onClose: () => void, currentUser: string }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filtered = useMemo(() => 
        data.filter(d => 
            d.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
            d.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.country.toLowerCase().includes(searchTerm.toLowerCase())
        ), [data, searchTerm]);

    const totalFilteredValue = useMemo(() => 
        filtered.reduce((sum, item) => sum + item.value, 0), [filtered]);

    const totalFilteredCount = filtered.length;

    const dateHeader = useMemo(() => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('shipped') || lowerTitle.includes('shipment')) {
            return 'SHIPPED DATE';
        }
        return 'ORDER FORWARDING DATE';
    }, [title]);
    
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content value-breakdown-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header breakdown-header">
                    <div className="breakdown-title-group">
                        <h2>{title} <span className="text-focus-in">Breakdown</span></h2>
                        <div className="breakdown-total-badge">
                            Total: {formatCurrencyNoDecimals(totalFilteredValue)} ({totalFilteredCount} Unique Orders)
                        </div>
                    </div>
                    <button className="modal-close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body breakdown-body">
                    <div className="breakdown-controls">
                        <div className="search-bar-container professional-search">
                            {Icons.search}
                            <input 
                                type="text" 
                                placeholder="Filter by Order No, Customer, or Country..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="table-wrapper breakdown-table-wrapper">
                        <table className="breakdown-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Order No</th>
                                    <th>{dateHeader}</th>
                                    {currentUser === 'admin' && <th>Clients Name</th>}
                                    {currentUser === 'admin' && <th>Country</th>}
                                    <th className="text-right">Qty</th>
                                    <th className="text-right">Export Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length > 0 ? (
                                    filtered.map((row, idx) => (
                                        <tr key={idx} style={{ animationDelay: `${idx * 0.03}s` }}>
                                            <td className="text-color-muted" style={{ width: '40px' }}>{idx + 1}</td>
                                            <td>
                                                <span className="order-pill">{row.orderNo}</span>
                                            </td>
                                            <td className="text-color-muted">{formatDateDDMMMYY(row.date)}</td>
                                            {currentUser === 'admin' && <td className="font-medium">{row.customer}</td>}
                                            {currentUser === 'admin' && <td className="text-color-muted">{row.country}</td>}
                                            <td className="text-right font-medium">{formatNumber(row.qty)}</td>
                                            <td className="text-right font-bold value-highlight">
                                                {formatCurrency(row.value)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={currentUser === 'admin' ? 7 : 5} className="text-center no-results">
                                            No matching orders found for "{searchTerm}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};


const SalesByCountryChart = ({ data, onFilter, activeFilters }: { data: OrderData[], onFilter: (filter: Filter) => void, activeFilters: Filter[] | null }) => {
    const chartData = useMemo(() => {
        const countryData = data.reduce<Record<string, { name: string; value: number; qty: number }>>((acc, curr) => {
            if (curr.country) {
              const key = curr.country.trim().toLowerCase();
              if (!acc[key]) {
                  acc[key] = { name: curr.country.trim(), value: 0, qty: 0 };
              }
              acc[key].value += curr.exportValue;
              acc[key].qty += curr.qty;
            }
            return acc;
        }, {});
        return Object.values(countryData)
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [data]);

    const activeStatus = useMemo(() => {
        const statusFilter = activeFilters?.find(f => f.type === 'status');
        if (!statusFilter) return 'Total Received';
        const val = statusFilter.value.toUpperCase();
        if (val === 'SHIPPED') return 'Shipment';
        if (val === 'PLAN') return 'In Process';
        return 'Filtered Received';
    }, [activeFilters]);

    const handleClick = (payload: any) => {
        if (!payload || !payload.name) return;
        const countryName = payload.name;
        onFilter({ type: 'country', value: countryName, source: 'countryChart' });
    };

    interface CountryTooltipPayloadItem {
      value: number;
      payload: { qty: number };
    }
    const CustomCountryTooltip = ({ active, payload, label }: { active?: boolean; payload?: CountryTooltipPayloadItem[]; label?: string; }) => {
        if (active && payload && payload.length) {
          return (
            <div className="recharts-default-tooltip" style={{padding: '0.5rem 1rem', backgroundColor: 'var(--card-background)', border: '1px solid var(--card-border)'}}>
              <p style={{margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--text-color)'}}>{label}</p>
              <p style={{margin: 0, color: 'var(--text-color)'}}>{`${activeStatus} Value: ${formatCurrency(payload[0].value)}`}</p>
              <p style={{margin: 0, color: 'var(--text-color-muted)'}}>{`Total Qty: ${formatNumber(payload[0].payload.qty)}`}</p>
            </div>
          );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 30, right: 20, left: 30, bottom: 40 }} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" />
                <XAxis dataKey="name" stroke={'var(--text-color-muted)'} tick={{ fontSize: 11 }} interval={0} angle={-35} textAnchor="end" />
                <YAxis stroke={'var(--text-color-muted)'} tickFormatter={formatCompactNumber}/>
                <Tooltip 
                    cursor={{fill: 'var(--tooltip-cursor)'}} 
                    content={<CustomCountryTooltip />}
                />
                <Bar dataKey="value" onClick={(data) => handleClick(data.payload)} animationDuration={800} animationEasing="ease-out">
                    {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          cursor="pointer"
                          fill={activeFilters?.some(f => f.type === 'country' && f.value.toLowerCase() === entry.name.toLowerCase()) ? 'var(--primary-accent-active)' : 'var(--primary-accent)'} 
                        />
                    ))}
                    <LabelList dataKey="value" position="top" formatter={formatCompactNumber} fill="var(--text-color)" fontSize={12} fontWeight="bold" />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
};

const OrdersOverTimeChart = ({ data, onFilter, activeFilters, selectedPeriod }: { data: OrderData[], onFilter: (filter: Filter) => void, activeFilters: Filter[] | null, selectedPeriod: string }) => {
    const chartData = useMemo(() => {
        const monthData = Array.from({ length: 12 }, () => ({ value: 0, orders: new Set<string>() }));
        
        let targetYearSuffix: string | null = null;
        if (selectedPeriod !== 'All') {
            const match = selectedPeriod.match(/Dec-(.*)/);
            if (match) {
                targetYearSuffix = match[1];
            }
        }

        const statusFilter = activeFilters.find(f => f.type === 'status');
        const isShippedFiltered = statusFilter && statusFilter.value.toUpperCase() === 'SHIPPED';

        for (const item of data) {
            const status = (item.originalStatus || item.status || '').toUpperCase();
            const isPlan = status === 'PLAN';
            const isShipped = status === 'SHIPPED' || status === 'COMPLETE';
            
            if (!isPlan && !isShipped) continue;

            const dateToBucket = isShippedFiltered ? item.stuffingMonth : item.orderDate;
            if (dateToBucket) {
                const date = parseDate(dateToBucket);
                if (date) {
                    const matchesYear = !targetYearSuffix || date.getFullYear() === (2000 + parseInt(targetYearSuffix, 10));
                    if (!matchesYear) continue;

                    const monthIndex = date.getMonth();
                    monthData[monthIndex].value += item.exportValue > 0 ? item.exportValue : 0;
                    if (item.orderNo) {
                        monthData[monthIndex].orders.add(item.orderNo);
                    }
                }
            }
        }

        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthOrder.map((month, index) => ({
            name: month,
            value: monthData[index].value,
            orderCount: monthData[index].orders.size,
        }));
    }, [data, selectedPeriod, activeFilters]);

    const handleDotClickAction = (payload: any) => {
        if (!payload || !payload.name || payload.value === 0) return;
        const monthName = payload.name;
        onFilter({ type: 'month', value: monthName, source: 'monthChart' });
    };

    const dotRenderer = (props: any) => {
        const { cx, cy, stroke, payload } = props;
        if (payload.value === 0) return null;

        const isActive = activeFilters && activeFilters.some(f => f.type === 'month' && f.value === payload.name);
        
        const handleClick = () => {
            handleDotClickAction(payload);
        };

        return (
            <circle
                cx={cx}
                cy={cy}
                r={isActive ? 8 : 5}
                fill={stroke}
                stroke={isActive ? 'var(--dot-active-stroke)' : 'none'}
                strokeWidth={2}
                onClick={handleClick}
                style={{ cursor: 'pointer', transition: 'r 0.2s ease, stroke 0.2s ease' }}
            />
        );
    };
    
    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string; }) => {
        if (active && payload && payload.length && payload[0].value > 0) {
          return (
            <div className="recharts-default-tooltip" style={{padding: '0.5rem 1rem', backgroundColor: 'var(--card-background)', border: '1px solid var(--card-border)'}}>
              <p style={{margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--text-color)'}}>{label}</p>
              <p style={{margin: 0, color: 'var(--secondary-accent)'}}>{`Value: ${formatCurrency(payload[0].value)}`}</p>
              <p style={{margin: 0, color: 'var(--text-color-muted)'}}>{`Orders: ${payload[0].payload.orderCount}`}</p>
            </div>
          );
        }
        return null;
    };

     return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 30, right: 20, left: -10, bottom: 5 }}>
                 <defs>
                    <linearGradient id="colorValue" x1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--secondary-accent)" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="var(--secondary-accent)" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" />
                <XAxis dataKey="name" stroke={'var(--text-color-muted)'} />
                <YAxis stroke={'var(--text-color-muted)'} tickFormatter={formatCompactNumber} />
                <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{fill: 'var(--tooltip-cursor)'}}
                />
                <Line type="monotone" dataKey="value" name="Order Value" stroke="var(--secondary-accent)" strokeWidth={3} animationDuration={800} animationEasing="ease-out" dot={dotRenderer} activeDot={{ r: 8 }}>
                    <LabelList dataKey="value" position="top" formatter={(val: number) => val > 0 ? formatCompactNumber(val) : ''} fill="var(--text-color)" fontSize={16} fontWeight="bold" />
                </Line>
                <Area type="monotone" dataKey="value" stroke="none" fill="url(#colorValue)" />
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
      <div className="main">
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
      </div>
    </div>
  );

const UserManagement = ({ allClientNames, currentCredentials, onClose, onCredentialsUpdate }: { allClientNames: string[], currentCredentials: Record<string, string>, onClose: () => void, onCredentialsUpdate: () => void }) => {
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
            setSaveMessage(result.message || 'Credentials saved successfully! The data has been updated.');
            onCredentialsUpdate();
            
            setTimeout(() => {
                setSelectedClient('');
                setApiKey('');
                setSaveStatus('idle');
                setSaveMessage('');
            }, 3000);
    
        } catch (error) {
            console.error('Failed to save credentials:', error);
            setSaveStatus('error');
            let errorMessage = 'An unknown error occurred. This could be a CORS issue. Please check the browser console.';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else {
                errorMessage = String(error);
            }
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
            <div className="main">
                <div className="user-management-form-container">
                    <h2>Add/Update User API Key</h2>
                    <p>Select a client to view, generate, or update their API key.</p>
                    <div className="form-group">
                        <label htmlFor="client-select">Client Name</label>
                        <div className="select-container">
                             <select 
                                id="client-select" 
                                value={selectedClient} 
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedClient(e.target.value)}
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
                                {apiKey ? 'Regenerate Key' : 'Generate Key'}
                             </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="form-actions">
                            <button
                                className="save-button"
                                onClick={handleSave}
                                disabled={saveStatus === 'saving' || !selectedClient || !apiKey}
                            >
                                {saveStatus === 'saving' ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                    {saveMessage && (
                        <div className={`save-status-container ${saveStatus}`}>
                            {saveMessage}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ThemeToggles = ({ theme, isEyeProtection, onThemeChange, onEyeProtectionChange }: any) => {
    return (
        <div className="theme-toggles-container">
            <label className="toggle-switch" title="Toggle Eye Protection">
                <input type="checkbox" checked={isEyeProtection} onChange={onEyeProtectionChange} />
                <span className="slider eye">{Icons.eye}</span>
            </label>
            <label className="toggle-switch" title="Toggle Light/Dark Theme">
                <input type="checkbox" checked={theme === 'dark'} onChange={onThemeChange} />
                <span className="slider theme">
                    {theme === 'light' ? Icons.sun : Icons.moon}
                </span>
            </label>
        </div>
    );
};

const AnnouncementsPanel = ({ announcements, onClose, buttonRef }: any) => {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                panelRef.current && !panelRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose, buttonRef]);

    return (
        <div className="announcements-panel" ref={panelRef}>
            <div className="announcements-header">
                <h3>What's New</h3>
            </div>
            <div className="announcements-body">
                {announcements.slice().reverse().map((ann: any) => ( 
                    <div key={ann.id} className="announcement-item">
                        <h4>{ann.title}</h4>
                        <span>{ann.date}</span>
                        <div className="announcement-description">
                            {ann.description.split('\n').map((line: string, i: number) => (
                                <React.Fragment key={i}>
                                    {line.trim().startsWith('-') ? (
                                        <ul><li>{line.substring(1).trim()}</li></ul>
                                    ) : (
                                        <>{line}<br/></>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const App = () => {
  const [data, setData] = useState<OrderData[]>([]);
  const [masterProductList, setMasterProductList] = useState<MasterProductData[]>([]);
  const [stepData, setStepData] = useState<StepData[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(null);
  const [userCredentials, setUserCredentials] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState('admin');
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [drillDownState, setDrillDownState] = useState({
      level: 1,
      baseOrder: null as string | null,
      subOrder: null as string | null,
      hasSubOrders: false
  });
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<string | null>(null);
  const [showNeverBought, setShowNeverBought] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [adminViewMode, setAdminViewMode] = useState<'dashboard' | 'table'>('dashboard');
  const [mainViewMode, setMainViewMode] = useState<'dashboard' | 'calendar'>('dashboard');
  const [theme, setTheme] = useState('light');
  const [isEyeProtection, setIsEyeProtection] = useState(false);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  const [hasUnreadAnnouncements, setHasUnreadAnnouncements] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const announcementsButtonRef = useRef<HTMLButtonElement>(null);
  
  const [valueBreakdown, setValueBreakdown] = useState<{ title: string, data: BreakdownItem[] } | null>(null);

  const handleThemeChange = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleEyeProtectionChange = () => {
    setIsEyeProtection(prev => {
        const newState = !prev;
        if (newState) {
            document.body.classList.add('eye-protection-mode');
        } else {
            document.body.classList.remove('eye-protection-mode');
        }
        return newState;
    });
  };

  const clientFilteredData = useMemo(() => {
    let filtered = currentUser === 'admin' ? data : data.filter(d => d.customerName === currentUser);
    return filtered;
  }, [data, currentUser]);

  const aiData = useMemo(() => {
    if (authenticatedUser === 'admin') {
        if (currentUser === 'admin') return data;
        return data.filter(d => d.customerName === currentUser);
    }
    return data.filter(d => d.customerName === authenticatedUser);
  }, [data, currentUser, authenticatedUser]);

  const checkHasSubOrders = useCallback((baseOrderNo: string) => {
      if (!baseOrderNo) return false;
      const products = data.filter(row => getBaseOrderNo(row.orderNo) === baseOrderNo);
      const uniqueOrderNos = [...new Set(products.map(p => p.orderNo.toUpperCase()))];
      return uniqueOrderNos.length > 1 || (uniqueOrderNos.length === 1 && uniqueOrderNos[0] !== baseOrderNo);
  }, [data]);

  const handleRowDoubleClick = (row: any) => {
      if (drillDownState.level === 1) {
          if (row.hasSubOrders) {
              setDrillDownState({ level: 2, baseOrder: row.baseOrderNo, subOrder: null, hasSubOrders: true });
          } else {
              setDrillDownState({ level: 3, baseOrder: row.baseOrderNo, subOrder: row.singleOrderNo, hasSubOrders: false });
          }
      } else if (drillDownState.level === 2) {
          const status = row.originalStatus?.toUpperCase();
          if (status === 'SHIPPED' || status === 'COMPLETE' || status === 'PLAN') {
              setDrillDownState({ level: 3, baseOrder: drillDownState.baseOrder, subOrder: row.orderNo, hasSubOrders: true });
          }
      }
  };

  const handleDrillUp = () => {
      if (drillDownState.level === 3) {
          if (drillDownState.baseOrder && drillDownState.hasSubOrders) {
              setDrillDownState({ level: 2, baseOrder: drillDownState.baseOrder, subOrder: null, hasSubOrders: true });
          } else {
              setDrillDownState({ level: 1, baseOrder: null, subOrder: null, hasSubOrders: false });
          }
      } else if (drillDownState.level === 2) {
          setDrillDownState({ level: 1, baseOrder: null, subOrder: null, hasSubOrders: false });
      }
  };
    
  const refetchCredentials = async () => {
    const sheetId = '1JbxRqsZTDgmdlJ_3nrumfjPvjGVZdjJe43FPrh9kYw4';
    const apiKeySheetGid = '817322209';
    const apiKeySheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?gid=${apiKeySheetGid}`;

    try {
        const apiKeyResponse = await fetch(apiKeySheetUrl);
        if (!apiKeyResponse.ok) {
            console.warn("Failed to refetch API keys.");
            return;
        }

        const apiKeyText = await apiKeyResponse.text();
        const match = apiKeyText.match(/{.*}/s);
        if (match) {
            const json: any = JSON.parse(match[0]);
            if (json.status === 'ok') {
                const fetchedCredentials: Record<string, string> = {};
                json.table.rows.forEach((r: any) => {
                    const name: string = String(r.c?.[0]?.v || '').trim();
                    const key: string = String(r.c?.[1]?.v || '').trim();
                    if (name && key) {
                        fetchedCredentials[name] = key;
                    }
                });
                setUserCredentials(fetchedCredentials);
            }
        }
    } catch (e) {
        console.error("Error refetching credentials:", e);
    }
  };

  const fetchData = async (isInitial: boolean) => {
    const sheetId = '1JbxRqsZTDgmdlJ_3nrumfjPvjGVZdjJe43FPrh9kYw4';
    const liveQuery = encodeURIComponent("SELECT *");
    
    const liveSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=Live&range=A1:W&tq=${liveQuery}`;
    const masterSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=MASTER`;
    const apiKeySheetGid = '817322209';
    const apiKeySheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?gid=${apiKeySheetGid}`;
    const stepSheetGid = '2023445010';
    const stepSheetRange = 'A1:M';
    const stepQuery = encodeURIComponent('SELECT *');
    const stepSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?gid=${stepSheetGid}&range=${stepSheetRange}&tq=${stepQuery}`;
    const paymentTermsSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=Payments%20Terms&range=A2:D`;

    if (isInitial) {
        setLoading(true);
    }

    try {
      const [liveResponse, masterResponse, apiKeyResponse, stepResponse, pTermsResponse] = await Promise.all([
        fetch(liveSheetUrl),
        fetch(masterSheetUrl),
        fetch(apiKeySheetUrl).catch(e => { console.warn("API Key sheet fetch failed, proceeding without it."); return null; }),
        fetch(stepSheetUrl).catch(e => { console.warn("Step sheet fetch failed, proceeding without it."); return null; }),
        fetch(paymentTermsSheetUrl).catch(e => { console.warn("Payment Terms fetch failed"); return null; }),
      ]);

      if (!liveResponse.ok) throw new Error(`HTTP error! status: ${liveResponse.status} on Live sheet`);
      if (!masterResponse.ok) throw new Error(`HTTP error! status: ${masterResponse.status} on MASTER sheet`);

      const liveText = await liveResponse.text();
      const masterText = await masterResponse.text();

      const liveHeaderMapping = {
          'Status': 'status', 'ORDER FORWARDING DATE': 'orderDate', 'Stuffing Month': 'stuffingMonth',
          'Order Number': 'orderNo', 'Client': 'customerName', 'Country': 'country',
          'Products Code': 'productCode', 'Qty': 'qty', 'Export Value': 'exportValue',
          'Logo Image': 'logoUrl', 'Category': 'category', 'Segment': 'segment',
          'Product': 'product', 'Image Link': 'imageLink', 'Unit Price': 'unitPrice',
          'Fob Price': 'fobPrice', 'MOQ': 'moq', 'Month': 'forwardingMonth', 'FY': 'fy',
          'Stuffing Date': 'stuffingDate',
          'ETD/ SOB': 'etd',
          'ETA': 'eta',
          'Commercial Invoice No': 'commercialInvoiceNo'
      };
      const parsedLiveDataWithoutFyFallback: OrderData[] = parseGvizResponse(liveText, liveHeaderMapping, ['orderNo']);

      const parsedLiveData = parsedLiveDataWithoutFyFallback.map(order => {
          let fy = order.fy;
          if (!fy || fy.toLowerCase() === '#n/a' || fy.trim() === '') {
               fy = '25-26';
          }
          return { ...order, fy };
      });

      const masterHeaderMapping = {
          'Category': 'category', 'Segment': 'segment', 'Product': 'product',
          'Products Code': 'productCode', 'Image Link': 'imageLink', 'Customer Name': 'customerName',
          'Country': 'country', 'Fob Price': 'fobPrice', 'Moq Qty': 'moq'
      };
      const parsedMasterData: MasterProductData[] = parseGvizResponse(masterText, masterHeaderMapping, ['productCode']);
      
      let parsedStepData: StepData[] = [];
      if (stepResponse && stepResponse.ok) {
          const stepText = await stepResponse.text();
          const match = stepText.match(/{.*}/s);
          if (match) {
              const json: any = JSON.parse(match[0]);
              if (json.status === 'ok') {
                  parsedStepData = json.table.rows.map((r: any) => ({
                      orderNo: String(r.c?.[0]?.v || '').trim(),
                      productionDate: String(r.c?.[1]?.v || '').trim(),
                      productionStatus: String(r.c?.[2]?.v || '').trim(),
                      sobDate: String(r.c?.[3]?.v || '').trim(),
                      sobStatus: String(r.c?.[4]?.v || '').trim(),
                      paymentPlannedDate: String(r.c?.[5]?.v || '').trim(),
                      paymentStatus: String(r.c?.[6]?.v || '').trim(),
                      qualityCheckPlannedDate: String(r.c?.[7]?.v || '').trim(),
                      qualityCheck1Url: String(r.c?.[8]?.v || '').trim(),
                      qualityCheck2Url: String(r.c?.[9]?.v || '').trim(),
                      qualityCheck3Url: String(r.c?.[10]?.v || '').trim(),
                      qualityCheck4Url: String(r.c?.[11]?.v || '').trim(),
                      qualityCheckStatus: String(r.c?.[12]?.v || '').trim(),
                  } as StepData)).filter((row: StepData) => row.orderNo && row.orderNo.toLowerCase() !== '#n/a');
              }
          }
      }
      
      let parsedPTerms: PaymentTermData[] = [];
      if (pTermsResponse && pTermsResponse.ok) {
          const pText = await pTermsResponse.text();
          const pMatch = pText.match(/{.*}/s);
          if (pMatch) {
              const json: any = JSON.parse(pMatch[0]);
              if (json.status === 'ok') {
                  parsedPTerms = json.table.rows.map((r: any) => ({
                      client: String(r.c?.[0]?.v || '').trim(),
                      country: String(r.c?.[1]?.v || '').trim(),
                      paymentTerm: String(r.c?.[2]?.v || '').trim(),
                      dueDateRule: String(r.c?.[3]?.v || '').trim()
                  } as PaymentTermData)).filter((row: PaymentTermData) => row.client && row.client.toLowerCase() !== '#n/a');
              }
          }
      }
      setPaymentTerms(parsedPTerms);

      const stepDataMap = new Map<string, StepData>(parsedStepData.map(d => [d.orderNo, d]));

      const processedLiveData = parsedLiveData.map(order => {
          const stepInfo = stepDataMap.get(order.orderNo);
          let updatedStatus = order.status;
          const originalStatus = order.status; 

          if (stepInfo) {
              const sobDone = (stepInfo.sobStatus?.toLowerCase() === 'yes' || stepInfo.sobStatus?.toLowerCase() === 'done');
              const qualityDone = (stepInfo.qualityCheckStatus?.toLowerCase() === 'yes' || stepInfo.qualityCheckStatus?.toLowerCase() === 'done');
              const productionDone = (stepInfo.productionStatus?.toLowerCase() === 'yes' || stepInfo.productionStatus?.toLowerCase() === 'done');
              const paymentDone = (stepInfo.paymentStatus?.toLowerCase() === 'yes' || stepInfo.paymentStatus?.toLowerCase() === 'done');
              
              const isValidDate = (dateStr: string) => dateStr && dateStr.trim().toLowerCase() !== '#n/a' && dateStr.trim() !== '';

              if (sobDone && paymentDone && isValidDate(stepInfo.sobDate)) {
                  updatedStatus = `Complete (${stepInfo.sobDate})`;
              } else if (sobDone && isValidDate(stepInfo.sobDate)) {
                  updatedStatus = `Shipped (${stepInfo.sobDate})`;
              } else if (qualityDone && isValidDate(stepInfo.qualityCheckPlannedDate)) {
                  updatedStatus = `Quality Check (${stepInfo.qualityCheckPlannedDate})`;
              } else if (productionDone && isValidDate(stepInfo.productionDate)) {
                  updatedStatus = `Production (${stepInfo.productionDate})`;
              }
          }
          return { ...order, status: updatedStatus, originalStatus: originalStatus };
      });

      setData(processedLiveData);
      setMasterProductList(parsedMasterData);
      setStepData(parsedStepData);
      setLastUpdateTime(new Date()); 

      const fetchedCredentials: Record<string, string> = {};
      if (apiKeyResponse && apiKeyResponse.ok) {
          const apiKeyText = await apiKeyResponse.text();
          const match = apiKeyText.match(/{.*}/s);
          if (match) {
              const json: any = JSON.parse(match[0]);
              if (json.status === 'ok') {
                  json.table.rows.forEach((r: any) => {
                      const name: string = String(r.c?.[0]?.v || '').trim();
                      const key: string = String(r.c?.[1]?.v || '').trim();
                      if (name && key) {
                          fetchedCredentials[name] = key;
                      }
                  });
              }
          }
      }
      
      const allCredentials: Record<string, string> = { ...fetchedCredentials };
      setUserCredentials(allCredentials);

      if (isInitial) {
        const savedName = localStorage.getItem('dashboard_username');
        const savedKey = localStorage.getItem('dashboard_apikey');

        let isAutoLoginValid = false;
        if (savedName && savedKey) {
            const nameToCheck = String(savedName);
            if (Object.prototype.hasOwnProperty.call(allCredentials, nameToCheck)) {
                if (allCredentials[nameToCheck] === savedKey) {
                    isAutoLoginValid = true;
                }
            }
        }

        if (isAutoLoginValid && savedName) {
          setAuthenticatedUser(savedName);
          setCurrentUser(savedName);
        } else if (savedName) {
          localStorage.removeItem('dashboard_username');
          localStorage.removeItem('dashboard_apikey');
        }
      }

    } catch (e) {
      console.error("Failed to fetch or parse sheet data:", e);
      if (isInitial) {
        let errorMessage = 'An unknown error occurred.';
        if (e instanceof Error) {
            errorMessage = e.message;
        } else {
            errorMessage = String(e);
        }
        setError(`Failed to load live data. Error: ${errorMessage}`);
      }
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const lastReadId = localStorage.getItem('dashboard_last_announcement_id');
    const latestId = ANNOUNCEMENTS[ANNOUNCEMENTS.length - 1]?.id;
    if (latestId && lastReadId !== latestId) {
        setHasUnreadAnnouncements(true);
    }

    // Initial load
    fetchData(true);

    // Setup 60-second background refresh interval
    const intervalId = setInterval(() => {
        fetchData(false);
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);
  
  const handleLogin = (name: string, key: string): boolean => {
    const loginName = String(name);
    
    if (userCredentials && Object.prototype.hasOwnProperty.call(userCredentials, loginName)) {
        if (userCredentials[loginName] === key) {
            localStorage.setItem('dashboard_username', loginName);
            localStorage.setItem('dashboard_apikey', key);
            setAuthenticatedUser(loginName);
            setCurrentUser(loginName);
            return true;
        }
    }
    return false;
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
  };

  const handleToggleAnnouncements = () => {
      setIsAnnouncementsOpen(prev => {
          const newIsOpen = !prev;
          if (newIsOpen) {
              setHasUnreadAnnouncements(false);
              const latestId = ANNOUNCEMENTS[ANNOUNCEMENTS.length - 1]?.id;
              if (latestId) {
                  localStorage.setItem('dashboard_last_announcement_id', latestId);
              }
          }
          return newIsOpen;
      });
  };

  const clientLogos = useMemo(() => data.reduce<Record<string, string>>((acc, row) => {
    if (row.customerName && row.logoUrl && !acc[row.customerName]) {
      acc[row.customerName] = row.logoUrl;
    }
    return acc;
  }, {}), [data]);

  const clientList = useMemo(() => ['admin', ...new Set(data.map(d => d.customerName).filter(name => name && name.trim()))], [data]);

  const periodOptions = useMemo(() => {
    const fySet = new Set<string>();
    data.forEach(d => {
        if (d.fy) fySet.add(d.fy);
    });

    const sortedFYs = Array.from(fySet).sort((a, b) => b.localeCompare(a));
    const options = sortedFYs.map(fy => {
        const displayYear = fy.includes('-') ? fy.split('-')[1] : fy;
        return `Jan to Dec-${displayYear}`;
    }).filter(opt => !opt.endsWith('-27'));

    return ['All', ...options];
  }, [data]);
  
  const searchedData = useMemo(() => {
    if (!searchQuery.trim()) return clientFilteredData;
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    
    return clientFilteredData.filter(d => {
        const shippedDate = formatDateDDMMMYY(d.stuffingMonth).toLowerCase();
        const statusMatch = (d.status && d.status.toLowerCase().includes(lowercasedQuery)) || (d.originalStatus && d.originalStatus.toLowerCase().includes(lowercasedQuery));
        const orderMatch = d.orderNo && d.orderNo.toLowerCase().includes(lowercasedQuery);

        const productMatch = (d.product && d.product.toLowerCase().includes(lowercasedQuery));
        const codeMatch = (d.productCode && d.productCode.toLowerCase().includes(lowercasedQuery));
        const categoryMatch = (d.category && d.category.toLowerCase().includes(lowercasedQuery));

        if (currentUser === 'admin') {
            const clientMatch = d.customerName && d.customerName.toLowerCase().includes(lowercasedQuery);
            const countryMatch = d.country && d.country.toLowerCase().includes(lowercasedQuery);
            
            return (
                statusMatch ||
                shippedDate.includes(lowercasedQuery) ||
                orderMatch ||
                clientMatch ||
                countryMatch ||
                productMatch || codeMatch || categoryMatch
            );
        } else { 
            return (
                statusMatch ||
                shippedDate.includes(lowercasedQuery) ||
                orderMatch ||
                productMatch || codeMatch || categoryMatch
            );
        }
    });
  }, [clientFilteredData, searchQuery, currentUser]);

  const getOrderContextForKPI = useCallback((type: 'received' | 'shipped', ignoreStatus: boolean = false) => {
    let baseData = currentUser === 'admin' ? data : data.filter(d => d.customerName === currentUser);

    const countryFilter = activeFilters.find(f => f.type === 'country');
    if (countryFilter) {
        baseData = baseData.filter(d => d.country?.trim().toLowerCase() === countryFilter.value.trim().toLowerCase());
    }

    if (!ignoreStatus) {
        const statusFilter = activeFilters.find(f => f.type === 'status');
        if (statusFilter) {
            const val = statusFilter.value.toUpperCase();
            baseData = baseData.filter(item => {
                if (statusFilter.source === 'kpi') {
                    return item.originalStatus?.toUpperCase() === val;
                }
                return item.status.toUpperCase().startsWith(val);
            });
        }
    }

    const sDate = startDate ? parseDate(startDate) : null;
    const eDate = endDate ? parseDate(endDate) : null;
    const hasDateRange = !!(sDate || eDate);
    if (sDate) sDate.setHours(0, 0, 0, 0);
    if (eDate) eDate.setHours(23, 59, 59, 999);

    const isinRange = (dateStr: string) => {
         const d = parseDate(dateStr);
         if (!d) return false;
         return (!sDate || d >= sDate) && (!eDate || d <= eDate);
    };

    let targetYearSuffix: string | null = null;
    if (selectedPeriod !== 'All') {
        const match = selectedPeriod.match(/Dec-(.*)/);
        if (match) {
            targetYearSuffix = match[1];
        }
    }

    const isTimeFiltered = selectedPeriod !== 'All' || hasDateRange || selectedMonth !== 'All';

    return baseData.filter(row => {
        const status = (row.originalStatus || '').toUpperCase();
        const isActuallyShipped = status === 'SHIPPED' || status === 'COMPLETE';

        const dateToUse = type === 'shipped' ? row.stuffingMonth : row.orderDate;
        const dateObj = parseDate(dateToUse);
        
        if (!isTimeFiltered) {
            if (type === 'received') return true;
            return isActuallyShipped;
        }

        if (!dateObj) return false;

        const matchesYear = !targetYearSuffix || dateObj.getFullYear() === (2000 + parseInt(targetYearSuffix, 10));
        
        let matchesMonth = true;
        if (selectedMonth !== 'All') {
            matchesMonth = dateObj.getMonth() === MONTH_NAMES_SHORT.indexOf(selectedMonth);
        }
        
        const inStatusScope = (type === 'received') ? true : isActuallyShipped;

        if (hasDateRange) {
            return isinRange(dateToUse) && inStatusScope && matchesMonth;
        } else {
            return matchesYear && inStatusScope && matchesMonth;
        }
    });
  }, [data, currentUser, selectedPeriod, selectedMonth, startDate, endDate, activeFilters]);

  const kpiConsistentData = useMemo(() => {
    let filtered = currentUser === 'admin' ? data : data.filter(d => d.customerName === currentUser);

    const statusFilter = activeFilters.find(f => f.type === 'status');
    
    const sDate = startDate ? parseDate(startDate) : null;
    const eDate = endDate ? parseDate(endDate) : null;
    const hasDateRange = !!(sDate || eDate);
    if (sDate) sDate.setHours(0, 0, 0, 0);
    if (eDate) eDate.setHours(23, 59, 59, 999);

    let targetYearSuffix: string | null = null;
    if (selectedPeriod !== 'All') {
        const match = selectedPeriod.match(/Dec-(.*)/);
        if (match) {
            targetYearSuffix = match[1];
        }
    }

    const isTimeFiltered = selectedPeriod !== 'All' || hasDateRange || selectedMonth !== 'All';

    filtered = filtered.filter(d => {
        const status = (d.originalStatus || '').toUpperCase();
        const isActuallyShipped = status === 'SHIPPED' || status === 'COMPLETE';
        const dateToValidate = isActuallyShipped ? d.stuffingMonth : d.orderDate;
        const dateObj = parseDate(dateToValidate);

        if (isTimeFiltered) {
            if (!dateObj) return false;
            const matchesYear = !targetYearSuffix || dateObj.getFullYear() === (2000 + parseInt(targetYearSuffix, 10));
            const inDateRange = !hasDateRange || ( (!sDate || dateObj >= sDate) && (!eDate || dateObj <= eDate) );
            let matchesMonth = true;
            if (selectedMonth !== 'All') {
                matchesMonth = dateObj.getMonth() === MONTH_NAMES_SHORT.indexOf(selectedMonth);
            }
            if (!matchesYear || !inDateRange || !matchesMonth) return false;
        }

        if (statusFilter) {
            const val = statusFilter.value.toUpperCase();
            const matchesStatus = statusFilter.source === 'kpi' 
                ? d.originalStatus?.toUpperCase() === val 
                : d.status.toUpperCase().startsWith(val);
            if (!matchesStatus) return false;
        }

        return true;
    });

    const countryFilter = activeFilters.find(f => f.type === 'country');
    if (countryFilter) {
        filtered = filtered.filter(d => d.country?.trim().toLowerCase() === countryFilter.value.trim().toLowerCase());
    }
    
    return filtered;
  }, [data, currentUser, activeFilters, startDate, endDate, selectedPeriod, selectedMonth]);

    const finalFilteredData = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        return kpiConsistentData.filter(d => {
            if (!lowercasedQuery) return true;
            
            const shippedDate = formatDateDDMMMYY(d.stuffingMonth).toLowerCase();
            const statusMatch = (d.status && d.status.toLowerCase().includes(lowercasedQuery)) || (d.originalStatus && d.originalStatus.toLowerCase().includes(lowercasedQuery));
            const orderMatch = d.orderNo && d.orderNo.toLowerCase().includes(lowercasedQuery);
            const clientMatch = d.customerName && d.customerName.toLowerCase().includes(lowercasedQuery);
            const countryMatch = d.country && d.country.toLowerCase().includes(lowercasedQuery);
            const productMatch = (d.product && d.product.toLowerCase().includes(lowercasedQuery));
            const codeMatch = (d.productCode && d.productCode.toLowerCase().includes(lowercasedQuery));
            const categoryMatch = (d.category && d.category.toLowerCase().includes(lowercasedQuery));

            return statusMatch || shippedDate.includes(lowercasedQuery) || orderMatch || clientMatch || countryMatch || productMatch || codeMatch || categoryMatch;
        });
    }, [kpiConsistentData, searchQuery]);
  
  const neverBoughtForClientData = useMemo(() => {
    if (masterProductList.length === 0) return [];

    if (currentUser === 'admin') {
        const uniqueProducts = new Map<string, MasterProductData>();
        masterProductList.forEach(p => {
            if (p.productCode && !uniqueProducts.has(p.productCode)) {
                uniqueProducts.set(p.productCode, p);
            }
        });
        return Array.from(uniqueProducts.values());
    }

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


  const kpis = useMemo(() => {
    const receivedOrdersData = getOrderContextForKPI('received', true);
    const shippedOrdersData = getOrderContextForKPI('shipped', true);
    const planOrdersData = receivedOrdersData.filter(d => (d.originalStatus || '').toUpperCase() === 'PLAN');

    const receivedOrdersSet = new Set(receivedOrdersData.map(d => d.orderNo.toUpperCase()));
    const inProcessOrdersSet = new Set(planOrdersData.map(d => d.orderNo.toUpperCase()));
    const shippedOrdersSet = new Set(shippedOrdersData.map(d => d.orderNo.toUpperCase()));
    
    const totalOrderValue = receivedOrdersData.reduce((sum, d) => sum + (d.exportValue || 0), 0);
    const totalShipmentValue = shippedOrdersData.reduce((sum, d) => sum + (d.exportValue || 0), 0);
    const totalPlanValue = planOrdersData.reduce((sum, d) => sum + (d.exportValue || 0), 0);
    
    const statusFilter = activeFilters.find(f => f.type === 'status');
    let unitsDataForTotal = receivedOrdersData;
    if (statusFilter) {
        const val = statusFilter.value.toUpperCase();
        if (val === 'SHIPPED') unitsDataForTotal = shippedOrdersData;
        else if (val === 'PLAN') unitsDataForTotal = planOrdersData;
    }
    const totalUnits = new Set(unitsDataForTotal.map(d => d.productCode).filter(Boolean)).size;

    return {
      totalValue: formatCurrencyNoDecimals(totalOrderValue),
      totalShipmentValue: formatCurrencyNoDecimals(totalShipmentValue),
      totalPlanValue: formatCurrencyNoDecimals(totalPlanValue),
      totalOrders: receivedOrdersSet.size,
      totalInProcess: inProcessOrdersSet.size,
      totalShipped: shippedOrdersSet.size,
      boughtProducts: totalUnits, 
      activeClients: new Set(receivedOrdersData.map(item => item.customerName)).size,
      neverBoughtCount: neverBoughtForClientData.length,
      rawForwarding: receivedOrdersData,
      rawShipped: shippedOrdersData,
      rawPlan: planOrdersData
    };
  }, [getOrderContextForKPI, neverBoughtForClientData, activeFilters]);

  const handleKpiBreakdown = (type: 'forwarding' | 'shipment' | 'received' | 'plan') => {
      let sourceData;
      if (type === 'forwarding' || type === 'received') sourceData = kpis.rawForwarding;
      else if (type === 'shipment') sourceData = kpis.rawShipped;
      else sourceData = kpis.rawPlan;

      const resultsMap = new Map<string, BreakdownItem>();
      
      sourceData.forEach(curr => {
          const uniqueKey = curr.orderNo.toUpperCase();
          const dateSource = (type === 'forwarding' || type === 'received' || type === 'plan') ? curr.orderDate : curr.stuffingMonth;
          
          if (!resultsMap.has(uniqueKey)) {
              resultsMap.set(uniqueKey, {
                  orderNo: curr.orderNo,
                  date: dateSource,
                  customer: curr.customerName,
                  country: curr.country,
                  value: 0,
                  qty: 0
              });
          }
          const item = resultsMap.get(uniqueKey)!;
          item.value += curr.exportValue;
          item.qty += curr.qty;
      });
      
      let modalTitle = 'Breakdown';
      if (type === 'forwarding') modalTitle = 'Order Forwarding Value';
      else if (type === 'shipment') modalTitle = 'Shipment Order Value';
      else if (type === 'received') modalTitle = 'Total Orders Received';
      else if (type === 'plan') modalTitle = 'In Process Value';

      setValueBreakdown({
          title: modalTitle,
          data: Array.from(resultsMap.values()).sort((a, b) => b.value - a.value)
      });
  };

  const handleKpiStatusFilter = (status: 'PLAN' | 'SHIPPED' | 'RECEIVED') => {
      if (status === 'RECEIVED') {
          setActiveFilters(prev => prev.filter(f => f.type !== 'status'));
          return;
      }
      handleFilter({ type: 'status', value: status, source: 'kpi' });
  };

  const relevantCatalogData = useMemo(() => {
    if (currentUser === 'admin') {
        return masterProductList;
    }
    return masterProductList.filter(p => p.customerName === currentUser);
  }, [masterProductList, currentUser]);

  const countryChartData = useMemo(() => {
    const countryData = kpiConsistentData.reduce<Record<string, { name: string; value: number; qty: number }>>((acc, curr) => {
        if (curr.country) {
            const key = curr.country.trim().toLowerCase();
            if (!acc[key]) {
                acc[key] = { name: curr.country.trim(), value: 0, qty: 0 };
            }
            acc[key].value += curr.exportValue;
            acc[key].qty += (curr.qty || 0);
        }
        return acc;
    }, {});
    return Object.values(countryData).sort((a, b) => b.value - a.value);
  }, [kpiConsistentData]);

  const monthlyChartData = useMemo(() => {
        const monthData = Array.from({ length: 12 }, () => ({ orders: new Set<string>(), value: 0, qty: 0 }));
        
        for (const item of kpiConsistentData) {
             const status = (item.originalStatus || '').toUpperCase();
             const isShipped = status === 'SHIPPED' || status === 'COMPLETE';
             const dateToValidate = isShipped ? item.stuffingMonth : item.orderDate;
             const date = parseDate(dateToValidate);
             if (date) {
                 const monthIndex = date.getMonth();
                 monthData[monthIndex].value += (item.exportValue || 0);
                 monthData[monthIndex].qty += (item.qty || 0);
                 if (item.orderNo) monthData[monthIndex].orders.add(item.orderNo);
             }
        }

        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthOrder.map((month, index) => ({
            name: month,
            orders: monthData[index].orders.size,
            value: monthData[index].value,
            qty: monthData[index].qty
        }));
  }, [kpiConsistentData]);

    const financialYearDisplay = useMemo(() => {
        if (selectedPeriod === 'All') return 'FY:- 18-19 to 25-26';
        let display = `Period:- ${selectedPeriod}`;
        if (selectedMonth !== 'All') {
            display += ` (${selectedMonth})`;
        }
        return display;
    }, [selectedPeriod, selectedMonth]);

    const handleFilter = (filter: Filter) => {
        setActiveFilters(prevFilters => {
            const isAlreadyActive = prevFilters.some(
                f => f.type === filter.type && f.value === filter.value
            );
    
            if (isAlreadyActive) {
                return prevFilters.filter(
                    f => !(f.type === filter.type && f.value === filter.value)
                );
            } else {
                if (filter.source === 'kpi') {
                    const cleaned = prevFilters.filter(f => f.type !== 'status');
                    return [...cleaned, filter];
                }
                if (filter.source === 'countryChart') {
                    const cleaned = prevFilters.filter(f => f.type !== 'country');
                    return [...cleaned, filter];
                }
                return [...prevFilters, filter];
            }
        });
    };
    
    const handleDashboardDoubleClick = () => {
        setActiveFilters([]);
    };

    const baseOrderHasSubOrders = drillDownState.hasSubOrders ?? false;
  
  const getFinancialSummaryForTracking = (orderNo: string | null) => {
      if (!orderNo) return undefined;
      const relatedLiveRows = data.filter(d => d.orderNo === orderNo);
      const orderQty = relatedLiveRows.reduce((sum, r) => sum + r.qty, 0);
      const orderValue = relatedLiveRows.reduce((sum, r) => sum + r.exportValue, 0);

      return { orderQty, orderValue };
  };

  if (loading) return <SkeletonLoader />;
  if (error) return <div className="error">{error}</div>;

  if (!authenticatedUser) {
    const clearSavedUser = () => {
        localStorage.removeItem('dashboard_username');
        localStorage.removeItem('dashboard_apikey');
    };
    return (
        <div className="login-page-container">
            <div className="login-container">
                <LoginScreen onLogin={handleLogin} onClearSavedUser={clearSavedUser} />
            </div>
            <div className="login-video-container">
                <video autoPlay muted loop playsInline id="background-video">
                  <source src="https://bonhoeffermachines.com/en/public/images/brand-video-updated.mp4" type="video/mp4"/>
                </video>
            </div>
        </div>
    );
  }
  
  if (mainViewMode === 'calendar') {
      return <CalendarViewDashboard
        allOrderData={data}
        masterProductList={masterProductList}
        stepData={stepData}
        clientList={clientList}
        onClose={() => setMainViewMode('dashboard')}
        authenticatedUser={authenticatedUser}
        initialClientName={currentUser}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        periodOptions={periodOptions}
        selectedMonth={selectedMonth} 
        onMonthChange={setSelectedMonth} 
      />
  }

  if (showUserManagement) {
      return <UserManagement 
        allClientNames={clientList.filter(c => c !== 'admin')}
        currentCredentials={userCredentials}
        onClose={() => setShowUserManagement(false)}
        onCredentialsUpdate={refetchCredentials}
      />
  }

  if (showNeverBought) {
    return <NeverBoughtDashboard 
        allOrderData={data}
        masterProductList={masterProductList}
        stepData={stepData}
        initialClientName={currentUser}
        clientList={clientList}
        onClose={() => setShowNeverBought(false)} 
        authenticatedUser={authenticatedUser}
    />;
  }
  
  const searchPlaceholder = currentUser === 'admin'
    ? "Search Status, Date, Order, Client, Country, Product, Code, Category..."
    : "Search Status, Date, Order, Product, Code, Category...";

  const showCharts = drillDownState.level === 1 && (currentUser !== 'admin' || adminViewMode === 'dashboard');

  return (
    <>
      <div className="dashboard-container" onDoubleClick={handleDashboardDoubleClick}>
        <header>
            <div className="header-main">
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
                    <div className="title-and-fy">
                        <h1>{currentUser === 'admin' ? 'Global Operations Dashboard' : `Welcome, ${currentUser}`}</h1>
                        <div className="header-badges">
                            {financialYearDisplay && <span className="financial-year-display">{financialYearDisplay}</span>}
                            {lastUpdateTime && (
                                <span className="last-update-display">
                                    <span className="live-dot"></span>
                                    Last Update : {lastUpdateTime.toLocaleTimeString('en-GB', { hour12: false })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="header-main-actions">
                    {authenticatedUser === 'admin' && (
                        <button className="user-management-button" onClick={() => setShowUserManagement(true)}>
                            {Icons.clients} User Management
                        </button>
                    )}
                    <div className="header-actions">
                        <div className="announcements-container">
                            <button
                                ref={announcementsButtonRef}
                                className="announcements-button"
                                onClick={handleToggleAnnouncements}
                                aria-label="View announcements"
                            >
                                {Icons.bell}
                                {hasUnreadAnnouncements && <span className="notification-dot"></span>}
                            </button>
                            {isAnnouncementsOpen &&
                                <AnnouncementsPanel
                                    announcements={ANNOUNCEMENTS}
                                    onClose={() => setIsAnnouncementsOpen(false)}
                                    buttonRef={announcementsButtonRef}
                                />
                            }
                        </div>
                        <ThemeToggles
                            theme={theme}
                            isEyeProtection={isEyeProtection}
                            onThemeChange={handleThemeChange}
                            onEyeProtectionChange={handleEyeProtectionChange}
                        />
                        {authenticatedUser && (
                            <button className="logout-button" onClick={handleLogout}>
                                {Icons.logout} Logout
                            </button>
                        )}
                   </div>
                </div>
            </div>
            <div className="filters">
               <div className="date-filter-container">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                        aria-label="Start Date"
                    />
                    <span>to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                        min={startDate}
                        aria-label="End Date"
                    />
                    {(startDate || endDate) && (
                        <button className="clear-date-button" onClick={() => { setStartDate(''); setEndDate(''); }}>
                            &times;
                        </button>
                    )}
                </div>
              <div className="search-bar-container">
                  {Icons.search}
                  <input
                      type="text"
                      placeholder={searchPlaceholder}
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  />
              </div>
              <label className="view-switcher-label" htmlFor="view-switcher">Current View:</label>
               <div className="select-container">
                  <select id="view-switcher" value={currentUser} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {setCurrentUser(e.target.value); setActiveFilters([]); setDrillDownState({level: 1, baseOrder: null, subOrder: null, hasSubOrders: false}); setSearchQuery(''); setStartDate(''); setEndDate(''); setAdminViewMode('dashboard'); setSelectedPeriod('All'); setSelectedMonth('All');}} disabled={authenticatedUser !== 'admin'}>
                    {authenticatedUser === 'admin' ?
                      clientList.map(client => <option key={client} value={client}>{client === 'admin' ? 'Admin' : client}</option>)
                      : <option value={authenticatedUser}>{authenticatedUser}</option>
                    }
                  </select>
               </div>
                <label className="view-switcher-label" htmlFor="period-switcher">Period:</label>
                <div className="select-container">
                  <select id="period-switcher" value={selectedPeriod} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {setSelectedPeriod(e.target.value); setSelectedMonth('All');}}>
                    {periodOptions.map(period => <option key={period} value={period}>{period}</option>)}
                  </select>
                </div>
                {selectedPeriod !== 'All' && (
                    <>
                        <label className="view-switcher-label" htmlFor="month-switcher">Month:</label>
                        <div className="select-container">
                            <select id="month-switcher" value={selectedMonth} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMonth(e.target.value)}>
                                {['All', ...MONTH_NAMES_SHORT].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </>
                )}
                <button className="calendar-view-button" onClick={() => setMainViewMode('calendar')}>
                    {Icons.calendar} Calendar View
                </button>
               <button className="never-bought-button" onClick={() => setShowNeverBought(true)}>
                  {Icons.placeholder} Never Bought Products
               </button>
            </div>
        </header>
        <div className="main">
          <div className="kpi-container">
              <KpiCard 
                title="Order Forwarding Value" 
                value={kpis.totalValue} 
                icon="revenue" 
                activeFilters={activeFilters} 
                onDoubleClick={() => handleKpiBreakdown('forwarding')}
              />
              <KpiCard 
                title="Shipment Order Value" 
                value={kpis.totalShipmentValue} 
                icon="revenue" 
                activeFilters={activeFilters} 
                onDoubleClick={() => handleKpiBreakdown('shipment')}
              />
              <KpiCard 
                title="In Process Value" 
                value={kpis.totalPlanValue} 
                icon="revenue" 
                activeFilters={activeFilters} 
                onDoubleClick={() => handleKpiBreakdown('plan')}
              />
              <KpiCard 
                title={authenticatedUser === 'admin' ? "Total Orders Received" : "Total Orders Placed"} 
                value={formatCompactNumber(kpis.totalOrders)} 
                icon="orders" 
                activeFilters={activeFilters}
                onDoubleClick={() => handleKpiBreakdown('received')}
              />
              <KpiCard 
                title="In Process" 
                value={formatCompactNumber(kpis.totalInProcess)} 
                icon="plan" 
                onFilter={handleFilter} 
                filterType="status" 
                filterValue="PLAN" 
                activeFilters={activeFilters}
                onDoubleClick={() => handleKpiStatusFilter('PLAN')}
              />
              <KpiCard 
                title="Shipped Orders" 
                value={formatCompactNumber(kpis.totalShipped)} 
                icon="shipped" 
                onFilter={handleFilter} 
                filterType="status" 
                filterValue="SHIPPED" 
                activeFilters={activeFilters}
                onDoubleClick={() => handleKpiStatusFilter('SHIPPED')}
              />
              <KpiCard 
                title="Total No of Units" 
                value={formatCompactNumber(kpis.boughtProducts)} 
                icon="shoppingCart" 
                activeFilters={activeFilters}
                className="bought-products-kpi"
              />
              <KpiCard 
                title="Never Bought Products"
                value={formatCompactNumber(kpis.neverBoughtCount)} 
                icon="placeholder" 
                onClick={() => setShowNeverBought(true)}
                activeFilters={activeFilters}
                className="never-bought-kpi"
              />
          </div>
          <div className="view-toggle-buttons">
              {authenticatedUser === 'admin' && currentUser === 'admin' && (
                  <>
                      <button 
                          className={adminViewMode === 'dashboard' ? 'active' : ''}
                          onClick={() => setAdminViewMode('dashboard')}
                      >
                          {Icons.dashboard} Dashboard
                      </button>
                      <button 
                          className={adminViewMode === 'table' ? 'active' : ''}
                          onClick={() => setAdminViewMode('table')}
                        >
                          {Icons.table} Table
                      </button>
                  </>
              )}
              <button 
                  className="query-button-global" 
                  onClick={() => window.open('https://query-bon.vercel.app/', '_blank')}
              >
                  {Icons.search} Query Portal
              </button>
              <button 
                  className="query-button-global" 
                  onClick={() => window.open('https://top-pro-eight.vercel.app/', '_blank')}
              >
                  {Icons.box} Top Products
              </button>
          </div>

          <div className={`main-content ${!showCharts ? 'table-only-view' : 'dashboard-view'}`}>
                {showCharts && (
                    <div className="charts-container">
                        <div className={`chart-container ${activeFilters.some(f => f.source === 'countryChart') ? 'active-filter-source' : ''}`}>
                            <h3>Order Value by Country</h3>
                            <SalesByCountryChart data={kpiConsistentData} onFilter={handleFilter} activeFilters={activeFilters} />
                        </div>
                        <div className={`chart-container ${activeFilters.some(f => f.source === 'monthChart') ? 'active-filter-source' : ''}`}>
                            <h3>Monthly Order Value</h3>
                            <OrdersOverTimeChart 
                                data={kpiConsistentData} 
                                onFilter={handleFilter} 
                                activeFilters={activeFilters} 
                                selectedPeriod={selectedPeriod}
                            />
                        </div>
                    </div>
                )}
                <DataTable 
                    data={finalFilteredData} 
                    globalData={kpiConsistentData}
                    currentUser={currentUser}
                    authenticatedUser={authenticatedUser}
                    onShowTracking={setSelectedOrderForTracking}
                    stepData={stepData}
                    drillDownState={drillDownState}
                    onRowDoubleClick={handleRowDoubleClick}
                    onDrillUp={handleDrillUp}
                    baseOrderHasSubOrders={baseOrderHasSubOrders}
                    activeFilters={activeFilters}
                    paymentTerms={paymentTerms}
                />
          </div>
        </div>
      </div>
      <ChatAssistant 
          orderData={aiData} 
          catalogData={relevantCatalogData}
          stepData={stepData}
          clientName={currentUser} 
          kpis={kpis}
          countryChartData={countryChartData}
          monthlyChartData={monthlyChartData}
      />
      {selectedOrderForTracking && 
        <OrderTrackingModal 
            orderNo={selectedOrderForTracking} 
            stepData={stepData.find(d => d.orderNo === selectedOrderForTracking)}
            orderDate={data.find(d => d.orderNo === selectedOrderForTracking)?.orderDate}
            onClose={() => setSelectedOrderForTracking(null)}
            financialSummary={getFinancialSummaryForTracking(selectedOrderForTracking)}
        />
      }
      {valueBreakdown && 
        <ValueBreakdownModal 
            title={valueBreakdown.title} 
            data={valueBreakdown.data} 
            onClose={() => setValueBreakdown(null)}
            currentUser={currentUser}
        />
      }
    </>
  );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
