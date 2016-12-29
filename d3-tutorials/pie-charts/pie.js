/**
 * Make a pie chart.
 *
 * @param config: a javascript object with the following properties:
 *     @param dataset: the dataset to visualize, should be in [{obj}, {obj}, ..] format
 *     @param svgId: id of the svg element onto which draw the barchart
 *     @param dispkey: the names to display in the slices
 *     @param dispval: the values to display in the tooltip
 *     @param perckey: the percentage values
 *     @param color: d3 color function, for example d3.scaleOrdinal(d3.schemeCategory10)
 *     @param donut: if true, create donut chart
 *     @param donutRadius: donut radius (makes sense only if donut is true)
 *     @param w: width of the svg
 *     @param h: height of the svg
 *     @param margin: object defining the top, right, bottom and left margins
 *     @param labelMargin: margin between the outer arc and the labels
 *     @param slicepad: padding between the bars
 */
var pieChart = function(config) {

    // ---------------------- //
    // Set up the svg element //
    // ---------------------- //

    let svg = d3.select("#" + config.svgId).attr("width", config.w).attr("height", config.h);
    let width = svg.attr("width") - margin.left - margin.right;
    let height = svg.attr("height") - margin.top - margin.bottom;
    let radius = Math.min(width, height) / 2;
    let g = svg.append("g").attr(
        "transform", "translate(" + width / 2 + "," + height / 2 + ")"
    );

    // ------------------------------ //
    // Create the arcs and the layout //
    // ------------------------------ //

    /**
     * [arc] is the object that will actually draw the slices of the pie.
     * It needs inner and outer radiuses, as well as a startAngle and an
     * endAngle (that will be provided later by the layout).
     */
    let arc = d3.arc()
        .outerRadius(radius - margin.top)
        .innerRadius(config.donut ? config.donutRadius : 0)
        .padAngle(config.slicepad);

    /**
     * [labelArc] is the object that will draw the labels of the slices.
     * It needs to be inside the slice by a certain margin, which I arbitrary
     * chosen to be 25.
     */
    let labelRadius = radius - margin.top - config.labelMargin;
    let labelArc = d3.arc()
        .outerRadius(labelRadius)
        .innerRadius(config.donut ? labelRadius - config.donutRadius : labelRadius);
    
    /**
     * [pie] layout creates a mapping between percentage values and arc angles.
     * As always in d3, we have a layout object [pie] that creates a mapping between
     * the actual dataset values and our visual domain, and another object [arc]
     * with the task of the actual drawing.
     */
    let pie = d3.pie()
        .sort(null)
        .value(function(d) {
            return d[config.perckey];
        });


    // ----------------- //
    // Create the Slices //
    // ----------------- //

    let slices = g.selectAll(".arc")
        .data(pie(dataset))  // this is where percentages are converted into angles
        .enter()
        .append("g")
        .attr("class", "arc");
        
    let arcs = slices.append("path")
        .attr("d", arc)  // this is where the angles are converted into svg paths
        .style("stroke", "#fff")
        .style("fill", function(d, i) {
            return config.color(i);
        });
    
    slices.append("text")
        .attr("transform", function(d) {
            // the arc.centroid() function computes the center of the arc
            // to best position the label
            return "translate(" + labelArc.centroid(d) + ")";
        })
        .attr("dx", "-1.25em")
        .attr("dy", "0.25em")
        .text(function(d) {
            return d.data[config.dispkey];
        });

    arcs
        .on("mouseover", function(d, i) {
            d3.select(this).style("fill", shadeColor(config.color(i), -30));
            let tooltip = d3.select("#tooltip")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
            tooltip
                .select("#label")
                .text(d.data[config.dispkey]);
            tooltip
                .select("#value")
                .text(d.data[config.dispval]);

            d3.select("#tooltip").classed("hidden", false);
        })
        .on("mouseout", function(d, i) {
            d3.select(this).style("fill", config.color(i));
            d3.select("#tooltip").classed("hidden", true);
        });

};

/**
 * Darken or Lighten a hex color by a given percentage.
 * Taken from here: http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
 *
 * @param color: hex color
 * @param percent: darken or lighten percent (< 0 darken, > 0 lighten)
 *
 * @return darker or lighter color
 */
function shadeColor(color, percent) {

    var R = parseInt(color.substring(1, 3), 16);
    var G = parseInt(color.substring(3, 5), 16);
    var B = parseInt(color.substring(5, 7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
    var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
    var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
}

/**
 * Global variables
 */
var dataset = [{
    "name": "Samsung",
    "units": 76743.5,
    "perc": 22.3
}, {
    "name": "Apple",
    "units": 44395,
    "perc": 12.9
}, {
    "name": "Huawei",
    "units": 30670.7,
    "perc": 8.9
}, {
    "name": "Oppo",
    "units": 18489.6,
    "perc": 5.4
}, {
    "name": "Xiaomi",
    "units": 15530.7,
    "perc": 4.5
}, {
    "name": "Others",
    "units": 158530.3,
    "perc": 46.0
}];

var w = 960;
var h = 500;
var margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
};

/**
 * Create a pie chart
 */
pieChart({
    dataset: dataset,
    svgId: "pie-chart",
    dispkey: "name",
    dispval: "units",
    perckey: "perc",
    color: d3.scaleOrdinal(d3.schemeCategory10),
    donut: false,
    w: w,
    h: h,
    margin: margin,
    labelMargin: 50,
    slicepad: 0,
});

/**
 * Create a donut chart
 */
pieChart({
    dataset: dataset,
    svgId: "donut-chart",
    dispkey: "name",
    dispval: "units",
    perckey: "perc",
    color: d3.scaleOrdinal(d3.schemeCategory10),
    donut: true,
    donutRadius: 130,
    w: w,
    h: h,
    margin: margin,
    labelMargin: 0,
    slicepad: Math.PI / 360
});