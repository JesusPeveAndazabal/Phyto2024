export * from './cultivation';
export * from './farm';
export * from './lot';
export * from './nozzle-color';
export * from './nozzle-type';
export * from './nozzles';
export * from './person';
export * from './product';
export * from './work';
export * from './work-execution';
export * from './we-configuration';
export * from './we-data';
export * from './weather';

export interface SocketData{
    event : number;
    type : number;
    data : any;
}
