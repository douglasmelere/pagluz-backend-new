import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum ContractType {
  LOCACAO = 'locacao',
  PRESTACAO = 'prestacao',
  PROCURACAO = 'procuracao',
}

export class GenerateContractDto {
  @IsEnum(ContractType)
  @IsNotEmpty()
  documentType: ContractType;

  @IsString()
  @IsNotEmpty()
  cidade: string;

  @IsString()
  @IsNotEmpty()
  data: string;

  // Campos para Locação
  @IsOptional()
  @IsString()
  nomeGerador?: string;

  @IsOptional()
  @IsString()
  cpfCnpjGerador?: string;

  @IsOptional()
  @IsString()
  emailGerador?: string;

  @IsOptional()
  @IsString()
  bancoGerador?: string;

  @IsOptional()
  @IsString()
  agenciaGerador?: string;

  @IsOptional()
  @IsString()
  contaGerador?: string;

  @IsOptional()
  @IsString()
  tipoUsina?: string;

  @IsOptional()
  @IsString()
  numeroUcGerador?: string;

  @IsOptional()
  @IsString()
  ruaGerador?: string;

  @IsOptional()
  @IsString()
  numeroGerador?: string;

  @IsOptional()
  @IsString()
  bairroGerador?: string;

  @IsOptional()
  @IsString()
  cidadeGerador?: string;

  @IsOptional()
  @IsString()
  ufGerador?: string;

  @IsOptional()
  @IsString()
  cepGerador?: string;

  @IsOptional()
  @IsString()
  tipoDocumentoGerador?: string;

  @IsOptional()
  @IsString()
  nomeConsumidor?: string;

  @IsOptional()
  @IsString()
  cpfCnpjConsumidor?: string;

  @IsOptional()
  @IsString()
  emailConsumidor?: string;

  @IsOptional()
  @IsString()
  numeroUcConsumidor?: string;

  @IsOptional()
  @IsString()
  ruaConsumidor?: string;

  @IsOptional()
  @IsString()
  numeroConsumidor?: string;

  @IsOptional()
  @IsString()
  bairroConsumidor?: string;

  @IsOptional()
  @IsString()
  cidadeConsumidor?: string;

  @IsOptional()
  @IsString()
  ufConsumidor?: string;

  @IsOptional()
  @IsString()
  cepConsumidor?: string;

  @IsOptional()
  @IsString()
  tipoDocumentoConsumidor?: string;

  @IsOptional()
  @IsString()
  percentualCapacidade?: string;

  @IsOptional()
  @IsString()
  percentualCapacidadePorExtenso?: string;

  @IsOptional()
  @IsString()
  percentualDesconto?: string;

  @IsOptional()
  @IsString()
  percentualDescontoPorExtenso?: string;

  @IsOptional()
  @IsString()
  prazoVigencia?: string;

  @IsOptional()
  @IsString()
  prazoVigenciaPorExtenso?: string;

  @IsOptional()
  @IsString()
  prazoMulta?: string;

  @IsOptional()
  @IsString()
  diaPagamento?: string;

  // Campos para Prestação
  @IsOptional()
  @IsString()
  nomeContratante?: string;

  @IsOptional()
  @IsString()
  enderecoContratante?: string;

  @IsOptional()
  @IsString()
  cpfCnpjContratante?: string;

  @IsOptional()
  @IsString()
  emailContratante?: string;

  @IsOptional()
  @IsString()
  nomeRepresentanteContratante?: string;

  @IsOptional()
  @IsString()
  cpfRepresentanteContratante?: string;

  @IsOptional()
  @IsString()
  tipoEnergia?: string;

  @IsOptional()
  @IsString()
  prazoMinimoMulta?: string;

  // Campos para Procuração
  @IsOptional()
  @IsString()
  procuracaoType?: string; // 'pj' ou 'pf'

  @IsOptional()
  @IsString()
  razaoSocialOutorgante?: string;

  @IsOptional()
  @IsString()
  cnpjOutorgante?: string;

  @IsOptional()
  @IsString()
  nomeRepresentanteOutorgante?: string;

  @IsOptional()
  @IsString()
  cpfRepresentanteOutorgante?: string;

  @IsOptional()
  @IsString()
  cargoRepresentanteOutorgante?: string;

  @IsOptional()
  @IsString()
  nomeOutorgante?: string;

  @IsOptional()
  @IsString()
  cpfOutorgante?: string;

  @IsOptional()
  @IsString()
  ocupacaoOutorgante?: string;

  @IsOptional()
  @IsString()
  enderecoOutorgante?: string;
}

