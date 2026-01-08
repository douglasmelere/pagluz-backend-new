import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { GoogleApisService } from '../../common/services/google-apis.service';
import { NumberToWordsService } from '../../common/services/number-to-words.service';
import { GenerateContractDto, ContractType } from './dto/generate-contract.dto';

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  // IDs dos templates e pastas do Google Drive
  private readonly TEMPLATE_LOCACAO_ID = '1BjjCJGisw9baDI1ENQpiykgh7ZBUY5vPbcwuNzOU9N4';
  private readonly TEMPLATE_PRESTACAO_ID = '1qZxkafpOE4BFuRrZqdraqpAcXwUE_7GsTY0Q5bzcmdY';
  private readonly TEMPLATE_PROCURACAO_PJ_ID = '1UtYkaU0Y8bq-_3Sm7V-Jsz_8leUOMDQtpRG2idcxUWk';
  private readonly TEMPLATE_PROCURACAO_PF_ID = '1qtI83buiWR7TKuxNQdEZf33vsli2mGNIWgmCoGcuC_A';

  private readonly FOLDER_LOCACAO_ID = '1TGmlbRGNN9QZ0ZWpcFQYIYpC1OQpSGHY';
  private readonly FOLDER_PRESTACAO_ID = '1jAub0cviN3TE-0JrwhtgzojtjRkIyY8p';
  private readonly FOLDER_PROCURACAO_ID = '1HbjCit_IYcMqHa7ZvcvaQFjQu6edu3A8';

  private readonly SPREADSHEET_ID = '19DtKJnOMxw4TVbc8sbywV5oP6x6wzps7iFuuAmLshTg';
  private readonly SHEET_LOCACAO = 'Página1';
  private readonly SHEET_PRESTACAO = 'Página2';
  private readonly SHEET_PROCURACAO_PJ = 'Página3';
  private readonly SHEET_PROCURACAO_PF = 'Página4';

  private readonly EMAIL_TO = 'consumidorpagueminhaluz@gmail.com';

  constructor(
    private prisma: PrismaService,
    private googleApis: GoogleApisService,
    private numberToWords: NumberToWordsService,
    private configService: ConfigService,
  ) {}

  async generateContract(dto: GenerateContractDto): Promise<{ contractId: string; documentUrl: string }> {
    const contractId = this.generateContractId();

    switch (dto.documentType) {
      case ContractType.LOCACAO:
        return this.generateLocacaoContract(dto, contractId);
      case ContractType.PRESTACAO:
        return this.generatePrestacaoContract(dto, contractId);
      case ContractType.PROCURACAO:
        return this.generateProcuracaoContract(dto, contractId);
      default:
        throw new Error(`Tipo de contrato não suportado: ${dto.documentType}`);
    }
  }

  private generateContractId(): string {
    return Date.now().toString();
  }

  private async generateLocacaoContract(
    dto: GenerateContractDto,
    contractId: string,
  ): Promise<{ contractId: string; documentUrl: string }> {
    try {
      // Prepara dados
      const data = this.prepareLocacaoData(dto, contractId);

      // Verifica se gerador já existe no banco
      await this.checkAndCreateGenerator(data);

      // Adiciona linha no Google Sheets
      await this.googleApis.appendRow(this.SPREADSHEET_ID, this.SHEET_LOCACAO, {
        'ID CONTRATO': contractId,
        'CIDADE': data.cidade,
        'NOME GERADOR': data.nomeGerador,
        'DATA': data.data,
        'CPF/CNPJ GERADOR': data.cpfCnpjGerador,
        'EMAIL GERADOR': data.emailGerador,
        'BANCO GERADOR': data.bancoGerador,
        'AGENCIA GERADOR': data.agenciaGerador,
        'CONTA GERADOR': data.contaGerador,
        'NOME CONSUMIDOR': data.nomeConsumidor,
        'CPF/CNPJ CONSUMIDOR': data.cpfCnpjConsumidor,
        'EMAIL CONSUMIDOR': data.emailConsumidor,
        'TIPO USINA': data.tipoUsina,
        'NUMERO UC GERADOR': data.numeroUcGerador,
        'NUMERO UC CONSUMIDOR': data.numeroUcConsumidor,
        'PERCENTUAL CAPACIDADE': data.percentualCapacidade,
        'PERCENTUAL DESCONTO': data.percentualDesconto,
        'PRAZO DE VIGENCIA': data.prazoVigencia,
        'PRAZO MULTA': data.prazoMulta,
        'RUA GERADOR': data.ruaGerador,
        'NUMERO CASA GERADOR': data.numeroCasaGerador,
        'BAIRRO GERADOR': data.bairroGerador,
        'CIDADE GERADOR': data.cidadeGerador,
        'UF GERADOR': data.ufGerador,
        'CEP GERADOR': data.cepGerador,
        'RUA CONSUMIDOR': data.ruaConsumidor,
        'CEP CONSUMIDOR': data.cepConsumidor,
        'TIPO DOCUMENTO GERADOR': data.tipoDocumentoGerador,
        'TIPO DOCUMENTO CONSUMIDOR': data.tipoDocumentoConsumidor,
      });

      // Cria pasta no Google Drive
      const folderName = `CONTRATO ${contractId} - ${data.nomeGerador} & ${data.nomeConsumidor}`;
      const folderId = await this.googleApis.createFolder(folderName, this.FOLDER_LOCACAO_ID);

      // Copia template
      const documentName = `${contractId} - Contrato (${data.nomeGerador}) & ${data.nomeConsumidor}`;
      const documentId = await this.googleApis.copyFile(
        this.TEMPLATE_LOCACAO_ID,
        documentName,
        folderId,
      );

      // Atualiza documento
      await this.googleApis.updateDocument(documentId, {
        '{NOME DO GERADOR}': data.nomeGerador.toUpperCase(),
        '{ENDEREÇO COMPLETO DO GERADOR}': this.formatEnderecoCompleto(
          data.ruaGerador,
          data.bairroGerador,
          data.numeroCasaGerador,
          data.cidadeGerador,
          data.ufGerador,
        ),
        '{CPF OU CNPJ GERADOR}': data.cpfCnpjGerador,
        '{NOME DO CONSUMIDOR}': data.nomeConsumidor,
        '{ENDEREÇO COMPLETO DO CONSUMIDOR}': this.formatEnderecoCompleto(
          data.ruaConsumidor,
          data.bairroConsumidor,
          data.numeroConsumidor,
          data.cidadeConsumidor,
          data.ufConsumidor,
        ),
        '{CIDADE}': data.cidade,
        '{DATA}': data.data,
        '{NÚMERO DA UC DO GERADOR}': data.numeroUcGerador,
        '{NÚMERO DA UC DO CONSUMIDOR}': data.numeroUcConsumidor,
        '{PERCENTUAL DA CAPACIDADE}': data.percentualCapacidade,
        '{PERCENTUAL POR EXTENSO CAPACIDADE}': data.percentualCapacidadePorExtenso,
        '{PERCENTUAL DE DESCONTO}': data.percentualDesconto,
        '{PERCENTUAL DE DESCONTO POR EXTENSO}': data.percentualDescontoPorExtenso,
        '{NÚMERO DE MESES}': data.prazoVigencia,
        '{NÚMERO DE MESES POR EXTENSO}': data.prazoVigenciaPorExtenso,
        '{DIA DO MÊS}': data.diaPagamento,
        '{E-MAIL DO GERADOR}': data.emailGerador,
        '{E-MAIL DO CONSUMIDOR}': data.emailConsumidor,
        '{BANCO}': data.bancoGerador,
        '{AGÊNCIA}': data.agenciaGerador,
        '{Nº DA CONTA}': data.contaGerador,
        '{CNPJ OU CPF DO CONSUMIDOR}': data.cpfCnpjConsumidor,
        '{PERCENTUAL POR EXTENSO}': data.percentualCapacidadePorExtenso,
        '{TIPO DA USINA}': data.tipoUsina,
        '{NÚMERO DE MESES MULTA}': data.prazoMulta,
      });

      // Baixa como PDF
      const pdfBuffer = await this.googleApis.downloadAsPdf(documentId);

      // Envia email
      await this.googleApis.sendEmail(
        this.EMAIL_TO,
        `CONTRATO DE LOCAÇÃO - ${data.nomeGerador}`,
        this.getEmailMessage(),
        {
          filename: `${documentName}.pdf`,
          content: pdfBuffer,
        },
      );

      const documentUrl = `https://docs.google.com/document/d/${documentId}`;

      return { contractId, documentUrl };
    } catch (error) {
      this.logger.error('Erro ao gerar contrato de locação:', error);
      throw error;
    }
  }

  private async generatePrestacaoContract(
    dto: GenerateContractDto,
    contractId: string,
  ): Promise<{ contractId: string; documentUrl: string }> {
    try {
      const data = this.preparePrestacaoData(dto, contractId);

      // Adiciona linha no Google Sheets
      await this.googleApis.appendRow(this.SPREADSHEET_ID, this.SHEET_PRESTACAO, {
        'ID CONTRATO': contractId,
        'NOME DO CONTRATANTE': data.nomeContratante,
        'ENDERECO DO CONTRATANTE': data.enderecoContratante,
        'CPF/CNPJ DO CONTRATANTE': data.cpfCnpjContratante,
        'TIPO DE ENERGIA': this.formatTipoEnergia(data.tipoEnergia),
        'NÚMERO DE MESES RECISÃO ': data.prazoMinimoMulta,
        'EMAIL DO CONTRATANTE': data.emailContratante,
        'NOME DO REPRESENTANTE DO CONTRATANTE': data.nomeRepresentanteContratante,
        'CPF DO REPRESENTANTE DO CONTRATANTE': data.cpfRepresentanteContratante,
        'CIDADE': data.cidade,
        'DATA': data.data,
      });

      // Cria pasta
      const folderName = `CONTRATO ${data.nomeContratante}`;
      const folderId = await this.googleApis.createFolder(folderName, this.FOLDER_PRESTACAO_ID);

      // Copia template
      const documentName = `${contractId} - CONTRATANTE ${data.nomeContratante}`;
      const documentId = await this.googleApis.copyFile(
        this.TEMPLATE_PRESTACAO_ID,
        documentName,
        folderId,
      );

      // Atualiza documento
      await this.googleApis.updateDocument(documentId, {
        '{NOME DO CONTRATANTE}': data.nomeContratante,
        '{ENDEREÇO DO CONTRATANTE}': data.enderecoContratante,
        '{CPF/CNPJ DO CONTRATANTE}': data.cpfCnpjContratante,
        '{TIPO DE ENERGIA}': this.formatTipoEnergia(data.tipoEnergia),
        '{NÚMERO DE MESES}': data.prazoMinimoMulta,
        '{EMAIL DO CONTRATANTE}': data.emailContratante,
        '{NOME DO REPRESENTANTE DO CONTRATANTE}': data.nomeRepresentanteContratante,
        '{CPF DO REPRESENTANTE DO CONTRATANTE}': data.cpfRepresentanteContratante,
      });

      // Baixa como PDF
      const pdfBuffer = await this.googleApis.downloadAsPdf(documentId);

      // Envia email
      await this.googleApis.sendEmail(
        this.EMAIL_TO,
        `CONTRATO DE PRESTAÇÃO DE SERVIÇO - ${data.nomeContratante}`,
        this.getEmailMessage(),
        {
          filename: `${documentName}.pdf`,
          content: pdfBuffer,
        },
      );

      const documentUrl = `https://docs.google.com/document/d/${documentId}`;

      return { contractId, documentUrl };
    } catch (error) {
      this.logger.error('Erro ao gerar contrato de prestação:', error);
      throw error;
    }
  }

  private async generateProcuracaoContract(
    dto: GenerateContractDto,
    contractId: string,
  ): Promise<{ contractId: string; documentUrl: string }> {
    try {
      const isPJ = dto.procuracaoType?.toLowerCase() === 'pj';

      if (isPJ) {
        return this.generateProcuracaoPJ(dto, contractId);
      } else {
        return this.generateProcuracaoPF(dto, contractId);
      }
    } catch (error) {
      this.logger.error('Erro ao gerar procuração:', error);
      throw error;
    }
  }

  private async generateProcuracaoPJ(
    dto: GenerateContractDto,
    contractId: string,
  ): Promise<{ contractId: string; documentUrl: string }> {
    const data = this.prepareProcuracaoPJData(dto, contractId);

    // Adiciona linha no Google Sheets
    await this.googleApis.appendRow(this.SPREADSHEET_ID, this.SHEET_PROCURACAO_PJ, {
      'ID': contractId,
      'Cidade': data.cidade,
      'Data': data.data,
      'Razão Social': data.razaoSocialOutorgante,
      'CNPJ Outorgante': data.cnpjOutorgante,
      'Nome Representante': data.nomeRepresentanteOutorgante,
      'CPF RP': data.cpfRepresentanteOutorgante,
      'Cargo RP': data.cargoRepresentanteOutorgante,
    });

    // Cria pasta
    const folderName = `PROCURAÇÃO PJ - ${data.razaoSocialOutorgante}`;
    const folderId = await this.googleApis.createFolder(folderName, this.FOLDER_PROCURACAO_ID);

    // Copia template
    const documentName = `PROCURAÇÃO - ${data.razaoSocialOutorgante}`;
    const documentId = await this.googleApis.copyFile(
      this.TEMPLATE_PROCURACAO_PJ_ID,
      documentName,
      folderId,
    );

    // Atualiza documento
    const now = new Date();
    await this.googleApis.updateDocument(documentId, {
      '{RAZÃO_SOCIAL_OUTORGANTE}': data.razaoSocialOutorgante,
      '{CNPJ_OUTORGANTE}': data.cnpjOutorgante,
      '{ENDERECO_OUTORGANTE}': data.enderecoOutorgante,
      '{NOME_REPRESENTANTE}': data.nomeRepresentanteOutorgante,
      '{CPF_REPRESENTANTE}': data.cpfRepresentanteOutorgante,
      '{CARGO_REPRESENTANTE}': data.cargoRepresentanteOutorgante,
      ' {CIDADE}': data.cidade,
      '{ANO}': now.getFullYear().toString(),
      '{DIA}': now.getDate().toString(),
      '{MES}': this.getMonthName(now),
    });

    // Baixa como PDF
    const pdfBuffer = await this.googleApis.downloadAsPdf(documentId);

    // Envia email
    await this.googleApis.sendEmail(
      this.EMAIL_TO,
      `CONTRATO DE PRESTAÇÃO DE SERVIÇO - ${data.razaoSocialOutorgante}`,
      this.getEmailMessage(),
      {
        filename: `${documentName}.pdf`,
        content: pdfBuffer,
      },
    );

    const documentUrl = `https://docs.google.com/document/d/${documentId}`;

    return { contractId, documentUrl };
  }

  private async generateProcuracaoPF(
    dto: GenerateContractDto,
    contractId: string,
  ): Promise<{ contractId: string; documentUrl: string }> {
    const data = this.prepareProcuracaoPFData(dto, contractId);

    // Adiciona linha no Google Sheets
    await this.googleApis.appendRow(this.SPREADSHEET_ID, this.SHEET_PROCURACAO_PF, {
      'ID': contractId,
      'Tipo Procuração': data.tipoProcuracao.toUpperCase(),
      'Data': data.data,
      'Nome Outorgante': data.nomeOutorgante,
      'CPF Outorgante': data.cpfOutorgante,
      'Cidade': data.cidade,
      'Endereço Outorgante': data.enderecoOutorgante,
      'Ocupação Outorgante': data.ocupacaoOutorgante,
    });

    // Cria pasta
    const folderName = `PROCURAÇÃO PF - ${data.nomeOutorgante}`;
    const folderId = await this.googleApis.createFolder(folderName, this.FOLDER_PROCURACAO_ID);

    // Copia template
    const documentName = `PROCURAÇÃO - ${data.nomeOutorgante} - ${contractId}`;
    const documentId = await this.googleApis.copyFile(
      this.TEMPLATE_PROCURACAO_PF_ID,
      documentName,
      folderId,
    );

    // Atualiza documento
    const now = new Date();
    await this.googleApis.updateDocument(documentId, {
      '{NOME_OUTORGANTE}': data.nomeOutorgante,
      '{CPF_OUTORGANTE}': data.cpfOutorgante,
      '{OCUPACAO_OUTORGANTE}': data.ocupacaoOutorgante,
      '{ENDERECO_OUTORGANTE}': data.enderecoOutorgante,
      '{ANO}': '2025',
    });

    // Baixa como PDF
    const pdfBuffer = await this.googleApis.downloadAsPdf(documentId);

    // Envia email
    await this.googleApis.sendEmail(
      this.EMAIL_TO,
      `CONTRATO DE PRESTAÇÃO DE SERVIÇO - ${data.nomeOutorgante}`,
      this.getEmailMessage(),
      {
        filename: `${documentName}.pdf`,
        content: pdfBuffer,
      },
    );

    const documentUrl = `https://docs.google.com/document/d/${documentId}`;

    return { contractId, documentUrl };
  }

  // Métodos auxiliares
  private prepareLocacaoData(dto: GenerateContractDto, contractId: string) {
    return {
      idContrato: contractId,
      cidade: dto.cidade,
      data: dto.data,
      nomeGerador: dto.nomeGerador || '',
      cpfCnpjGerador: dto.cpfCnpjGerador || '',
      emailGerador: dto.emailGerador || '',
      bancoGerador: dto.bancoGerador || '',
      agenciaGerador: dto.agenciaGerador || '',
      contaGerador: dto.contaGerador || '',
      tipoUsina: dto.tipoUsina || '',
      numeroUcGerador: dto.numeroUcGerador || '',
      ruaGerador: dto.ruaGerador || '',
      numeroCasaGerador: dto.numeroGerador || '',
      bairroGerador: dto.bairroGerador || '',
      cidadeGerador: dto.cidadeGerador || '',
      ufGerador: dto.ufGerador || '',
      cepGerador: dto.cepGerador || '',
      tipoDocumentoGerador: dto.tipoDocumentoGerador?.toUpperCase() || '',
      nomeConsumidor: dto.nomeConsumidor || '',
      cpfCnpjConsumidor: dto.cpfCnpjConsumidor || '',
      emailConsumidor: dto.emailConsumidor || '',
      numeroUcConsumidor: dto.numeroUcConsumidor || '',
      ruaConsumidor: dto.ruaConsumidor || '',
      numeroConsumidor: dto.numeroConsumidor || '',
      bairroConsumidor: dto.bairroConsumidor || '',
      cidadeConsumidor: dto.cidadeConsumidor || '',
      ufConsumidor: dto.ufConsumidor || '',
      cepConsumidor: dto.cepConsumidor || '',
      tipoDocumentoConsumidor: dto.tipoDocumentoConsumidor?.toUpperCase() || '',
      percentualCapacidade: dto.percentualCapacidade || '',
      percentualCapacidadePorExtenso:
        dto.percentualCapacidadePorExtenso ||
        this.numberToWords.toWordsSimple(dto.percentualCapacidade || '0'),
      percentualDesconto: dto.percentualDesconto || '',
      percentualDescontoPorExtenso:
        dto.percentualDescontoPorExtenso ||
        this.numberToWords.toWordsSimple(dto.percentualDesconto || '0'),
      prazoVigencia: dto.prazoVigencia || '',
      prazoVigenciaPorExtenso:
        dto.prazoVigenciaPorExtenso ||
        this.numberToWords.toWordsSimple(dto.prazoVigencia || '0'),
      prazoMulta: dto.prazoMulta || '',
      diaPagamento: dto.diaPagamento || '',
    };
  }

  private preparePrestacaoData(dto: GenerateContractDto, contractId: string) {
    return {
      idContrato: contractId,
      cidade: dto.cidade,
      data: dto.data,
      nomeContratante: dto.nomeContratante || '',
      enderecoContratante: dto.enderecoContratante || '',
      cpfCnpjContratante: dto.cpfCnpjContratante || '',
      emailContratante: dto.emailContratante || '',
      nomeRepresentanteContratante: dto.nomeRepresentanteContratante || '',
      cpfRepresentanteContratante: dto.cpfRepresentanteContratante || '',
      tipoEnergia: dto.tipoEnergia || '',
      prazoMinimoMulta: dto.prazoMinimoMulta || '',
    };
  }

  private prepareProcuracaoPJData(dto: GenerateContractDto, contractId: string) {
    return {
      id: contractId,
      cidade: dto.cidade,
      data: dto.data,
      razaoSocialOutorgante: dto.razaoSocialOutorgante || '',
      cnpjOutorgante: dto.cnpjOutorgante || '',
      nomeRepresentanteOutorgante: dto.nomeRepresentanteOutorgante || '',
      cpfRepresentanteOutorgante: dto.cpfRepresentanteOutorgante || '',
      cargoRepresentanteOutorgante: dto.cargoRepresentanteOutorgante || '',
      enderecoOutorgante: dto.enderecoOutorgante || '',
    };
  }

  private prepareProcuracaoPFData(dto: GenerateContractDto, contractId: string) {
    return {
      id: contractId,
      tipoProcuracao: dto.procuracaoType || 'pf',
      cidade: dto.cidade,
      data: dto.data,
      nomeOutorgante: dto.nomeOutorgante || '',
      cpfOutorgante: dto.cpfOutorgante || '',
      ocupacaoOutorgante: dto.ocupacaoOutorgante || '',
      enderecoOutorgante: dto.enderecoOutorgante || '',
    };
  }

  private formatEnderecoCompleto(
    rua: string,
    bairro: string,
    numero: string,
    cidade: string,
    uf: string,
  ): string {
    return `${rua}, Bairro ${bairro}, Nº ${numero}, ${cidade} - ${uf}`;
  }

  private formatTipoEnergia(tipo: string): string {
    if (!tipo) return '';
    return tipo
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private getMonthName(date: Date): string {
    return date.toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, (c) => c.toUpperCase());
  }

  private getEmailMessage(): string {
    return `Oi, pessoal do RH,  Segue em anexo o contrato para vocês darem uma olhada. Por favor, revisem os detalhes e me avisem se tiver algo para ajustar ou esclarecer. Se possível, gostaria de receber ele assinado o quanto antes para seguirmos com o processo.`;
  }

  private async checkAndCreateGenerator(data: any): Promise<void> {
    try {
      // Verifica se gerador já existe pelo CPF/CNPJ
      const existingGenerator = await this.prisma.generator.findFirst({
        where: {
          cpfCnpj: data.cpfCnpjGerador.replace(/[^0-9]/g, ''), // Remove formatação
        },
      });

      if (!existingGenerator) {
        // Cria novo gerador no banco
        await this.prisma.generator.create({
          data: {
            ownerName: data.nomeGerador,
            cpfCnpj: data.cpfCnpjGerador.replace(/[^0-9]/g, ''),
            sourceType: this.mapTipoUsinaToSourceType(data.tipoUsina),
            installedPower: 0, // Valor padrão, pode ser ajustado
            concessionaire: '', // Valor padrão
            ucNumber: data.numeroUcGerador,
            city: data.cidadeGerador,
            state: data.ufGerador,
            status: 'UNDER_ANALYSIS',
          },
        });
      }
    } catch (error) {
      this.logger.warn('Erro ao verificar/criar gerador:', error);
      // Não interrompe o fluxo se houver erro
    }
  }

  private mapTipoUsinaToSourceType(tipoUsina: string): string {
    const mapping: { [key: string]: string } = {
      solar: 'SOLAR',
      hidro: 'HYDRO',
      eolica: 'WIND',
      biomassa: 'BIOMASS',
    };

    return mapping[tipoUsina?.toLowerCase()] || 'SOLAR';
  }
}

