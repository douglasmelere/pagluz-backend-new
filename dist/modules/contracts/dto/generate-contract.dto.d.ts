export declare enum ContractType {
    LOCACAO = "locacao",
    PRESTACAO = "prestacao",
    PROCURACAO = "procuracao"
}
export declare class GenerateContractDto {
    documentType: ContractType;
    cidade: string;
    data: string;
    nomeGerador?: string;
    cpfCnpjGerador?: string;
    emailGerador?: string;
    bancoGerador?: string;
    agenciaGerador?: string;
    contaGerador?: string;
    tipoUsina?: string;
    numeroUcGerador?: string;
    ruaGerador?: string;
    numeroGerador?: string;
    bairroGerador?: string;
    cidadeGerador?: string;
    ufGerador?: string;
    cepGerador?: string;
    tipoDocumentoGerador?: string;
    nomeConsumidor?: string;
    cpfCnpjConsumidor?: string;
    emailConsumidor?: string;
    numeroUcConsumidor?: string;
    ruaConsumidor?: string;
    numeroConsumidor?: string;
    bairroConsumidor?: string;
    cidadeConsumidor?: string;
    ufConsumidor?: string;
    cepConsumidor?: string;
    tipoDocumentoConsumidor?: string;
    percentualCapacidade?: string;
    percentualCapacidadePorExtenso?: string;
    percentualDesconto?: string;
    percentualDescontoPorExtenso?: string;
    prazoVigencia?: string;
    prazoVigenciaPorExtenso?: string;
    prazoMulta?: string;
    diaPagamento?: string;
    nomeContratante?: string;
    enderecoContratante?: string;
    cpfCnpjContratante?: string;
    emailContratante?: string;
    nomeRepresentanteContratante?: string;
    cpfRepresentanteContratante?: string;
    tipoEnergia?: string;
    prazoMinimoMulta?: string;
    procuracaoType?: string;
    razaoSocialOutorgante?: string;
    cnpjOutorgante?: string;
    nomeRepresentanteOutorgante?: string;
    cpfRepresentanteOutorgante?: string;
    cargoRepresentanteOutorgante?: string;
    nomeOutorgante?: string;
    cpfOutorgante?: string;
    ocupacaoOutorgante?: string;
    enderecoOutorgante?: string;
}
