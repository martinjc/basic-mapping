var resolution = units;
var area = "gb";

function change_area() {
    units = resolution;
    var f = "json/" + area + "/topo_" + units + ".json";

    load_data(f, units);
}

d3.select("#top_level").on('change', function(){
    area = this.options[this.selectedIndex].value;
    console.log(area);
    change_area();
});

d3.select("#resolution").on('change', function(){
    resolution = this.options[this.selectedIndex].value;
    console.log(resolution);
    change_area();
});


