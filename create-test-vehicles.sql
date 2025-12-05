-- Script pour créer 2 véhicules complets de test
-- Véhicule 1: Renault Clio (tenant 2)
-- Véhicule 2: Citroën C3 (tenant 225)

-- Véhicule 1: Renault Clio pour tenant 2 (FlotteQ admin)
INSERT INTO vehicles (
  id,
  registration,
  brand,
  model,
  year,
  vin,
  color,
  fuel_type,
  transmission,
  "purchasePrice",
  "purchaseDate",
  "initialMileage",
  "currentKm",
  status,
  tenant_id,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'FR-789-XY',
  'Renault',
  'Clio 5',
  2023,
  'VF1RJA00067123456',
  'Bleu Cosmos',
  'essence',
  'manual',
  18500.00,
  '2023-03-15',
  10,
  25600,
  'available',
  2,
  NOW(),
  NOW()
) RETURNING id AS vehicle1_id
\gset

-- Véhicule 2: Citroën C3 pour tenant 225 (3WS)
INSERT INTO vehicles (
  id,
  registration,
  brand,
  model,
  year,
  vin,
  color,
  fuel_type,
  transmission,
  "purchasePrice",
  "purchaseDate",
  "initialMileage",
  "currentKm",
  status,
  tenant_id,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'FR-456-AB',
  'Citroën',
  'C3',
  2022,
  'VF7SXHZFP00654321',
  'Rouge Aden',
  'diesel',
  'automatic',
  16800.00,
  '2022-11-20',
  5,
  38200,
  'in_use',
  225,
  NOW(),
  NOW()
) RETURNING id AS vehicle2_id
\gset

-- Afficher les véhicules créés
SELECT
  'Véhicules créés:' as message,
  registration,
  brand,
  model,
  tenant_id,
  status
FROM vehicles
WHERE registration IN ('FR-789-XY', 'FR-456-AB');
