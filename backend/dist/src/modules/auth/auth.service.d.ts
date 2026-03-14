import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: string;
            tenantId: string | null;
            personId: string | null;
        };
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        isActive: boolean;
        createdAt: Date;
        tenant: {
            id: string;
            slug: string;
            name: string;
        } | null;
        tenantId: string | null;
        person: {
            id: string;
            phone: string | null;
            fullName: string;
            photoUrl: string | null;
        } | null;
        personId: string | null;
        role: string;
        lastLoginAt: Date | null;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
