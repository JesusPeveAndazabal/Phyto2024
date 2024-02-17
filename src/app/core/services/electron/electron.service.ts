import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame,ipcMain } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as SerialPort from 'serialport';
//import { SqliteService } from '../sqlite/sqlite.service';
import { sqlite3 } from 'sqlite3';
import * as logger from 'electron-log';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  childProcess: typeof childProcess;
  fs: typeof fs;
  serialPort: typeof SerialPort;
  sqlite : sqlite3;
  path : typeof path;
  logger : typeof logger;
  //sqlite : SqliteService;

  constructor() {
    // Conditional imports
    if (this.isElectron) {
      this.path = window.require('path');
      /* initialize logger */

      // this.logger = window.require('electron-log');
      // this.setupLogger();
      // this.logger.info('main.ts');
      /* end of initialize logger */

      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      this.serialPort = window.require('serialport');
      this.sqlite = window.require('sqlite3').verbose();

      // Notes :
      // * A NodeJS's dependency imported with 'window.require' MUST BE present in `dependencies` of both `app/package.json`
      // and `package.json (root folder)` in order to make it work here in Electron's Renderer process (src folder)
      // because it will loaded at runtime by Electron.
      // * A NodeJS's dependency imported with TS module import (ex: import { Dropbox } from 'dropbox') CAN only be present
      // in `dependencies` of `package.json (root folder)` because it is loaded during build phase and does not need to be
      // in the final bundle. Reminder : only if not used in Electron's Main process (app folder)

      // If you want to use a NodeJS 3rd party deps in Renderer process,
      // ipcRenderer.invoke can serve many common use cases.
      // https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrendererinvokechannel-args
    }
  }

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  setupLogger() {
    // Same as for console transport
    this.logger.transports.file.level = 'info';
    this.logger.transports.file.format = '{h}:{i}:{s}:{ms} {text}';

    // Set approximate maximum log size in bytes. When it exceeds,
    // the archived log will be saved as the log.old.log file
    this.logger.transports.file.maxSize = 5 * 1024 * 1024;

    // Write to this file, must be set before first logging
    this.logger.transports.file.resolvePath = () => this.path.resolve("bd/log/","log.log");
    // fs.createWriteStream options, must be set before first logging
    //logger.transports.file.streamConfig = {flags: 'w'};

    // set existed file stream
    //logger.transports.file.stream = fs.createWriteStream('log.log');
  }
}
