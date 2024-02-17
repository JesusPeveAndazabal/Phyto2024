export interface NozzlesConfiguration{
    number : number;
    color : number;
    type : number;
}

export interface WorkExecutionConfiguration {
    pressure : number;
    unit : number;
    volume : number;
    speed : number;
    water_flow : number;
    width : number;
    nozzles : NozzlesConfiguration[];
    temperature : number;
    humidity : number;
    wind_kmh : number;
}
