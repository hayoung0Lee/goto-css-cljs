import {
  DefinitionProvider,
  TextDocument,
  Position,
  CancellationToken,
  Location,
  Uri,
} from "vscode";
import * as path from "path";
import * as fs from "fs";

type ClassTransformer = (cls: string) => string;

interface ClickInfo {
  importModule: string;
  targetClass: string;
}

interface Keyword {
  obj: string;
  field: string;
}

export class CSSModuleDefinitionProvider implements DefinitionProvider {
  constructor() {}

  public async provideDefinition(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Promise<Location | null> {
    const currentDir = path.dirname(document.uri.fsPath);
    console.log("promise 안녕", currentDir);
    return Promise.resolve(null);
  }
}

export default CSSModuleDefinitionProvider;
