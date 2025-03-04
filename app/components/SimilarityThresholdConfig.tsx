import React, { useState, useEffect } from 'react';
import { Settings, Percent, AlertCircle, AlertTriangle, CheckCircle, SlidersHorizontal } from 'lucide-react';
import { toast } from 'react-toastify';

const SimilarityThresholdConfig = () => {
  const [warningThreshold, setWarningThreshold] = useState('');
  const [dangerThreshold, setDangerThreshold] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Charger les seuils depuis le serveur au chargement
    fetchThresholds();
  }, []);

  const fetchThresholds = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/similarity-threshold');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWarningThreshold(data.warningThreshold);
          setDangerThreshold(data.dangerThreshold);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des seuils:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveThresholds = async () => {
    try {
      setIsLoading(true);
      
      // Validation des seuils
      if (warningThreshold >= dangerThreshold) {
        toast.error("Le seuil d'alerte doit être inférieur au seuil de danger");
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/admin/similarity-threshold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          warningThreshold,
          dangerThreshold
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Seuils de similarité mis à jour avec succès');
        } else {
          toast.error(data.message || 'Erreur lors de la mise à jour des seuils');
        }
      } else {
        toast.error('Erreur serveur lors de la mise à jour des seuils');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des seuils:', error);
      toast.error('Erreur lors de la sauvegarde des seuils');
    } finally {
      setIsLoading(false);
    }
  };

  const getThresholdColor = (value) => {
    if (value < 50) return 'text-green-500';
    if (value < 70) return 'text-orange-500';
    return 'text-red-500';
  };

  const getThresholdIcon = (value) => {
    if (value < 50) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (value < 70) return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Settings className="w-6 h-6 text-purple-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Configuration des seuils de similarité</h2>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <p className="text-gray-600 text-sm">
          Définissez les seuils de similarité pour l'analyse des mémoires. Ces seuils déterminent à quel moment un document 
          sera considéré comme ayant un niveau de similarité moyen (alerte) ou élevé (danger) par rapport aux documents existants.
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Seuil d'alerte */}
        <div className="border border-gray-200 rounded-lg p-4">
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center">
      <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
      <h3 className="font-medium text-gray-800">Seuil d'alerte</h3>
    </div>
    <div className="flex items-center">
      <Percent className="w-4 h-4 text-gray-400 mr-1" />
      <span className={`font-semibold ${getThresholdColor(warningThreshold)}`}>
        {warningThreshold}%
      </span>
    </div>
  </div>
  
  <p className="text-sm text-gray-600 mb-3">
    Les documents avec un taux de similarité supérieur à cette valeur seront marqués avec une alerte orange.
  </p>
  
  <div className="relative pt-1">
    <input
      type="range"
      min="0"
      max="100"
      step="1"
      value={warningThreshold}
      onChange={(e) => setWarningThreshold(e.target.value)}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-orange-400
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-4
        [&::-webkit-slider-thumb]:h-4
        [&::-webkit-slider-thumb]:bg-orange-500
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:cursor-pointer
        [&::-webkit-slider-thumb]:transition-all
        [&::-webkit-slider-thumb]:hover:scale-110"
    />
  </div>
  
  <div className="flex justify-between text-xs text-gray-500 mt-1">
    <span>30%</span>
    <span>45%</span>
    <span>60%</span>
  </div>
        </div>
        
        {/* Seuil de danger */}
        <div className="border border-gray-200 rounded-lg p-4">
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center">
      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
      <h3 className="font-medium text-gray-800">Seuil de danger</h3>
    </div>
    <div className="flex items-center">
      <Percent className="w-4 h-4 text-gray-400 mr-1" />
      <span className={`font-semibold ${getThresholdColor(dangerThreshold)}`}>
        {dangerThreshold}%
      </span>
    </div>
  </div>
  
  <p className="text-sm text-gray-600 mb-3">
    Les documents avec un taux de similarité supérieur à cette valeur seront marqués en rouge et nécessiteront une attention particulière.
  </p>
  
  <div className="relative pt-1">
    <input
      type="range"
      min="0"
      max="100"
      step="1"
      value={dangerThreshold}
      onChange={(e) => setDangerThreshold(e.target.value)}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-red-400
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-4
        [&::-webkit-slider-thumb]:h-4
        [&::-webkit-slider-thumb]:bg-red-500
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:cursor-pointer
        [&::-webkit-slider-thumb]:transition-all
        [&::-webkit-slider-thumb]:hover:scale-110"
    />
  </div>
  
  <div className="flex justify-between text-xs text-gray-500 mt-1">
    <span>60%</span>
    <span>75%</span>
    <span>90%</span>
  </div>
        </div>
      
      <div className="p-4 bg-gray-50 rounded-lg mt-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {getThresholdIcon(warningThreshold)}
            <div className="h-4 w-4 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-600">{warningThreshold}% - {dangerThreshold-0.1}%</span>
          </div>
          <span className="text-sm font-medium text-orange-500">Similarité moyenne</span>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center space-x-4">
            {getThresholdIcon(dangerThreshold)}
            <div className="h-4 w-4 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">{dangerThreshold}% et plus</span>
          </div>
          <span className="text-sm font-medium text-red-500">Similarité élevée</span>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          onClick={saveThresholds}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {isLoading ? (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
          ) : (
            <Settings className="w-4 h-4 mr-2" />
          )}
          Enregistrer les paramètres
        </button>
      </div>
    </div>
    </div>
  );
};

export default SimilarityThresholdConfig;