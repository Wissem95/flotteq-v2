import { ApiProperty } from '@nestjs/swagger';

export class InvoiceDto {
  @ApiProperty({ description: 'Invoice ID from Stripe' })
  id: string;

  @ApiProperty({ description: 'Amount paid in cents' })
  amountPaid: number;

  @ApiProperty({ description: 'Currency code', example: 'eur' })
  currency: string;

  @ApiProperty({ description: 'Invoice status', example: 'paid' })
  status: string;

  @ApiProperty({ description: 'Invoice PDF URL' })
  pdfUrl: string;

  @ApiProperty({ description: 'Invoice number' })
  number: string;

  @ApiProperty({ description: 'Invoice date' })
  created: Date;

  @ApiProperty({ description: 'Period start date', required: false })
  periodStart?: Date;

  @ApiProperty({ description: 'Period end date', required: false })
  periodEnd?: Date;
}
