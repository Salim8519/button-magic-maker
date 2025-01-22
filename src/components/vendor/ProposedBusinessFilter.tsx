import React from 'react';
import { Store } from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';

interface Props {
  selectedBusinessCode: string | 'all';
  onBusinessChange: (businessCode: string | 'all') => void;
  assignments: Array<{
    owner_business_code: string;
    owner_business_name: string;
  }>;
  className?: string;
}

export function ProposedBusinessFilter({ 
  selectedBusinessCode,
  onBusinessChange,
  assignments,
  className = ''
}: Props) {
  const { language } = useLanguageStore();

  // Get unique businesses from assignments
  const uniqueBusinesses = Array.from(
    new Map(
      assignments.map(a => [a.owner_business_code, a.owner_business_name])
    ).entries()
  ).map(([code, name]) => ({ code, name }));

  const translations = {
    ar: {
      proposedBusinesses: 'المتاجر المقترحة',
      allBusinesses: 'جميع المتاجر',
      selectBusiness: 'اختر متجر...'
    },
    en: {
      proposedBusinesses: 'Proposed Businesses',
      allBusinesses: 'All Businesses',
      selectBusiness: 'Select business...'
    }
  };

  const t = translations[language];

  return (
    <div className={`flex items-center space-x-2 space-x-reverse ${className}`}>
      <Store className="w-5 h-5 text-gray-400" />
      <select
        value={selectedBusinessCode}
        onChange={(e) => onBusinessChange(e.target.value as string | 'all')}
        className="border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <option value="all">{t.allBusinesses}</option>
        {uniqueBusinesses.map(business => (
          <option key={business.code} value={business.code}>
            {business.name}
          </option>
        ))}
      </select>
    </div>
  );
}