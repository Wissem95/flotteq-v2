import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PartnerDocumentVerificationStatus } from '../../../entities/partner-document.entity';

export enum PartnerDocumentSource {
  REGISTRATION = 'registration',
  LEGACY = 'legacy',
}

export class VerifyPartnerDocumentDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsIn([
    PartnerDocumentVerificationStatus.APPROVED,
    PartnerDocumentVerificationStatus.REJECTED,
  ])
  status: Exclude<
    PartnerDocumentVerificationStatus,
    PartnerDocumentVerificationStatus.PENDING
  >;

  @ApiProperty({ enum: PartnerDocumentSource })
  @IsEnum(PartnerDocumentSource)
  source: PartnerDocumentSource;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
