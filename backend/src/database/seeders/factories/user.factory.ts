import { User, UserRole } from '../../../entities/user.entity';

export class UserFactory {
  static create(data: Partial<User> = {}): User {
    const user = new User();
    user.email = data.email || `user${Math.random()}@example.com`;
    user.password = data.password || 'Test123!';
    user.firstName = data.firstName || 'John';
    user.lastName = data.lastName || 'Doe';
    user.role = data.role || UserRole.VIEWER;
    user.isActive = data.isActive ?? true;
    if (data.phone !== undefined) {
      user.phone = data.phone;
    }
    user.tenantId = data.tenantId!;

    return Object.assign(user, data);
  }
}
