
var width = window.innerWidth;
var height = window.innerHeight;

var projection, boundaries, svg, path, g;

var file_name = "cdf";
var area = "wards";

var zoom = d3.behavior.zoom()
    .on("zoom", move);

init(width, height);

function init(width, height) {

    projection = d3.geo.albers()
        .rotate([0, 0]);

    path = d3.geo.path()
        .projection(projection);

    svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height);

    g = svg.append("g");

    svg.call(zoom);

    function deselect(d) {
        d3.selectAll(".selected")
            .attr("class", "area"); 
        d3.select("#data_table")
        .html("");      
    }

    // add a blank rectangle to enable zooming from anywhere in the svg
    g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .style("fill", "#fff")
        .on('click', deselect);
}

// move function allows us to pan around the svg
function move() {
    g.attr("transform","translate("+ 
        d3.event.translate.join(",")+")scale("+d3.event.scale+")");
    g.selectAll("path")
        .attr("d", path.projection(projection));
}

function create_table(properties) {
    var keys = Object.keys(properties);

    table_string = "<table>";
    for (var i = 0; i < keys.length; i++) {
        table_string += "<tr><td>" + keys[i] + "</td><td>" + properties[keys[i]] + "</td></tr>";
    }
    table_string += "</table>";
    return table_string;
}

function select(d) {
    var id = "#" + d.id;
    d3.selectAll(".selected")
        .attr("class", "area");
    d3.select(id)
        .attr("class", "selected area")
    d3.select("#data_table")
        .html(create_table(d.properties));
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
        .attr("id", function(d) {return d.id})
        .attr("properties_table", function(d) { return create_table(d.properties)})
        .attr("d", path)
        .on("click", function(d){ return select(d)});

    g.append("path")
        .datum(topojson.mesh(boundaries, boundaries.objects[file_name], function(a, b){ return a !== b }))
        .attr('d', path)
        .attr('class', 'boundary');
}

function redraw() {
    width = window.innerWidth;
    height = window.innerHeight;

    d3.select("svg").remove();

    init(width, height);
    draw(boundaries);
}

function load_data() {
    d3.json("json/" + area + "_" + file_name + ".json", function(error, b) {
        if (error) return console.error(error);
        boundaries = b;
        redraw();
    });    
}

window.addEventListener('resize', redraw);
d3.select("#areas").on('change', function(){
    area = this.options[this.selectedIndex].value;
    load_data();
});

load_data();

