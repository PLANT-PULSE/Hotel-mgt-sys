"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    app.use((0, helmet_1.default)());
    app.enableCors({
        origin: frontendUrl,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Hotel Management API')
        .setDescription('Production-ready REST API for Hotel Management System')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('auth', 'Authentication')
        .addTag('rooms', 'Room management')
        .addTag('bookings', 'Booking management')
        .addTag('payments', 'Payment processing')
        .addTag('users', 'User management')
        .addTag('guests', 'Guest management')
        .addTag('staff', 'Staff management')
        .addTag('dashboard', 'Analytics & Dashboard')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 4000;
    const host = process.env.HOST || '0.0.0.0';
    await app.listen(port, host);
    logger.log(`🚀 Application running on: http://localhost:${port}`);
    logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
    logger.log(`🌐 Network access: http://${process.env.HOST || 'your-machine-ip'}:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map