[![Angular Logo](https://www.vectorlogo.zone/logos/angular/angular-icon.svg)](https://angular.io/) [![Electron Logo](https://www.vectorlogo.zone/logos/electronjs/electronjs-icon.svg)](https://electronjs.org/)

<!-- ![Maintained][maintained-badge]
[![Make a pull request][prs-badge]][prs]
[![License][license-badge]](LICENSE.md)

[![Linux Build][linux-build-badge]][linux-build]
[![MacOS Build][macos-build-badge]][macos-build]
[![Windows Build][windows-build-badge]][windows-build]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter] -->

# Introducción

Arranque y empaquete su proyecto con Angular 13 y Electron 17 (Typescript + SASS + Hot Reload) para crear aplicaciones de escritorio.

Actualmente corre con:

- Angular v13.2.4
- Electron v17.1.0

Con esta muestra, puede:

- Ejecutar la aplicación en un entorno de desarrollo local con Electron & Hot reload
- Ejecute su aplicación en un entorno de producción
- Empaquete su aplicación en un archivo ejecutable para Linux, Windows y Mac

/!\ La recarga en caliente solo pertenece al proceso de renderizado. El proceso principal de Electron no se puede recargar en caliente, solo se puede reiniciar.

/!\ Angular CLI & Electron Builder necesita Node 14 o posterior para funcionar correctamente.

## Empezando


*Instale dependencias con npm (utilizado por el proceso de representación de Electron):*

``` bash
npm install --force
```

Hay un problema con `yarn` y `node_modules` cuando el empaquetador crea la aplicación. Utilice `npm` como administrador de dependencias.

Si desea generar componentes Angular con Angular-cli , **DEBE**instalar `@angular/cli` en el contexto global de npm.
Siga la [documentación de Angular-cli] (https://github.com/angular/angular-cli) si había instalado una versión anterior de `angular-cli`.

``` bash
npm install -g @angular/cli
```

*Instale las dependencias de NodeJS con npm (utilizado por el proceso principal de Electron):*

``` bash
cd app/
npm install --force
```

¿Por qué dos paquetes.json? Este proyecto sigue [la estructura de dos paquetes.json de Electron Builder] (https://www.electron.build/tutorials/two-package-structure) para optimizar el paquete final y aún poder usar la función Angular `ng add`.

## Construir para el desarrollo

- **En una ventana de terminal** -> npm start

¡Bien! ¡Ahora puede usar la aplicación Angular + Electron en un entorno de desarrollo local con recarga en caliente!

El código de la aplicación es administrado por `app/main.ts`. En este ejemplo, la aplicación se ejecuta con una aplicación Angular simple (http://localhost:4200) y una ventana Electron. \
El componente Angular contiene un ejemplo de importación de librerías nativas de Electron y NodeJS. \
Puede deshabilitar "Herramientas de desarrollador" comentando `win.webContents.openDevTools();` en `app/main.ts`.

### Configuración importante 

Para los diversos modos de trabajo existe una configuración en los archivos `src/environments/` que tienen la estructura:

```
export const APP_CONFIG = {
  production: false,
  environment: 'LOCAL',
  analog_mode: true, //true si es para usar el component FALCOT , false si es para usar el componente BETA
  with_clamshell : false, //true si el modo de trabajo es clamshell

  // Las siguientes configuraciones deben ser establecidas si en caso se usa el modo web (Solo para propósitos de desarrollo)
  ws_test: "ws://192.168.42.200:8001/ws/balanza-ws/",
  token: "c7f14f4e4339dd99b0ef31e118f722e94fbd1012d8045eb7bab291d12eb4ce85a0",
  planta: 1,
};
```

Estas configuraciones deben ser establecidas antes de empezar el desarrollo o la construcción de la aplicación.
## Estructura del proyecto

| Folder | Description                                      |
|--------|--------------------------------------------------|
| app    | Carpeta de proceso principal de Electron (NodeJS)            |
| src    | Carpeta de proceso del renderizador de Electron (Web / Angular) |

## Cómo importar bibliotecas de terceros

Este proyecto de ejemplo se ejecuta en ambos modos (web y electrón). Para que esto funcione, **tienes que importar tus dependencias de la manera correcta**. \

Hay dos tipos de bibliotecas de terceros:
- El de NodeJS: utiliza el módulo principal de NodeJS (crypto, fs, util...)
    - Le sugiero que agregue este tipo de biblioteca de terceros en `dependencias` tanto de `app/package.json` como de `package.json (carpeta raíz)` para que funcione tanto en el proceso principal de Electron (carpeta de la aplicación) como en Proceso Renderer de Electron (carpeta src).
Verifique `providers/electron.service.ts` para ver cómo se debe realizar la importación condicional de bibliotecas cuando se usan bibliotecas de NodeJS/de terceros en el contexto del renderizador (es decir, Angular).

- Uno de la web (como bootstrap, material, tailwind...)
    - Debe agregarse en `dependencias` de `package.json (carpeta raíz)`

## Add a dependency with ng-add

Puede encontrar algunas dificultades con `ng-add` porque este proyecto no usa los valores predeterminados `@angular-builders`. \
Por ejemplo, puede encontrar [aquí] (HOW_TO.md) cómo instalar Angular-Material con `ng-add`.

## Modo Navegador (Angular)

¿Quizás solo desea ejecutar la aplicación en el navegador con recarga en caliente? Simplemente ejecute `npm run ng:serve:web`.

## ¿Puede usar una lib específica (como rxjs) en el hilo principal de Electron?

¡SÍ! ¡Puedes hacerlo! Simplemente importando su biblioteca en la sección de dependencias de npm de `app/package.json` con `npm install --save XXXXX`. \
Se cargará con Electron durante la fase de construcción y se agregará a su paquete final. \
Luego use su biblioteca importándola en el archivo `app/main.ts`.

## Pruebas E2E

Los scripts de prueba de E2E se pueden encontrar en la carpeta `e2e`.

| Command       | Description               |
|---------------|---------------------------|
| `npm run e2e` | Ejecutar pruebas de extremo a extremo  |

Nota: para que funcione detrás de un proxy, puede agregar esta excepción de proxy en su terminal
`export {no_proxy,NO_PROXY}="127.0.0.1,localhost"`

## Depurar con VsCode

[VsCode](https://code.visualstudio.com/) ¡La configuración de depuración está disponible! Para usarlo, necesita la extensión [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome).

Luego establezca algunos puntos de interrupción en el código fuente de su aplicación.

Finalmente desde VsCode presione **Ctrl+Shift+D**y seleccione **Depuración de aplicación**y presione **F5**.

Tenga en cuenta que la recarga en caliente solo está disponible en el proceso Renderer.

## Comandos incluidos

**Estos comandos se encuentran en el archivo package.json sección scripts, podrá modificarlos acorde a los requerimientos que crea conveniente.**

| Comando                  | Descripción                                                                                           |
|--------------------------|-------------------------------------------------------------------------------------------------------|
| `npm run ng:serve`       | Ejecute la aplicación en el navegador web (modo DEV)                                                         |
| `npm run web:build`      | Cree la aplicación que se puede usar directamente en el navegador web. Sus archivos construidos están en la carpeta /dist. |
| `npm run electron:local` | Construya la aplicación e inicie Electron localmente                                                    |
| `npm run postinstall`    | Prepare los archivos y dependencias para crear los ejecutables (establecer el S.O. y la arquitectura correspondiente) |
| `npm run electron:build` | Construya la aplicación y crea un ejecutable de aplicación basado en su sistema operativo, el archivo de configuración es `electron-builder.json`                |

**La aplicación está optimizada. Solo la carpeta /dist y las dependencias de NodeJS se incluyen en el paquete final.**

### Despliegue en el procesador (Raspberry)

Después de haber ejecutado los comandos `npm run postinstall` y posteriormente `npm run electron:build` para la construcción
del ejecutable, encontrará una nueva carpeta `dist` donde se encuentra el ejecutable `.AppImage` este deberá copiarlo en alguna carpeta del raspberry y ejecutar el comando `sudo chmod +x [nombrearchivo].AppImage`  para este ejemplo será en `/home/pi/Documents/Scale`, allí deberá crear una carpeta con el nombre `bd` y crear el 
al archivo `conf.env` con lo siguientes parámetros:

```
URL_WS=ws://192.168.1.209:8001/ws/balanza-ws/ #Ruta del servidor WebSocket
PLANTA=1 #ID de la planta según base de datos
TOKEN=c7f14f4e4339dd99b0ef31e118f722e94fbd1012d8045eb7bab291d12eb4ce85a0 #Token de la Balanza, puede verlo desde el admin del sistema de balanza
URL_BALANZA=http://192.168.1.209:8000/api/ #Ruta del servidor API/REST de Balanza
URL_ASISTENCIA=http://192.168.1.209:8000/api/employes/ #Ruta del servidor API/REST de Asistencia
PUERTO_ARDUINO=/dev/ttyACM0 #Puerto Serial del dispositivo (Arduino)
BAUD_RATE=115200 #Baudios del dispositivo serial
HX711=1 #1 si se trabajará con el módulo HX711, 0 si se leerá directamente de la balanza.
CLAMSHELL=0 #1 si se trabajará con el módulo CLAMSHELL, 0 si se trabajará con el módulo normal de balanza.
```

**Para saber cual es el puerto serial que está usando el Arduino use el comando
`ls /dev/tty*`** , por lo general será `/dev/ttyACM0` o `/dev/ttyUSB0`.

Luego crear el archivo .desktop para iniciar automaticamente la aplicacion en Raspberry con el siguiente contenido:

```
#!/usr/bin/env xdg-open
[Desktop Entry]
Encoding=UTF-8
Type=Application
Name=Scale
Exec=sh -c "cd /home/pi/Documents/Scale; sudo ./[nombre_archivo].AppImage --disable-gpu-sandbox"
Terminal=true
StartupNotify=true
Name[en_GB]=Scale
X-KeepTerminal=true
Path=/home/pi/Documents/Scale
```

Luego copiarlo en la carpeta `/home/pi/.config/autostart` *Si no existe, crear la carpeta*
ejecutar `sudo chmod +x [nombrearchivo].desktop` [Ver Referencia](https://docs.appimage.org/introduction/quickstart.html#using-the-terminal)

A partir de aquí, al momento de iniciar el sistema operativo del Raspberry se ejecutará automáticamente la aplicación de balanza.

### Configurar el S.O. del Raspberry para producción

A continuación siga las siguientes instrucciones:
- Para ocultar automaticamente el puntero cuando hay inactividad del mouse instale el paquete:

```bash
sudo apt-get install unclutter
```

- Para ocultar la barra de tarea del S.O. y el programa entre en modo fullscreen:
    Editar el archivo `/etc/xdg/lxsession/LXDE-pi/autostart` 
    comentar la línea con el símbolo `#@lxpanel --profile LXDE-pi` 
    reinicie y el panel debería desaparecer

- Si se requiere usar nuevamente la barra de tareas descomentar la linea editada del archivo `/etc/xdg/lxsession/LXDE-pi/` autostart

- Mover las carpetas y archivos del escritorio para otra ubicacion y si los archivos de la aplicacion estuvieron alli, no olvidar editar los archivos `.desktop` para el arranque automatico de la aplicacion.

- Y poner el fondo negro con una imagen
[ver](https://raspberrypiuser.co.uk/how-to-customise-the-raspberry-pi-os-desktop).
- Para acceder a la terminal cuando no haya barra de tareas, utilice `CTRL + ALT + F11`.

- Para establecer configuraciones de red de raspberry tal como servidor dns e ip statica, [ver](https://pimylifeup.com/raspberry-pi-static-ip-address/). Editar el archivo `/etc/dhcpcd.conf` con sudo : `sudo nano /etc/dhcpcd.conf` y agregar al ultimo :

```
interface wlan0 #Adaptador Wifi/Ethernet (por lo general es wlan0/eth0)
static ip_address 192.168.43.144/24 #Ip del procesador
static routers=192.168.43.1 #Ip del router
static domain_name_servers=192.168.1.116 8.8.8.8 #DNS Server
static domain_search=8.8.4.4 #DNS Lookup
noipv6
```
- Verificar el interface a editar con el comando:
```bash
ip address
```

- Para cambiar el logo de Raspberry por el que se desee, [ver](https://www.tomshardware.com/how-to/custom-raspberry-pi-splash-screen).

**No olvidar que para ver toda modificación del sistema operativo debe reiniciar el procesador**
