import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;
  const userServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    uploadPicture: jest.fn(),
  };

  beforeEach(() => {
    controller = new UserController(userServiceMock as any);
  });

  it('should call create in userService', async () => {
    const argument1 = { key: 'value' };
    const argument2 = 'value';
    const expected = { key: 'value' };

    jest.spyOn(userServiceMock, 'create').mockResolvedValue(expected);

    const result = await controller.create(argument1 as any, argument2);

    expect(userServiceMock.create).toHaveBeenCalledWith(argument1);
    expect(result).toEqual(expected);
  });

  it('should call findAll in userService', async () => {
    const expected = { key: 'value' };

    jest.spyOn(userServiceMock, 'findAll').mockResolvedValue(expected);

    const result = await controller.findAll();

    expect(userServiceMock.findAll).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it('should call findOne in userService', async () => {
    const argument = 1;
    const expected = { key: 'value' };

    jest.spyOn(userServiceMock, 'findOne').mockResolvedValue(expected);

    const result = await controller.findOne(argument);

    expect(userServiceMock.findOne).toHaveBeenCalledWith(argument);
    expect(result).toEqual(expected);
  });

  it('should call update in userService', async () => {
    const argument1 = 1;
    const argument2 = { key: 'value' };
    const argument3 = { key: 'value' };
    const expected = { key: 'value' };

    jest.spyOn(userServiceMock, 'update').mockResolvedValue(expected);

    const result = await controller.update(
      argument1,
      argument2 as any,
      argument3 as any,
    );

    expect(userServiceMock.update).toHaveBeenCalledWith(
      argument1,
      argument2,
      argument3,
    );
    expect(result).toEqual(expected);
  });

  it('should call remove in userService', async () => {
    const argument1 = 1;
    const argument2 = { key: 'value' };
    const expected = { key: 'value' };

    jest.spyOn(userServiceMock, 'remove').mockResolvedValue(expected);

    const result = await controller.remove(argument1, argument2 as any);

    expect(userServiceMock.remove).toHaveBeenCalledWith(argument1, argument2);
    expect(result).toEqual(expected);
  });

  it('should call uploadPicture in userService', async () => {
    const argument1 = { key: 'value' };
    const argument2 = { key: 'value' };
    const expected = { key: 'value' };

    jest.spyOn(userServiceMock, 'uploadPicture').mockResolvedValue(expected);

    const result = await controller.uploadPicture(
      argument1 as any,
      argument2 as any,
    );

    expect(userServiceMock.uploadPicture).toHaveBeenCalledWith(
      argument1,
      argument2,
    );
    expect(result).toEqual(expected);
  });
});
