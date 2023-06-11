export class SelectItem {
    value: string;
    label: string;
    isSelected: boolean;

    constructor(value: string, label: string, isSelected: boolean) {
       this.value = value;
       this.label = label;
       this.isSelected = isSelected;
    }
 }