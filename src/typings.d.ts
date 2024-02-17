import './app/core/utils/prototypes';
/*

//SystemJS module definition 
declare const nodeModule: NodeModule;
interface NodeModule {
  id: string;
}
interface Window {
  process: any;
  require: any;
}
*/
interface Number{
  toFixedDown(digits:number): number ;
}