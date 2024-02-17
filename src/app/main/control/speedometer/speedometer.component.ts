import { WorkExecution } from './../../../core/models/work-execution';
import { Component, OnInit,OnChanges, SimpleChanges, Input } from '@angular/core';
// import { WorkExecution } from 'src/app/core/models/work-execution';
declare var d3 : any;
declare var iopctrl : any;

@Component({
  selector: 'app-speedometer',
  templateUrl: './speedometer.component.html',
  styleUrls: ['./speedometer.component.scss'],
})
export class SpeedometerComponent  implements OnInit,OnChanges {
  @Input("speed") speed : number = 0;
  @Input("wExecution") wExecution! : WorkExecution;
  @Input("latitudGPS") latitudGPS : number = 0;
  @Input("longitudGPS") longitudGPS : number = 0;
  data : any;
  svg : any;
  gauge : any;
  segDisplay : any;

  private maxSpeed : number = 10;
  private arduino : any;
  private parser : any;
  private interval : any;

  private scaleIndicator = function(g : any, r: any) {
    g.append("path").attr("d", "M0 " + -0.25 * r + " L 0 " + -1.05 * r + "");
  };

  constructor() { }

  ngOnChanges(changes: any): void {
    if(this.gauge && changes['speed']){
      this.gauge.value(changes.speed.currentValue);
      this.segDisplay.value(changes.speed.currentValue);
    }

    // if(this.wExecution){
    //   let wConfig : WorkExecutionConfiguration = JSON.parse(this.wExecution.configuration);
    //   this.teoric_pressure = { value : wConfig.pressure, unit : UnitPressure.find(p => p.value == wConfig.unit)?.name}
    //   this.efficiency_pressure.unit = UnitPressure.find(p => p.value == wConfig.unit)?.name;
    //   this.pressure.unit = UnitPressure.find(p => p.value == wConfig.unit)?.name;
    // }
  }

  ngOnInit() {
    let instance = this;

    this.svg = d3.select("#scale")
                .append("svg:svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("class", "svg-gauge svg-components")
                .attr("part", "svg-gauge")
                //.attr("style", "height: 100%;")
                .attr("viewBox", "0 0 600 560");

    this.gauge = iopctrl.arcslider()
      .transitionDuration(250)
      .radius(250)
      .events(false)
      .bands([
          {"domain": [6, this.maxSpeed], "span":[1.05, 1.12] , "class": "fault"},
          {"domain": [0, 6], "span": [1.05, 1.12] , "class": "ok"},

      ])
      .indicator(iopctrl.defaultGaugeIndicator);

    let sLinear1 = d3.scale.linear()
      .domain([0, this.maxSpeed])
      .range([-2.7*Math.PI/4, 2.7*Math.PI/4]);

    let sLog2 = d3.scale.log()
      .domain([1, this.maxSpeed])
      .range([-2.7*Math.PI/4, 2.7*Math.PI/4]).clamp(true).nice();

    let mScales = [sLinear1,sLog2.invert,sLog2,sLinear1];

    this.gauge.axis().orient("in")
      .normalize(true)
      .ticks(9)
      .tickSubdivide(9)
      .tickSize(15, 8, 10)
      .tickPadding(5)
      .scale(sLinear1);

    this.segDisplay = iopctrl.segdisplay()
      .width(400)
      .digitCount(5)
      .negative(false)
      .decimals(2);

    this.svg.append("g")
      .attr("class", "segdisplay")
      .attr("transform", "translate(90, 430)")
      .call(this.segDisplay);


    this.svg.append("g")
      .attr("class", "gauge")
      .call(this.gauge);

    // this.svg.append("svg:image")
    //   .attr('x', 200)
    //   .attr('y', 200)
    //   .attr('width', 200)
    //   .attr('height', 200)
    //   .attr('id', "img_icon_scale")
    //   .attr("xlink:href", "./assets/images/check.png");

    instance.gauge.value(0.0);
    instance.segDisplay.value(0.0);

  }


}
