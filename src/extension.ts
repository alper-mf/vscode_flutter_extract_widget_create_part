import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.extractFlutterWidgetCreatePart', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const selectedText = editor.document.getText(editor.selection);
    if (!selectedText) {
      vscode.window.showErrorMessage('Lütfen bir widget seçin.');
      return;
    }

    // Yeni sınıf adını al
    const newClassName = await vscode.window.showInputBox({
      prompt: 'Yeni sınıf adını girin.',
      value: 'MyNewWidget', // Varsayılan sınıf adı
    });

    if (!newClassName) {
      return;
    }

    // Yeni sınıfın içeriği
    const newClassText = `class ${newClassName} extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return ${selectedText.trim()};\n  }\n}`;

    // Seçili metnin yerine yeni sınıfın örneğini oluştur
    await editor.edit((editBuilder) => {
      editBuilder.replace(editor.selection, `${newClassName}()`);
    });

    // Yeni sınıf dosyasını oluştur
    let className = newClassName;
    if (className.startsWith('_')) {
      className = className.slice(1);
    }
    const parts = className.split(/(?=[A-Z])/);
    parts[0] = parts[0].charAt(0).toLowerCase() + parts[0].slice(1);
    const fileName = `${parts.join('_').toLowerCase()}.dart`;

    // A sınıfının başına part olarak ekle
    const currentFileContent = fs.readFileSync(editor.document.uri.fsPath).toString();
    const partTextForCurrentClass = `part "${fileName}";\n\n`; // Part of ifadesi oluşturuluyor

    // Dosyanın başlangıcından itibaren ilk satıra kadar olan metni al
    const firstLine = editor.document.lineAt(0).text.trim();

    // Eğer main fonksiyonu yoksa part ifadesini dosyanın başına ekle
    let newFileContent;
    if (!firstLine.startsWith('void main()')) {
      newFileContent = `${partTextForCurrentClass}${currentFileContent}`;
    } else {
      // Main fonksiyonu varsa, main fonksiyonundan sonra gelecek şekilde part ifadesini ekle
      const index = currentFileContent.indexOf('{');
      newFileContent = `${currentFileContent.substring(0, index)}\n\n${partTextForCurrentClass}${currentFileContent.substring(index)}`;
    }

    // Dosyayı kaydet ve değiştirilmediğinden emin ol
    try {
      await editor.document.save(); // Dosyayı kaydet
    } catch (err) {
      console.error(err);
      return;
    }

    const currentFileName = path.basename(editor.document.uri.fsPath, '.dart');
    const currentFileStat = fs.statSync(editor.document.uri.fsPath);
    const currentFileModificationTime = currentFileStat.mtimeMs;
    if (currentFileModificationTime > Date.now()) {
      vscode.window.showErrorMessage(`Dosya "${currentFileName}" daha yeni bir sürüme sahip. Değişikliklerinizi kaydetmek için lütfen dosyayı yeniden açın ve farklı bir adla kaydedin.`);
      return;
    }

    // Dosyayı tamamen güncelle
    try {
      fs.writeFileSync(editor.document.uri.fsPath, newFileContent);
    } catch (err) {
      console.error(err);
      return;
    }

    const currentDirectory = path.dirname(editor.document.uri.fsPath);
    const newFilePath = path.join(currentDirectory, fileName);

    // Yeni dosyanın içeriğini oluştur
    const partOfText = `part of "${currentFileName}.dart"; \n`;
    try {
      fs.writeFileSync(newFilePath, `${partOfText}${newClassText}`);
    } catch (err) {
      console.error(err);
      return;
    }

    vscode.window.showInformationMessage(`${newClassName} adlı yeni widget sınıfı başarıyla oluşturuldu.`);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
