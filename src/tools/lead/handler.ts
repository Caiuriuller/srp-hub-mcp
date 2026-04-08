import { z } from "zod";
import server from "../../server.js";
import { request } from "../../utils/hub.http.js";
import { LeadRequest, LeadResponse } from "./typings.js";

server.registerTool(
  "post_lead",
  {
    description: "Cria um novo lead no Hub usando o endpoint `/leads` da API Multiplier.",
    inputSchema: z.object({
      codigo: z
        .string({ required_error: "codigo é obrigatório" })
        .min(1, "codigo não pode ser vazio")
        .max(100, "codigo deve ter no máximo 100 caracteres"),
      email: z
        .string({ required_error: "email é obrigatório" })
        .min(1, "email não pode ser vazio")
        .max(250, "email deve ter no máximo 250 caracteres")
        .email("email deve ser um endereço válido"),
      nomeFantasia: z
        .string()
        .min(1, "nomeFantasia não pode ser vazio")
        .max(250, "nomeFantasia deve ter no máximo 250 caracteres")
        .optional(),
      razaoSocial: z
        .string()
        .min(1, "razaoSocial não pode ser vazio")
        .max(250, "razaoSocial deve ter no máximo 250 caracteres")
        .optional(),
      telefone: z
        .string()
        .min(1, "telefone não pode ser vazio")
        .max(20, "telefone deve ter no máximo 20 caracteres")
        .optional(),
      celular: z
        .string()
        .min(1, "celular não pode ser vazio")
        .max(20, "celular deve ter no máximo 20 caracteres")
        .optional(),
      origem: z
        .enum(["OUTROS", "RD_STATION"])
        .optional()
        .describe("Origem do lead. Valores aceitos: OUTROS ou RD_STATION"),
    }),
  },
  async ({ celular, codigo, email, nomeFantasia, origem, razaoSocial, telefone }) => {
    const payload: LeadRequest = {
      codigo,
      email,
      ...(nomeFantasia ? { nomeFantasia } : {}),
      ...(razaoSocial ? { razaoSocial } : {}),
      ...(telefone ? { telefone } : {}),
      ...(celular ? { celular } : {}),
      ...(origem ? { origem } : {}),
    };

    const { data, error } = await request<LeadRequest, LeadResponse>("/leads", "POST", payload);

    if (error || !data) {
      return {
        isError: true,
        content: [{ type: "text", text: `Falha ao criar lead: ${error ?? "resposta vazia"}` }],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Lead criado com sucesso!\n\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  },
);
