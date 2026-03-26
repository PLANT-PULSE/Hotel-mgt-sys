export declare enum RegisterRole {
    GUEST = "GUEST"
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: RegisterRole;
}
