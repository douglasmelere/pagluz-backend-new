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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const ExcelJS = require('exceljs');
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateCommissionsReport(res, filters) {
        const where = {};
        if (filters.representativeId)
            where.representativeId = filters.representativeId;
        if (filters.status)
            where.status = filters.status;
        if (filters.startDate || filters.endDate) {
            where.calculatedAt = {};
            if (filters.startDate)
                where.calculatedAt.gte = new Date(filters.startDate);
            if (filters.endDate)
                where.calculatedAt.lte = new Date(filters.endDate);
        }
        const commissions = await this.prisma.commission.findMany({
            where,
            include: {
                representative: { select: { name: true, email: true, cpfCnpj: true } },
                consumer: { select: { name: true, cpfCnpj: true, ucNumber: true } },
            },
            orderBy: { calculatedAt: 'desc' },
        });
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'PagLuz Energy';
        workbook.created = new Date();
        const sheet = workbook.addWorksheet('Comissões');
        sheet.columns = [
            { header: 'Data', key: 'date', width: 15 },
            { header: 'Representante', key: 'rep', width: 25 },
            { header: 'CPF/CNPJ Rep.', key: 'repDoc', width: 18 },
            { header: 'Consumidor', key: 'consumer', width: 25 },
            { header: 'UC', key: 'uc', width: 15 },
            { header: 'Consumo (kWh)', key: 'kwh', width: 15 },
            { header: 'Preço kWh (R$)', key: 'price', width: 15 },
            { header: 'Comissão (R$)', key: 'value', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Pago em', key: 'paidAt', width: 15 },
        ];
        sheet.getRow(1).font = { bold: true, size: 12 };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        const statusMap = { PENDING: 'Pendente', CALCULATED: 'Calculada', PAID: 'Paga', CANCELLED: 'Cancelada' };
        commissions.forEach(c => {
            sheet.addRow({
                date: c.calculatedAt.toLocaleDateString('pt-BR'),
                rep: c.representative.name,
                repDoc: c.representative.cpfCnpj,
                consumer: c.consumer.name,
                uc: c.consumer.ucNumber,
                kwh: c.kwhConsumption,
                price: c.kwhPrice,
                value: c.commissionValue,
                status: statusMap[c.status] || c.status,
                paidAt: c.paidAt ? c.paidAt.toLocaleDateString('pt-BR') : '-',
            });
        });
        const totalRow = sheet.addRow({
            date: '',
            rep: '',
            repDoc: '',
            consumer: '',
            uc: '',
            kwh: commissions.reduce((s, c) => s + c.kwhConsumption, 0),
            price: '',
            value: commissions.reduce((s, c) => s + c.commissionValue, 0),
            status: 'TOTAL',
            paidAt: '',
        });
        totalRow.font = { bold: true, size: 12 };
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio_comissoes_${Date.now()}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    }
    async generateConsumersReport(res, filters) {
        const where = {};
        if (filters.representativeId)
            where.representativeId = filters.representativeId;
        if (filters.status)
            where.status = filters.status;
        if (filters.concessionaire)
            where.concessionaire = filters.concessionaire;
        const consumers = await this.prisma.consumer.findMany({
            where,
            include: {
                Representative: { select: { name: true } },
                generator: { select: { ownerName: true, ucNumber: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Consumidores');
        sheet.columns = [
            { header: 'Nome', key: 'name', width: 25 },
            { header: 'CPF/CNPJ', key: 'doc', width: 18 },
            { header: 'UC', key: 'uc', width: 15 },
            { header: 'Concessionária', key: 'conc', width: 20 },
            { header: 'Tipo', key: 'type', width: 15 },
            { header: 'Consumo (kWh)', key: 'kwh', width: 15 },
            { header: 'Desconto (%)', key: 'discount', width: 12 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Alocação (%)', key: 'alloc', width: 12 },
            { header: 'Representante', key: 'rep', width: 25 },
            { header: 'Gerador', key: 'gen', width: 20 },
            { header: 'Cidade', key: 'city', width: 18 },
            { header: 'Estado', key: 'state', width: 5 },
            { header: 'Cadastro', key: 'created', width: 12 },
        ];
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };
        const statusMap = { AVAILABLE: 'Disponível', ALLOCATED: 'Alocado', IN_PROCESS: 'Em Processo', CONVERTED: 'Convertido' };
        consumers.forEach(c => {
            sheet.addRow({
                name: c.name,
                doc: c.cpfCnpj,
                uc: c.ucNumber,
                conc: c.concessionaire,
                type: c.consumerType,
                kwh: c.averageMonthlyConsumption,
                discount: c.discountOffered,
                status: statusMap[c.status] || c.status,
                alloc: c.allocatedPercentage || 0,
                rep: c.Representative?.name || '-',
                gen: c.generator?.ownerName || '-',
                city: c.city,
                state: c.state,
                created: c.createdAt.toLocaleDateString('pt-BR'),
            });
        });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio_consumidores_${Date.now()}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    }
    async generateRepresentativesReport(res) {
        const representatives = await this.prisma.representative.findMany({
            where: { status: 'ACTIVE' },
            include: {
                Consumer: {
                    select: {
                        id: true,
                        status: true,
                        averageMonthlyConsumption: true,
                        allocatedPercentage: true,
                    },
                },
                commissions: {
                    select: {
                        commissionValue: true,
                        status: true,
                        kwhConsumption: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Performance Representantes');
        sheet.columns = [
            { header: 'Representante', key: 'name', width: 25 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Cidade', key: 'city', width: 18 },
            { header: 'Total Clientes', key: 'totalClients', width: 15 },
            { header: 'Convertidos', key: 'converted', width: 12 },
            { header: 'Alocados', key: 'allocated', width: 12 },
            { header: 'Total kWh', key: 'totalKwh', width: 15 },
            { header: 'Comissões Pagas (R$)', key: 'paidComm', width: 18 },
            { header: 'Comissões Pendentes (R$)', key: 'pendingComm', width: 20 },
            { header: 'Taxa Conversão (%)', key: 'convRate', width: 15 },
        ];
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
        representatives.forEach(rep => {
            const converted = rep.Consumer.filter(c => c.status === 'CONVERTED').length;
            const allocated = rep.Consumer.filter(c => c.status === 'ALLOCATED').length;
            const totalKwh = rep.Consumer.reduce((s, c) => s + c.averageMonthlyConsumption, 0);
            const paidComm = rep.commissions.filter(c => c.status === 'PAID').reduce((s, c) => s + c.commissionValue, 0);
            const pendingComm = rep.commissions.filter(c => c.status === 'PENDING' || c.status === 'CALCULATED').reduce((s, c) => s + c.commissionValue, 0);
            const convRate = rep.Consumer.length > 0 ? (converted / rep.Consumer.length) * 100 : 0;
            sheet.addRow({
                name: rep.name,
                email: rep.email,
                city: `${rep.city}/${rep.state}`,
                totalClients: rep.Consumer.length,
                converted,
                allocated,
                totalKwh: Math.round(totalKwh * 100) / 100,
                paidComm: Math.round(paidComm * 100) / 100,
                pendingComm: Math.round(pendingComm * 100) / 100,
                convRate: Math.round(convRate * 10) / 10,
            });
        });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio_representantes_${Date.now()}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map