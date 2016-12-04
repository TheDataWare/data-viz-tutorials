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
 * Display summary statistics in a table.
 */
var tableHeaders = ["fruit", "mean", "stddev", "min", "max"];
var table = d3.select("#table-container").append("table")
    .classed("table", true)
    .classed("table-bordered", true)
    .classed("table-hover", true)
    .classed("table-inverse", true);

/**
 * Table header
 */
table.append("thead").append("tr")
    .classed("bg-primary", true)
    .selectAll("th")
    .data(tableHeaders)
    .enter()
    .append("th")
    .text(function(d) {
        return d;
    });

/**
 * Table body
 */
var tableBody = table.append("tbody");

d3.range(fruits.length).map(function(d) {
    let row = tableBody.append("tr");
    row.append("td").text(fruits[d]);
    row
        .selectAll()
        .data(summaryStatistics[d])
        .enter()
        .append("td")
        .text(function(d) {
            return format(d);
        });
});