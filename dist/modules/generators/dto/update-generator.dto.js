"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGeneratorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_generator_dto_1 = require("./create-generator.dto");
class UpdateGeneratorDto extends (0, swagger_1.PartialType)(create_generator_dto_1.CreateGeneratorDto) {
}
exports.UpdateGeneratorDto = UpdateGeneratorDto;
//# sourceMappingURL=update-generator.dto.js.map