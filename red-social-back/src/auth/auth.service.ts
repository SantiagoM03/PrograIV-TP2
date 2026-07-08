/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {BadRequestException, ForbiddenException,Injectable, UnauthorizedException,} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {UserProfile} from '../users/schemas/user.schema';
import {UserResponse,UsersService} from '../users/users.service';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { AnalyticsService } from '../analytics/analytics.service';

/*
  Acá defino el payload del JWT.

  Esta es la información que guardo dentro del token.

  El PDF pide que el JWT valide:
  - quién es el usuario;
  - qué rol tiene: usuario o administrador.

  Por eso guardamos:
  - sub: id del usuario;
  - correo;
  - nombreUsuario;
  - perfil.
*/
export interface JwtPayload 
{
  sub: string;
  correo: string;
  nombreUsuario: string;
  perfil: UserProfile;
}

/*
  Acá defino la respuesta de autenticación.

  Desde AuthService devuelvo:
  - user: datos seguros del usuario, sin passwordHash;
  - accessToken: JWT generado.

  Después, en AuthController, meto ese token en una cookie.
*/
export interface AuthResponse 
{
  user: UserResponse;
  accessToken: string;
}

/*
  Acá tipé el archivo de imagen que llega desde AuthController.

  Como uso memoryStorage, la imagen llega en memoria.
  AuthService es quien la guarda en uploads/users.
*/
export interface UploadedProfileImage 
{
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class AuthService 
{
  /*
    Inyecto UsersService porque AuthService necesita:
    - buscar usuarios;
    - validar duplicados;
    - crear usuarios;
    - transformar usuarios a respuestas seguras.

    También inyecto JwtService porque necesito generar JWT.
  */
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /*
    Acá registro un usuario.

    Este método recibe el archivo tipado, pero la captura la maneja el controller con Multer.

    El controller me pasa lo necesario para terminar guardando la imagen
    y construir la URL final.

    Flujo:
    1. Valido que password y repetirPassword coincidan.
    2. Valido que el correo no exista.
    3. Valido que el nombre de usuario no exista.
    4. Hasheo la contraseña con bcrypt.
    5. Creo el usuario en MongoDB.
    6. Genero JWT.
    7. Devuelvo usuario seguro + token.
  */
  async register(registerDto: RegisterDto, imageFile: UploadedProfileImage, baseUrl: string): Promise<AuthResponse> 
  {
    /*
      Primero valido todo lo que pueda fallar ANTES de guardar la imagen.

      Así evito que queden archivos huérfanos en uploads/users
      cuando el registro falla por:
      - contraseñas distintas;
      - correo duplicado;
      - nombre de usuario duplicado.
    */
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

    /*
      Si llego hasta acá, los datos principales ya son válidos.
      Ahora sí hasheo la contraseña.
    */
    const passwordHash = await hash(registerDto.password, 10);

    /*
      Recién ahora guardo la imagen.
      Si antes hubo un error, nunca se guardó.
    */
    const savedImage = await this.saveProfileImage(imageFile, baseUrl);

    try 
    {
      /*
        Acá creo el usuario con la URL de la imagen ya guardada.
      */
      const createdUser = await this.usersService.createUser({
        nombre: registerDto.nombre,
        apellido: registerDto.apellido,
        correo: registerDto.correo,
        nombreUsuario: registerDto.nombreUsuario,
        passwordHash,
        fechaNacimiento: new Date(registerDto.fechaNacimiento),
        descripcionBreve: registerDto.descripcionBreve,
        imagenPerfilUrl: savedImage.publicUrl,
        perfil: registerDto.perfil || UserProfile.Usuario,
      });

      const userResponse = this.usersService.toUserResponse(createdUser);
      const accessToken = await this.generateAccessToken(userResponse);

      return {
        user: userResponse,
        accessToken,
      };
    } 
    catch (error) {
      /*
        Si MongoDB falla después de haber guardado la imagen,
        borro la imagen para no dejar basura.
      */
      await this.deleteFileIfExists(savedImage.filePath);
      throw error;
    }
  }

  /*
    Acá hago login de usuario.

    El PDF permite iniciar sesión usando:
    - correo;
    - nombre de usuario.

    Seguridad:
    - Si el usuario no existe, devuelvo "Credenciales inválidas".
    - Si la contraseña no coincide, devuelvo "Credenciales inválidas".
    - No digo si falló el usuario o la contraseña.
  */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    /*
      Acá busco usuario por correo o nombre de usuario.

      Este método trae passwordHash porque lo necesito para comparar
      la contraseña ingresada.
    */
    const user = await this.usersService.findByUsuarioOCorreoWithPassword(loginDto.usuarioOCorreo);

    /*
      No doy detalles si el usuario no existe.
      Así evito filtrar información.
    */
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    /*
      Si en Sprint 4 un administrador deshabilita un usuario,
      no debe poder ingresar.

      Este mensaje sí puede ser específico porque el usuario existe
      pero no está autorizado a usar la app.
    */
    if (!user.habilitado) 
    {
      throw new ForbiddenException('Tu usuario se encuentra deshabilitado.');
    }

    /*
      Acá comparo la contraseña plana recibida en login
      contra el hash guardado en MongoDB.

      bcrypt.compare devuelve true si coincide.
    */
    const passwordMatches = await compare(loginDto.password, user.passwordHash);

    /*
      No doy detalles si la contraseña no coincide.
    */
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    /*
      Acá armo la respuesta segura del usuario.
    */
    const userResponse = this.usersService.toUserResponse(user);

    /*
      Sprint 5:
      Registro cada login exitoso para la estadística:
      "Cantidad de ingresos por usuario".
    */
    await this.analyticsService.recordLogin(userResponse);

    /*
      Acá genero un JWT nuevo.
    */
    const accessToken = await this.generateAccessToken(userResponse);

    return {
      user: userResponse,
      accessToken,
    };
  }

    /*
    Acá autorizo sesión.

    Lo uso en Sprint 3 para validar si la cookie access_token
    sigue siendo válida al iniciar la aplicación.
  */
  async authorizeSession(currentUser: AuthenticatedUser): Promise<UserResponse> {
    const user = await this.usersService.findById(currentUser.id);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    if (!user.habilitado) {
      throw new ForbiddenException('Tu usuario se encuentra deshabilitado.');
    }

    return this.usersService.toUserResponse(user);
  }

  /*
    Acá refresco sesión.

    Valido que el token actual siga siendo válido mediante JwtCookieGuard.
    Si es válido, genero un token nuevo con otros 15 minutos de vencimiento.
  */
  async refreshSession(currentUser: AuthenticatedUser): Promise<AuthResponse> {
    const user = await this.usersService.findById(currentUser.id);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    if (!user.habilitado) {
      throw new ForbiddenException('Tu usuario se encuentra deshabilitado.');
    }

    const userResponse = this.usersService.toUserResponse(user);

    const accessToken = await this.generateAccessToken(userResponse);

    return {
      user: userResponse,
      accessToken,
    };
  }

  /*
    Acá genero un JWT para el usuario autenticado.

    El vencimiento no lo defino acá.
    Lo defino en AuthModule mediante JWT_EXPIRES_IN=15m.
  */
  private async generateAccessToken(user: UserResponse): Promise<string> 
  {
    const payload: JwtPayload = {
      sub: user.id,
      correo: user.correo,
      nombreUsuario: user.nombreUsuario,
      perfil: user.perfil,
    };

    return this.jwtService.signAsync(payload);
  }

  /*
  Acá guardo físicamente la imagen de perfil en uploads/users.

  Devuelvo:
  - filePath: ruta interna para poder borrar el archivo si algo falla.
  - publicUrl: URL pública que se guarda en MongoDB.
*/
private async saveProfileImage(
  imageFile: UploadedProfileImage,
  baseUrl: string,
): Promise<{ filePath: string; publicUrl: string }> {
  /*
    Acá me aseguro de que la carpeta exista.
    recursive: true evita error si la carpeta ya existe.
  */
  const uploadFolder = join(process.cwd(), 'uploads', 'users');

  await mkdir(uploadFolder, { recursive: true });

  /*
    Acá armo un nombre único para evitar pisar imágenes.
  */
  const fileExtension = extname(imageFile.originalname);
  const fileName = `${randomUUID()}${fileExtension}`;

  const filePath = join(uploadFolder, fileName);

  /*
    Acá escribo el buffer en disco.
  */
  await writeFile(filePath, imageFile.buffer);

  /*
    Esta URL es la que guardo en MongoDB.

    En main.ts servimos uploads con:
    app.useStaticAssets(..., { prefix: '/uploads/' })
  */
  const publicUrl = `${baseUrl}/uploads/users/${fileName}`;

  return {
    filePath,
    publicUrl,
  };
}

  /*
    Acá borro un archivo si existe.

    Lo uso como limpieza si ocurre un error después de guardar la imagen.
  */
  private async deleteFileIfExists(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
    } catch {
      /*
        Si el archivo no existe o ya fue borrado, no corto la ejecución.
      */
    }
  }
}