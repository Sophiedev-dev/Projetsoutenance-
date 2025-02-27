import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ValidationBadgeProps {
  adminName?: string;
  validationDate?: string;
}

const ValidationBadge = ({ adminName = "Admin", validationDate }: ValidationBadgeProps) => {
    return (
      <div className="absolute top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm z-10"> {/* Added z-10 */}
        <div className="flex items-center gap-2">
          <CheckCircle className="text-green-600" size={24} />
          <div>
            <p className="text-green-800 font-semibold">Document Validé</p>
            <p className="text-sm text-green-600">Par: {adminName}</p>
            {validationDate && (
              <p className="text-xs text-green-500">Le: {validationDate}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

export default ValidationBadge;