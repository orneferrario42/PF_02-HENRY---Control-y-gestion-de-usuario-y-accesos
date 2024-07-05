import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/enum/roles.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from 'src/enum/estados.enum';
import { Profesor } from 'src/profesor/entities/profesor.entity';
import { Plan } from 'src/plan/entities/plan.entity';

@Injectable()
export class UsersService {
  findBy(email: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    @InjectRepository(Profesor)
    private profesorRepository: Repository<Profesor>,
  ) {}
  
  async seederUser() {
    try {
      const userExists = await this.userRepository.findOneBy({
        email: 'jose@mail.com',
      });
      
      if (!userExists) {
        const passwordHashed = await bcrypt.hash('Hola12345@', 10);
        const newUser = this.userRepository.create({
          name: 'Jose',
          email: 'jose@mail.com',
          password: passwordHashed,
          phone: '123456789',
          fecha_nacimiento: '12-12-1994',
          numero_dni: '12345678',
          altura: "1.75",
          peso: "70",
          role: Role.Admin,
        });
        return await this.userRepository.save(newUser);
      }
      return;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  
  async create(user: CreateUserDto) {
    const email = user.email;
    const userExists = await this.userRepository.findOneBy({ email });
    
    if (userExists) {
      throw new HttpException('El usuario ya existe', HttpStatus.BAD_REQUEST);
    }
    
    const hashedPassword = await bcrypt.hash(user.password, 10);
    if (!hashedPassword) {
      throw new BadRequestException('La constraseña no pudo ser hasheada');
    }
    
    const newUser = this.userRepository.create({
      ...user,
      password: hashedPassword,
    });
    
    const savedUser = await this.userRepository.save(newUser);
    
    if (savedUser) {
      return savedUser;
    } else {
      throw new BadRequestException('Error al crear el usuario');
    }
  }
  
  async findAll() {
    return await this.userRepository.find({
      relations: ['profesor'],
      select: [
        'id',
        'name',
        'email',
        'phone',
        'fecha_nacimiento',
        'numero_dni',
        'role',
        'estado',
        'profesor',
      ],
    });
  }
  
  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        profesor: true,
        plan: true,
      },
      select: [
        'id',
        'name',
        'email',
        'phone',
        'fecha_nacimiento',
        'numero_dni',
        'role',
        'estado',
        'profesor',
        'plan',
        'pagos',
      ],
    });
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    
    const { password, ...userWithOutPassword } = user;
    
    return userWithOutPassword;
  }
  
  // async update(
  //   id: string,
  //   updateUserDto: UpdateUserDto,
  // ): Promise<Partial<User>> {
  //   const updateUser = await this.userRepository.findOneBy({ id });
  //   if (!updateUser) {
  //     throw new NotFoundException('Usuario no encontrado');
  //   }
    
  //   await this.userRepository.update(id, updateUserDto);
    
    
  //   const { password, ...userWithOutPassword } = updateUser;
    
  //   return userWithOutPassword;
  // }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<User>> {
    const updateUser = await this.userRepository.findOne({
      where: { id },
      relations: ['plan', 'profesor'],
    });

    if (!updateUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (updateUserDto.plan) {
      const plan = await this.planRepository.findOne({ where: { id: updateUserDto.plan.id } });
      if (!plan) {
        throw new BadRequestException('Plan no encontrado');
      }
      updateUserDto.plan = plan;
    }

    if (updateUserDto.profesor) {
      const profesor = await this.profesorRepository.findOne({ where: { id: updateUserDto.profesor.id } });
      if (!profesor) {
        throw new BadRequestException('Profesor no encontrado');
      }
      updateUserDto.profesor = profesor;
    }

    await this.userRepository.update(id, updateUserDto);

    const updatedUser = await this.userRepository.findOne({
      where: { id },
      relations: ['plan', 'profesor'],
    });

    const { password, ...userWithOutPassword } = updatedUser;

    return userWithOutPassword;
  }
  
  async updateState(id: string) {
    const user =  await this.userRepository.findOneBy({id});
    if(!user){
      throw new NotFoundException('Usuario no encontrado');
    }
    if (user.estado === true) {
      user.estado = false;
    } else {
      user.estado = true;
    }
    
    await this.userRepository.save(user)
    
    const { password, ...userWithOutPassword } = user;
    
    return userWithOutPassword;
    
  }
  
  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOneBy({ email: email });
  }
  
  async findUserByEmail(emailUser: string): Promise<boolean> {
    const userExist = await this.userRepository.findOneBy({email: emailUser});
    if(!userExist){
      throw new NotFoundException('Usuario no encontrado');
    }
    return true
  } 


}
