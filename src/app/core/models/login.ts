export interface Login{
  operador : number;
  supervisor : number;
  fechahora : moment.Moment;
  id_op: number;
  document_op: string;
  fullname_op: string;
  id_sup: number;
  document_sup: string;
  fullname_sup: string;
  code_sup: string;
  is_deleted_sup: boolean;
  type_sup: number;
}
