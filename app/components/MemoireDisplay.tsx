import React from 'react';
import ValidationBadge from './ValidationBadge';

const MemoireDisplay = ({ memoire }) => {
  return (
    <div className="relative">
      {memoire.status === 'validated' && (
        <ValidationBadge 
          adminName={memoire.validated_by_name || 'Admin'}
          validationDate={new Date(memoire.validation_date).toLocaleDateString('fr-FR')}
        />
      )}
      {/* Reste du contenu du mémoire */}
    </div>
  );
};

export default MemoireDisplay;