import React from 'react';
import { usePermissions, type Permission } from '@/hooks/usePermissions';

interface ProtectedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Permission requise pour activer le bouton
   */
  permission?: Permission;

  /**
   * Liste de permissions (au moins une requise)
   */
  anyPermissions?: Permission[];

  /**
   * Liste de permissions (toutes requises)
   */
  allPermissions?: Permission[];

  /**
   * Afficher un tooltip expliquant pourquoi le bouton est désactivé
   */
  showTooltip?: boolean;

  /**
   * Message custom pour le tooltip
   */
  disabledMessage?: string;

  /**
   * Masquer le bouton au lieu de le désactiver
   */
  hideWhenDisabled?: boolean;

  children: React.ReactNode;
  className?: string;
}

export const ProtectedButton: React.FC<ProtectedButtonProps> = ({
  permission,
  anyPermissions,
  allPermissions,
  showTooltip = true,
  disabledMessage = 'Vous n\'avez pas la permission d\'effectuer cette action',
  hideWhenDisabled = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Vérifier les permissions
  let hasRequiredPermission = true;

  if (permission) {
    hasRequiredPermission = hasPermission(permission);
  } else if (anyPermissions) {
    hasRequiredPermission = hasAnyPermission(anyPermissions);
  } else if (allPermissions) {
    hasRequiredPermission = hasAllPermissions(allPermissions);
  }

  // Si le bouton doit être masqué et que l'utilisateur n'a pas la permission
  if (hideWhenDisabled && !hasRequiredPermission) {
    return null;
  }

  // Le bouton est désactivé si :
  // 1. Pas la permission requise OU
  // 2. Désactivé via props
  const isDisabled = !hasRequiredPermission || disabled;

  const button = (
    <button
      {...props}
      disabled={isDisabled}
      className={`${className} ${
        isDisabled
          ? '!opacity-50 !cursor-not-allowed pointer-events-none'
          : ''
      }`}
    >
      {children}
    </button>
  );

  // Ajouter tooltip si le bouton est désactivé par manque de permission
  if (showTooltip && !hasRequiredPermission && !disabled) {
    return (
      <div className="relative group inline-block">
        {button}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          {disabledMessage}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  return button;
};

/**
 * Composant pour protéger un groupe d'éléments
 */
interface ProtectedProps {
  permission?: Permission;
  anyPermissions?: Permission[];
  allPermissions?: Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const Protected: React.FC<ProtectedProps> = ({
  permission,
  anyPermissions,
  allPermissions,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasRequiredPermission = true;

  if (permission) {
    hasRequiredPermission = hasPermission(permission);
  } else if (anyPermissions) {
    hasRequiredPermission = hasAnyPermission(anyPermissions);
  } else if (allPermissions) {
    hasRequiredPermission = hasAllPermissions(allPermissions);
  }

  if (!hasRequiredPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
