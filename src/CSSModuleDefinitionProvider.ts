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
import { strict } from "assert";

interface ClickInfo {
  importModule: string;
  targetClass: string;
}

interface Keyword {
  obj: string;
  field: string;
}

function getKeyword(currentWord: string): Keyword | null {
  // currentline에서 클래스명이랑 필드 명으로 분리하는 부분
  const words = currentWord.split("/");
  if (words.length !== 2) {
    return null;
  }

  return {
    obj: words[0],
    field: words[1],
  };
}

function findImportModule(
  currentDir: string,
  text: string,
  key: string
): string | null {
  // css file 경로 파악하기 - css 어쩌구 시작하는 놈만 찾기로..
  const regex = /\[css.*/g;
  const modules = text.matchAll(regex);
  // 해당 s/template 이런식이면 s를 가지고 있는 놈인지 확인
  // [css.new-team.main :as s] 이런식이면 공백으로 짤라서 본다
  for (const module of modules) {
    const bRegex = /\[.*\]/;
    const found = module[0].match(bRegex);
    if (!found) {
      continue;
    }

    const [modulePath, _, styleName] = found[0]
      .substring(1, found[0].length - 1)
      .split(" ");

    if (styleName === key) {
      let targetCssFilePath = currentDir;
      let splittedModule = modulePath.replaceAll("-", "_").split(".");

      for (const s of splittedModule) {
        targetCssFilePath += `/${s}`;
      }

      return `${targetCssFilePath}.css`;
    }
  }

  return null;
}

function getClickInfoByKeyword(
  currentDir: string,
  document: TextDocument,
  currentLine: string,
  position: Position,
  currentWord: string
): ClickInfo | null {
  const keyword = getKeyword(currentWord);
  if (!keyword) {
    return null;
  }

  // s/classname 할때 앞에 s랑 targetClass분리해서 각각 처리
  const importModule = findImportModule(
    currentDir,
    document.getText(),
    keyword.obj
  );

  if (!importModule) {
    return null;
  }

  const targetClass = keyword.field;

  return {
    importModule: importModule,
    targetClass: targetClass,
  };
}

function getPositionInCssFile(
  document: TextDocument,
  currentLine: string,
  position: Position,
  currentWord: string
): Position | null {
  return new Position(0, 0);
}

function getCurrentSrcPath(currentDir: string): string | null {
  const regex = /.*src./;
  const found = currentDir.match(regex);

  if (!found) {
    return null;
  }
  return found[0].substring(0, found[0].length - 1);
}

export class CSSModuleDefinitionProvider implements DefinitionProvider {
  constructor() {}

  public async provideDefinition(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Promise<Location | null> {
    // Location(uri: Uri, rangeOrPosition: Range | Position)
    const currentDir = getCurrentSrcPath(path.dirname(document.uri.fsPath));
    if (!currentDir) {
      return null;
    }

    const currentLine = document.getText(document.lineAt(position).range);
    const currentWord = document.getText(
      document.getWordRangeAtPosition(position)
    );

    // click한거 및 css file 불러온거 맞는지
    const clickInfo = getClickInfoByKeyword(
      currentDir,
      document,
      currentLine,
      position,
      currentWord
    );
    if (!clickInfo) {
      return Promise.resolve(null);
    }

    // css 파일 열었을때의 위치
    const targetPosition: Position | null = getPositionInCssFile(
      document,
      currentLine,
      position,
      currentWord
    );

    if (!targetPosition) {
      return Promise.resolve(null);
    }

    // css 파일의 경로, 파일 경로내에서의 위치
    return Promise.resolve(
      new Location(Uri.file(clickInfo.importModule), targetPosition)
    );
  }
}

export default CSSModuleDefinitionProvider;
