import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Req,
  UseGuards,

  Query,

  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Role } from 'src/enum/roles.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Response } from  'express' 
@ApiTags('USERS')
// @ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Este metodo permite a los usuarios no registrador inscribir se en la pagina
   */
  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  
  @Get('generaqr/:id')
  generaqr(@Param('id')id:string){
    return this.usersService.generaqr(id)
  
  }

  /**
   * Este metodo permite al Administrador ver la lista de los usuarios del gimnasio, en el ver quienres estan activos e inactivos
   */
  @Get()
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles(Role.Admin)
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    if (page && limit) {
      return this.usersService.findAll(page, limit);
    }
    return this.usersService.findAll(page, limit);
  }

  /**
   * Este metodo permite al usuario ingresar con una cuenta externa de google entre otras...
   */

  @Get('auth0')
  getAuth0(@Req() req: Request) {
    return JSON.stringify(req.oidc.user);
  }
  /***
   *Este metodo verifica si el usuario  existe
   */
  @Post('exist')
  userExist(@Body() data): Promise<boolean> {
    const { email } = data;
    return this.usersService.findUserByEmail(email);
  }
  /***
   * Ese metodo permite a admin activar o desactivar un usuaruio
   */
  @Put('updateState/:id')
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles(Role.Admin)
  updateStatus(@Param('id') id: string) {
    console.log(id);
    return this.usersService.updateState(id);
  }


  /***
   * Este metodo le permite al usuario ver su informacion personal
   */
  @Get(':id')
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles(Role.User)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Este metodo le permite al usuario modificar  su informacion personal
   */
  @Put(':id')
  // @Roles(Role.Admin,Role.User)
  // @UseGuards(AuthGuard,RolesGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

}
