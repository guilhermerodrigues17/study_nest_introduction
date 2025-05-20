import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TimingConnectionInterceptor } from 'src/common/interceptors/timing-connection.interceptor';
import { UrlParam } from 'src/common/params/url-param.decorator';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';

@UseGuards(AuthTokenGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto, @UrlParam() url: string) {
    console.log(url);
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseInterceptors(TimingConnectionInterceptor)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }
}
