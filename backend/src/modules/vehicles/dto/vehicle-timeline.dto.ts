import { ApiProperty } from '@nestjs/swagger';

export enum TimelineItemType {
  MAINTENANCE = 'maintenance',
  DOCUMENT = 'document',
  ASSIGNMENT = 'assignment',
  CREATION = 'creation',
}

export class TimelineItemDto {
  @ApiProperty({ enum: TimelineItemType })
  type: TimelineItemType;

  @ApiProperty({ description: "Date de l'événement" })
  date: Date;

  @ApiProperty({ description: "Description de l'événement" })
  description: string;

  @ApiProperty({ description: 'Métadonnées additionnelles', required: false })
  metadata?: any;
}

export class VehicleTimelineDto {
  @ApiProperty({ format: 'uuid', description: 'ID du véhicule' })
  vehicleId: string;

  @ApiProperty({
    type: [TimelineItemDto],
    description: 'Liste des événements triés par date décroissante',
  })
  items: TimelineItemDto[];

  @ApiProperty({ description: "Nombre total d'événements" })
  totalEvents: number;
}
