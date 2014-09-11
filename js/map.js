var margin = 40;

var width = window.innerWidth;
var height = window.innerHeight;

var projection, boundaries, svg, path, g;

var file_name = "cdf";

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 8])
    .on("zoom", move);

init(width, height);

function init(width, height) {

    projection = d3.geo.albers()
        .rotate([0, 0]);

    path = d3.geo.path()
        .projection(projection);

    svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    g = svg.append("g")
            .call(zoom);

    // add a blank rectangle to enable zooming from anywhere in the svg
    g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .style("fill", "#fff");
}

// move function allows us to pan around the svg
function move() {

  var t = d3.event.translate;
  var s = d3.event.scale;  
  var h = height / 3;
  
  t[0] = Math.min(width / 2 * (s - 1), Math.max(width / 2 * (1 - s), t[0]));
  t[1] = Math.min(height / 2 * (s - 1) + h * s, Math.max(height / 2 * (1 - s) - h * s, t[1]));

  zoom.translate(t);
  g.attr("transform", "translate(" + t + ")scale(" + s + ")");

}


function draw(boundaries) {

    projection
        .scale(1)
        .translate([0,0]);

    var b = path.bounds(topojson.feature(boundaries, boundaries.objects[file_name]));
    var s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
    var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    
    projection
        .scale(s)
        .translate(t);

    g.selectAll(".soa")
        .data(topojson.feature(boundaries, boundaries.objects[file_name]).features)
        .enter().append("path")
        .attr("class", "area")
        .attr("id", function(d) { return d.id })
        .attr("d", path); 

    g.append("path")
        .datum(topojson.mesh(boundaries, boundaries.objects[file_name], function(a, b){ return a !== b }))
        .attr('d', path)
        .attr('class', 'boundary');
}


function redraw() {
    width = window.innerWidth - (2 * margin);
    height = window.innerHeight - (2 * margin);

    d3.select("svg").remove();

    init(width, height);
    draw(boundaries);
}


window.addEventListener('resize', redraw);

d3.json("json/wards_" + file_name + ".json", function(error, b) {
    if (error) return console.error(error);
    boundaries = b;
    draw(boundaries);
});

