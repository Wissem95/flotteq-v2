import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { Vehicle, VehicleStatus } from '../../entities/vehicle.entity';
import { User, UserRole } from '../../entities/user.entity';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { EmailService } from '../../modules/notifications/email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  async completeOnboarding(
    userId: string,
    dto: CompleteOnboardingDto,
  ): Promise<{ message: string }> {
    // 1. Get user with tenant
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['tenant'],
    });

    if (!user || !user.tenant) {
      throw new NotFoundException('User or tenant not found');
    }

    // 2. Update tenant profile (using .save() to ensure proper DB commit)
    user.tenant.name = dto.profile.companyName;
    user.tenant.address = dto.profile.companyAddress;
    user.tenant.city = dto.profile.companyCity;
    user.tenant.postalCode = dto.profile.companyPostalCode;
    user.tenant.country = dto.profile.companyCountry;
    user.tenant.onboardingCompleted = true;

    await this.tenantsRepository.save(user.tenant);

    // 3. Create first vehicle if provided
    if (dto.vehicle) {
      const vehicle = this.vehiclesRepository.create({
        registration: dto.vehicle.licensePlate,
        brand: dto.vehicle.brand,
        model: dto.vehicle.model,
        year: dto.vehicle.year,
        vin: dto.vehicle.vin || `VIN-${Date.now()}`, // Generate VIN if not provided
        color: 'Non spécifié', // Default value
        purchaseDate: new Date(),
        purchasePrice: 0,
        status: VehicleStatus.AVAILABLE,
        tenantId: user.tenantId,
      });

      await this.vehiclesRepository.save(vehicle);
    }

    // 4. Create first driver if provided
    if (dto.driver) {
      // Check if driver email already exists for this tenant
      const existingDriver = await this.usersRepository.findOne({
        where: {
          email: dto.driver.email,
          tenantId: user.tenantId,
        },
      });

      if (!existingDriver) {
        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        const driver = this.usersRepository.create({
          email: dto.driver.email,
          password: hashedPassword,
          firstName: dto.driver.firstName,
          lastName: dto.driver.lastName,
          phone: dto.driver.phone,
          role: UserRole.DRIVER,
          tenantId: user.tenantId,
        });

        await this.usersRepository.save(driver);

        // Send welcome email with temp password
        try {
          await this.emailService.sendDriverWelcomeEmail(
            driver.email,
            driver.firstName,
            user.tenant.name,
            tempPassword,
          );
          this.logger.log(`Welcome email sent to driver ${driver.email}`);
        } catch (emailError) {
          this.logger.error(
            `Failed to send welcome email to ${driver.email}`,
            emailError.stack,
          );
          // Don't fail the onboarding if email fails
        }
      }
    }

    return { message: 'Onboarding complété avec succès' };
  }
}
