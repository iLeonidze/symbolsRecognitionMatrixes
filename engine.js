var networks = {};

Array.prototype.last = function() {
    return this[this.length-1];
}


/* © 2009 ROBO Design
 * http://www.robodesign.ro
 */

var canvas, canvas2, context, context2;
// Keep everything in anonymous function, called on window load.
if(window.addEventListener) {
    window.addEventListener('load', function () {
        var tool, tool2;

        canvas = document.getElementById('imageView1');
        canvas2 = document.getElementById('imageView2');

        var canvasWidth = document.querySelector(".partly2").offsetWidth-1;
        var canvasHeight = document.querySelector(".partly2").offsetHeight-1;

        canvas.width = canvas2.width = canvasWidth;
        canvas.height = canvas2.height = canvasHeight;

        console.log(canvasWidth, canvasHeight);

        function init () {
            // Find the canvas element.
            if (!canvas || !canvas2) {
                alert('Error: I cannot find the canvas element!');
                return;
            }

            if (!canvas.getContext || !canvas2.getContext) {
                alert('Error: no canvas.getContext!');
                return;
            }

            // Get the 2D canvas context.
            context = canvas.getContext('2d');
            context2 = canvas2.getContext('2d');

            context.lineWidth = 50;
            context2.lineWidth = 50;

            if (!context) {
                alert('Error: failed to getContext!');
                return;
            }

            if (!context2) {
                alert('Error: failed to getContext!');
                return;
            }

            // Pencil tool instance.
            tool = new tool_pencil();
            tool2 = new tool_pencil2();

            // Attach the mousedown, mousemove and mouseup event listeners.
            canvas.addEventListener('mousedown', ev_canvas, false);
            canvas2.addEventListener('mousedown', function(ev){
                ev_canvas2(ev);
                document.getElementById("recognizedSymbol").innerText = "-";
                document.getElementById("recognizedSymbolPercentage").innerText = "-";
            }, false);
            canvas.addEventListener('mousemove', ev_canvas, false);
            canvas2.addEventListener('mousemove', ev_canvas2, false);
            canvas.addEventListener('mouseup',   function(ev){
                ev_canvas(ev);
                doTrainNetwork(context, canvas);
            }, false);
            canvas2.addEventListener('mouseup',   function(ev){
                ev_canvas2(ev);
                doRecognizeNetwork(context, canvas);
            }, false);
        }

        // This painting tool works like a drawing pencil which tracks the mouse
        // movements.
        function tool_pencil () {
            var tool = this;
            this.started = false;

            // This is called when you start holding down the mouse button.
            // This starts the pencil drawing.
            this.mousedown = function (ev) {
                context.beginPath();
                context.moveTo(ev._x, ev._y);
                tool.started = true;
            };

            // This function is called every time you move the mouse. Obviously, it only
            // draws if the tool.started state is set to true (when you are holding down
            // the mouse button).
            this.mousemove = function (ev) {
                if (tool.started) {
                    context.lineTo(ev._x, ev._y);
                    context.stroke();
                }
            };

            // This is called when you release the mouse button.
            this.mouseup = function (ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                }
            };
        }

        // This painting tool works like a drawing pencil which tracks the mouse
        // movements.
        function tool_pencil2 () {
            var tool = this;
            this.started = false;

            // This is called when you start holding down the mouse button.
            // This starts the pencil drawing.
            this.mousedown = function (ev) {
                context2.beginPath();
                context2.moveTo(ev._x, ev._y);
                tool.started = true;
            };

            // This function is called every time you move the mouse. Obviously, it only
            // draws if the tool.started state is set to true (when you are holding down
            // the mouse button).
            this.mousemove = function (ev) {
                if (tool.started) {
                    context2.lineTo(ev._x, ev._y);
                    context2.stroke();
                }
            };

            // This is called when you release the mouse button.
            this.mouseup = function (ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                }
            };
        }

        // The general-purpose event handler. This function just determines the mouse
        // position relative to the canvas element.
        function ev_canvas (ev) {
            if (ev.layerX || ev.layerX == 0) { // Firefox
                ev._x = ev.layerX;
                ev._y = ev.layerY;
            } else if (ev.offsetX || ev.offsetX == 0) { // Opera
                ev._x = ev.offsetX;
                ev._y = ev.offsetY;
            }

            // Call the event handler of the tool.
            var func = tool[ev.type];
            if (func) {
                func(ev);
            }
        }
        // The general-purpose event handler. This function just determines the mouse
        // position relative to the canvas element.
        function ev_canvas2 (ev) {
            if (ev.layerX || ev.layerX == 0) { // Firefox
                ev._x = ev.layerX;
                ev._y = ev.layerY;
            } else if (ev.offsetX || ev.offsetX == 0) { // Opera
                ev._x = ev.offsetX;
                ev._y = ev.offsetY;
            }

            // Call the event handler of the tool.
            var func = tool2[ev.type];
            if (func) {
                func(ev);
            }
        }

        init();

    }, false); }

// vim:set spell spl=en fo=wan1croql tw=80 ts=2 sw=2 sts=2 sta et ai cin fenc=utf-8 ff=unix:







/*
var dropArea = document.getElementById('dropArea');
dropArea.addEventListener('dragenter', function(e) {
    e.preventDefault();
    e.stopPropagation();

    console.log("Drag enter");
}, false);
dropArea.addEventListener('dragleave', function(e) {
    e.preventDefault();
    e.stopPropagation();

    console.log("Drag leave");
}, false);
dropArea.addEventListener('dragover', function(e) {
    e = e || event;
    e.preventDefault();
}, false);
dropArea.addEventListener('drop', function(e) {
    e = e || event;
    e.preventDefault();

    var symbolName = document.getElementById("trainingName").value;
    var dt = e.dataTransfer;
    var files = dt.files;
    console.log("Drag drop", files);
    ([...files]).forEach(function(file){

            var url = URL.createObjectURL(file);
            var img = new Image();
            img.onload = function() {
                trainNetwork(img, symbolName);
            };
            img.src = url;
    });
}, false);*/


function filterToBinary(ctx, cnv) {
    var output = [];
    var coefficient = 5;

    var i = 0;


    for (var x = 0; x < cnv.width; x++) {
        if (x % coefficient === 0) {
            output[i] = [];
            var j = 0;
            for (var y = 0; y < cnv.height; y++) {
                if (y % coefficient === 0) {
                    var p = ctx.getImageData(x, y, 1, 1).data;
                    /*var rgba = [p[0], p[1], p[2], p[3]];
                    console.log(rgba);*/

                    //then invent a black or white algorithm for rgb to black&white
                    /*var cnt = 0;
                    if (p[0] > 128) cnt++;
                    if (p[1] > 128) cnt++;
                    if (p[2] > 128) cnt++;
                    output[i][j] = cnt > 1 ? 0 : 1*/    // black or white if 2 rgb > 128 (i have no idea how to do this lol)
                    output[i][j] = p[3] > 0;
                    j++;
                }
            }
            i++;
        }
    }


    return output;
}

function doGetNetworkMatrix(networkName){
    var newMatrix = [];
    for(var i = 0; i < networks[networkName].matrix.length; i++) {
        newMatrix[i] = [];
        for(var j = 0; j < networks[networkName].matrix[i].length; j++) {
            newMatrix[i][j] = networks[networkName].matrix[i][j]/networks[networkName].trains;
        }
    }
    return newMatrix;
}


function doRecognizeNetwork(){
    console.log("Do recognize network!");

    var binaryImage = filterToBinary(context2, canvas2);
    console.log("Searching for dataset "+binaryImage.length+"x"+binaryImage[0].length+" = "+(binaryImage.length*binaryImage[0].length));

    var symbols = Object.keys(networks);
    console.log(symbols);
    var calculated = [];
    for(var k = 0; k < symbols.length; k++) {
        var matrix = doGetNetworkMatrix(symbols[k]);
        var summ = 0;
        var matrixSumm = 0;
        for(var i = 0; i < binaryImage.length; i++) {
            for(var j = 0; j < binaryImage[i].length; j++) {
                matrixSumm += matrix[i][j];
                var diff = binaryImage[i][j]-matrix[i][j];
                if(diff < 0){

                } else {
                    summ += matrix[i][j];
                }
            }
        }
        calculated.push([summ/matrixSumm*100, symbols[k], summ, matrixSumm]);

    }

    calculated.sort(function(a, b){
        return a[0] - b[0];
    });

    console.log(calculated);

    console.log("Seams this is a symbol "+calculated[calculated.length-1][1]);

    document.getElementById("recognizedSymbol").innerText = calculated[calculated.length-1][1];
    document.getElementById("recognizedSymbolPercentage").innerText = "With precision "+(Math.floor(calculated[calculated.length-1][0]*100)/100)+"%";
}
function doTrainNetwork(){
    var symbolName = document.getElementById("trainingName").value;
    console.log("Do train network for symbol "+symbolName);

    var binaryImage = filterToBinary(context, canvas);

    var thatNew = false;
    if(typeof networks[symbolName] === "undefined") {
        networks[symbolName] = {
            trains : 1,
            matrix: []
        };
        thatNew = true;
    } else {
        networks[symbolName].trains++;
    }
        for(var i = 0; i < binaryImage.length; i++) {
            if(thatNew) {
                networks[symbolName].matrix[i] = [];
            }
                for (var j = 0; j < binaryImage[i].length; j++) {
                        if(thatNew) {
                            networks[symbolName].matrix[i][j] = binaryImage[i][j];
                        } else {
                            networks[symbolName].matrix[i][j] += binaryImage[i][j];
                        }
                }
        }

        console.log("Trained dataset "+networks[symbolName].matrix.length+"x"+networks[symbolName].matrix[0].length+" = "+(networks[symbolName].matrix.length*networks[symbolName].matrix[0].length), networks);

    context.clearRect(0, 0, canvas.width, canvas.height);
}