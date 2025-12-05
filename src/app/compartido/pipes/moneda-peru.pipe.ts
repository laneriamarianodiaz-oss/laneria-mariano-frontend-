import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'monedaPeru' })
export class MonedaPeruPipe implements PipeTransform {
  transform(value: number): string { return `s/ ${value?.toFixed(2)}`; }
}
