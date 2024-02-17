import { app, BrowserWindow, Menu, screen,session  } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import * as logger from 'electron-log';
import * as unhandled from 'electron-unhandled';

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');



function createWindow(): BrowserWindow {
  setupLogger();

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;
  // console.log("main...",session);
  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    fullscreen: true,
    webPreferences: {
      session: session.fromPartition("persist:name"),
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
      contextIsolation: false,  // false if you want to run e2e test with Spectron
      partition : "persist:name",

    },
  });
  win.webContents.session.cookies.set({url:"http://localhost",name:"test",value:"tval"});
  // win.on("ready-to-show",()=>{
  //   session.defaultSession.cookies.flushStore();
  // })

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';
    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
     pathIndex = '../dist/index.html';
   }

    win.loadURL(url.format({
      pathname: path.join(__dirname, pathIndex),
      protocol: 'file:',
      slashes: true,

    }));
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
  win.maximize();
  //win.setResizable(false);
  //win.removeMenu();
  win.setFullScreen(true);
  // win.webContents.addListener("console-message",(event : Electron.Event,level:number,message : string,line : number,sourceId : string)=>{
  //   if(level != 2 && level != 0){
  //     logger.log(level,message,line);
  //   }
  // })

  return win;
}

function setupLogger() {
  // Same as for console transport
  logger.transports.file.level = 'info';
  logger.transports.file.format = '{h}:{i}:{s}:{ms} {text}';

  // Set approximate maximum log size in bytes. When it exceeds,
  // the archived log will be saved as the log.old.log file
  logger.transports.file.maxSize = 5 * 1024 * 1024;

  // Write to this file, must be set before first logging
  logger.transports.file.resolvePath = () => path.resolve("bd/log/","log.log");
  // fs.createWriteStream options, must be set before first logging
  //logger.transports.file.streamConfig = {flags: 'w'};

  // set existed file stream
  //logger.transports.file.stream = fs.createWriteStream('log.log');

  //unhandled
  unhandled({
    logger: (error) => {
        logger.error(error);
    },
    showDialog: false,
  });
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at ://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
