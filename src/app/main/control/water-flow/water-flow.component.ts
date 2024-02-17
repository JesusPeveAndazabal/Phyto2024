import { WorkExecutionConfiguration } from './../../../core/models/we-configuration';
import { WorkExecution } from './../../../core/models/work-execution';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

declare var d3 : any;

@Component({
  selector: 'app-water-flow',
  templateUrl: './water-flow.component.html',
  styleUrls: ['./water-flow.component.scss'],
})
export class WaterFlowComponent  implements OnInit {
  @Input("wExecution") wExecution! : WorkExecution;
  @Input("realWaterflow") realWaterflow : number = 0;

  private duration = 500;
  private animationDuration = 1500;
  private transition = 200;
  private _current = 0;
  teoric_water_flow : number = 0;
  efficiency : string = '0';

  bubblesStyle = {
    "animation-duration" : "1500ms",
  };


  constructor() { }

  ngOnInit() {
    //this.drawDonutChart("#efficiency-water-flow",0,".35em");

    this.setRealWaterflow(0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(this.wExecution && changes['wExecution']){
      let wConfig : WorkExecutionConfiguration = JSON.parse(this.wExecution.configuration);
      this.teoric_water_flow = +wConfig.water_flow.toFixed(1);
      //this.drawDonutChart("#teoric-water-flow",wConfig.water_flow,".35em");
    }
    else if(changes['realWaterflow']){
      let currentFlow : number = changes['realWaterflow'].currentValue;

      this.setRealWaterflow(currentFlow);

      //Se calcula el error relativo en porcentaje
      let relativeError : number = Math.abs((this.teoric_water_flow - currentFlow) / this.teoric_water_flow * 100);

      //La exactitud es el 100% - el error relativo
      this.efficiency = (100 - (isNaN(relativeError)? 100 :relativeError)).toFixed(2);
    }
  }

  setRealWaterflow(value: number) {
    this.realWaterflow = value;
    let duration = Math.round(1500 - (1500 * value / 100));

    if(Math.abs(this.animationDuration - duration) > 30){
      this.animationDuration = duration;
      this.bubblesStyle['animation-duration'] = `${duration}ms`;

    }
  }

  drawDonutChart(element : string, percent : number, text_y : string) {
    text_y = typeof text_y !== 'undefined' ? text_y : "-.10em";

    var dataset = {
          lower: this.calcPercent(0),
          upper: this.calcPercent(100)
        },
        //radius = Math.min(width, height) / 2,
        radius = 50,
        pie = d3.layout.pie().sort(null),
        format = d3.format(".0");

    var arc = d3.svg.arc()
          .innerRadius(radius - 20)
          .outerRadius(radius);

    var svg = d3.select(element).append("svg")
          // .attr("width", width)
          // .attr("height", height)
          .attr("class","svg-thermometer half-svg-components")
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 100 100")
          .append("g")
          .attr("transform", "translate(50, 50)");

    var path = svg.selectAll("path")
          .data(pie(dataset.lower))
          .enter().append("path")
          .attr("class", function(d : any, i : any) { return "color" + i })
          .attr("d", arc)
          .each((d : any) : any =>  { this._current = d; });

    var text = svg.append("text")
          .attr("text-anchor", "middle")
          .attr("font-size", "10pt")
          .attr("dy", text_y);

    if (typeof(percent) === "string") {
      text.text(percent);
    }
    else {
      var progress = 0;
      let instance = this;
      var timeout = setTimeout(() : any => {
        clearTimeout(timeout);
        path = path.data(pie(dataset.upper)); // update the data
        path.transition().duration(instance.duration).attrTween("d", (a : any): any =>  {
          var i  = d3.interpolate(this._current, a);
          var i2 = d3.interpolate(progress, percent)
          this._current = i(0);
          return function(t : any) {
            text.text(`${format(i2(t) / 100)} L/min` );
            return arc(i(t));
          };
        }); // redraw the arcs
      }, 200);
    }
  }

  calcPercent(percent : number) {
    return [percent, 100-percent];
  }


}
