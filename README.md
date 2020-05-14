# Satviz

**Multiplatform augmented reality application for Earth satelite visualization** as the title of my bachelor thesis says. After a long analysis and several experiments, it is a React Native app with usage of Viro React AR & VR framework.

## Install guide
1. Set up React Native development environment (https://reactnative.dev/docs/environment-setup - React Native CLI Quickstart)

2. Clone this repository

3. `npm install` in project folder to install all project dependecies

4. Connect Android device with Developer mode enabled via USB to the development PC

5. `npx react-native run-android --variant=arDebug` in project folder to run the project

### Documentation generation
Run the ESDoc documentation tool by `./node_modules/.bin/esdoc` command in root of project.

### Compilation
Run `./android/gradlew assebleRelease` command in root of project. Generated .apk will be in .\android\app\build\outputs\apk\gvr\release folder.

Compilation for iOS devices is not verified because of lack of testing devices, but probably it will not work - more details in thesis text.