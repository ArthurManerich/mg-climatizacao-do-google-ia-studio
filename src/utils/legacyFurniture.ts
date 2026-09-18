/** Only explicit furniture assembly phrases identify legacy content.
 * Locations and HVAC parts alone are not evidence; no record IDs were established locally.
 */
export function isFurnitureText(text: string): boolean {
  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return /\b(?:montagem|desmontagem|montar|desmontar)\s+(?:(?:de|do|dos|da|das|um|uma)\s+)?(?:moveis|movel|guarda[ -]?roupas?|armarios?|estantes?|racks?|camas?|mesas?|sofas?|prateleiras?)\b/.test(normalized);
}
