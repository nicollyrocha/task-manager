import { randomUUID } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it } from "vitest";
import { createCallerFactory } from "../../trpc/trpc.js";
import { appRouter } from "../../trpc/router.js";
import { InMemoryTaskRepository } from "./task.repository.js";
import { TaskService } from "./task.service.js";

const createCaller = createCallerFactory(appRouter);

async function expectTRPCError(promise: Promise<unknown>, code: TRPCError["code"], message?: RegExp) {
  const error = await promise.then(
    () => {
      throw new Error("Era esperado um erro");
    },
    (err: unknown) => err,
  );
  expect(error).toBeInstanceOf(TRPCError);
  expect((error as TRPCError).code).toBe(code);
  if (message) expect((error as TRPCError).message).toMatch(message);
}

describe("task router", () => {
  let caller: ReturnType<typeof createCaller>;

  beforeEach(() => {
    caller = createCaller({ taskService: new TaskService(new InMemoryTaskRepository()) });
  });

  describe("create", () => {
    it("cria uma tarefa com id, título, descrição e data de criação", async () => {
      const task = await caller.task.create({ titulo: "  Estudar tRPC  ", descricao: "Ler a doc" });

      expect(task.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(task.titulo).toBe("Estudar tRPC");
      expect(task.descricao).toBe("Ler a doc");
      expect(task.dataCriacao).toBeInstanceOf(Date);
    });

    it("aceita tarefa sem descrição", async () => {
      const task = await caller.task.create({ titulo: "Sem descrição" });
      expect(task.descricao).toBeNull();
    });

    it("rejeita tarefa sem título", async () => {
      // @ts-expect-error — título ausente é justamente o caso testado
      await expectTRPCError(caller.task.create({}), "BAD_REQUEST", /título é obrigatório/);
    });

    it("rejeita título vazio ou só com espaços", async () => {
      await expectTRPCError(caller.task.create({ titulo: "   " }), "BAD_REQUEST", /título é obrigatório/);
    });
  });

  describe("list", () => {
    it("retorna as tarefas, mais recentes primeiro", async () => {
      const first = await caller.task.create({ titulo: "Primeira" });
      await new Promise((resolve) => setTimeout(resolve, 5));
      const second = await caller.task.create({ titulo: "Segunda" });

      const tasks = await caller.task.list();
      expect(tasks.map((t) => t.id)).toEqual([second.id, first.id]);
    });
  });

  describe("update", () => {
    it("atualiza os campos informados e mantém os demais", async () => {
      const task = await caller.task.create({ titulo: "Original", descricao: "Desc" });

      const updated = await caller.task.update({ id: task.id, titulo: "Editada" });
      expect(updated).toMatchObject({ id: task.id, titulo: "Editada", descricao: "Desc" });
      expect(updated.dataCriacao).toEqual(task.dataCriacao);

      const cleared = await caller.task.update({ id: task.id, descricao: null });
      expect(cleared.descricao).toBeNull();
    });

    it("retorna NOT_FOUND para tarefa inexistente", async () => {
      const id = randomUUID();
      await expectTRPCError(
        caller.task.update({ id, titulo: "X" }),
        "NOT_FOUND",
        new RegExp(`Tarefa com id "${id}" não encontrada`),
      );
    });

    it("rejeita atualização sem nenhum campo", async () => {
      const task = await caller.task.create({ titulo: "Tarefa" });
      await expectTRPCError(caller.task.update({ id: task.id }), "BAD_REQUEST", /ao menos um campo/);
    });

    it("rejeita título vazio", async () => {
      const task = await caller.task.create({ titulo: "Tarefa" });
      await expectTRPCError(caller.task.update({ id: task.id, titulo: "" }), "BAD_REQUEST");
    });

    it("rejeita id inválido", async () => {
      await expectTRPCError(caller.task.update({ id: "abc", titulo: "X" }), "BAD_REQUEST", /ID de tarefa inválido/);
    });
  });

  describe("delete", () => {
    it("remove a tarefa", async () => {
      const task = await caller.task.create({ titulo: "Remover" });

      await expect(caller.task.delete({ id: task.id })).resolves.toEqual({ id: task.id });
      await expect(caller.task.list()).resolves.toEqual([]);
    });

    it("retorna NOT_FOUND para tarefa inexistente", async () => {
      await expectTRPCError(caller.task.delete({ id: randomUUID() }), "NOT_FOUND");
    });
  });

  describe("byId", () => {
    it("retorna NOT_FOUND para tarefa inexistente", async () => {
      await expectTRPCError(caller.task.byId({ id: randomUUID() }), "NOT_FOUND");
    });
  });
});
