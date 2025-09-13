"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRepresentativeDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_representative_dto_1 = require("./create-representative.dto");
class UpdateRepresentativeDto extends (0, mapped_types_1.PartialType)(create_representative_dto_1.CreateRepresentativeDto) {
}
exports.UpdateRepresentativeDto = UpdateRepresentativeDto;
//# sourceMappingURL=update-representative.dto.js.map