export class Helper{

    /**
     * Calcula la varianza de un array de valores
     * @param lista valores
     * @returns varianza
     */
    public static varianza(lista : Array<number>) : number
    {
        let mu : number = Helper.media(lista);
        let acumulador : number = 0;
        for (let item of lista){
            acumulador += Math.pow(item - mu,2);
        }
        return acumulador / lista.length;
    }

    /**
     * Calcula la media de un array de valores
     * @param lista valores
     * @returns media
     */
    public static media(lista : Array<number>) : number{
        let sum = lista.reduce((a,b)=> a+b,0);
        return sum / lista.length;
    }

    /**
     * Calcula la desviación estándar de un array de valores
     * @param lista valores
     * @returns desviación
     */
    public static desviacion(lista : Array<number>) : number
    {
        return Math.sqrt(this.varianza(lista));
    }

    /**
     * Permite redondear un número por múltiplos.
     * - Ejemplo: si desea obtener solo números que sean múltiplos de 2 (step),
     * y el número (valor) es 1457, el resultado será 1456.
     * @param valor Número que se redondeará.
     * @param step Múltiplo al que se desea redondear.
     * @returns Devuelve resultado en Kilogramos
     */
    public static valorPrecision(valor : number,step : number) : number 
    {
        let result : number = 0;
        let num = valor.toString();       
        let lastNumber : number = parseInt(num.substring(num.length - 1));
        
        if((lastNumber >= 0 && lastNumber <= 2) ||
                (lastNumber >= 5 && lastNumber <= 7)) //Para redondear a valor menor al cercano
        {          
            let val = step*(Math.floor(Math.abs(valor/step)));
            
            result = val /1000;
        }
        else //Para redondear a valor siguiente al cercanos
        {
            let val = step*(Math.ceil(Math.abs(valor/step)));
            
            result = val / 1000;
        }

        return result;
    }

    /**
     * - Calcula el valor máximo de la diferencia absoluta entre elementos adyacentes en la lista.
     * - Su utilidad radica en detectar cambios bruscos en el peso.
     * @param lista 
     * @returns resultado
     */
    public static maxima_diferencia(lista : Array<number>) : number{
        let t = new Array<number>();
        
        for(let i = lista.length - 1; i > 0; i--){
            let s = Math.abs((lista[i] - lista[i -1]));
            if(s > 0)
                t.push(s);
        }
        
        return t.reduce((a,b)=> a < b ? b : a,0);
    }

    /**
     * Calcula el valor máximo de un array
     * @param lista 
     * @returns resultado
     */
    public static max(lista : Array<number>) : number{
        let t = new Array<number>();
        
        for(let i = lista.length - 1; i > 0; i--){
            t.push(lista[i]);
        }

        return t.reduce((a,b)=> a < b ? b : a,0);
    }
    
    /**
     * Calcula el valor mínimo de un array
     * @param lista 
     * @returns resultado
     */
    public static min(lista : Array<number>) : number{
        let t = new Array<number>();
        
        for(let i = lista.length - 1; i > 0; i--){
            t.push(lista[i]);
        }

        return t.reduce((a,b)=> a > b ? b : a,0);
    }
}