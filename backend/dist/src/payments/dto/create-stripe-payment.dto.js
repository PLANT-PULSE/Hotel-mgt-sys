"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmPaymentDto = exports.CreateStripePaymentIntentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateStripePaymentIntentDto {
    constructor() {
        this.currency = 'usd';
    }
}
exports.CreateStripePaymentIntentDto = CreateStripePaymentIntentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStripePaymentIntentDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Amount to pay (defaults to remaining balance)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateStripePaymentIntentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Currency code', default: 'usd' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStripePaymentIntentDto.prototype, "currency", void 0);
class ConfirmPaymentDto {
}
exports.ConfirmPaymentDto = ConfirmPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment Intent ID from Stripe' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfirmPaymentDto.prototype, "paymentIntentId", void 0);
//# sourceMappingURL=create-stripe-payment.dto.js.map