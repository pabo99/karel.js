/* Cosas para dibujar el canvas del mundo */

var Kind = {
    Beeper: 0, 
    Corner: 1,
    WestWall: 2,
    NorthWall: 3,
    EastWall: 4,
    SouthWall: 5,
};

var WorldRender = function(context){
    this.should_draw = true;
    this.context = context;

    this.primera_fila = 1;
    this.primera_columna = 1;

    this.num_filas = 1
    this.num_columnas = 1

    this.tamano_celda = 30;
    this.margin = 7.5;

    this.polygon = false;
    this.polygon_begin = undefined;
    this.polygon_end = undefined;

    this.paint = function(world, mundo_ancho, mundo_alto, options) {
        options = options || {};

        function dibuja_karel(context, world, origen){ //Dibujar a Karel

            context.fillStyle = '#0000FF';
            context.beginPath();
            if (world.orientation == 0) { // oeste
                context.moveTo( origen.x, origen.y+15 );
                context.lineTo( origen.x+13, origen.y );
                context.lineTo( origen.x+13, origen.y+7 );
                context.lineTo( origen.x+27, origen.y+7 );
                context.lineTo( origen.x+27, origen.y+23 );
                context.lineTo( origen.x+13, origen.y+23 );
                context.lineTo( origen.x+13, origen.y+30 );
            } else if (world.orientation == 1) { // norte
                context.moveTo ( origen.x, origen.y+13 );
                context.lineTo ( origen.x+15, origen.y );
                context.lineTo ( origen.x+30, origen.y+13 );
                context.lineTo ( origen.x+23, origen.y+13 );
                context.lineTo ( origen.x+23, origen.y+27 );
                context.lineTo ( origen.x+7, origen.y+27 );
                context.lineTo ( origen.x+7, origen.y+13 );
            } else if (world.orientation == 2) { // este
                context.moveTo ( origen.x+3, origen.y+7 );
                context.lineTo ( origen.x+17, origen.y+7 );
                context.lineTo ( origen.x+17, origen.y );
                context.lineTo ( origen.x+30, origen.y+15 );
                context.lineTo ( origen.x+17, origen.y+30 );
                context.lineTo ( origen.x+17, origen.y+23 );
                context.lineTo ( origen.x+3, origen.y+23 );
            } else if (world.orientation == 3) { // sur
                context.moveTo ( origen.x+7, origen.y+3 );
                context.lineTo ( origen.x+23, origen.y+3 );
                context.lineTo ( origen.x+23, origen.y+17 );
                context.lineTo ( origen.x+30, origen.y+17 );
                context.lineTo ( origen.x+15, origen.y+30 );
                context.lineTo ( origen.x, origen.y+17);
                context.lineTo ( origen.x+7, origen.y+17);
            }
            context.closePath();
            context.fill();
        }

        context.clearRect(0, 0, mundo_ancho, mundo_alto);
        context.fillStyle="#959595";
        context.fillRect(0, 0, mundo_ancho, mundo_alto);

        var tamanio_lienzo = {x:(mundo_ancho-30), y:(mundo_alto-30)};
        var tamanio_mundo = {x:mundo_ancho, y:mundo_alto};

        context.fillStyle = options.editable ? "#FFFFFF" : "#FAFAFA";
        context.fillRect(30, 0, tamanio_lienzo.x, tamanio_lienzo.y);

        //IMPORTANTE
        var origen = {x:30, y:mundo_alto-60} //Coordenada para dibujar la primera casilla

        this.num_columnas = (tamanio_lienzo.x/30 + Math.ceil((tamanio_lienzo.x%30)/30.))*1;
        this.num_filas = (tamanio_lienzo.y/30 + Math.ceil((tamanio_lienzo.y%30)/30.))*1;

        if(options.track_karel) {
          //Rastrea la ubicación de karel y lo forza a aparecer
          if(world.i < this.primera_fila) {
            this.primera_fila = Math.floor(world.i)
          } else if (world.i > ((this.primera_fila + this.num_filas)-2)) {
            this.primera_fila = Math.floor(world.i - this.num_filas) +3
          }
          if(world.j < this.primera_columna) {
            this.primera_columna = Math.floor(world.j)
          } else if (world.j > ((this.primera_columna + this.num_columnas)-2)) {
            this.primera_columna = Math.floor(world.j - this.num_columnas) +3
          }
        }

        //Cuadrados de las esquinas
        for(var i=0; i<this.num_filas;i++){
            for(var j=0;j<this.num_columnas;j++) {
                x = origen.x+30*j;
                y = origen.y-30*i;
                context.fillStyle="#656565";
                context.fillRect(x-2, y+26, 6, 6);
            }
        }

        //Dibujar las cosas que pertenecen al mundo por cada casilla
        num_fila = 1 //Posicion relativa a la pantalla
        num_columna = 1 //Posicion relativa a la pantalla
        for(var fila=this.primera_fila;fila<(this.primera_fila+this.num_filas);fila++){
            num_columna = 1
            for(var columna=this.primera_columna;columna<this.primera_columna+this.num_columnas;columna++){
                //Si esa casilla se debe imprimir
                if (options.editable) {
                    context.fillStyle = '#eee';
                    if (world.getDumpCell(fila, columna)) {
                        context.fillRect(origen.x+(num_columna-1)*30+4,
                                         origen.y-(num_fila-1)*30+2,
                                         24,
                                         24);
                    }
                }

                //Dibujar a karel
                if (world.i === fila && world.j === columna) {
                    var referencia = {x: origen.x+(num_columna-1)*30, y: origen.y-(num_fila-1)*30};

                    dibuja_karel(context, world, referencia);
                }

                //Paredes
                context.fillStyle="#191919";
                var paredes = world.walls(fila, columna);
                if ((paredes & 0x1) != 0) { // oeste
                    context.fillRect(origen.x+(num_columna-1)*30-1, origen.y-(num_fila-1)*30, 4, 30);
                }
                if ((paredes & 0x2) != 0) { // norte
                    context.fillRect(origen.x+(num_columna-1)*30+1, origen.y-(num_fila-1)*30+27-30, 30, 4);
                }
                if ((paredes & 0x4) != 0) { // este
                    context.fillRect(origen.x+(num_columna-1)*30-1+30, origen.y-(num_fila-1)*30, 4, 30);
                }
                if ((paredes & 0x8) != 0) { // oeste
                    context.fillRect(origen.x+(num_columna-1)*30+1, origen.y-(num_fila-1)*30+27, 30, 4);
                }

                //Zumbadores
                var zumbadores = world.buzzers(fila, columna);
                if (zumbadores == -1 || zumbadores > 0) {
                    context.fillStyle = options.editable ? '#00FF00' : '#E0E0E0';
                    if (zumbadores == -1) {
                        context.fillRect(origen.x+(num_columna-1)*30+8, origen.y-(num_fila-1)*30+8, 16, 12);

                        context.font = '25px monospace';
                        context.fillStyle = '#000000';
                        context.fillText('∞', origen.x+(num_columna-1)*30+9, origen.y-(num_fila-1)*30+23);
                    } else if (zumbadores < 10) {
                        context.fillRect(origen.x+(num_columna-1)*30+9, origen.y-(num_fila-1)*30+8, 12, 14);

                        context.font = '12px monospace';
                        context.fillStyle = '#000000';
                        context.fillText(String(zumbadores), origen.x+(num_columna-1)*30+11, origen.y-(num_fila-1)*30+20);
                    } else {
                        context.fillRect(origen.x+(num_columna-1)*30+7, origen.y-(num_fila-1)*30+8, 16, 14);

                        context.font = '12px monospace';
                        context.fillStyle = '#000000';
                        context.fillText(String(zumbadores), origen.x+(num_columna-1)*30+8, origen.y-(num_fila-1)*30+20);
                    }
                }
                num_columna += 1
            }
            num_fila += 1
        }
        this.should_draw = !this.should_draw;
        //Numeros de fila
        var a = 1
        for (i=this.primera_fila;i<this.primera_fila+this.num_filas;i++){
            context.font = "14px monospace"
            context.fillStyle = '#000000'
            context.fillText(""+i,10, mundo_alto-(10+a*30));
            a += 1
        }

        //Numeros de colummna
        a = 1
        for(i=this.primera_columna;i<this.primera_columna+this.num_columnas;i++){
            context.font = '14px monospace'
            context.fillStyle = '#000000'
            context.fillText(""+i,10+30*a, mundo_alto-10);
            a += 1
        }

        $('#mochila').val(world.bagBuzzers);

        //Pad de control
        context.fillStyle = '#305881'
        context.beginPath();
        context.moveTo(tamanio_mundo.x-70+35, 5)
        context.lineTo(tamanio_mundo.x-70+69, 5+55)
        context.lineTo(tamanio_mundo.x-70+35, 5+110)
        context.lineTo(tamanio_mundo.x-70+1, 5+55)
        context.closePath()
        context.fill()

        //Controles de movimiento
        context.fillStyle = '#60b151'
        context.beginPath();
        context.moveTo(mundo_ancho-40-10, 40)
        context.lineTo(mundo_ancho-10-10, 40)
        context.lineTo(mundo_ancho-25-10, 10)
        context.closePath()
        context.fill()

        context.beginPath();
        context.moveTo(mundo_ancho-40-10, 10+70) //Sur
        context.lineTo(mundo_ancho-10-10, 10+70)
        context.lineTo(mundo_ancho-25-10, 40+70)
        context.closePath()
        context.fill()

        context.beginPath();
        context.moveTo(mundo_ancho-25-8, 45) //Este
        context.lineTo(mundo_ancho-25+30-8, 45+15)
        context.lineTo(mundo_ancho-25-8, 45+30)
        context.closePath()
        context.fill()

        context.beginPath();
        context.moveTo(mundo_ancho-25-50+30+8, 45) //Oeste
        context.lineTo(mundo_ancho-25-50+8, 45+15)
        context.lineTo(mundo_ancho-25-50+30+8, 45+30)
        context.closePath()
        context.fill()

        if (this.polygon) {
            context.fillStyle = '#ff0000';
            var from_x = origen.x+(this.polygon_begin[1] - this.primera_columna)*30;
            var from_y = origen.y-(this.polygon_begin[0] - this.primera_fila)*30;
            var width = 4;
            var height = 4;
            //corner marker
            context.fillRect(from_x-2,from_y+26,6,6);

            if (this.polygon_end) {
                context.fillStyle = '#0000ff';
                if (this.polygon_begin[0] == this.polygon_end[0]) {
                    width = 30 * (this.polygon_end[1] - this.polygon_begin[1]);
                } else {
                    height = 30 * (this.polygon_begin[0] - this.polygon_end[0]);
                }
                context.fillRect(from_x-1,from_y+27,width,height);
            }
        }
    };

    this.polygonStart = function(fila, columna) {
        this.polygon = !((this.polygon_begin) &&
                        (this.polygon_begin[0] == fila) &&
                        (this.polygon_begin[1] == columna));
        if (this.polygon) {
            this.polygon_begin = [fila, columna];
        } else {
            this.polygon_begin = undefined;
        }
    };

    this.polygonUpdate = function(fila, columna) {
        //debe compartir alguna coordenada pero no las dos
        if (this.polygon_begin[0] == fila ^ this.polygon_begin[1] == columna) {
            this.polygon_end = [fila, columna];
        } else {
            this.polygon_end = undefined;
        }
    };

    this.polygonFinish = function(fila, columna) {
        this.polygonUpdate(fila, columna);

        if (this.polygon_end) {
            var result = {
                start_row: Math.min(this.polygon_begin[0],this.polygon_end[0]),
                finish_row: Math.max(this.polygon_begin[0],this.polygon_end[0]),
                start_column: Math.min(this.polygon_begin[1],this.polygon_end[1]),
                finish_column: Math.max(this.polygon_begin[1],this.polygon_end[1])
            };
            this.polygonClear();
            return result;
        } else {
            return null;
        }
    };

    this.polygonClear = function() {
        this.polygon_begin = this.polygon_end = undefined;
        this.polygon = false;
    }

    this.hoverCorner = function(fila, columna, mundo_ancho, mundo_alto) {
        var origen = {x:30, y:mundo_alto-60} //Coordenada para dibujar la primera casilla
        context.fillStyle = 'rgba(255,0,0,0.5)';
        context.fillRect(origen.x+(columna - this.primera_columna)*30 - 4,
                         origen.y-(fila - this.primera_fila)*30 + 24,
                         10,
                         10);
    };

    this.hoverWall = function(fila, columna, orientacion, mundo_ancho, mundo_alto) {
        var origen = {x:30, y:mundo_alto-60} //Coordenada para dibujar la primera casilla
        context.fillStyle = 'rgba(255,0,0,0.5)';
        if (orientacion == 0) { // oeste
            context.fillRect(origen.x+(columna - this.primera_columna)*30-2,
                             origen.y-(fila - this.primera_fila)*30+2,
                             6,
                             24);
        } else if (orientacion == 1) { // norte
            context.fillRect(origen.x+(columna - this.primera_columna)*30+4,
                             origen.y-(fila - this.primera_fila)*30-4,
                             24,
                             6);
        } else if (orientacion == 2) { // este
            context.fillRect(origen.x+(columna - this.primera_columna)*30-2+30,
                             origen.y-(fila - this.primera_fila)*30+2,
                             6,
                             24);
        } else if (orientacion = 3) { // sur
            context.fillRect(origen.x+(columna - this.primera_columna)*30+4,
                             origen.y-(fila - this.primera_fila)*30+26,
                             24,
                             6);
        }
    };

    this.hoverBuzzer = function(fila, columna, mundo_ancho, mundo_alto) {
        var origen = {x:30, y:mundo_alto-60} //Coordenada para dibujar la primera casilla
        context.fillStyle = 'rgba(255,0,0,0.5)';
        context.fillRect(origen.x+(columna - this.primera_columna)*30 + 4,
                         origen.y-(fila - this.primera_fila)*30 + 2,
                         this.tamano_celda - 6,
                         this.tamano_celda - 6);
    };

    this.moveSouth = function() {
        if (this.primera_fila > 1)  this.primera_fila -= 1
    };

    this.moveNorth = function() {
        if (this.primera_fila+this.num_filas-2 < 100)
            this.primera_fila += 1
    };

    this.moveWest = function() {
        if (this.primera_columna > 1)  this.primera_columna -= 1
    };

    this.moveEast = function() {
        if (this.primera_columna+this.num_columnas-2 < 100)
            this.primera_columna += 1
    };

    this.calculateCell = function(x,y) {

        x += this.margin;
        y += this.margin;

        var column = Math.floor(x/this.tamano_celda) + this.primera_columna-1;
        var row = Math.floor(y/this.tamano_celda) + this.primera_fila-1;

        var x_in_wall = Math.floor((x / this.margin) % 4 ) < 2;
        var y_in_wall = Math.floor((y / this.margin) % 4) < 2;
        var kind = Kind.Beeper;
        if (x_in_wall && y_in_wall) 
            kind = Kind.Corner;
        else if (x_in_wall)
            kind = Kind.WestWall;
        else if (y_in_wall)
            kind = Kind.SouthWall;

        return {row: row, column: column, kind: kind};
    };
}
