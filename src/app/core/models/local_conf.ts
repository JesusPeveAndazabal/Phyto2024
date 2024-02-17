export interface LocalConf{
    api_server : string;
    vol_alert_on : number;

    min_wflow : number;
    max_wflow : number;

    unit_pressure : number;
    min_pressure : number;
    max_pressure : number;

    fecha :  moment.Moment;
}
