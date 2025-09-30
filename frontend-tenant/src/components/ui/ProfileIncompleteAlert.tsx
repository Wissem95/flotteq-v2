import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProfileIncompleteAlertProps {
  isVisible: boolean;
  missingFields: Record<string, string>;
  onDismiss: () => void;
}

const ProfileIncompleteAlert: React.FC<ProfileIncompleteAlertProps> = ({ 
  isVisible, 
  missingFields, 
  onDismiss 
}) => {
  if (!isVisible) return null;

  const missingFieldsCount = Object.keys(missingFields).length;

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">
              Votre profil est incomplet
            </p>
            <p className="text-sm text-amber-700">
              Il manque {missingFieldsCount} information{missingFieldsCount > 1 ? 's' : ''} importante{missingFieldsCount > 1 ? 's' : ''} : {Object.values(missingFields).join(', ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700">
            <Link to="/profile">
              Compléter mon profil
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDismiss}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ProfileIncompleteAlert; 