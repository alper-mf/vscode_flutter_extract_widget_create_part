import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.extractFlutterWidgetCreatePart', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const selectedText = getSelectedText(editor);
    if (!selectedText) {
      vscode.window.showErrorMessage('Please select a widget.');
      return;
    }

    // Add a new class name with the user input
    const newClassName = await getNewClassName();
    if (!newClassName) {
      return;
    }

    // Create a new class text
    const newClassText = createNewClassText(newClassName, selectedText);


    // Replace the selected text with the new instance
    await replaceSelectedTextWithNewInstance(editor, newClassName);

    // Yeni sınıf dosyasını oluştur
    const fileName = generateFileName(newClassName);
 

    // Add a part expression to the current file
    const currentFileContent = fs.readFileSync(editor.document.uri.fsPath).toString();
    const partTextForCurrentClass = createPartTextForCurrentClass(fileName);
    const currentFileName = path.basename(editor.document.uri.fsPath, '.dart');

    // Update the current file
    const firstLine = editor.document.lineAt(0).text.trim();

    // If there is no main function, add the part expression to the beginning of the file
    let newFileContent;
    if (!firstLine.startsWith('void main()')) {
      newFileContent = `${partTextForCurrentClass}${currentFileContent}`;
    } else {
      // Otherwise, add the part expression after the first curly brace
      const index = currentFileContent.indexOf('{');
      newFileContent = `${currentFileContent.substring(0, index)}\n\n${partTextForCurrentClass}${currentFileContent.substring(index)}`;
    }

    // Update the current file and be sure that the file is not changed by another process
    try {
      await editor.document.save(); // Save the current file
    } catch (err) {
      console.error(err);
      return;
    }


    const currentFileStat = fs.statSync(editor.document.uri.fsPath);
    const currentFileModificationTime = currentFileStat.mtimeMs;
    if (currentFileModificationTime > Date.now()) {
      vscode.window.showErrorMessage('The file has been changed. Please try again.');
      return;
    }

    // Update the current file
    try {
      fs.writeFileSync(editor.document.uri.fsPath, newFileContent);
    } catch (err) {
      console.error(err);
      return;
    }

    createNewFile(editor, fileName, newClassText);

    vscode.window.showInformationMessage(`The new file has been created: ${fileName}`);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}


/// Get the selected text
function getSelectedText(editor: vscode.TextEditor) {
  return editor.document.getText(editor.selection);
}

/// Get a new class name from the user
async function getNewClassName() {
  return await vscode.window.showInputBox({
    prompt: 'Enter the new class name.',
    value: 'MyNewWidget',
  });
}

/// Create a new class text
function createNewClassText(newClassName: string, selectedText: string) {
  return `class ${newClassName} extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return ${selectedText.trim()};\n  }\n}`;
}

/// Replace the selected text with the new instance
async function replaceSelectedTextWithNewInstance(editor: vscode.TextEditor, newClassName: string) {
  await editor.edit((editBuilder) => {
    editBuilder.replace(editor.selection, `${newClassName}()`);
  });
}

/// Generate a file name from the class name
function generateFileName(className: string) {
  let fileName = className;
  if (fileName.startsWith('_')) {
    fileName = fileName.slice(1);
  }
  const parts = fileName.split(/(?=[A-Z])/);
  parts[0] = parts[0].charAt(0).toLowerCase() + parts[0].slice(1);
  return `${parts.join('_').toLowerCase()}.dart`;
}
/// Add a part expression to the current file
function createPartTextForCurrentClass(fileName: string) {
  return `part "${fileName}";\n\n`;
}

/// Create a new file with the given file name and class text
function createNewFile(editor: vscode.TextEditor, fileName: string, newClassText: string) {
  const currentDirectory = path.dirname(editor.document.uri.fsPath);
  const newFilePath = path.join(currentDirectory, fileName);

  const currentFileName = path.basename(editor.document.uri.fsPath, '.dart');
  const partOfText = `part of "${currentFileName}.dart"; \n`;

  try {
    fs.writeFileSync(newFilePath, `${partOfText}${newClassText}`);
  } catch (err) {
    console.error(err);
    return;
  }
}