// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-select-filter',
//   templateUrl: './select-filter.component.html',
//   styleUrls: ['./select-filter.component.scss']
// })
// export class SelectFilterComponent {

// }

import { Component, EventEmitter, Input, OnInit, Output, ViewChild, forwardRef } from '@angular/core';
import { SelectFilterItem } from '../types';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { IonModal, ModalController } from '@ionic/angular';


@Component({
  selector: 'select-filter',
  templateUrl: './select-filter.component.html',
  styleUrls: ['./select-filter.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi:true,
      useExisting: SelectFilterComponent
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SelectFilterComponent),
      multi: true,
    },
  ]
})
export class SelectFilterComponent  implements OnInit,ControlValueAccessor,Validator  {
  @ViewChild('modalSelectFilter', { static: true }) modalSelectFilter!: IonModal;

  constructor() { }

  @Input() options: SelectFilterItem[] = [];
  @Input() selectedItems: SelectFilterItem[] = [];
  @Input() modalTitle = 'Seleccionar opción';
  @Input() nonSelectedValue : string = 'Ningún valor seleccionado';
  @Input() multiple: boolean = false;
  @Input() labelText : string = '';

  value : SelectFilterItem = { value : undefined, text : '' };
  values : SelectFilterItem[] = [];

  filteredItems: SelectFilterItem[] = [];
  private workingSelectedValues: SelectFilterItem[] = [];
  private workingSelectedValue : SelectFilterItem = { value : undefined, text : '' };
  singleValue : any;

  onChange = (selection : SelectFilterItem[] | SelectFilterItem | undefined) => {};
  onTouched = () => {};
  touched = false;
  disabled = false;


  ngOnInit() {
  }

  filterModalOpening($event: any){
    this.filteredItems = [...this.options];
    this.workingSelectedValues = [...this.selectedItems];
  }

  get selectedText() : string {
    if(this.multiple){
      if(!this.values.length)
        return this.nonSelectedValue;
      else if(this.values.length == 1)
        return this.values[0].text;
      else if(this.values.length > 1)
        return `${this.values.length} items`;
    }
    return `${(this.value.value? this.value.text:  this.nonSelectedValue)}`;
  }

  trackItems(index: number, item: SelectFilterItem) {
    return item.value;
  }

  async cancelChanges() {
    this.value = { value : undefined, text : '' };
    this.values = [];
    this.onChange(undefined);
    await this.modalSelectFilter.dismiss();
  }

  async confirmChanges() {
    if(this.multiple){
      this.values = this.workingSelectedValues;
      this.onChange(this.values.map(p => p.value));
    }
    else{
      this.value = this.workingSelectedValue;
      this.onChange(this.value.value);
    }

    await this.modalSelectFilter.dismiss();
  }

  searchbarInput(ev : any) {
    this.filterList(ev.target.value);
  }

  /**
   * Update the rendered view with
   * the provided search query. If no
   * query is provided, all data
   * will be rendered.
   */
  filterList(searchQuery: string | undefined) {
    /**
     * If no search query is defined,
     * return all options.
     */
    if (searchQuery === undefined) {
      this.filteredItems = [...this.options];
    } else {
      /**
       * Otherwise, normalize the search
       * query and check to see which items
       * contain the search query as a substring.
       */
      const normalizedQuery = searchQuery.toLowerCase();
      this.filteredItems = this.options.filter((options) => {
        return options.text.toLowerCase().includes(normalizedQuery);
      });
    }
  }

  isChecked(value: SelectFilterItem) {
    return this.workingSelectedValues.find((item) => item === value);
  }

  checkboxChange(ev : any) {
    const { checked, value } = ev.detail;

    if (checked) {
      this.workingSelectedValues = [...this.workingSelectedValues, this.options.find(p => p.value == value)!];
    } else {
      this.workingSelectedValues = this.workingSelectedValues.filter((item) => item.value !== value);
    }
  }

  selectSingleChanged(ev : any) {
    // console.log("ev",ev);
    // console.log("singleValue",this.singleValue);
    this.singleValue = ev.detail.value;
    this.workingSelectedValue = this.options.find(p => p.value == this.singleValue)!;
  }


  writeValue(obj: any[] | any): void {
    if(this.multiple){
      obj = [];
      this.values = this.options.filter(p => (obj as any[]).some(x => x == p.value));
    }
    else{
      if(!obj)
        this.value = { value : undefined, text : '' };
      else
        this.value = this.options.find(p => p.value == (obj as any))!;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  validate(control: AbstractControl<any, any>): ValidationErrors | null {
    const value =  control.value as SelectFilterItem[] | SelectFilterItem;
    if(!value){
      return {
        required: true
      }
    }
    else if (this.multiple && (value as SelectFilterItem[]).length <= 0) {
      return {
        required: true
      }
    }

    return null;
  }

  registerOnValidatorChange?(fn: () => void): void {
  }
}

