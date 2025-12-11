/**
 * BiUD Frontend - Name Details Component
 * Display detailed information about a registered name
 */

'use client';

import { useState, useEffect } from 'react';
import { getNameInfo, formatSTX, estimateTimeUntilExpiry } from '../services/biud';

interface NameDetailsProps {
  label: string;
  currentBlock?: number;
}

interface NameInfo {
  label: string;
  'full-name': string;
  owner: string;
  'expiry-height': number;
  resolver: string | null;
  'is-premium': boolean;
  'name-id': number;
  'created-at': number;
  'last-renewed': number;
}

export default function NameDetails({ label, currentBlock = 0 }: NameDetailsProps) {
  const [nameInfo, setNameInfo] = useState<NameInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNameInfo() {
      setIsLoading(true);
      try {
        const info = await getNameInfo(label);
        setNameInfo(info);
        setError(null);
      } catch (err) {
        setError('Failed to fetch name information');
        setNameInfo(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (label) {
      fetchNameInfo();
    }
  }, [label]);

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!nameInfo) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">Name not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {nameInfo['full-name']}
        </h2>
        {nameInfo['is-premium'] && (
          <span className="px-3 py-1 bg-bitcoin text-white text-sm rounded-full">
            Premium
          </span>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Owner */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Owner</p>
          <p className="font-mono text-sm break-all">{nameInfo.owner}</p>
        </div>

        {/* Expiry */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Expires</p>
          <p className="font-medium">
            Block {nameInfo['expiry-height'].toLocaleString()}
          </p>
          {currentBlock > 0 && (
            <p className="text-sm text-gray-600">
              {estimateTimeUntilExpiry(currentBlock, nameInfo['expiry-height'])}
            </p>
          )}
        </div>

        {/* Name ID */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Name ID</p>
          <p className="font-medium">#{nameInfo['name-id']}</p>
        </div>

        {/* Created */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Created at Block</p>
          <p className="font-medium">{nameInfo['created-at'].toLocaleString()}</p>
        </div>

        {/* Resolver */}
        {nameInfo.resolver && (
          <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
            <p className="text-sm text-gray-500 mb-1">Resolver</p>
            <p className="font-mono text-sm break-all">{nameInfo.resolver}</p>
          </div>
        )}
      </div>
    </div>
  );
}
