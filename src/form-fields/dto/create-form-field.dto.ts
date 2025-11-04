export class CreateFormFieldDto {
  formId: number;
  name: string;
  type: string;
  required: boolean;
  order: number;
  active: boolean;
}
