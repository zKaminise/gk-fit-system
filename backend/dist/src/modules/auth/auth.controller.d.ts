import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(user: RequestUser): Promise<{
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
    changePassword(user: RequestUser, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
