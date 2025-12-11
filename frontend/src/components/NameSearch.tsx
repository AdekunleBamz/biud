/**
 * BiUD Frontend - Name Search Component
 * Search and check availability of .sBTC names
 */

'use client';

import { useState } from 'react';
import { isNameAvailable, getRegistrationFee, validateLabel, formatSTX, getFullName } from '../services/biud';

interface NameSearchProps {
  onNameSelected?: (label: string, available: boolean, fee: number) => void;
}

export default function NameSearch({ onNameSelected }: NameSearchProps) {
  const [label, setLabel] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{
    available: boolean;
    fee: number;
    error?: string;
  } | null>(null);

  const handleSearch = async () => {
    // Validate label
    const validation = validateLabel(label.toLowerCase());
    if (!validation.valid) {
      setResult({ available: false, fee: 0, error: validation.error });
      return;
    }

    setIsChecking(true);
    try {
      const normalizedLabel = label.toLowerCase();
      const [available, fee] = await Promise.all([
        isNameAvailable(normalizedLabel),
        getRegistrationFee(normalizedLabel),
      ]);

      setResult({ available, fee });
      onNameSelected?.(normalizedLabel, available, fee);
    } catch (error) {
      setResult({ available: false, fee: 0, error: 'Failed to check availability' });
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value.toLowerCase())}
            onKeyPress={handleKeyPress}
            placeholder="Search for a name..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stacks focus:border-transparent outline-none text-lg"
            maxLength={32}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
            .sBTC
          </span>
        </div>
        <button
          onClick={handleSearch}
          disabled={isChecking || !label}
          className="px-6 py-3 bg-bitcoin hover:bg-bitcoin/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isChecking ? 'Checking...' : 'Search'}
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div className={`mt-4 p-4 rounded-lg ${
          result.error 
            ? 'bg-red-50 border border-red-200' 
            : result.available 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
        }`}>
          {result.error ? (
            <p className="text-red-700">{result.error}</p>
          ) : (
            <>
              <p className="font-semibold text-lg">
                {getFullName(label)}
              </p>
              {result.available ? (
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 bg-green-500 text-white text-sm rounded">
                    Available
                  </span>
                  <p className="mt-2 text-gray-600">
                    Registration fee: <strong>{formatSTX(result.fee)} STX</strong>
                  </p>
                </div>
              ) : (
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 bg-yellow-500 text-white text-sm rounded">
                    Taken
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
