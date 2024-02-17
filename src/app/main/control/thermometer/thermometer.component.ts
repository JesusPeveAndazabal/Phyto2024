import { GeneralService } from './../../../core/services/general/general.service';
import { DatabaseService } from './../../../core/services/database/database.service';
import { Weather } from './../../../core/models/weather';
import { environment } from './../../../../environments/environment';
import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, Input,OnChanges, SimpleChanges } from '@angular/core';
// import { Weather } from 'src/app/core/models/weather';
import { WorkExecution } from './../../../core/models/work-execution';
// import { DatabaseService, GeneralService } from 'src/app/core/services/services';
// import { Capacitor } from '@capacitor/core';
// import { Geolocation } from '@capacitor/geolocation';
import { WorkExecutionConfiguration } from './../../../core/models/we-configuration';
// import { environment } from 'src/environments/environment';

declare var d3 : any;

@Component({
  selector: 'app-thermometer',
  templateUrl: './thermometer.component.html',
  styleUrls: ['./thermometer.component.scss'],
})
export class ThermometerComponent  implements OnInit,AfterViewInit,OnChanges {
  @ViewChild('temperature') temperature! : ElementRef;
  @ViewChild('graduations') graduations! :ElementRef;
  @Input("wExecution") wExecution! : WorkExecution;

  svg : any;
  private units = {
    Celcius: "°C",
    Fahrenheit: "°F"
  };

  private config = {
    minTemp: -20,
    maxTemp: 50,
    unit: "Celcius"
  };

  // private duration = 500;
  // private transition = 200;
  // private _current = 0;
  humidity = 0;
  currentLocation = 'Ica.';

  constructor(
    private generalService: GeneralService,
    private dbService: DatabaseService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.wExecution){
      // if(Capacitor.getPlatform() != "web")
      // {
      //   const printCurrentPosition = async () => {
      //     const coordinates = await Geolocation.getCurrentPosition();

      //     console.log('Current position:', coordinates);
      //     this.currentLocation = `${coordinates.coords.latitude},${coordinates.coords.longitude}`
      //   };
      // }

      let weConfiguration : WorkExecutionConfiguration = JSON.parse(this.wExecution.configuration);
      if(!weConfiguration.humidity || !weConfiguration.temperature){
        this.generalService.getCurrentWeather(this.currentLocation).subscribe({
          next: async (data: Weather) => {
            this.setTemperature(data.current.temp_c);
            this.humidity = data.current.humidity;

            weConfiguration.humidity = data.current.humidity;
            weConfiguration.temperature = data.current.temp_c;
            weConfiguration.wind_kmh = data.current.wind_kph;

            this.wExecution.configuration = JSON.stringify(weConfiguration);

            await this.dbService.openConnection();

            await this.dbService.updateWorkExecutionData(this.wExecution)
            .then(()=>{
              // this.dbService.closeConnection();
            })
            .catch((error)=>{
              console.log(error);
              return false;
            });
            }
        });
      }
      else{
        this.setTemperature(weConfiguration.temperature);
        this.humidity = weConfiguration.humidity;
      }
    }
  }


  ngAfterViewInit(): void {

  }

  ngOnInit() {
    //this.drawDonutChart('#humidity-slider',50,".35em");
  }

  setTemperature(value : number) {
    this.temperature.nativeElement.style.height = (value - this.config.minTemp) / (this.config.maxTemp - this.config.minTemp) * 100 + "%";
    this.temperature.nativeElement.dataset.value = value + this.units.Celcius; // [this.config.unit];
  }

  // drawDonutChart(
  //   '#donut',
  //   $('#donut').data('donut'),
  //   290,
  //   290,
  //   ".35em"
  // );

  // drawDonutChart(element : string, percent : number, text_y : string) {
  //   text_y = typeof text_y !== 'undefined' ? text_y : "-.10em";

  //   var dataset = {
  //         lower: this.calcPercent(0),
  //         upper: this.calcPercent(percent)
  //       },
  //       //radius = Math.min(width, height) / 2,
  //       radius = 50,
  //       pie = d3.layout.pie().sort(null),
  //       format = d3.format(".0%");

  //   var arc = d3.svg.arc()
  //         .innerRadius(radius - 20)
  //         .outerRadius(radius);

  //   var svg = d3.select(element).append("svg")
  //         // .attr("width", width)
  //         // .attr("height", height)
  //         .attr("class","svg-thermometer half-svg-components")
  //         .attr("preserveAspectRatio", "xMinYMin meet")
  //         .attr("viewBox", "0 0 100 100")
  //         .append("g")
  //         .attr("transform", "translate(50, 50)");
  //         //.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  //   var path = svg.selectAll("path")
  //         .data(pie(dataset.lower))
  //         .enter().append("path")
  //         .attr("class", function(d : any, i : any) { return "color" + i })
  //         .attr("d", arc)
  //         .each((d : any) : any =>  { this._current = d; }); // store the initial values

  //   var text = svg.append("text")
  //         .attr("text-anchor", "middle")
  //         .attr("dy", text_y);

  //   if (typeof(percent) === "string") {
  //     text.text(percent);
  //   }
  //   else {
  //     var progress = 0;
  //     let instance = this;
  //     var timeout = setTimeout(() : any => {
  //       clearTimeout(timeout);
  //       path = path.data(pie(dataset.upper)); // update the data
  //       path.transition().duration(instance.duration).attrTween("d", (a : any): any =>  {
  //         // Store the displayed angles in _current.
  //         // Then, interpolate from _current to the new angles.
  //         // During the transition, _current is updated in-place by d3.interpolate.
  //         var i  = d3.interpolate(this._current, a);
  //         var i2 = d3.interpolate(progress, percent)
  //         this._current = i(0);
  //         return function(t : any) {
  //           text.text( format(i2(t) / 100) );
  //           return arc(i(t));
  //         };
  //       }); // redraw the arcs
  //     }, 200);
  //   }
  // }

  calcPercent(percent : number) {
    return [percent, 100-percent];
  }
}
