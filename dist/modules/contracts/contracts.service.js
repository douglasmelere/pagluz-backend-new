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
var ContractsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../config/prisma.service");
const google_apis_service_1 = require("../../common/services/google-apis.service");
const number_to_words_service_1 = require("../../common/services/number-to-words.service");
const generate_contract_dto_1 = require("./dto/generate-contract.dto");
const enums_1 = require("../../common/enums");
const axios_1 = require("axios");
const https = require("node:https");
let ContractsService = ContractsService_1 = class ContractsService {
    prisma;
    googleApis;
    numberToWords;
    configService;
    logger = new common_1.Logger(ContractsService_1.name);
    TEMPLATE_LOCACAO_ID = "1BjjCJGisw9baDI1ENQpiykgh7ZBUY5vPbcwuNzOU9N4";
    TEMPLATE_PRESTACAO_ID = "1qZxkafpOE4BFuRrZqdraqpAcXwUE_7GsTY0Q5bzcmdY";
    TEMPLATE_PROCURACAO_PJ_ID = "1UtYkaU0Y8bq-_3Sm7V-Jsz_8leUOMDQtpRG2idcxUWk";
    TEMPLATE_PROCURACAO_PF_ID = "1qtI83buiWR7TKuxNQdEZf33vsli2mGNIWgmCoGcuC_A";
    FOLDER_LOCACAO_ID = "1TGmlbRGNN9QZ0ZWpcFQYIYpC1OQpSGHY";
    FOLDER_PRESTACAO_ID = "1jAub0cviN3TE-0JrwhtgzojtjRkIyY8p";
    FOLDER_PROCURACAO_ID = "1HbjCit_IYcMqHa7ZvcvaQFjQu6edu3A8";
    SPREADSHEET_ID = "19DtKJnOMxw4TVbc8sbywV5oP6x6wzps7iFuuAmLshTg";
    SHEET_LOCACAO = "Página1";
    SHEET_PRESTACAO = "Página2";
    SHEET_PROCURACAO_PJ = "Página3";
    SHEET_PROCURACAO_PF = "Página4";
    EMAIL_TO = "consumidorpagueminhaluz@gmail.com";
    constructor(prisma, googleApis, numberToWords, configService) {
        this.prisma = prisma;
        this.googleApis = googleApis;
        this.numberToWords = numberToWords;
        this.configService = configService;
    }
    async generateContract(dto) {
        const contractId = this.generateContractId();
        const contractWebhookUrl = this.getContractWebhookUrl();
        if (contractWebhookUrl) {
            const payload = {
                contractId,
                documentType: dto.documentType,
                source: "backend",
                requestedAt: new Date().toISOString(),
                data: dto,
            };
            const response = await this.sendToN8n(payload, contractWebhookUrl);
            return {
                contractId,
                documentUrl: response?.documentUrl ?? undefined,
                status: response?.status ?? "sent_to_generation",
            };
        }
        switch (dto.documentType) {
            case generate_contract_dto_1.ContractType.LOCACAO:
                return this.generateLocacaoContract(dto, contractId);
            case generate_contract_dto_1.ContractType.PRESTACAO:
                return this.generatePrestacaoContract(dto, contractId);
            case generate_contract_dto_1.ContractType.PROCURACAO:
                return this.generateProcuracaoContract(dto, contractId);
            default:
                throw new Error(`Tipo de contrato não suportado: ${dto.documentType}`);
        }
    }
    async getGeneratorsFromN8n() {
        try {
            const auth = this.getBasicAuth();
            const httpsAgent = new https.Agent({ rejectUnauthorized: false });
            const { data } = await axios_1.default.get("https://automation.pagluz.com.br/webhook/get-generatos", {
                headers: { Authorization: `Basic ${auth}` },
                timeout: 10000,
                httpsAgent,
            });
            return (Array.isArray(data) ? data : []).map((g) => ({
                id: g.id ?? g.cnpj ?? g.cpf,
                nome: g.nome ?? g.razaoSocial,
                cpfCnpj: g.cpf_cnpj ?? g.cpfCnpj ?? g.cnpj ?? g.cpf,
                email: g.email,
                rua: g.rua,
                numero: g.numero_casa ?? g.numero ?? g.numeroCasa,
                bairro: g.bairro,
                cidade: g.cidade,
                uf: g.uf,
                cep: g.cep,
                banco: g.banco,
                agencia: g.agencia,
                conta: g.conta,
                numeroUcGerador: g.numero_uc ?? g.numeroUc ?? g.numeroUcGerador,
                tipoUsina: g.tipo_usina ?? g.tipoUsina,
                tipoDocumento: g.tipo_documento?.toLowerCase() ??
                    g.tipoDocumento?.toLowerCase(),
            }));
        }
        catch (error) {
            this.logger.error("Erro ao buscar geradores no n8n:", error);
            throw error;
        }
    }
    async sendToN8n(payload, url) {
        const auth = this.getBasicAuth();
        const httpsAgent = new https.Agent({ rejectUnauthorized: false });
        const response = await axios_1.default.post(url, payload, {
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/json",
            },
            httpsAgent,
            timeout: 15000,
        });
        this.logger.log(`Contrato enviado para N8n. Status: ${response.status}`);
        return response.data;
    }
    generateContractId() {
        return Date.now().toString();
    }
    getBasicAuth() {
        const user = this.configService.get("N8N_BASIC_AUTH_USER");
        const pass = this.configService.get("N8N_BASIC_AUTH_PASS");
        return Buffer.from(`${user}:${pass}`).toString("base64");
    }
    getContractWebhookUrl() {
        return (this.configService.get("N8N_CONTRACT_WEBHOOK_URL") ||
            "https://automation.pagluz.com.br/webhook/contract-generation");
    }
    async generateLocacaoContract(dto, contractId) {
        try {
            const data = this.prepareLocacaoData(dto, contractId);
            await this.checkAndCreateGenerator(data);
            await this.googleApis.appendRow(this.SPREADSHEET_ID, this.SHEET_LOCACAO, {
                "ID CONTRATO": contractId,
                CIDADE: data.cidade,
                "NOME GERADOR": data.nomeGerador,
                DATA: data.data,
                "CPF/CNPJ GERADOR": data.cpfCnpjGerador,
                "EMAIL GERADOR": data.emailGerador,
                "BANCO GERADOR": data.bancoGerador,
                "AGENCIA GERADOR": data.agenciaGerador,
                "CONTA GERADOR": data.contaGerador,
                "NOME CONSUMIDOR": data.nomeConsumidor,
                "CPF/CNPJ CONSUMIDOR": data.cpfCnpjConsumidor,
                "EMAIL CONSUMIDOR": data.emailConsumidor,
                "TIPO USINA": data.tipoUsina,
                "NUMERO UC GERADOR": data.numeroUcGerador,
                "NUMERO UC CONSUMIDOR": data.numeroUcConsumidor,
                "PERCENTUAL CAPACIDADE": data.percentualCapacidade,
                "PERCENTUAL DESCONTO": data.percentualDesconto,
                "PRAZO DE VIGENCIA": data.prazoVigencia,
                "PRAZO MULTA": data.prazoMulta,
                "RUA GERADOR": data.ruaGerador,
                "NUMERO CASA GERADOR": data.numeroCasaGerador,
                "BAIRRO GERADOR": data.bairroGerador,
                "CIDADE GERADOR": data.cidadeGerador,
                "UF GERADOR": data.ufGerador,
                "CEP GERADOR": data.cepGerador,
                "RUA CONSUMIDOR": data.ruaConsumidor,
                "CEP CONSUMIDOR": data.cepConsumidor,
                "TIPO DOCUMENTO GERADOR": data.tipoDocumentoGerador,
                "TIPO DOCUMENTO CONSUMIDOR": data.tipoDocumentoConsumidor,
            });
            const folderName = `CONTRATO ${contractId} - ${data.nomeGerador} & ${data.nomeConsumidor}`;
            const folderId = await this.googleApis.createFolder(folderName, this.FOLDER_LOCACAO_ID);
            const documentName = `${contractId} - Contrato (${data.nomeGerador}) & ${data.nomeConsumidor}`;
            const documentId = await this.googleApis.copyFile(this.TEMPLATE_LOCACAO_ID, documentName, folderId);
            await this.googleApis.updateDocument(documentId, {
                "{NOME DO GERADOR}": data.nomeGerador.toUpperCase(),
                "{ENDEREÇO COMPLETO DO GERADOR}": this.formatEnderecoCompleto(data.ruaGerador, data.bairroGerador, data.numeroCasaGerador, data.cidadeGerador, data.ufGerador),
                "{CPF OU CNPJ GERADOR}": data.cpfCnpjGerador,
                "{NOME DO CONSUMIDOR}": data.nomeConsumidor,
                "{ENDEREÇO COMPLETO DO CONSUMIDOR}": this.formatEnderecoCompleto(data.ruaConsumidor, data.bairroConsumidor, data.numeroConsumidor, data.cidadeConsumidor, data.ufConsumidor),
                "{CIDADE}": data.cidade,
                "{DATA}": data.data,
                "{NÚMERO DA UC DO GERADOR}": data.numeroUcGerador,
                "{NÚMERO DA UC DO CONSUMIDOR}": data.numeroUcConsumidor,
                "{PERCENTUAL DA CAPACIDADE}": data.percentualCapacidade,
                "{PERCENTUAL POR EXTENSO CAPACIDADE}": data.percentualCapacidadePorExtenso,
                "{PERCENTUAL DE DESCONTO}": data.percentualDesconto,
                "{PERCENTUAL DE DESCONTO POR EXTENSO}": data.percentualDescontoPorExtenso,
                "{NÚMERO DE MESES}": data.prazoVigencia,
                "{NÚMERO DE MESES POR EXTENSO}": data.prazoVigenciaPorExtenso,
                "{DIA DO MÊS}": data.diaPagamento,
                "{E-MAIL DO GERADOR}": data.emailGerador,
                "{E-MAIL DO CONSUMIDOR}": data.emailConsumidor,
                "{BANCO}": data.bancoGerador,
                "{AGÊNCIA}": data.agenciaGerador,
                "{Nº DA CONTA}": data.contaGerador,
                "{CNPJ OU CPF DO CONSUMIDOR}": data.cpfCnpjConsumidor,
                "{PERCENTUAL POR EXTENSO}": data.percentualCapacidadePorExtenso,
                "{TIPO DA USINA}": data.tipoUsina,
                "{NÚMERO DE MESES MULTA}": data.prazoMulta,
            });
            const pdfBuffer = await this.googleApis.downloadAsPdf(documentId);
            await this.googleApis.sendEmail(this.EMAIL_TO, `CONTRATO DE LOCAÇÃO - ${data.nomeGerador}`, this.getEmailMessage(), {
                filename: `${documentName}.pdf`,
                content: pdfBuffer,
            });
            const documentUrl = `https://docs.google.com/document/d/${documentId}`;
            return { contractId, documentUrl };
        }
        catch (error) {
            this.logger.error("Erro ao gerar contrato de locação:", error);
            throw error;
        }
    }
    async generatePrestacaoContract(dto, contractId) {
        try {
            const data = this.preparePrestacaoData(dto, contractId);
            await this.googleApis.appendRow(this.SPREADSHEET_ID, this.SHEET_PRESTACAO, {
                "ID CONTRATO": contractId,
                "NOME DO CONTRATANTE": data.nomeContratante,
                "ENDERECO DO CONTRATANTE": data.enderecoContratante,
                "CPF/CNPJ DO CONTRATANTE": data.cpfCnpjContratante,
                "TIPO DE ENERGIA": this.formatTipoEnergia(data.tipoEnergia),
                "NÚMERO DE MESES RECISÃO ": data.prazoMinimoMulta,
                "EMAIL DO CONTRATANTE": data.emailContratante,
                "EMAIL DE COMUNICAÇÕES": data.emailComunicacoes,
                "NOME DO REPRESENTANTE DO CONTRATANTE": data.nomeRepresentanteContratante,
                "CPF DO REPRESENTANTE DO CONTRATANTE": data.cpfRepresentanteContratante,
                CIDADE: data.cidade,
                DATA: data.data,
            });
            const folderName = `CONTRATO ${data.nomeContratante}`;
            const folderId = await this.googleApis.createFolder(folderName, this.FOLDER_PRESTACAO_ID);
            const documentName = `${contractId} - CONTRATANTE ${data.nomeContratante}`;
            const documentId = await this.googleApis.copyFile(this.TEMPLATE_PRESTACAO_ID, documentName, folderId);
            await this.googleApis.updateDocument(documentId, {
                "{NOME DO CONTRATANTE}": data.nomeContratante,
                "{ENDEREÇO DO CONTRATANTE}": data.enderecoContratante,
                "{CPF/CNPJ DO CONTRATANTE}": data.cpfCnpjContratante,
                "{TIPO DE ENERGIA}": this.formatTipoEnergia(data.tipoEnergia),
                "{NÚMERO DE MESES}": data.prazoMinimoMulta,
                "{EMAIL DO CONTRATANTE}": data.emailContratante,
                "{EMAIL DE COMUNICAÇÕES}": data.emailComunicacoes,
                "{NOME DO REPRESENTANTE DO CONTRATANTE}": data.nomeRepresentanteContratante,
                "{CPF DO REPRESENTANTE DO CONTRATANTE}": data.cpfRepresentanteContratante,
            });
            const pdfBuffer = await this.googleApis.downloadAsPdf(documentId);
            await this.googleApis.sendEmail(this.EMAIL_TO, `CONTRATO DE PRESTAÇÃO DE SERVIÇO - ${data.nomeContratante}`, this.getEmailMessage(), {
                filename: `${documentName}.pdf`,
                content: pdfBuffer,
            });
            const documentUrl = `https://docs.google.com/document/d/${documentId}`;
            return { contractId, documentUrl };
        }
        catch (error) {
            this.logger.error("Erro ao gerar contrato de prestação:", error);
            throw error;
        }
    }
    async generateProcuracaoContract(dto, contractId) {
        try {
            const isPJ = dto.procuracaoType?.toLowerCase() === "pj";
            if (isPJ) {
                return this.generateProcuracaoPJ(dto, contractId);
            }
            else {
                return this.generateProcuracaoPF(dto, contractId);
            }
        }
        catch (error) {
            this.logger.error("Erro ao gerar procuração:", error);
            throw error;
        }
    }
    async generateProcuracaoPJ(dto, contractId) {
        const data = this.prepareProcuracaoPJData(dto, contractId);
        await this.googleApis.appendRow(this.SPREADSHEET_ID, this.SHEET_PROCURACAO_PJ, {
            ID: contractId,
            Cidade: data.cidade,
            Data: data.data,
            "Razão Social": data.razaoSocialOutorgante,
            "CNPJ Outorgante": data.cnpjOutorgante,
            "Nome Representante": data.nomeRepresentanteOutorgante,
            "CPF RP": data.cpfRepresentanteOutorgante,
            "Cargo RP": data.cargoRepresentanteOutorgante,
        });
        const folderName = `PROCURAÇÃO PJ - ${data.razaoSocialOutorgante}`;
        const folderId = await this.googleApis.createFolder(folderName, this.FOLDER_PROCURACAO_ID);
        const documentName = `PROCURAÇÃO - ${data.razaoSocialOutorgante}`;
        const documentId = await this.googleApis.copyFile(this.TEMPLATE_PROCURACAO_PJ_ID, documentName, folderId);
        const now = new Date();
        await this.googleApis.updateDocument(documentId, {
            "{RAZÃO_SOCIAL_OUTORGANTE}": data.razaoSocialOutorgante,
            "{CNPJ_OUTORGANTE}": data.cnpjOutorgante,
            "{ENDERECO_OUTORGANTE}": data.enderecoOutorgante,
            "{NOME_REPRESENTANTE}": data.nomeRepresentanteOutorgante,
            "{CPF_REPRESENTANTE}": data.cpfRepresentanteOutorgante,
            "{CARGO_REPRESENTANTE}": data.cargoRepresentanteOutorgante,
            " {CIDADE}": data.cidade,
            "{ANO}": now.getFullYear().toString(),
            "{DIA}": now.getDate().toString(),
            "{MES}": this.getMonthName(now),
        });
        const pdfBuffer = await this.googleApis.downloadAsPdf(documentId);
        await this.googleApis.sendEmail(this.EMAIL_TO, `CONTRATO DE PRESTAÇÃO DE SERVIÇO - ${data.razaoSocialOutorgante}`, this.getEmailMessage(), {
            filename: `${documentName}.pdf`,
            content: pdfBuffer,
        });
        const documentUrl = `https://docs.google.com/document/d/${documentId}`;
        return { contractId, documentUrl };
    }
    async generateProcuracaoPF(dto, contractId) {
        const data = this.prepareProcuracaoPFData(dto, contractId);
        await this.googleApis.appendRow(this.SPREADSHEET_ID, this.SHEET_PROCURACAO_PF, {
            ID: contractId,
            "Tipo Procuração": data.tipoProcuracao.toUpperCase(),
            Data: data.data,
            "Nome Outorgante": data.nomeOutorgante,
            "CPF Outorgante": data.cpfOutorgante,
            Cidade: data.cidade,
            "Endereço Outorgante": data.enderecoOutorgante,
            "Ocupação Outorgante": data.ocupacaoOutorgante,
        });
        const folderName = `PROCURAÇÃO PF - ${data.nomeOutorgante}`;
        const folderId = await this.googleApis.createFolder(folderName, this.FOLDER_PROCURACAO_ID);
        const documentName = `PROCURAÇÃO - ${data.nomeOutorgante} - ${contractId}`;
        const documentId = await this.googleApis.copyFile(this.TEMPLATE_PROCURACAO_PF_ID, documentName, folderId);
        const now = new Date();
        await this.googleApis.updateDocument(documentId, {
            "{NOME_OUTORGANTE}": data.nomeOutorgante,
            "{CPF_OUTORGANTE}": data.cpfOutorgante,
            "{OCUPACAO_OUTORGANTE}": data.ocupacaoOutorgante,
            "{ENDERECO_OUTORGANTE}": data.enderecoOutorgante,
            "{ANO}": "2025",
        });
        const pdfBuffer = await this.googleApis.downloadAsPdf(documentId);
        await this.googleApis.sendEmail(this.EMAIL_TO, `CONTRATO DE PRESTAÇÃO DE SERVIÇO - ${data.nomeOutorgante}`, this.getEmailMessage(), {
            filename: `${documentName}.pdf`,
            content: pdfBuffer,
        });
        const documentUrl = `https://docs.google.com/document/d/${documentId}`;
        return { contractId, documentUrl };
    }
    prepareLocacaoData(dto, contractId) {
        return {
            idContrato: contractId,
            cidade: dto.cidade,
            data: dto.data,
            nomeGerador: dto.nomeGerador || "",
            cpfCnpjGerador: dto.cpfCnpjGerador || "",
            emailGerador: dto.emailGerador || "",
            bancoGerador: dto.bancoGerador || "",
            agenciaGerador: dto.agenciaGerador || "",
            contaGerador: dto.contaGerador || "",
            tipoUsina: dto.tipoUsina || "",
            numeroUcGerador: dto.numeroUcGerador || "",
            ruaGerador: dto.ruaGerador || "",
            numeroCasaGerador: dto.numeroGerador || "",
            bairroGerador: dto.bairroGerador || "",
            cidadeGerador: dto.cidadeGerador || "",
            ufGerador: dto.ufGerador || "",
            cepGerador: dto.cepGerador || "",
            tipoDocumentoGerador: dto.tipoDocumentoGerador?.toUpperCase() || "",
            nomeConsumidor: dto.nomeConsumidor || "",
            cpfCnpjConsumidor: dto.cpfCnpjConsumidor || "",
            emailConsumidor: dto.emailConsumidor || "",
            numeroUcConsumidor: dto.numeroUcConsumidor || "",
            ruaConsumidor: dto.ruaConsumidor || "",
            numeroConsumidor: dto.numeroConsumidor || "",
            bairroConsumidor: dto.bairroConsumidor || "",
            cidadeConsumidor: dto.cidadeConsumidor || "",
            ufConsumidor: dto.ufConsumidor || "",
            cepConsumidor: dto.cepConsumidor || "",
            tipoDocumentoConsumidor: dto.tipoDocumentoConsumidor?.toUpperCase() || "",
            percentualCapacidade: dto.percentualCapacidade || "",
            percentualCapacidadePorExtenso: dto.percentualCapacidadePorExtenso ||
                this.numberToWords.toWordsSimple(dto.percentualCapacidade || "0"),
            percentualDesconto: dto.percentualDesconto || "",
            percentualDescontoPorExtenso: dto.percentualDescontoPorExtenso ||
                this.numberToWords.toWordsSimple(dto.percentualDesconto || "0"),
            prazoVigencia: dto.prazoVigencia || "",
            prazoVigenciaPorExtenso: dto.prazoVigenciaPorExtenso ||
                this.numberToWords.toWordsSimple(dto.prazoVigencia || "0"),
            prazoMulta: dto.prazoMulta || "",
            diaPagamento: dto.diaPagamento || "",
        };
    }
    preparePrestacaoData(dto, contractId) {
        return {
            idContrato: contractId,
            cidade: dto.cidade,
            data: dto.data,
            nomeContratante: dto.nomeContratante || "",
            enderecoContratante: dto.enderecoContratante || "",
            cpfCnpjContratante: dto.cpfCnpjContratante || "",
            emailContratante: dto.emailContratante || "",
            emailComunicacoes: dto.emailComunicacoes || "",
            nomeRepresentanteContratante: dto.nomeRepresentanteContratante || "",
            cpfRepresentanteContratante: dto.cpfRepresentanteContratante || "",
            tipoEnergia: dto.tipoEnergia || "",
            prazoMinimoMulta: dto.prazoMinimoMulta || "",
        };
    }
    prepareProcuracaoPJData(dto, contractId) {
        return {
            id: contractId,
            cidade: dto.cidade,
            data: dto.data,
            razaoSocialOutorgante: dto.razaoSocialOutorgante || "",
            cnpjOutorgante: dto.cnpjOutorgante || "",
            nomeRepresentanteOutorgante: dto.nomeRepresentanteOutorgante || "",
            cpfRepresentanteOutorgante: dto.cpfRepresentanteOutorgante || "",
            cargoRepresentanteOutorgante: dto.cargoRepresentanteOutorgante || "",
            enderecoOutorgante: dto.enderecoOutorgante || "",
        };
    }
    prepareProcuracaoPFData(dto, contractId) {
        return {
            id: contractId,
            tipoProcuracao: dto.procuracaoType || "pf",
            cidade: dto.cidade,
            data: dto.data,
            nomeOutorgante: dto.nomeOutorgante || "",
            cpfOutorgante: dto.cpfOutorgante || "",
            ocupacaoOutorgante: dto.ocupacaoOutorgante || "",
            enderecoOutorgante: dto.enderecoOutorgante || "",
        };
    }
    formatEnderecoCompleto(rua, bairro, numero, cidade, uf) {
        return `${rua}, Bairro ${bairro}, Nº ${numero}, ${cidade} - ${uf}`;
    }
    formatTipoEnergia(tipo) {
        if (!tipo)
            return "";
        return tipo
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    }
    getMonthName(date) {
        return date
            .toLocaleString("pt-BR", { month: "long" })
            .replace(/^\w/, (c) => c.toUpperCase());
    }
    getEmailMessage() {
        return `Oi, pessoal do RH,  Segue em anexo o contrato para vocês darem uma olhada. Por favor, revisem os detalhes e me avisem se tiver algo para ajustar ou esclarecer. Se possível, gostaria de receber ele assinado o quanto antes para seguirmos com o processo.`;
    }
    async checkAndCreateGenerator(data) {
        try {
            const existingGenerator = await this.prisma.generator.findFirst({
                where: {
                    cpfCnpj: data.cpfCnpjGerador.replace(/[^0-9]/g, ""),
                },
            });
            if (!existingGenerator) {
                await this.prisma.generator.create({
                    data: {
                        ownerName: data.nomeGerador,
                        cpfCnpj: data.cpfCnpjGerador.replace(/[^0-9]/g, ""),
                        sourceType: this.mapTipoUsinaToSourceType(data.tipoUsina),
                        installedPower: 0,
                        concessionaire: "",
                        ucNumber: data.numeroUcGerador,
                        city: data.cidadeGerador,
                        state: data.ufGerador,
                        status: "UNDER_ANALYSIS",
                    },
                });
            }
        }
        catch (error) {
            this.logger.warn("Erro ao verificar/criar gerador:", error);
        }
    }
    mapTipoUsinaToSourceType(tipoUsina) {
        const mapping = {
            solar: enums_1.SourceType.SOLAR,
            hidro: enums_1.SourceType.HYDRO,
            eolica: enums_1.SourceType.WIND,
            biomassa: enums_1.SourceType.BIOMASS,
        };
        return mapping[tipoUsina?.toLowerCase()] || enums_1.SourceType.SOLAR;
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = ContractsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        google_apis_service_1.GoogleApisService,
        number_to_words_service_1.NumberToWordsService,
        config_1.ConfigService])
], ContractsService);
//# sourceMappingURL=contracts.service.js.map