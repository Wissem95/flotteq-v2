import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '../dto/register.dto';

describe('AuthService Enterprise registration', () => {
  const registerDto: RegisterDto = {
    email: 'enterprise@example.com',
    password: 'Password123',
    firstName: 'Jane',
    lastName: 'Doe',
    companyName: 'Entreprise test',
    planId: '4',
  };

  it('refuse un plan sur devis avant toute recherche ou écriture utilisateur', async () => {
    const userRepository = { findOne: jest.fn() };
    const subscriptionPlanRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 4,
        name: 'Enterprise',
        price: 0,
        maxVehicles: -1,
      }),
    };
    const service = new AuthService(
      userRepository as never,
      {} as never,
      {} as never,
      subscriptionPlanRepository as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(service.register(registerDto)).rejects.toThrow(
      new BadRequestException('This plan requires a custom quote'),
    );
    expect(userRepository.findOne).not.toHaveBeenCalled();
  });
});
