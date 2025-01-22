import React, { useEffect, useState } from 'react';
import { Store } from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import { getProfile } from '../../services/profileService';
import { posTranslations } from '../../translations/pos';

interface Props {
  onBranchChange: (branchId: string) => void;
}

export function BranchPOSSelector({ onBranchChange }: Props) {
  const { language } = useLanguageStore();
  const { user } = useAuthStore();
  const { branches } = useBusinessStore();
  const t = posTranslations[language];
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeBranch = async () => {
      if (!isInitialized && user?.id && branches.length > 0) {
        try {
          const profile = await getProfile(user.id);
          if (profile?.main_branch) {
            const mainBranch = branches.find(b => 
              b.branch_name === profile.main_branch && b.is_active
            );
            if (mainBranch) {
              setSelectedBranchId(mainBranch.branch_id);
              onBranchChange(mainBranch.branch_id);
            }
          }
          setIsInitialized(true);
        } catch (error) {
          console.error('Error initializing branch:', error);
          setIsInitialized(true);
        }
      }
    };

    initializeBranch();
  }, [user?.id, branches, isInitialized, onBranchChange]);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    onBranchChange(branchId);
  };

  return (
    <div className="flex items-center space-x-2 space-x-reverse">
      <Store className="w-5 h-5 text-gray-400" />
      <select
        value={selectedBranchId}
        onChange={(e) => handleBranchChange(e.target.value)}
        className="border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <option value="">{t.selectBranch}</option>
        {branches
          .filter(branch => branch.is_active)
          .map(branch => (
            <option 
              key={branch.branch_id} 
              value={branch.branch_id}
            >
              {branch.branch_name}
            </option>
          ))}
      </select>
    </div>
  );
}