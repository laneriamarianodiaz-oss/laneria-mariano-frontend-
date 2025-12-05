import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncar' })
export class TruncarPipe implements PipeTransform {
  transform(value: string, length = 100): string { return value?.length > length ? value.slice(0,length) + '...' : value; }
}
