/**
 * Make a line chart.
 *
 * @param config: a javascript object with the following properties:
 *     @param dataset: the dataset to visualize, should be in
 *            [[{xkey: xval, ykey: yval}, ...], ... ] format
 *     @param svgId: id of the svg element onto which draw the barchart
 *     @param xkey: data x key
 *     @param ykey: data y key
 *     @param color: d3 color function, for example d3.scaleOrdinal(d3.schemeCategory10)
 *     @param w: width of the svg
 *     @param h: height of the svg
 *     @param margin: object defining the top, right, bottom and left margins
 */
function lineChart(config) {

    // --------------------- //
    // Setup the SVG element //
    // --------------------- //

    let svg = d3.select("#" + config.svgId)
        .attr("width", config.w)
        .attr("height", config.h);
    let width = config.w - config.margin.left - config.margin.right;
    let height = config.h - config.margin.top - config.margin.bottom;
    let g = svg.append("g").attr(
        "transform", "translate(" + config.margin.left + "," + config.margin.top + ")");
        
    // ----------------- //
    // Create the scales //
    // ----------------- //

    let xScale = d3.scaleTime()
        .domain(d3.extent(config.dataset, function(d) {
            return new Date(d[config.xkey]);
        }))
        .range([0, width])
        .nice();

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(config.dataset, function(d) {
            return d[config.ykey];
        })])
        .range([height, 0])
        .nice();

    // --------------- //
    // Create the axes //
    // --------------- //

    let xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeWeek);

    let yAxis = d3.axisLeft(yScale);

    g.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(" + config.margin.left + "," + (height - config.margin.bottom) + ")")
        .call(xAxis);

    g.selectAll(".xaxis text")
        .attr("transform", function(d) {
            return "translate(" + this.getBBox().height * -2 + "," + this.getBBox().height + ")rotate(-45)";
        });

    g.append("g")
        .attr("transform", "translate(" + config.margin.left + "," + (-config.margin.bottom) + ")")
        .call(yAxis);

    // ------------------- //
    // Draw the line chart //
    // ------------------- //
    
    let line = d3.line()
        .x(function(d) { return xScale(new Date(d[config.xkey])); })
        .y(function(d) { return yScale(d[config.ykey]); });
        
    g.append("path")
        .datum(config.dataset)
        .attr("d", line)
        .attr("stroke", function(d, i) {
            return config.color(i);
        })
        .attr("stroke-width", 3)
        .attr("fill", "none");
        
    if (config.circles) {
        g.selectAll("circle")
            .data(config.dataset)
            .enter()
            .append("circle")
            .attr("fill", config.color(2))
            .attr("cx", function(d) {
                return xScale(new Date(d[config.xkey]));
            })
            .attr("cy", function(d) {
                return yScale(d[config.ykey]);
            })
            .attr("r", 5)
            .on("mouseover", function(d) {
                let tooltip = d3.select("#tooltip")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px");
                tooltip
                    .select("#label")
                    .text(d[config.xkey]);
                tooltip
                    .select("#value")
                    .text(d[config.ykey]);

                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function(d) {
                d3.select("#tooltip").classed("hidden", true);
            });
    }
}

// ----------------------------------- //
// Read the data using d3 tsv function //
// ----------------------------------- //

d3.tsv("../../datasets/my_weekly_productive_hours.tsv", function(data) {
    let config = {
        dataset: data,
        xkey: "week",
        ykey: "duration",
        color: d3.scaleOrdinal(d3.schemeCategory10),
        w: 960,
        h: 500,
        margin: {
            top: 10,
            left: 15,
            bottom: 25,
            right: 20
        }
    };

    // Simple line chart
    config.svgId = "line-chart-simple";
    config.circles = false;
    lineChart(config);

    // Interactive line chart
    config.svgId = "line-chart-interactive";
    config.circles = true;
    lineChart(config);
});
