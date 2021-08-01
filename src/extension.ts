// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { languages, ExtensionContext, DocumentFilter } from "vscode";
import CSSModuleDefinitionProvider from "./CSSModuleDefinitionProvider";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "goto-css-cljs" is now active!');

  const mode: DocumentFilter[] = [{ language: "clojure", scheme: "file" }];

  context.subscriptions.push(
    languages.registerDefinitionProvider(
      mode,
      new CSSModuleDefinitionProvider()
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
