/**
 * Global variables
 */
var datasetUrl = "../../datasets/gapminderDataFiveYear.txt";
var continents = {
    "Africa": 1,
    "Americas": 2,
    "Asia": 3,
    "Europe": 4,
    "Oceania": 5
};
var w = 960;
var h = 500;
var margin = {
    top: 30,
    right: 30,
    bottom: 45,
    left: 50
};

/**
 * Get the data set, and draw the scatter plot between
 * GDP and life expectancy at the given year.
 *
 */
$.get(datasetUrl, function(res) {
    let data = d3.tsvParse(res);
    let dataset2007 = [];

    d3.values(data)
        .forEach(function(d) {
            if (d.year === "2007") {
                dataset2007.push({
                    gdp: +d.gdpPercap,
                    lifeExp: +d.lifeExp,
                    country: d.country,
                    pop: +d.pop,
                    continent: d.continent
                });
            }
        });

    let scatterSimpleSVG = d3.select("#scatter-simple")
        .attr("width", w).attr("height", h);

    let scatterInteractiveSVG = d3.select("#scatter-interactive")
        .attr("width", w).attr("height", h);

    let scatterDynamicRadiusSVG = d3.select("#scatter-dynamic-radius")
        .attr("width", w).attr("height", h);

    let scatterDynamicColorSVG = d3.select("#scatter-dynamic-color")
        .attr("width", w).attr("height", h);
        
    let scatterCompleteSVG = d3.select("#scatter-complete")
        .attr("width", w).attr("height", h);

    drawScatterPlot(scatterSimpleSVG, dataset2007, {});

    drawScatterPlot(scatterInteractiveSVG, dataset2007, {
        interaction: addInteraction,
    });

    drawScatterPlot(scatterDynamicRadiusSVG, dataset2007, {
        interaction: addInteraction,
        radius: addRadiusPropToPopulation,
    });

    drawScatterPlot(scatterDynamicColorSVG, dataset2007, {
        interaction: addInteraction,
        fill: addContinentColor,
    });

    drawScatterPlot(scatterCompleteSVG, dataset2007, {
        interaction: addInteraction,
        fill: addContinentColor,
        radius: addRadiusPropToPopulation,
    });
});

/**
 * Draw a Scatter plot between GDP and life expectancy
 * at the given year.
 *
 * @param svg: svg element into which the plot is created
 * @param dataset: array of objects
 * @param callbacks: (optional) callbacks object. Can provide callbacks for
 *                   the following functions.
 *       fill: (optional) function to apply to the fill attribute of elems
 *       radius: (optional) function to apply to the r attribute of elems
 *       interaction: (optional) function to add interactivity to the plot
 */
var drawScatterPlot = function(svg, dataset, callbacks) {
    /**
     * Callbacks
     */
    let fillFunc = _.has(callbacks, "fill") ? callbacks.fill : function(d) {
        return "steelblue";
    };

    let radiusFunc = _.has(callbacks, "radius") ? callbacks.radius : function(d) {
        return "5px";
    };

    let interactionFunc = _.has(callbacks, "interaction") ? callbacks.interaction : function(elems) {};
    
    /**
     * Create the svg
     */
    let width = svg.attr("width") - margin.left - margin.right;
    let height = svg.attr("height") - margin.top - margin.bottom;
    let g = svg.append("g")
        .attr(
            "transform", "translate(" + margin.left + "," + margin.top + ")"
        );

    // X scale
    let x = d3.scaleLog()
        .domain([200, d3.max(dataset, function(d) {
            return d.gdp;
        }) * 2])
        .rangeRound([0, width]);

    // Y scale
    let y = d3.scaleLinear()
        .domain([35, d3.max(dataset, function(d) {
            return d.lifeExp;
        })])
        .range([height, 0])
        .nice();
    
    // Population scale
    let popScale = d3.scaleLog()
        .domain([
            d3.min(dataset, function(d) {
                return d.pop;
            }),
            d3.max(dataset, function(d) {
                return d.pop;
            }),
        ])
        .rangeRound([2, 12]);
        
    // Color scale
    let color = d3.scaleOrdinal(d3.schemeCategory10);

    // Draw the scatter plot
    let circles = g.append("g").selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("fill", function(d) {
            return fillFunc(d, color);
        })
        .attr("r", function(d) {
            return radiusFunc(d, popScale);
        })
        .attr("cx", function(d) {
            return x(d.gdp);
        })
        .attr("cy", function(d) {
            return y(d.lifeExp);
        });

    interactionFunc(circles);

    // X-axis
    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Y-axis
    g.append("g")
        .call(d3.axisLeft(y));

    // Axis labels
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (margin.left - 30) + "," + (height / 2) + ")rotate(-90)")
        .text("Life Expectancy");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (width / 2) + "," + (height + margin.top + 40) + ")")
        .text("GDP Per Capita");
};

/**
 * Add interaction to the elements of a scatter plot
 *
 * @param elements: selection of svg elements (circles) to which add
 *                  interactivity (tooltips).
 */
var addInteraction = function(elements) {
    let prevColor = "";

    elements
        .on("mouseover", function(d) {
            prevColor = d3.select(this).attr("fill");
            d3.select(this).attr("fill", "#bcbd22");

            let tooltip = d3.select("#tooltip")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
            tooltip
                .select("#label")
                .text("Country");
            tooltip
                .select("#value")
                .text(d.country + ", " + d.continent);

            d3.select("#tooltip").classed("hidden", false);
        })
        .on("mouseout", function(d) {
            d3.select(this).attr("fill", prevColor);
            d3.select("#tooltip").classed("hidden", true);
        });
};

/**
 * Modify the radius of the circles in the scatter plot to be
 * proportional to the population in that country.
 *
 * @param d: circle svg element
 * @param scale: d3 population scale function
 */
var addRadiusPropToPopulation = function(d, scale) {
    return scale(d.pop) + "px";
};

/**
 * Modify the circles in the scatter plot to be
 * of the same color of their continent.
 *
 * @param d: circle svg element
 * @param color: d3 color scale function
 */
var addContinentColor = function(d, color) {
    let idx = continents[d.continent];
    return color(idx);
};
