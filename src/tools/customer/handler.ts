import { z } from "zod";
import server from "../../server.js";
import constants from "../../utils/constants.js";
import { CustomerRequest, CustomerResponse } from "./typings.js";
import { request } from "../../utils/hub.http.js";

server.registerTool(
  "post_customer",
  {
    description: "Cria um novo cliente no Hub. Use esta ferramenta para registrar clientes encontrados em outras fontes.",
    inputSchema: z.object({
      codigo: z
        .string({ required_error: "codigo é obrigatório" })
        .min(1, "codigo não pode ser vazio")
        .max(40, "codigo deve ter no máximo 40 caracteres"),
      tipo: z
        .nativeEnum(constants.PESSOA.TIPO, {
          required_error: "tipo é obrigatório",
          invalid_type_error: `tipo deve ser: ${Object.entries(constants.PESSOA.TIPO)
            .map(([k, v]) => `${v}=${k}`)
            .join(", ")}`,
        })
        .describe("Tipo de pessoa. 1=Jurídica, 2=Física, 3=Exportação"),
      cnpjCpf: z
        .string({ required_error: "cnpjCpf é obrigatório" })
        .min(1, "cnpjCpf não pode ser vazio")
        .max(40, "cnpjCpf deve ter no máximo 40 caracteres")
        .describe("Somente dígitos: CPF (11 dígitos) ou CNPJ (14 dígitos)"),
      nomeFantasia: z
        .string({ required_error: "nomeFantasia é obrigatório" })
        .min(1, "nomeFantasia não pode ser vazio")
        .max(250, "nomeFantasia deve ter no máximo 250 caracteres"),
      status: z
        .number({ required_error: "status é obrigatório" })
        .refine(
          (v) => Object.values(constants.STATUS).includes(v),
          { message: `status deve ser ${Object.values(constants.STATUS).join(" ou ")} (0=Inativo, 1=Ativo)` },
        ),
    }),
  },
  async ({ cnpjCpf, codigo, nomeFantasia, status, tipo }) => {
    if (tipo === constants.PESSOA.TIPO.FISICA) {
      if (!constants.CPF.test(cnpjCpf)) {
        return {
          isError: true,
          content: [{ type: "text", text: "Erro: cnpjCpf deve ser um CPF válido com 11 dígitos numéricos (sem pontos ou traços)" }],
        };
      }
    } else if (
      tipo === constants.PESSOA.TIPO.JURIDICA ||
      tipo === constants.PESSOA.TIPO.EXPORTACAO
    ) {
      if (!constants.CNPJ.test(cnpjCpf)) {
        return {
          isError: true,
          content: [{ type: "text", text: "Erro: cnpjCpf deve ser um CNPJ válido com 14 dígitos numéricos (sem pontos, barras ou traços)" }],
        };
      }
    }

    const { data, error } = await request<CustomerRequest, CustomerResponse>(
      "/clientes",
      "POST",
      { codigo, tipo, cnpjCpf, nomeFantasia, status },
    );

    if (error || !data) {
      return {
        isError: true,
        content: [{ type: "text", text: `Falha ao criar cliente: ${error ?? "resposta vazia"}` }],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Cliente criado com sucesso!\n\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  },
);
