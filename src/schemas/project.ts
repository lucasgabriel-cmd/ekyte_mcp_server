import { z } from "zod";
import { PaginationSchema, DateSchema, ResponseFormat } from "./common.js";

// ============ READ SCHEMAS ============

export const ListProjectsSchema = PaginationSchema.extend({
  search: z.string().optional().describe("Busca por nome do projeto"),
  workspace_id: z.number().optional().describe("ID do workspace para filtrar os projetos"),
  status: z.number().optional().describe("Filtrar por status do projeto (situation)"),
  is_planning: z.number().optional().describe("Use 1 para filtrar projetos que são apenas planejamento (tarefas planejadas não ativas), 0 para não-planejamento"),
  endpoint_override: z.string().optional().describe("Opcional: override da rota da API (ex: 'projects', 'ctc-projects', 'plans'). Padrão é 'projects'.")
});
export type ListProjectsInput = z.infer<typeof ListProjectsSchema>;

export const ListProjectTemplatesSchema = PaginationSchema.extend({
  search: z.string().optional().describe("Busca por nome do modelo/template"),
  endpoint_override: z.string().optional().describe("Opcional: override da rota da API (ex: 'projects'). Padrão é 'projects'.")
});
export type ListProjectTemplatesInput = z.infer<typeof ListProjectTemplatesSchema>;

export const ListProjectTasksSchema = PaginationSchema.extend({
  project_id: z.number().describe("ID do projeto (obtido via ekyte_list_projects)"),
  search: z.string().optional().describe("Filtrar por nome da tarefa"),
  status: z.number().optional().describe("Filtrar por status da tarefa"),
});
export type ListProjectTasksInput = z.infer<typeof ListProjectTasksSchema>;

export const ListProjectPhasesSchema = z.object({
  project_id: z.number().int().positive().describe("ID do projeto (obtido via ekyte_list_projects)"),
  response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Formato de saída"),
}).strict();
export type ListProjectPhasesInput = z.infer<typeof ListProjectPhasesSchema>;

// ============ WRITE SCHEMAS ============

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(200).describe("Nome do projeto"),
  workspaceId: z.number().int().positive().describe("ID do workspace onde o projeto será criado"),
  alias: z.string().max(14).optional().describe("Identificação curta do projeto (máx. 14 chars). Opcional: gerada a partir do nome se omitida."),
  description: z.string().max(5000).optional().describe("Descrição do projeto (objetivo, links de pastas/planilhas). Texto puro; convertido para HTML."),
  templateId: z.number().optional().describe("ID do modelo (template) do projeto, se houver. ⚠️ Não validado contra a API — use por sua conta."),
  startDate: DateSchema.optional().describe("Data de início (AAAA-MM-DD). Obrigatória na API — se omitida, usa a data de hoje."),
  endDate: DateSchema.optional().describe("Data final (AAAA-MM-DD)"),
  phases: z.array(z.string().min(1).max(100)).max(30).optional()
    .describe("Nomes das ETAPAS do projeto a criar logo após o projeto, na ordem dada (ex: ['Planejamento','Produção','Publicação']). Cada etapa recebe um project_phase_id, usado para agrupar tasks."),
  endpoint_override: z.string().optional().describe("Opcional: override da rota de criação (relativa a /api/v2/companies/{id}/). Padrão é 'projects'."),
  additional_payload: z.record(z.any()).optional().describe("Campos adicionais a mesclar no payload (JSON), caso o Ekyte passe a exigir algo novo.")
});
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const CreateProjectPhaseSchema = z.object({
  project_id: z.number().int().positive().describe("ID do projeto que recebe a etapa"),
  name: z.string().min(1).max(100).describe("Nome da etapa (ex: 'Semana 1', 'Produção', 'Dia dos Namorados')"),
  position: z.number().int().min(1).optional().describe("Posição (1 = primeira) da etapa no projeto. Opcional: se omitida, entra por último."),
}).strict();
export type CreateProjectPhaseInput = z.infer<typeof CreateProjectPhaseSchema>;

export const ReorderProjectPhasesSchema = z.object({
  project_id: z.number().int().positive().describe("ID do projeto"),
  phase_ids: z.array(z.number().int().positive()).min(1).max(100)
    .describe("IDs das etapas (project_phase_id) na NOVA ordem. Etapas do projeto que ficarem de fora mantêm-se depois das listadas, na ordem atual."),
}).strict();
export type ReorderProjectPhasesInput = z.infer<typeof ReorderProjectPhasesSchema>;

export const DeleteProjectPhaseSchema = z.object({
  project_id: z.number().int().positive().describe("ID do projeto"),
  phase_id: z.number().int().positive().describe("ID da etapa (project_phase_id) a remover"),
}).strict();
export type DeleteProjectPhaseInput = z.infer<typeof DeleteProjectPhaseSchema>;

export const ArchiveProjectSchema = z.object({
  project_id: z.number().int().positive().describe("ID do projeto a arquivar"),
}).strict();
export type ArchiveProjectInput = z.infer<typeof ArchiveProjectSchema>;

export const DeleteProjectSchema = z.object({
  project_id: z.number().int().positive().describe("ID do projeto a excluir (só funciona se o projeto nunca gerou tarefas)"),
}).strict();
export type DeleteProjectInput = z.infer<typeof DeleteProjectSchema>;
