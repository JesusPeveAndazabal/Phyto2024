import * as moment from 'moment';

export class Chronos {
    private _name: string | null;
    private _start: boolean;
    private _startTime: moment.Moment | null;
    private accumulator: moment.Duration;
    private work: number;

    constructor(work: number, name: string | null = null, start: boolean = true) {
        this._name = name;
        this._start = start; // Boolean start clock on instantiation
        this.work = work;
        this.reset();
        if (this._start) {
            this.start();
        }
    }

    start(): void {
      if(!this._startTime){
        this._startTime = moment.utc();
      }
    }

    stop(): void {
        this._startTime = null;
    }

    update(): void {
        if (this._startTime) {
            this.accumulator.add(moment.utc().diff(this._startTime,'milliseconds'),'milliseconds');
            this._startTime = null;
            this.start();
        }
    }

    reset(): void {
        this.accumulator = moment.duration(0,'milliseconds');
        this._startTime = null;
    }

    set_initial(initial: string): void {
        try {
            const parsed = initial.split(':');
            const seconds = parsed[2].split('.');
            let milliseconds = 0;
            if (seconds.length > 1) {
                milliseconds = parseInt(seconds[1]);
            }
            this.accumulator = moment.duration({
                hours: parseInt(parsed[0]),
                minutes: parseInt(parsed[1]),
                seconds: parseInt(seconds[0]),
                milliseconds: milliseconds
            });
        } catch (ex) {
            console.log("timer...", ex);
        }
    }

    elapsed(): moment.Duration {
        if (this._startTime) {
            this.update();
        }
        return this.accumulator;
    }

    /**
     * 
     * @returns Retorna el tiempo acumulado en formato `H:mm:ss`
     */
    time(): moment.Moment {
      return moment.utc(this.elapsed().asMilliseconds());
    }
}
