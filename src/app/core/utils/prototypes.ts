interface Number{
    toFixedDown(digits:number): number ;
}

// Esta función extiende el prototipo de la clase Number para agregar un nuevo método llamado toFixedDown.
// El método toFixedDown permite redondear un número a un número específico de decimales hacia abajo.
// Recibe como parámetro el número de decimales a los que se desea redondear.
// Utiliza una expresión regular para buscar el número decimal en la representación en cadena del número.
// Si encuentra un número decimal, lo redondea hacia abajo utilizando la función parseFloat.
// Si no encuentra un número decimal, devuelve el valor original del número.
// Devuelve el número redondeado hacia abajo.
Number.prototype.toFixedDown = function(digits:number) : number {
    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = this.toString().match(re);
    return m ? parseFloat(m[1]) : this.valueOf();
};