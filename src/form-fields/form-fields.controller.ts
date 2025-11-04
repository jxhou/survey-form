import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FormFieldsService } from './form-fields.service';
import { CreateFormFieldDto } from './dto/create-form-field.dto';
import { UpdateFormFieldDto } from './dto/update-form-field.dto';

@Controller('form-fields')
export class FormFieldsController {
  constructor(private readonly formFieldsService: FormFieldsService) {}

  @Post()
  create(@Body() createFormFieldDto: CreateFormFieldDto) {
    return this.formFieldsService.create(createFormFieldDto);
  }

  @Get()
  findAll(@Query() query: { name?: string; state?: number }){
    return this.formFieldsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formFieldsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFormFieldDto: UpdateFormFieldDto) {
    return this.formFieldsService.update(+id, updateFormFieldDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formFieldsService.remove(+id);
  }
}
