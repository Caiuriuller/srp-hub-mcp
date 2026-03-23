export default {
  STATUS: {
    INATIVO: 0,
    ATIVO: 1,
  },
  CNPJ: /^\d{14}$/,
  CPF: /^\d{11}$/,
  PESSOA: {
    TIPO: {
      JURIDICA: 1,
      FISICA: 2,
      EXPORTACAO: 3,
    },
  },
};