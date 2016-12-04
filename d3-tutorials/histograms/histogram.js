/**
 * Global variables.
 */
var datasetSize = 1000;
var fruits = ["apples", "oranges"];
var params = [
    [15, 6],
    [10, 4],
];
var format = d3.format(",.2f");
var w = 960;
var h = 500;

/**
 * Generate a dataset of datasetSize data points.
 * Each data points has fruits.length,
 * gaussian distributed attributes.
 */
var generateDataset = function() {
    let clipLeft = function(v, mn) {
        return v > mn ? v : mn;
    };
    let clipRight = function(v, mx) {
        return v < mx ? v : mx;
    };
    return d3.range(datasetSize).map(function(d) {
        return d3.range(fruits.length).map(function(d) {
            const m = params[d][0];
            const s = params[d][1];
            let v = d3.randomNormal(m, s)();
            // Limit the gaussian to be between 0 and 3 stddev from the mean
            return clipRight(clipLeft(v, 0), m + (s * 3));
        });
    });
};

/**
 * Create the dataset.
 */
var dataset = generateDataset();

/**
 * Compute summary statistics.
 * @param i: fruit index
 */
var fruitStats = function(i) {
    let f = function(d) {
        return d[i];
    };
    return [
        d3.mean(dataset, f),
        d3.deviation(dataset, f),
        d3.min(dataset, f),
        d3.max(dataset, f)
    ];
};

var summaryStatistics = d3.range(fruits.length).map(
    function(d) {
        return fruitStats(d);
    }
);

/**
 * Create the histogram of a fruit counts.
 * @param fi: fruit index in fruits array
 */
var fruitHistogram = function(fi) {
    let fruitDataset = dataset.map(function(d) {
        return d[fi];
    });

    // Select the svg element and set its width/height.
    let svg = d3.select("#histogram-container").attr("width", w).attr("height", h),
        margin = {
            top: 10,
            right: 30,
            bottom: 30,
            left: 30
        },
        width = svg.attr("width") - margin.left - margin.right,
        height = svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g")
        .attr(
            "transform", "translate(" + margin.left + "," + margin.top + ")"
        );

    // Create a linear scale for the x-axis,
    // from the min value of the fruit to the max value.
    // We create two functions to left/right round a number
    // to the next integer dividing by r. For example,
    // if n = -6 and r = 5, the round left function returns -10.
    let roundLeftToModulo = function(n, r) {
        for (let j = n; j >= n - r; j--) {
            if (j % r === 0) {
                return j;
            }
        }
    };
    let x = d3.scaleLinear()
        .domain([
            roundLeftToModulo(Math.round(summaryStatistics[fi][2]), 5),
            roundLeftToModulo(Math.round(summaryStatistics[fi][3]), 5)])
        .rangeRound([0, width]);

    // Create the bins of the histogram, using the scale domain and 10 ticks.
    let bins = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(10))
        (fruitDataset);
        
    // Create a linear scale for the y-axis. The max value is the length
    // of the bin with the max num. of elements.
    var y = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) {
            return d.length;
        })])
        .range([height, 0]);
    
    // Create the bars.
    var bar = g.selectAll(".bar")
        .data(bins)
        .enter()
        .append("g")
        .attr("class", "bar")
        .style("fill", "steelblue")
        .attr("transform", function(d) {
            return "translate(" + x(d.x0) + "," + y(d.length) + ")";
        });
    
    // Create the rect elements inside the bars.
    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
        .attr("height", function(d) {
            return height - y(d.length);
        });

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "14")
        .text(function(d) {
            return d.length;
        });

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

};

fruitHistogram(0);