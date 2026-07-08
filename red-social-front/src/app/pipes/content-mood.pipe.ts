import { Pipe, PipeTransform } from '@angular/core';

/*
  Pipe propia Sprint 4.

  Analiza el texto de una publicación o comentario
  y devuelve una lectura simple del tono del contenido.
*/
@Pipe({
  name: 'contentMood',
  standalone: true,
})
export class ContentMoodPipe implements PipeTransform {
  transform(text: string | null | undefined): string {
    if (!text || !text.trim()) {
      return '💬 Neutral';
    }

    const normalizedText = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const hasQuestion =
      normalizedText.includes('?') ||
      normalizedText.includes('alguien sabe') ||
      normalizedText.includes('como hago') ||
      normalizedText.includes('como se') ||
      normalizedText.includes('por que') ||
      normalizedText.includes('duda');

    if (hasQuestion) {
      return '❓ Consulta';
    }

    const debateWords = [
      'no estoy de acuerdo',
      'debate',
      'discusion',
      'controversial',
      'opino distinto',
      'polemico',
    ];

    if (debateWords.some((word) => normalizedText.includes(word))) {
      return '🔥 Debate';
    }

    const criticalWords = [
      'mal',
      'horrible',
      'pesimo',
      'odio',
      'fallo',
      'error',
      'problema',
      'no sirve',
      'critica',
    ];

    if (criticalWords.some((word) => normalizedText.includes(word))) {
      return '⚠️ Crítico';
    }

    const positiveWords = [
      'bien',
      'genial',
      'excelente',
      'perfecto',
      'me encanta',
      'buenisimo',
      'increible',
      'gracias',
      'feliz',
    ];

    if (positiveWords.some((word) => normalizedText.includes(word))) {
      return '❤️ Positivo';
    }

    return '💬 Neutral';
  }
}