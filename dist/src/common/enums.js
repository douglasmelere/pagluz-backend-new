"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeRequestStatus = exports.CommissionStatus = exports.DocumentType = exports.GeneratorStatus = exports.SourceType = exports.ConsumerApprovalStatus = exports.ConsumerStatus = exports.PhaseType = exports.ConsumerType = exports.RepresentativeStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["OPERATOR"] = "OPERATOR";
    UserRole["REPRESENTATIVE"] = "REPRESENTATIVE";
})(UserRole || (exports.UserRole = UserRole = {}));
var RepresentativeStatus;
(function (RepresentativeStatus) {
    RepresentativeStatus["ACTIVE"] = "ACTIVE";
    RepresentativeStatus["INACTIVE"] = "INACTIVE";
    RepresentativeStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    RepresentativeStatus["SUSPENDED"] = "SUSPENDED";
})(RepresentativeStatus || (exports.RepresentativeStatus = RepresentativeStatus = {}));
var ConsumerType;
(function (ConsumerType) {
    ConsumerType["RESIDENTIAL"] = "RESIDENTIAL";
    ConsumerType["COMMERCIAL"] = "COMMERCIAL";
    ConsumerType["INDUSTRIAL"] = "INDUSTRIAL";
    ConsumerType["RURAL"] = "RURAL";
    ConsumerType["PUBLIC_POWER"] = "PUBLIC_POWER";
})(ConsumerType || (exports.ConsumerType = ConsumerType = {}));
var PhaseType;
(function (PhaseType) {
    PhaseType["MONOPHASIC"] = "MONOPHASIC";
    PhaseType["BIPHASIC"] = "BIPHASIC";
    PhaseType["TRIPHASIC"] = "TRIPHASIC";
})(PhaseType || (exports.PhaseType = PhaseType = {}));
var ConsumerStatus;
(function (ConsumerStatus) {
    ConsumerStatus["AVAILABLE"] = "AVAILABLE";
    ConsumerStatus["ALLOCATED"] = "ALLOCATED";
    ConsumerStatus["IN_PROCESS"] = "IN_PROCESS";
    ConsumerStatus["CONVERTED"] = "CONVERTED";
})(ConsumerStatus || (exports.ConsumerStatus = ConsumerStatus = {}));
var ConsumerApprovalStatus;
(function (ConsumerApprovalStatus) {
    ConsumerApprovalStatus["PENDING"] = "PENDING";
    ConsumerApprovalStatus["APPROVED"] = "APPROVED";
    ConsumerApprovalStatus["REJECTED"] = "REJECTED";
})(ConsumerApprovalStatus || (exports.ConsumerApprovalStatus = ConsumerApprovalStatus = {}));
var SourceType;
(function (SourceType) {
    SourceType["SOLAR"] = "SOLAR";
    SourceType["HYDRO"] = "HYDRO";
    SourceType["BIOMASS"] = "BIOMASS";
    SourceType["WIND"] = "WIND";
})(SourceType || (exports.SourceType = SourceType = {}));
var GeneratorStatus;
(function (GeneratorStatus) {
    GeneratorStatus["UNDER_ANALYSIS"] = "UNDER_ANALYSIS";
    GeneratorStatus["AWAITING_ALLOCATION"] = "AWAITING_ALLOCATION";
    GeneratorStatus["ACTIVE"] = "ACTIVE";
    GeneratorStatus["INACTIVE"] = "INACTIVE";
})(GeneratorStatus || (exports.GeneratorStatus = GeneratorStatus = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["CPF"] = "CPF";
    DocumentType["CNPJ"] = "CNPJ";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var CommissionStatus;
(function (CommissionStatus) {
    CommissionStatus["PENDING"] = "PENDING";
    CommissionStatus["CALCULATED"] = "CALCULATED";
    CommissionStatus["PAID"] = "PAID";
    CommissionStatus["CANCELLED"] = "CANCELLED";
})(CommissionStatus || (exports.CommissionStatus = CommissionStatus = {}));
var ChangeRequestStatus;
(function (ChangeRequestStatus) {
    ChangeRequestStatus["PENDING"] = "PENDING";
    ChangeRequestStatus["APPROVED"] = "APPROVED";
    ChangeRequestStatus["REJECTED"] = "REJECTED";
})(ChangeRequestStatus || (exports.ChangeRequestStatus = ChangeRequestStatus = {}));
//# sourceMappingURL=enums.js.map