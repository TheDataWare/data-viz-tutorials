/**
 * Make a bar chart.
 *
 * @param config: a javascript object with the following properties:
 *     @param dataset: the dataset to visualize, should be in [{obj}, {obj}, ..] format
 *     @param svgId: id of the svg element onto which draw the barchart
 *     @param xkey: the key to use in the x-axis
 *     @param ykeys: list of the keys to use in the y-axis
 *     @param ycols: list of the same length as ykeys, with the colors of the bars for the keys
 *     @param ylabel: label to put in the y-axis
 *     @param stacked: if true, create stacked bars (makes sense only if ykeys > 1)
 *     @param w: width of the svg
 *     @param h: height of the svg
 *     @param margin: object defining the top, right, bottom and left margins
 *     @param barpad: padding between the bars
 */
var barChart = function(config) {

    // ---------------------- //
    // Set up the svg element //
    // ---------------------- //

    let svg = d3.select("#" + config.svgId).attr("width", config.w).attr("height", config.h);
    let width = svg.attr("width") - margin.left - margin.right;
    let height = svg.attr("height") - margin.top - margin.bottom;
    let g = svg.append("g").attr(
        "transform", "translate(" + margin.left + "," + margin.top + ")"
    );

    // ----------------- //
    // Create the scales //
    // ----------------- //

    let x = d3.scaleBand()
        .range([0, width])
        .padding(config.barpad);

    let y = d3.scaleLinear()
        .range([height, 0]);

    x.domain(dataset.map(function(d) {
        return d[config.xkey];
    }));

    let mx = [];
    if (config.stacked) {
        dataset.forEach(function(sample, k) {
            mx.push(d3.sum(config.ykeys, function(d) {
                return sample[d];
            }));
        });
    } else {
        config.ykeys.forEach(function(v, k) {
            mx.push(d3.max(dataset, function(d) {
                return d[v];
            }));
        });
    }
    y.domain([0, d3.max(mx)]);

    // --------------- //
    // Create the Bars //
    // --------------- //

    config.ykeys.forEach(function(ykey, k) {
        let bars = g.append("g")
            .selectAll("rect")
            .data(dataset)
            .enter()
            .append("g")
            .style("fill", config.ycols[k]);

        if (config.stacked) {
            bars.append("rect")
                .attr("x", function(d) {
                    return x(d[config.xkey]);
                })
                .attr("y", function(d) {
                    let barY = 0;
                    for (let j = 0; j <= k; j++) {
                        barY += d[config.ykeys[j]];
                    }
                    return y(barY);
                })
                .attr("width", x.bandwidth())
                .attr("height", function(d) {
                    return height - y(d[ykey]);
                });
        } else {
            bars.append("rect")
                .attr("x", function(d) {
                    return x(d[config.xkey]) + ((k / config.ykeys.length) * x.bandwidth());
                })
                .attr("y", function(d) {
                    return y(d[ykey]);
                })
                .attr("width", x.bandwidth() / config.ykeys.length)
                .attr("height", function(d) {
                    return height - y(d[ykey]);
                });
        }
        
        bars
            .on("mouseover", function(d) {
                d3.select(this).style("fill", shadeColor(config.ycols[k], -30));
                let tooltip = d3.select("#tooltip")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px");
                tooltip
                    .select("#label")
                    .text(strCapitalize(ykey));
                tooltip
                    .select("#value")
                    .text(d[ykey]);

                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function(d) {
                d3.select(this).style("fill", config.ycols[k]);
                d3.select("#tooltip").classed("hidden", true);
            });
    });

    // ---------------------------- //
    // Add the axes and axes labels //
    // ---------------------------- //

    let xaxis = g.append("g")
        .attr("transform", "translate(0, " + height + ")")
        .call(d3.axisBottom(x));

    let yaxis = g.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("transform", "translate(" + (margin.left - 25) + "," + (height / 2) + ")rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "20")
        .text(config.ylabel);

    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + "," + (height + margin.top + 40) + ")")
        .attr("text-anchor", "middle")
        .style("font-size", "20")
        .text(strCapitalize(config.xkey));
        
    // -------------- //
    // Add the legend //
    // -------------- //

    // svg.append("g")
        // .attr("class", "legend")
        // .attr("transform", "translate(50, 30)")
        // .style("font-size", "12")
        // .call(d3.legend);

};

/**
 * Capitalize the first letter of the given string.
 *
 * @param str: input string
 *
 * @return str: input string with first letter capitalized
 */
var strCapitalize = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
    year: 1960,
    apples: 2,
    oranges: 3,
    bananas: 1,
}, {
    year: 1965,
    apples: 3,
    oranges: 4,
    bananas: 2,
}, {
    year: 1970,
    apples: 5,
    oranges: 6,
    bananas: 4,
}, {
    year: 1975,
    apples: 3,
    oranges: 6,
    bananas: 7,
}, {
    year: 1980,
    apples: 6,
    oranges: 5,
    bananas: 8,
}, {
    year: 1985,
    apples: 4,
    oranges: 8,
    bananas: 9,
}, {
    year: 1990,
    apples: 8,
    oranges: 8,
    bananas: 3,
}, {
    year: 1995,
    apples: 10,
    oranges: 5,
    bananas: 5,
}, {
    year: 2000,
    apples: 12,
    oranges: 3,
    bananas: 3,
}, {
    year: 2005,
    apples: 10,
    oranges: 7,
    bananas: 11,
}, {
    year: 2010,
    apples: 12,
    oranges: 10,
    bananas: 13,
}, {
    year: 2015,
    apples: 15,
    oranges: 13,
    bananas: 18,
}, ];

var w = 960;
var h = 500;
var margin = {
    top: 15,
    right: 30,
    bottom: 45,
    left: 40
};

/**
 * Create the simple bar chart with one variable
 */
barChart({
    dataset: dataset,
    svgId: "bar-simple",
    xkey: "year",
    ykeys: ["apples"],
    ycols: ["#4682b4"],
    ylabel: "Quantity",
    stacked: false,
    w: w,
    h: h,
    margin: margin,
    barpad: 0.1
});

/**
 * Create the bar chart with two variables
 */
barChart({
    dataset: dataset,
    svgId: "bar-two",
    xkey: "year",
    ykeys: ["apples", "oranges"],
    ycols: ["#4682b4", "#FFA500"],
    ylabel: "Quantity",
    stacked: false,
    w: w,
    h: h,
    margin: margin,
    barpad: 0.1
});

/**
 * Create the bar chart with three variables
 */
barChart({
    dataset: dataset,
    svgId: "bar-three",
    xkey: "year",
    ykeys: ["apples", "oranges", "bananas"],
    ycols: ["#4682b4", "#FFA500", "#007F00"],
    ylabel: "Quantity",
    stacked: false,
    w: w,
    h: h,
    margin: margin,
    barpad: 0.1
});

/**
 * Create the stacked bar chart with three variables
 */
barChart({
    dataset: dataset,
    svgId: "bar-stacked",
    xkey: "year",
    ykeys: ["apples", "oranges", "bananas"],
    ycols: ["#4682b4", "#FFA500", "#007F00"],
    ylabel: "Quantity",
    stacked: true,
    w: w,
    h: h,
    margin: margin,
    barpad: 0.1
});