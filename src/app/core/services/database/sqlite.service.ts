import { Injectable } from '@angular/core';

import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteDBConnection, SQLiteConnection, capSQLiteSet,
         capSQLiteChanges, capSQLiteValues, capEchoResult, capSQLiteResult,
         capNCDatabasePathResult } from '@capacitor-community/sqlite';

@Injectable()

export class SQLiteService {
    sqlite!: SQLiteConnection;
    isService: boolean = false;
    platform!: string;
    sqlitePlugin: any;
    native: boolean = false;

    constructor() {
    }
    /**
     * Plugin Initialization
     */
    async initializePlugin(): Promise<boolean> {
        this.platform = Capacitor.getPlatform();
        if ( this.platform === 'ios' || this.platform === 'android' ) {
            this.native = true;
        }
        this.sqlitePlugin = CapacitorSQLite;
        this.sqlite = new SQLiteConnection(this.sqlitePlugin);
        this.isService = true;
        return true;
    }

    /**
     * Echo a value
     * @param value
     */
    async echo(value: string): Promise<capEchoResult> {
        this.ensureConnectionIsOpen();
        return this.sqlite.echo(value);
    }

    async isSecretStored(): Promise<capSQLiteResult> {
        this.ensureIsNativePlatform();
        this.ensureConnectionIsOpen();
        return this.sqlite.isSecretStored();
    }

    async setEncryptionSecret(passphrase: string): Promise<void> {
        this.ensureIsNativePlatform();
        this.ensureConnectionIsOpen();
        return this.sqlite.setEncryptionSecret(passphrase);
    }

    async changeEncryptionSecret(passphrase: string, oldpassphrase: string): Promise<void> {
        this.ensureIsNativePlatform();
        this.ensureConnectionIsOpen();
        return this.sqlite.changeEncryptionSecret(passphrase, oldpassphrase);
    }

    async addUpgradeStatement(database: string, toVersion: number, statement: string)
        : Promise<void> {
        this.ensureConnectionIsOpen();
        return this.sqlite.addUpgradeStatement(database, toVersion, [statement]);
    }

    /**
     * get a non-conformed database path
     * @param folderPath
     * @param database
     * @returns Promise<capNCDatabasePathResult>
     * @since 3.3.3-1
     */
    async getNCDatabasePath(folderPath: string, database: string): Promise<capNCDatabasePathResult> {
        this.ensureConnectionIsOpen();
        return this.sqlite.getNCDatabasePath(folderPath, database);
    }

    /**
     * Create a non-conformed database connection
     * @param databasePath
     * @param version
     * @returns Promise<SQLiteDBConnection>
     * @since 3.3.3-1
     */
    async createNCConnection(databasePath: string, version: number): Promise<SQLiteDBConnection> {
        this.ensureConnectionIsOpen();
        const db: SQLiteDBConnection = await this.sqlite.createNCConnection(databasePath, version);
        if ( db == null ) {
            throw new Error(`no db returned is null`);
        }
        return db;
    }

    /**
     * Close a non-conformed database connection
     * @param databasePath
     * @returns Promise<void>
     * @since 3.3.3-1
     */
    async closeNCConnection(databasePath: string): Promise<void> {
        this.ensureConnectionIsOpen();
        return this.sqlite.closeNCConnection(databasePath);
    }

    /**
     * Check if a non-conformed databaseconnection exists
     * @param databasePath
     * @returns Promise<capSQLiteResult>
     * @since 3.3.3-1
     */
    async isNCConnection(databasePath: string): Promise<capSQLiteResult> {
        this.ensureConnectionIsOpen();
        return this.sqlite.isNCConnection(databasePath);
    }

    /**
     * Retrieve a non-conformed database connection
     * @param databasePath
     * @returns Promise<SQLiteDBConnection>
     * @since 3.3.3-1
     */
    async retrieveNCConnection(databasePath: string): Promise<SQLiteDBConnection> {
        this.ensureConnectionIsOpen();
        return this.sqlite.retrieveNCConnection(databasePath);
    }

    /**
     * Check if a non conformed database exists
     * @param databasePath
     * @returns Promise<capSQLiteResult>
     * @since 3.3.3-1
     */
    async isNCDatabase(databasePath: string): Promise<capSQLiteResult> {
        this.ensureConnectionIsOpen();
        return this.sqlite.isNCDatabase(databasePath);
    }

    /**
     * Create a connection to a database
     * @param database
     * @param encrypted
     * @param mode
     * @param version
     */
    async createConnection(database: string, encrypted: boolean,
                           mode: string, version: number
    ): Promise<SQLiteDBConnection> {
        this.ensureConnectionIsOpen();
        const db: SQLiteDBConnection = await this.sqlite.createConnection(database, encrypted, mode, version, false);
        if ( db == null ) {
            throw new Error(`no db returned is null`);
        }
        return db;
    }

    /**
     * Close a connection to a database
     * @param database
     */
    async closeConnection(database: string): Promise<void> {
        this.ensureConnectionIsOpen();
        return this.sqlite.closeConnection(database, false);
    }

    /**
     * Retrieve an existing connection to a database
     * @param database
     */
    async retrieveConnection(database: string): Promise<SQLiteDBConnection> {
        this.ensureConnectionIsOpen();
        return this.sqlite.retrieveConnection(database, false);
    }

    /**
     * Retrieve all existing connections
     */
    async retrieveAllConnections(): Promise<Map<string, SQLiteDBConnection>> {
        this.ensureConnectionIsOpen();
        return this.sqlite.retrieveAllConnections();
    }

    /**
     * Close all existing connections
     */
    async closeAllConnections(): Promise<void> {
        this.ensureConnectionIsOpen();
        return this.sqlite.closeAllConnections();
    }

    /**
     * Check if connection exists
     * @param database
     */
    async isConnection(database: string): Promise<capSQLiteResult> {
        this.ensureConnectionIsOpen();
        return this.sqlite.isConnection(database, false);
    }

    /**
     * Check Connections Consistency
     * @returns
     */
    async checkConnectionsConsistency(): Promise<capSQLiteResult> {
        this.ensureConnectionIsOpen();
        return this.sqlite.checkConnectionsConsistency();
    }

    /**
     * Check if database exists
     * @param database
     */
    async isDatabase(database: string): Promise<capSQLiteResult> {
        this.ensureConnectionIsOpen();
        return this.sqlite.isDatabase(database);
    }

    /**
     * Get the list of databases
     */
    async getDatabaseList(): Promise<capSQLiteValues> {
        this.ensureConnectionIsOpen();
        return this.sqlite.getDatabaseList();
    }

    /**
     * Get Migratable databases List
     */
    async getMigratableDbList(folderPath?: string): Promise<capSQLiteValues> {
        this.ensureIsNativePlatform();
        this.ensureConnectionIsOpen();

        if ( !folderPath || folderPath.length === 0 ) {
            throw new Error(`You must provide a folder path`);
        }
        return this.sqlite.getMigratableDbList(folderPath);
    }

    /**
     * Add "SQLite" suffix to old database's names
     */
    async addSQLiteSuffix(folderPath?: string, dbNameList?: string[]): Promise<void> {
        this.ensureIsNativePlatform();
        this.ensureConnectionIsOpen();
        const path: string = folderPath ? folderPath : 'default';
        const dbList: string[] = dbNameList ? dbNameList : [];
        return this.sqlite.addSQLiteSuffix(path, dbList);
    }

    /**
     * Delete old databases
     */
    async deleteOldDatabases(folderPath?: string, dbNameList?: string[]): Promise<void> {
        this.ensureIsNativePlatform();
        this.ensureConnectionIsOpen();
        const path: string = folderPath ? folderPath : 'default';
        const dbList: string[] = dbNameList ? dbNameList : [];
        return this.sqlite.deleteOldDatabases(path, dbList);
    }

    /**
     * Import from a Json Object
     * @param jsonstring
     */
    async importFromJson(jsonstring: string): Promise<capSQLiteChanges> {
        this.ensureConnectionIsOpen();
        return this.sqlite.importFromJson(jsonstring);
    }

    /**
     * Is Json Object Valid
     * @param jsonString Check the validity of a given Json Object
     */

    async isJsonValid(jsonString: string): Promise<capSQLiteResult> {
        this.ensureConnectionIsOpen();
        return this.sqlite.isJsonValid(jsonString);
    }

    /**
     * Copy databases from public/assets/databases folder to application databases folder
     */
    async copyFromAssets(overwrite?: boolean): Promise<void> {
        const mOverwrite: boolean = overwrite != null ? overwrite : true;
        this.ensureConnectionIsOpen();
        return this.sqlite.copyFromAssets(mOverwrite);
    }

    async initWebStore(): Promise<void> {
        this.ensureIsWebPlatform();
        this.ensureConnectionIsOpen();
        return this.sqlite.initWebStore();
    }

    /**
     * Save a database to store
     * @param database
     */
    async saveToStore(database: string): Promise<void> {
        this.ensureIsWebPlatform();
        this.ensureConnectionIsOpen();
        return this.sqlite.saveToStore(database);
    }

    private ensureConnectionIsOpen() {
        if ( this.sqlite == null ) {
            throw new Error(`no connection open`);
        }
    }

    private ensureIsNativePlatform() {
        if ( !this.native ) {
            throw new Error(`Not implemented for ${this.platform} platform`);
        }
    }

    private ensureIsWebPlatform() {
        if ( this.platform !== 'web' ) {
            throw new Error(`Not implemented for ${this.platform} platform`);
        }
    }
}
