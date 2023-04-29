# Flutter Extract Widget and Create Part

This Visual Studio Code extension allows you to select a Widget in Flutter, convert it into a new StatelessWidget class, and store this new class in a part file associated with your current file. This helps you keep your code more organized and maintainable.

## Installation

1. Open Visual Studio Code.
2. Go to the Extensions tab (fourth icon on the side panel) or use the **Ctrl+Shift+X** shortcut.
3. Type "Flutter Extract Widget and Create Part" in the search bar and press enter.
4. When you find the appropriate extension, click the "Install" button to install the extension.
5. Once the installation is complete, the extension will be automatically activated.

## Usage

1. Open the Dart file you want to work with in your Flutter project.
2. Select the Widget you want to convert into a new StatelessWidget.
3. Right-click the selected text and choose "Extract Flutter Widget and Create Part" from the context menu.
4. In the prompt that opens, enter the name for the new StatelessWidget class you want to create and press Enter.
5. The extension will convert the selected Widget into a new StatelessWidget class and store this class in a part file. Additionally, it will add a part statement to your current file, associating it with the new file.

## Example

Below is an example of how to use the extension by selecting a Container Widget and converting it into a new StatelessWidget class named "MyNewWidget":

**main.dart (before)**
```dart
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('My App')),
        body: Container(
          width: 100,
          height: 100,
          color: Colors.red,
        ),
      ),
    );
  }
}
```


**main.dart (after)**
```dart
import 'package:flutter/material.dart';

part 'my_new_widget.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('My App')),
        body: MyNewWidget(),
      ),
    );
  }
}
```



**my_new_widget.dart**
```dart
part of 'main.dart';

class MyNewWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 100,
      height: 100,
      color: Colors.red,
    );
  }
}
```
