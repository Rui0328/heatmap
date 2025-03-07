let url= "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
let req = new XMLHttpRequest();

let baseTemp;
let values;

let xScale;
let yScale;

let minYear;
let maxYear;

let width = 1200;
let height = 600;
let padding = 60;

let canvas = d3.select("#canvas");
canvas.attr("width", width)
canvas.attr("height", height)

let generateScales=()=>{

    minYear = d3.min(values, (item)=>{
        return item['year']
    })

    maxYear = d3.max(values, (item)=>{
        return item['year']
    })

   xScale = d3.scaleLinear()
              .domain([minYear, maxYear])
              .range([padding, width-padding])

   yScale = d3.scaleTime()
              .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
              .range([padding, height - padding])           
              
}

let drawCells =()=>{
   let tooltip = d3.select('body')
                   .append('div')
                   .attr('id', 'tooltip')
                   .style('visibility', 'hidden')
                   .style('background-color', 'white')
                   .style("border", "1px solid black")
                   .style("padding", "5px")
                   .style("border-radius", "5px");

   canvas.selectAll("rect")
         .data(values)
         .enter()
         .append("rect")
         .attr("class", "cell")
         .attr("fill", (item)=>{
            let variance = item["variance"]

            if(variance <= -1){
                return "SteelBlue";
            }else if(variance <= 0){
                return "LightSteelBlue"
            }else if(variance < 1){
                return "Orange"
            }else{
                return "Crimson"
            }
         })
         .attr("data-year", (item)=>{
            return item['year']
         })
         .attr("data-month", (item)=>{
            return item['month'] -1
         })
         .attr("data-temp", (item)=>{
            return baseTemp + item['variance']
         })
         .attr('height', (height - (2 * padding)) /12)
         .attr('y', (item)=>{
            return yScale(new Date(0, item['month'] -1, 0, 0, 0, 0, 0))
         })
         .attr('width',(item)=>{
            let numberOfYears = maxYear - minYear
            return (width - (2*padding)) / numberOfYears
         } )
         .attr('x', (item)=>{
            return xScale(item['year'])
         })
         .on('mouseover', (event, d)=>{
            console.log(d);
            tooltip.transition()
                   .style('visibility', 'visible')
                   .attr('data-year', d['year'])

            tooltip.text(`Temprature:${baseTemp-d['variance']}`)       
         })
         .on("mouseout", () => {
            tooltip.transition()
                .duration(200)
                .style("visibility", "hidden");
        });
}

let drawAxes =()=>{
    let xAxis = d3.axisBottom(xScale)
                  .tickFormat(d3.format('d'))
    let yAxis = d3.axisLeft(yScale)
                  .tickFormat(d3.timeFormat(('%B')))

    canvas.append("g")
          .call(xAxis)
          .attr("id", "x-axis")
          .attr("transform", "translate(0 " + (height - padding) + ")" )

    canvas.append("g")
          .call(yAxis)
          .attr("id", "y-axis")    
          .attr("transform", "translate(" + padding + ",0)")  

}

req.open("GET", url, true);

req.onload=()=>{
    let object = JSON.parse(req.responseText);
    
    baseTemp = object["baseTemperature"]
    values = object["monthlyVariance"]

    generateScales();
    drawCells();
    drawAxes();
}

req.send();