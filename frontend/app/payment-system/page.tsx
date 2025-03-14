'use client';

import React, { useState } from 'react';
import { CurrencyDollarIcon, CreditCardIcon, QrCodeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function PaymentSystem() {
  const [activeTab, setActiveTab] = useState('crypto');
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Payment System</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            {[
              { name: 'Cryptocurrency', key: 'crypto', icon: <CurrencyDollarIcon className="w-5 h-5 mr-2" /> },
              { name: 'NFC Payments', key: 'nfc', icon: <CreditCardIcon className="w-5 h-5 mr-2" /> },
              { name: 'QR Code', key: 'qr', icon: <QrCodeIcon className="w-5 h-5 mr-2" /> },
              { name: 'Transaction History', key: 'history', icon: <ArrowPathIcon className="w-5 h-5 mr-2" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`${
                  activeTab === tab.key
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'crypto' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Cryptocurrency Payment</h3>
                <p className="mt-1 text-sm text-gray-500">Pay for tolls, parking, and congestion charges using cryptocurrency</p>
                
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="wallet" className="block text-sm font-medium text-gray-700">Wallet Address</label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="wallet"
                        id="wallet"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="0x..."
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        name="amount"
                        id="amount"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">ETH</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Supported Cryptocurrencies</h3>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    {[
                      { name: 'Ethereum (ETH)', description: 'Main network for smart contracts' },
                      { name: 'Bitcoin (BTC)', description: 'Original cryptocurrency' },
                      { name: 'TrafficCoin (TFC)', description: 'Native token for traffic management system' },
                      { name: 'USD Coin (USDC)', description: 'Stablecoin pegged to US Dollar' },
                    ].map((currency, idx) => (
                      <div key={idx} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                        <dt className="text-sm font-medium text-gray-500">{currency.name}</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{currency.description}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'nfc' && (
            <div className="text-center py-12">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">NFC Payment</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tap your NFC-enabled device or card to make a payment
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Simulate NFC Payment
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'qr' && (
            <div className="text-center py-12">
              <QrCodeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">QR Code Payment</h3>
              <p className="mt-1 text-sm text-gray-500">
                Scan this QR code with your mobile wallet to make a payment
              </p>
              <div className="mt-6">
                <div className="mx-auto h-64 w-64 border-4 border-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">QR Code Placeholder</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
              <div className="mt-5 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Transaction ID</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {[
                      { id: 'TX-1234', type: 'Toll Payment', amount: '0.005 ETH', date: 'Today, 10:30 AM', status: 'Completed' },
                      { id: 'TX-1233', type: 'Parking Fee', amount: '0.002 ETH', date: 'Yesterday, 3:15 PM', status: 'Completed' },
                      { id: 'TX-1232', type: 'Congestion Charge', amount: '0.008 ETH', date: '2 days ago', status: 'Completed' },
                      { id: 'TX-1231', type: 'Toll Payment', amount: '0.005 ETH', date: '3 days ago', status: 'Completed' },
                      { id: 'TX-1230', type: 'Parking Fee', amount: '0.003 ETH', date: '4 days ago', status: 'Completed' },
                    ].map((transaction, idx) => (
                      <tr key={idx}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{transaction.id}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.type}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.amount}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.date}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}