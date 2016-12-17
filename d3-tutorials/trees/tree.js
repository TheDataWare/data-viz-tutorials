/**
 * Style
 */
var style = document.createElement("style");
style.type = "text/css";
style.innerHTML = `
    .node circle {
      fill: #fff;
      stroke: steelblue;
      stroke-width: 3px;
    }

    .node text {
        font: 12px;
        letter-spacing: 0px;
    }

    .node--internal text {
      text-shadow: 0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff;
    }

    .link {
      fill: none;
      stroke: #ccc;
      stroke-width: 2px;
    }
`;
document.getElementsByTagName('head')[0].appendChild(style);

/**
 * Draw a D3 Tree.
 *
 * @param config: a javascript object with the following properties:
 *    @param dataset: the tree to visualize
 *    @param svgId: id of the svg element onto which draw the barchart
 *    @param w: width of the svg
 *    @param h: height of the svg
 *    @param margin: object defining the top, right, bottom and left margins
 */
var drawTree = function(config) {

    var svg = d3.select("#" + config.svgId).attr("width", config.w).attr("height", config.h);
    var width = svg.attr("width") - config.margin.left - config.margin.right;
    var height = svg.attr("height") - config.margin.top - config.margin.bottom;
    var g = svg.append("g").attr(
        "transform", "translate(" + config.margin.left + "," + config.margin.top + ")"
    );

    /**
     * Creates a tree layout with default settings and sets the size
     */
    var treemap = d3.tree().size([width, height]);

    /**
     * This function constructs a root node from the specified hierarchical data.
     * The data must be an object representing the root node. The second argument
     * is a function that specifies how to get the descendant nodes of the root
     * node.
     */
    var nodes = d3.hierarchy(config.dataset, function(d) {
        return d.children;
    });

    /**
     * Maps the node data to the tree layout, assigning a x coordinate and a y
     * coordinate to each node in the hierarchy.
     */
    nodes = treemap(nodes);

    /**
     * Adds the links between the nodes, using nodes.descendants().slice(1)
     * to remove the root node. We remove the root node because we will create
     * links from children to parents, and the root node has no parent.
     * Regarding the path element:
     * M stands for "move to", C stands for "curve to".
     * The created path element works in the following way:
     *   1. Move to the coordinates of this node
     *   2. Create a Bézier curve from this node to its parent, using the
     *      two mid-points (one at the height of this node and the other one
     *      at the height of its parents) as control points.
     */
    var link = g.selectAll(".link")
        .data(nodes.descendants().slice(1))
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", function(d) {
            let midY = (d.y + d.parent.y) / 2;

            return "M" + d.y + "," + d.x +
                "C" + midY + "," + d.x +
                " " + midY + "," + d.parent.x +
                " " + d.parent.y + "," + d.parent.x;
        });

    /**
     * Adds each node as a group. Here we don't use .slice(1) because
     * we want to include also the root node.
     */
    var node = g.selectAll(".node")
        .data(nodes.descendants())
        .enter()
        .append("g")
        .attr("class", function(d) {
            return "node" + (d.children ? " node--internal" : " node--leaf");
        })
        .attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")";
        });

    // Adds the circle to the node
    node.append("circle")
        .attr("r", 10)
        .on("mouseover", function(d) {
            d3.select(this).style("stroke", "orange");
        })
        .on("mouseout", function(d) {
            d3.select(this).style("stroke", "steelblue");
        });

    // Adds the text to the node
    node.append("text")
        .attr("dy", ".35em")
        .attr("x", function(d) {
            return d.children ? -13 : 13;
        })
        .style("text-anchor", function(d) {
            return d.children ? "end" : "start";
        })
        .text(function(d) {
            return d.data.name;
        });

    // Adds mouseover and mouseout event handlers
    node.on("mouseover", function(d) {
            let tooltip = d3.select("#tooltip")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
            tooltip
                .select("#label")
                .text(function() {
                    if (d.height === 0) {
                        return "Final choices:";
                    } else {
                        return "Choices made at this point:";
                    }
                });
            let ol = tooltip.select("#value").append("ol");

            ol.selectAll("li")
                .data(d.ancestors().slice(0, -1).reverse())
                .enter()
                .append("li")
                .text(function(d) {
                    return d.data.name;
                });

            d3.select("#tooltip").classed("hidden", false);
        })
        .on("mouseout", function(d) {
            d3.select("#tooltip")
                .classed("hidden", true)
                .select("#value")
                .html("");
        });
};

/**
 * Create the tree data for the car choice.
 */
var genCarTreeData = function() {

    // Generate the subtree starting from cost
    let cost = function(i) {
        let name = {
            1: "Low Cost",
            2: "Mid Cost",
            3: "High Cost"
        };
        return {
            "name": name[i],
            "children": [
                hp(1), hp(2), hp(3)
            ]
        };
    };

    // Generate the subtree starting from horse power
    let hp = function(i) {
        let name = {
            1: "Low HP",
            2: "Mid HP",
            3: "High HP"
        };
        return {
            "name": name[i],
            "children": [
                fuel(1), fuel(2)
            ]
        };
    };

    // Generate the subtree starting from fuel
    let fuel = function(i) {
        let name = {
            1: "Low Fuel Cons.",
            2: "Mid Fuel Cons.",
            3: "High Fuel Cons."
        };
        return {
            "name": name[i],
            "children": [{
                "name": "Color light"
            }, {
                "name": "Color dark"
            }]
        };
    };

    // Return the generated tree
    return {
        "name": "Car?",
        "children": [cost(1), cost(2), cost(3)]
    };
};

/**
 * Create the tree data for the subsets of a set of N elements.
 *
 * @param n: upper limit of the set. The set will contain elements from 1 to n.
 */
var genSetTreeData = function(n) {

    let genSetTreeDataAux = function(root, level, n) {
        if (level === n) {
            return root;
        } else {
            let left = {
                "name": "Include " + (level + 1),
                "children": []
            };
            let right = {
                "name": "Not Include " + (level + 1),
                "children": []
            };
            root.children.push(left, right);
            left = genSetTreeDataAux(left, level + 1, n);
            right = genSetTreeDataAux(right, level + 1, n);

            return root;
        }
    };

    return genSetTreeDataAux({
        "name": "Subset?",
        "children": []
    }, 0, n);
};

/**
 * Draw the car tree
 */
drawTree({
    dataset: genCarTreeData(),
    svgId: "tree-car",
    w: 1000,
    h: 1000,
    margin: {
        top: 10,
        right: 10,
        bottom: 130,
        left: 50
    }
});

/**
 * Draw the integer subsets tree
 */
drawTree({
    dataset: genSetTreeData(4),
    svgId: "tree-subsets",
    w: 970,
    h: 900,
    margin: {
        top: 25,
        right: 30,
        bottom: 100,
        left: 75
    }
});