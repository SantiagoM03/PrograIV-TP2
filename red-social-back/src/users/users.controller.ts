/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { hash } from 'bcrypt';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { memoryStorage } from 'multer';
import { extname, join } from 'path';
import type { Request } from 'express';

import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtCookieGuard } from '../auth/guards/jwt-cookie.guard';
import { RegisterDto } from '../auth/dto/register.dto';
import { UserProfile } from './schemas/user.schema';
import { UsersService } from './users.service';

interface UploadedImageFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

/*
  Acá manejo el controller de usuarios para administración.

  Sprint 4:
  Solo usuarios administradores pueden:
  - listar usuarios;
  - crear usuarios;
  - deshabilitar usuarios;
  - rehabilitar usuarios.
*/
@Controller('users')
@UseGuards(JwtCookieGuard, AdminGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /*
    GET /api/users

    Acá devuelvo el listado de usuarios.
    Lo dejo solo para administradores.
  */
  @Get()
  @HttpCode(HttpStatus.OK)
  async listUsers() {
    const users = await this.usersService.findAllUsers();

    return {
      users: users.map((user) => this.usersService.toUserResponse(user)),
    };
  }

  /*
    POST /api/users

    Acá creo un usuario desde administración.

    Recibe los mismos datos que el registro:
    - nombre
    - apellido
    - correo
    - nombreUsuario
    - password
    - repetirPassword
    - fechaNacimiento
    - descripcionBreve
    - perfil
    - imagenPerfil

    El perfil puede ser:
    - usuario
    - administrador
  */
  @Post()
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: memoryStorage(),
      limits: {
        fileSize: 3 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        const isImage = file.mimetype.startsWith('image/');

        if (!isImage) {
          return callback(
            new BadRequestException(
              'El archivo seleccionado debe ser una imagen.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async createUserByAdmin(
    @Body() registerDto: RegisterDto,
    @UploadedFile() file: UploadedImageFile | undefined,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('La imagen de perfil es obligatoria.');
    }

    if (registerDto.password !== registerDto.repetirPassword) {
      throw new BadRequestException('Las contraseñas no coinciden.');
    }

    const existingEmail = await this.usersService.findByCorreo(
      registerDto.correo,
    );

    if (existingEmail) {
      throw new BadRequestException(
        'Ya existe una cuenta registrada con ese correo.',
      );
    }

    const existingUsername = await this.usersService.findByNombreUsuario(
      registerDto.nombreUsuario,
    );

    if (existingUsername) {
      throw new BadRequestException('Ese nombre de usuario ya está en uso.');
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imagenPerfilUrl = await this.saveProfileImage(file, baseUrl);

    const passwordHash = await hash(registerDto.password, 10);

    const createdUser = await this.usersService.createUser({
      nombre: registerDto.nombre,
      apellido: registerDto.apellido,
      correo: registerDto.correo,
      nombreUsuario: registerDto.nombreUsuario,
      passwordHash,
      fechaNacimiento: new Date(registerDto.fechaNacimiento),
      descripcionBreve: registerDto.descripcionBreve,
      imagenPerfilUrl,
      perfil: registerDto.perfil || UserProfile.Usuario,
    });

    return {
      message: 'Usuario creado correctamente.',
      user: this.usersService.toUserResponse(createdUser),
    };
  }

  /*
    DELETE /api/users/:id

    Acá hago baja lógica:
    deshabilito al usuario.
    Desde ese momento no puede iniciar sesión.
  */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async disableUser(@Param('id') id: string) {
    const updatedUser = await this.usersService.setUserEnabled(id, false);

    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return {
      message: 'Usuario deshabilitado correctamente.',
      user: this.usersService.toUserResponse(updatedUser),
    };
  }

  /*
    POST /api/users/:id/habilitar

    Acá hago alta lógica:
    rehabilito un usuario previamente deshabilitado.
  */
  @Post(':id/habilitar')
  @HttpCode(HttpStatus.OK)
  async enableUser(@Param('id') id: string) {
    const updatedUser = await this.usersService.setUserEnabled(id, true);

    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return {
      message: 'Usuario habilitado correctamente.',
      user: this.usersService.toUserResponse(updatedUser),
    };
  }

  private async saveProfileImage(
    imageFile: UploadedImageFile,
    baseUrl: string,
  ): Promise<string> {
    // Acá guardo la imagen en disco y devuelvo la URL pública.
    const uploadFolder = join(process.cwd(), 'uploads', 'users');

    await mkdir(uploadFolder, { recursive: true });

    const fileExtension = extname(imageFile.originalname);
    const fileName = `${randomUUID()}${fileExtension}`;
    const filePath = join(uploadFolder, fileName);

    await writeFile(filePath, imageFile.buffer);

    return `${baseUrl}/uploads/users/${fileName}`;
  }
}