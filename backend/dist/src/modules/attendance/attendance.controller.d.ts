import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    create(tenantId: string, user: RequestUser, dto: CreateAttendanceDto): Promise<{
        student: {
            id: string;
            person: {
                id: string;
                fullName: string;
            };
        };
        classGroup: {
            id: string;
            name: string;
            modality: {
                id: string;
                name: string;
            };
        };
        recordedBy: {
            id: string;
            person: {
                fullName: string;
            } | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string;
        notes: string | null;
        studentId: string;
        classGroupId: string;
        attendanceDate: Date;
        recordedByUserId: string | null;
    }>;
    createBatch(tenantId: string, user: RequestUser, records: CreateAttendanceDto[]): Promise<{
        created: number;
        failed: number;
        results: any[];
        errors: any[];
    }>;
    findAll(tenantId: string, classGroupId?: string, studentId?: string, status?: string, dateFrom?: string, dateTo?: string): Promise<({
        student: {
            id: string;
            person: {
                id: string;
                fullName: string;
                photoUrl: string | null;
            };
        };
        classGroup: {
            id: string;
            name: string;
            modality: {
                id: string;
                name: string;
            };
            level: {
                id: string;
                name: string;
                color: string | null;
            } | null;
        };
        recordedBy: {
            id: string;
            person: {
                fullName: string;
            } | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string;
        notes: string | null;
        studentId: string;
        classGroupId: string;
        attendanceDate: Date;
        recordedByUserId: string | null;
    })[]>;
    getAttendanceSheet(tenantId: string, classGroupId: string, date: string): Promise<{
        classGroup: {
            id: string;
            name: string;
            modality: {
                id: string;
                name: string;
            };
            level: {
                id: string;
                name: string;
                color: string | null;
            } | null;
            teacher: {
                id: string;
                person: {
                    fullName: string;
                } | null;
            } | null;
        };
        date: string;
        totalStudents: number;
        recorded: number;
        pending: number;
        students: {
            studentId: string;
            studentStatus: string;
            person: {
                id: string;
                fullName: string;
                birthDate: Date | null;
                photoUrl: string | null;
            };
            attendanceId: string | null;
            attendanceStatus: string | null;
            attendanceNotes: string | null;
            recordedBy: {
                id: string;
                person: {
                    fullName: string;
                } | null;
            } | null;
        }[];
    }>;
    getStudentSummary(tenantId: string, studentId: string, classGroupId?: string): Promise<{
        student: {
            id: string;
            fullName: string;
        };
        classGroupId: string;
        summary: {
            total: number;
            present: number;
            absent: number;
            justifiedAbsence: number;
            makeup: number;
            attendanceRate: number;
        };
    }>;
    findById(tenantId: string, id: string): Promise<{
        student: {
            id: string;
            person: {
                id: string;
                phone: string | null;
                fullName: string;
                birthDate: Date | null;
                cpf: string | null;
                photoUrl: string | null;
            };
            status: string;
        };
        classGroup: {
            id: string;
            name: string;
            modality: {
                id: string;
                name: string;
            };
            level: {
                id: string;
                name: string;
                color: string | null;
            } | null;
            daysOfWeek: string;
            startTime: string;
            endTime: string;
            location: string | null;
            teacher: {
                id: string;
                person: {
                    fullName: string;
                } | null;
            } | null;
        };
        recordedBy: {
            id: string;
            email: string;
            person: {
                fullName: string;
            } | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string;
        notes: string | null;
        studentId: string;
        classGroupId: string;
        attendanceDate: Date;
        recordedByUserId: string | null;
    }>;
    update(tenantId: string, user: RequestUser, id: string, dto: UpdateAttendanceDto): Promise<{
        student: {
            id: string;
            person: {
                id: string;
                fullName: string;
            };
        };
        classGroup: {
            id: string;
            name: string;
        };
        recordedBy: {
            id: string;
            person: {
                fullName: string;
            } | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string;
        notes: string | null;
        studentId: string;
        classGroupId: string;
        attendanceDate: Date;
        recordedByUserId: string | null;
    }>;
}
