
d3.tsv("../../datasets/my_weekly_productive_hours.tsv", function(data) {
    //console.log(data);
    drawLineChart(data);
});

function drawLineChart(dataset) {
    console.log(dataset);
}

