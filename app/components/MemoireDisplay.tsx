import React from 'react';
import ValidationBadge from './ValidationBadge';
import { ShieldCheck } from 'lucide-react';

const MemoireDisplay = ({ memoire }) => {
  return (
    <div className="relative">
      {memoire.status === 'validated' && (
        <div className="space-y-2">
          <ValidationBadge 
            adminName={memoire.validated_by_name || 'Admin'}
            validationDate={new Date(memoire.validation_date).toLocaleDateString('fr-FR')}
          />
          {memoire.signature && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
              <ShieldCheck className="w-4 h-4" />
              <span>Document signé numériquement</span>
            </div>
          )}
        </div>
      )}
      {/* Reste du contenu du mémoire */}
    </div>
  );
};

export default MemoireDisplay;