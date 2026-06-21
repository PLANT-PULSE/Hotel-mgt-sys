export declare class BookingItemDto {
    roomTypeId: string;
    quantity: number;
    pricePerNight: number;
}
export declare class CreateBookingDto {
    checkInDate: string;
    checkOutDate: string;
    guestFirstName: string;
    guestLastName: string;
    guestEmail: string;
    guestPhone?: string;
    specialRequests?: string;
    promoCode?: string;
    items: BookingItemDto[];
    addOns?: {
        addOnId: string;
        quantity: number;
    }[];
    sessionToken?: string;
}
