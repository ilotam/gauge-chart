const d3 = require('d3');
const dscc = require('@google/dscc');
const local = require('./localMessage.js');

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = false;

// parse the style value
const styleVal = (message, styleId) => {
    if (typeof message.style[styleId].defaultValue === "object") {
      return message.style[styleId].value.color !== undefined
        ? message.style[styleId].value.color
        : message.style[styleId].defaultValue.color;
    }
    return message.style[styleId].value !== undefined
      ? message.style[styleId].value
      : message.style[styleId].defaultValue;
};
  

const drawViz = message => {
  
    const margin = { top: 10, bottom: 50, right: 10, left: 10 };
    const padding = { top: 15, bottom: 15 };
    const height = dscc.getHeight() - margin.top - margin.bottom;
    const width = dscc.getWidth() - margin.left - margin.right;
    if (document.querySelector("svg")) {
        //console.log("hello");
        let oldSvg = document.querySelector("svg");
        oldSvg.parentNode.removeChild(oldSvg);
      }
    
    //Make an SVG Container

     const svgContainer = d3.select("body").append("svg")
                                     .attr("width", 200)
                                     .attr("height", 200);

    var linex1;
    var liney1;
    var liney1;
    var line2x1;
    var line2y1;
    var linex2;
    var liney2;
    var speedCount = 0;
    var avgSpeed = 0;
    var allCars = 0;
    var textSize = 20;
    //var maxRange = 80;
    //var height = 200;
    var tblList = message.tables.DEFAULT;

      let maxRange =  message.style.maxRange.value
     ? message.style.maxRange.value
      : message.style.maxRange.defaultValue;
    console.log(message.style["maxRange"].defaultValue);
    let circleColor = styleVal(message, "barColor");
    //adatok begyűjtése

    let speed = 0;
    tblList.forEach(function(row) {
        speed = row["metric"];
        speedCount = speedCount+ parseInt(speed);
        allCars ++;
    });
    
    
    //Átlagsebesség
    avgSpeed  = speedCount / allCars;
    var degree = 0;
 
    //A point at angle theta on the circle whose centre is (x0,y0) and whose radius is r is (x0 + r cos theta, y0 + r sin theta). 
    //Now choose theta values evenly spaced between 0 and 2pi.     

    if(avgSpeed <= (maxRange * (5/6))){
        degree = 225-(avgSpeed/0.01)*(45/ ((maxRange*(1/6))/0.01));
    }else if (avgSpeed <= maxRange - 0.02){
        degree = 360+ (225-(avgSpeed/0.01)*(45/ ((maxRange*(1/6))/0.01)));
    }else {
        degree = 315;
    }
    
    console.log(degree);
    var pi = Math.PI;
 
    var rad = (degree * (pi / 180));
    //var r = 69.04708538;
    var r = 63.96;
    var pos1 = (100+r*Math.cos(rad));
    var pos2 = (100+r*Math.sin(rad));
    console.log(pos1);
    console.log(pos2);
    console.log(rad);

    if((degree > 180 && degree < 270) || (degree >= 315 && degree < 360)){
        pos2 = 200-pos2;
    }
    if(degree < 180 && degree > 0){
        pos2 = 100-(pos2-100);
    }
    
    linex2 = pos1;
    liney2 = pos2;

    if(avgSpeed >= maxRange*(7/24) && avgSpeed <= maxRange*(17/24)){
        linex1  = 107;
        liney1 = 100;
        line2x1 = 93;
        line2y1 = 100;
    }else {
        linex1  = 100;
        liney1 = 107;
        line2x1 = 100;
        line2y1 = 93;
    }

    var x = d3.scaleLinear().range([0, 500]);
	var y = d3.scaleLinear().range([500, 0]);
  
    x.domain([0, 500]);
    y.domain([500,0 ]);
    
    var poly = [{"x":linex1, "y":liney1},
        {"x":linex2,"y":liney2},
        {"x":line2x1,"y":line2y1} ];
  
    svgContainer.selectAll("polygon")
            .data([poly])
            .enter().append("polygon")
            .style("fill","#365055")
            .attr("points",function(d) { 
                return d.map(function(d) {
                    return [x(d.x),y(d.y)].join(",");
                }).join(" ");
            });

    //  svgContainer.append("g")
    // .attr("transform", "translate(0," + height + ")")
    //.call(d3.axisBottom(x));

    // add the Y Axis
    //svgContainer.append("g")
    // .call(d3.axisLeft(y));
          

    //Draw the line
    var line = svgContainer.append("line")
                            .attr("x1", linex1)
                            .attr("y1", liney1)
                            .attr("x2", linex2)
                            .attr("y2", liney2)
                            .attr("stroke-width", 1)
                            .attr("stroke", "black");


                            
    //Draw the Circle
    var circle = svgContainer.append("circle")
                            .attr("cx", 100)
                            .attr("cy", 100)
                            .attr("r", 100)
                            .style("fill", circleColor);

    var line2 = svgContainer.append("line")
                            .attr("x1", line2x1)
                            .attr("y1", line2y1)
                            .attr("x2", linex2)
                            .attr("y2", liney2)
                            .attr("stroke-width", 1)
                            .attr("stroke", "black");

     d3.select("line").raise(); 
     d3.select("line2").raise(); 
    // d3.select("textavgSpeed").raise();

     d3.selectAll("polygon").raise();    
    // d3.selectAll("g").raise();    

    var circle2 = svgContainer.append("circle")
                                .attr("cx", 100)
                                .attr("cy", 100)
                                .attr("r",8)
                                .style("fill","#2d9e8c");

                                
 

    var textavgSpeed = svgContainer.append("text");
    textavgSpeed.attr("x",100)
                .attr("y",190)
                .attr("font-family","sans-serif")
                .attr("font-size",textSize)
                .attr("text-anchor", "middle")                   
                .text(avgSpeed);


    var line0 = svgContainer.append("line")
                .attr("x1", 29.29)
                .attr("y1", 170.71)
                .attr("x2", 37.36)
                .attr("y2", 162.64)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line333 = svgContainer.append("line")
                .attr("x1", 16.44)
                .attr("y1", 154.94)
                .attr("x2", 23.3)
                .attr("y2", 150.43)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line666 = svgContainer.append("line")
                .attr("x1", 6.92)
                .attr("y1", 136.55)
                .attr("x2", 14.56)
                .attr("y2", 133.54)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line10 = svgContainer.append("line")
                .attr("x1", 1.78)
                .attr("y1", 118.68)
                .attr("x2", 12.91)
                .attr("y2", 116.5)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line1333 = svgContainer.append("line")
                .attr("x1", 0)
                .attr("y1", 100)
                .attr("x2", 8,21)
                .attr("y2", 100)
                .attr("stroke-width", 1)
                .attr("stroke", "black"); 

    var line1666 = svgContainer.append("line")
                .attr("x1", 1.72)
                .attr("y1", 81.55)
                .attr("x2", 9.79)
                .attr("y2", 83.06)
                .attr("stroke-width", 1)
                .attr("stroke", "black"); 

    var line20 = svgContainer.append("line")
                .attr("x1", 6.96)
                .attr("y1", 62.92)
                .attr("x2", 17.7)
                .attr("y2", 67.07)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line2333 = svgContainer.append("line")
                .attr("x1", 16.18)
                .attr("y1", 45.46)
                .attr("x2", 23.06)
                .attr("y2", 49.94)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line2666 = svgContainer.append("line")
                .attr("x1", 29.29)
                .attr("y1", 29.29)
                .attr("x2", 35.09)
                .attr("y2", 35.09)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line30 = svgContainer.append("line")
                .attr("x1", 44.53)
                .attr("y1", 16.79)
                .attr("x2", 50.83)
                .attr("y2", 26.24)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line3333 = svgContainer.append("line")
                .attr("x1", 61.48)
                .attr("y1", 7.72)
                .attr("x2", 64.64)
                .attr("y2", 15.29)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line3666 = svgContainer.append("line")
                .attr("x1", 80.54)
                .attr("y1", 1.91)
                .attr("x2", 82.14)
                .attr("y2", 9.96)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line40 = svgContainer.append("line")
                .attr("x1", 100)
                .attr("y1", 0)
                .attr("x2", 100)
                .attr("y2", 11.36)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line4333 = svgContainer.append("line")
                .attr("x1", 119.24)
                .attr("y1", 1.87)
                .attr("x2", 117.66)
                .attr("y2", 9.96)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line4666 = svgContainer.append("line")
                .attr("x1", 139.14)
                .attr("y1", 7.98)
                .attr("x2", 135.93)
                .attr("y2", 15.53)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line50 = svgContainer.append("line")
                .attr("x1", 155.47)
                .attr("y1", 16.79)
                .attr("x2", 149.17)
                .attr("y2", 26.24)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line5333 = svgContainer.append("line")
                .attr("x1", 170.71)
                .attr("y1", 29.29)
                .attr("x2", 164.91)
                .attr("y2", 35.09)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line5666 = svgContainer.append("line")
                .attr("x1", 183.56)
                .attr("y1", 45.06)
                .attr("x2", 176.7)
                .attr("y2", 49.57)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line60 = svgContainer.append("line")
                .attr("x1", 193.08)
                .attr("y1", 63.45)
                .attr("x2", 182.51)
                .attr("y2", 67.6)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line6333 = svgContainer.append("line")
                .attr("x1", 198.25)
                .attr("y1", 81.38)
                .attr("x2", 190.19)
                .attr("y2", 82.91)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line6666 = svgContainer.append("line")
                .attr("x1", 200)
                .attr("y1", 100)
                .attr("x2", 191.79)
                .attr("y2", 100)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line70 = svgContainer.append("line")
                .attr("x1", 198.28)
                .attr("y1", 118.45)
                .attr("x2", 187.12)
                .attr("y2", 116.36)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line7333 = svgContainer.append("line")
                .attr("x1", 192.84)
                .attr("y1", 137.15)
                .attr("x2", 185.22)
                .attr("y2", 134.1)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line7666 = svgContainer.append("line")
                .attr("x1", 183.82)
                .attr("y1", 154.54)
                .attr("x2", 176.94)
                .attr("y2", 150.06)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var line80 = svgContainer.append("line")
                .attr("x1", 170.71)
                .attr("y1", 170.71)
                .attr("x2", 162.68)
                .attr("y2", 162.68)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

    var text0 = svgContainer.append("text");
    text0.attr("x",38.29)
            .attr("y",170.71)
            .attr("font-family","sans-serif")
            .attr("font-size",textSize)
            .attr("text-anchor", "left")
            .text("0");

    var text10 = svgContainer.append("text");
    text10.attr("x",12.78)
            .attr("y",125.68)
            .attr("font-family","sans-serif")
            .attr("font-size",textSize)
            .attr("text-anchor", "left")
            .text(maxRange*(3/24));
    
    var text20 = svgContainer.append("text");
    text20.attr("x",16.96)
            .attr("y",78.92)
            .attr("font-family","sans-serif")
            .attr("font-size",textSize)
            .attr("text-anchor", "start")
            .text(maxRange*(6/24));

    var text30 = svgContainer.append("text");
    text30.attr("x",45.53)
            .attr("y",41.79)
            .attr("font-family","sans-serif")
            .attr("font-size",textSize)
            .attr("text-anchor", "start")
            .text(maxRange*(9/24));

    var text40 = svgContainer.append("text");
    text40.attr("x",100)
        .attr("y",27 )
        .attr("font-family","sans-serif")
        .attr("font-size",textSize)
        .attr("text-anchor", "middle")
        .text(maxRange*(12/24));

    var text50 = svgContainer.append("text");
    text50.attr("x",151.47)
        .attr("y",41,79)
        .attr("font-family","sans-serif")
        .attr("font-size",textSize)
        .attr("text-anchor", "end")
        .text(maxRange*(15/24));

    var text60 = svgContainer.append("text");
    text60.attr("x",183.08)
        .attr("y",78.92)
        .attr("font-family","sans-serif")
        .attr("font-size",textSize)
        .attr("text-anchor", "end")
        .text(maxRange*(18/24));

    var text70 = svgContainer.append("text");
    text70.attr("x",187)
        .attr("y",125.68)
        .attr("font-family","sans-serif")
        .attr("font-size",textSize)
        .attr("text-anchor", "end")
        .text(maxRange*(21/24));

    var text80 = svgContainer.append("text");
    text80.attr("x",161.71)
        .attr("y",170.71)
        .attr("font-family","sans-serif")
        .attr("font-size",textSize)
        .attr("text-anchor", "end")
        .text(maxRange);

};
//document.body.appendChild(svg);
// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, {transform: dscc.objectTransform});
}