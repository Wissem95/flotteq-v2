
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface RepairSelectorProps {
  selectedRepairs: string[];
  onRepairsChange: (repairs: string[]) => void;
}

const availableRepairs = [
  'Vidange',
  'Changement disques',
  'Freins',
  'Contrôle technique',
  'Distribution',
  'Échappement',
  'Climatisation',
  'Pneumatiques',
  'Batterie',
  'Amortisseurs',
  'Embrayage',
  'Électronique'
];

const RepairSelector: React.FC<RepairSelectorProps> = ({ selectedRepairs, onRepairsChange }) => {
  const [newRepair, setNewRepair] = useState('');

  const handleAddRepair = () => {
    if (newRepair && !selectedRepairs.includes(newRepair)) {
      onRepairsChange([...selectedRepairs, newRepair]);
      setNewRepair('');
      toast.success(`${newRepair} ajouté aux réparations`);
    }
  };

  const handleRemoveRepair = (repair: string) => {
    onRepairsChange(selectedRepairs.filter(r => r !== repair));
    toast.info(`${repair} retiré des réparations`);
  };

  const availableOptions = availableRepairs.filter(repair => !selectedRepairs.includes(repair));

  return (
    <div className="space-y-4">
      {selectedRepairs.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center gap-2">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">{selectedRepairs.length}</span>
            Réparations sélectionnées :
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedRepairs.map((repair, index) => (
              <Badge 
                key={index} 
                className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors"
              >
                {repair}
                <button
                  onClick={() => handleRemoveRepair(repair)}
                  className="hover:bg-blue-300 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {availableOptions.length > 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <Select value={newRepair} onValueChange={setNewRepair}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 rounded-lg">
                  <SelectValue placeholder="Sélectionner une réparation..." />
                </SelectTrigger>
                <SelectContent>
                  {availableOptions.map((repair) => (
                    <SelectItem key={repair} value={repair}>
                      {repair}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddRepair}
              disabled={!newRepair}
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairSelector;
