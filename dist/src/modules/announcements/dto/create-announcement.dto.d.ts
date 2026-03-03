export declare class CreateAnnouncementDto {
    title: string;
    message: string;
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    representativeId?: string;
}
