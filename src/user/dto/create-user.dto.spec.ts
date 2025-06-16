import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
describe('CreateUserDto', () => {
  const dtoFactory = (
    email: string,
    name: string,
    password: string,
  ): CreateUserDto => {
    const dto = new CreateUserDto();
    dto.email = email;
    dto.name = name;
    dto.password = password;

    return dto;
  };

  it('should validate a valid DTO', async () => {
    const dto = dtoFactory('email@email.com', 'name name', 'password');

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail if email is invalid', async () => {
    const dto = dtoFactory('invalid-email', 'name name', 'password');

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('email');
  });

  it('should fail if name is empty', async () => {
    const dto = dtoFactory('email@email.com', '', 'password');

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail if name length is less than 4 characters', async () => {
    const dto = dtoFactory('email@email.com', 'nam', 'password');

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should fail if name length is greater than 100 characters', async () => {
    const dto = dtoFactory('email@email.com', 'n'.repeat(101), 'password');

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should fail if name is not a string', async () => {
    const dto = dtoFactory('email@email.com', 1 as any, 'password');

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail if password is empty', async () => {
    const dto = dtoFactory('email@email.com', 'name name', '');

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail if password is not a string', async () => {
    const dto = dtoFactory('email@email.com', 'name name', 123 as any);

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail if password length is less than 6 characters', async () => {
    const dto = dtoFactory('email@email.com', 'name name', 'passw');

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });
});
