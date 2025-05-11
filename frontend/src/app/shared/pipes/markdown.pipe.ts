import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): any {
    if (!value) return '';

    // Дуже проста реалізація Markdown
    const html = value
      // Заголовки
      .replace(/^### (.*$)/gim, '<h5>$1</h5>')
      .replace(/^## (.*$)/gim, '<h4>$1</h4>')
      .replace(/^# (.*$)/gim, '<h3>$1</h3>')
      // Жирний текст
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // Курсив
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Списки
      .replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>')
      .replace(/^\d\. (.*$)/gim, '<ol><li>$1</li></ol>')
      // Параграфи
      .replace(/\n\s*\n/g, '</p><p>')
      // Об'єднуємо списки
      .replace(/<\/ul>\s*<ul>/g, '')
      .replace(/<\/ol>\s*<ol>/g, '')
      // Обгортання у параграф
      .replace(/^(.+)$/gim, '<p>$1</p>');

    // Санітаризуємо HTML
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
