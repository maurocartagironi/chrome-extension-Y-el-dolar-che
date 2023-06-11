export class Validator {
   hasError: boolean;
   label: string;
   value: string;

   private static instance: Validator;

   private constructor() {}

   public static getInstance(): Validator {
      if (!Validator.instance) {
         Validator.instance = new Validator();
      }

      return Validator.instance;
   }

   public validateInput(
      value: string,
      type: string,
      characterNumbers: number,
      maxLength: number
   ) {
      this.value = value;
      switch (type) {
         case "decimal":
            if (typeof value === "string") {
               if (value.length > maxLength) {
                  this.value = value.substring(0, maxLength);
               }
               this.label = `Solo números y decimales de hasta ${characterNumbers} caracteres.`;
               const regex = new RegExp(
                  new RegExp(`^(\\d{1,${characterNumbers}})(,\\d{1,2})?$`)
               );

               this.hasError = !regex.test(value) && value !== "";
            }
            break;
         case "string":
            if (typeof value === "string") {
               this.label = `El limite de caracteres es ${length}.`;
               this.hasError = value.length > length;
            }
            break;
      }
   }
}
