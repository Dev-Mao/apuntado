import { ESLint } from "eslint";
import { isProjectFile, ROOT, toRepoPath } from "./source.js";

export const COMPLEXITY_LIMIT = 10;
export const COMPLEXITY_GOAL = 5;

export interface FunctionComplexity {
  readonly file: string;
  readonly line: number;
  readonly name: string;
  readonly complexity: number;
}

const MESSAGE = /^(.+) has a complexity of (\d+)\./;

export const measureComplexity = async (): Promise<FunctionComplexity[]> => {
  const eslint = new ESLint({ cwd: ROOT, overrideConfig: [{ rules: { complexity: ["warn", { max: 0 }] } }] });
  const results = await eslint.lintFiles(["apps/api/src", "packages/contracts/src"]);
  return results
    .filter((result) => isProjectFile(result.filePath))
    .flatMap((result) =>
      result.messages.flatMap((message) => {
        const match = message.ruleId === "complexity" ? MESSAGE.exec(message.message) : null;
        if (!match) return [];
        const [, name = "", complexity = "0"] = match;
        return [{ file: toRepoPath(result.filePath), line: message.line, name, complexity: Number(complexity) }];
      }),
    );
};
