export class Chronos {
  private _startTime: number | null;
  private accumulator: number;

  constructor() {
    this._startTime = null;
    this.accumulator = 0;
  }

  start(): void {
    this._startTime = performance.now();
  }

  stop(): void {
    if (this._startTime !== null) {
      this.accumulator += performance.now() - this._startTime;
      this._startTime = null;
    }
  }

  reset(): void {
    this.accumulator = 0;
    this._startTime = performance.now();
  }

  getTime(): number {
    if (this._startTime !== null) {
      return this.accumulator + (performance.now() - this._startTime);
    }
    return this.accumulator;
  }

  time(): string {
    const elapsedMilliseconds = this.getTime();
    const hours = Math.floor(elapsedMilliseconds / 3600000);
    const minutes = Math.floor((elapsedMilliseconds % 3600000) / 60000);
    const seconds = Math.floor((elapsedMilliseconds % 60000) / 1000);
    const milliseconds = Math.round(elapsedMilliseconds % 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
  }
}


export class TimeTracker {
  private productiveChronos: Chronos;
  private unproductiveChronos: Chronos;

  constructor() {
    this.productiveChronos = new Chronos();
    this.unproductiveChronos = new Chronos();
  }

  startProductiveTime(): void {
    this.productiveChronos.start();
    this.unproductiveChronos.stop();
  }

  stopProductiveTime(): void {
    this.productiveChronos.stop();
  }

  startUnproductiveTime(): void {
    this.unproductiveChronos.start();
    this.productiveChronos.stop();
  }

  stopUnproductiveTime(): void {
    this.unproductiveChronos.stop();
  }

  getProductiveTime(): string {
    return this.productiveChronos.time();
  }

  getUnproductiveTime(): string {
    return this.unproductiveChronos.time();
  }

  reset(): void {
    this.productiveChronos.reset();
    this.unproductiveChronos.reset();
  }
}
