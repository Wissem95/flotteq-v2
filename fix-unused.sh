#!/bin/bash
# Supprimer imports non utilisés automatiquement

# Backend: Supprimer IsOptional dans MaintenanceDto
sed -i '' '6d' backend/src/modules/maintenances/dto/update-maintenance.dto.ts

# Backend: Supprimer IsDecimal dans CommissionDto  
sed -i '' '/IsDecimal/d' backend/src/modules/commissions/dto/create-commission.dto.ts

# Backend: Supprimer IsEmail dans UpdatePartnerDto
sed -i '' '/import.*IsEmail/d' backend/src/modules/partners/dto/update-partner.dto.ts

# Backend: Supprimer imports dans ReportsController
sed -i '' '/import.*Post.*from/d' backend/src/modules/reports/reports.controller.ts
sed -i '' '/import.*UseGuards/d' backend/src/modules/reports/reports.controller.ts
sed -i '' '/CreateReportDto/d' backend/src/modules/reports/reports.controller.ts

# Backend: Supprimer Between dans TripsService
sed -i '' '/Between/d' backend/src/modules/trips/trips.service.ts

# Backend: Supprimer IsNull dans UsersService
sed -i '' '/IsNull/d' backend/src/modules/users/users.service.ts

# Backend: Supprimer MileageHistoryItemDto dans VehiclesService
sed -i '' '/MileageHistoryItemDto/d' backend/src/modules/vehicles/vehicles.service.ts

echo "✅ Imports non utilisés supprimés"
