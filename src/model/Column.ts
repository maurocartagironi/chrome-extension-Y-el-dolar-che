export class Column {
    id: string;
    label: string;
    datatype: string;
    format: string;

    constructor(id: string, label: string, datatype: string, format: string) {
       this.id = id;
       this.label = label;
       this.datatype = datatype;
       this.format = format;
    }
 }