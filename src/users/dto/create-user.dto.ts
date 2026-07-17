export class CreateUserDto {
  email!: string;
  password?: string;
  firstName!: string;
  lastName!: string;
  provider!: string;
  providerId?: string;
}
