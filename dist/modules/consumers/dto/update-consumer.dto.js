"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateConsumerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_consumer_dto_1 = require("./create-consumer.dto");
class UpdateConsumerDto extends (0, swagger_1.PartialType)(create_consumer_dto_1.CreateConsumerDto) {
}
exports.UpdateConsumerDto = UpdateConsumerDto;
//# sourceMappingURL=update-consumer.dto.js.map