let counter = 0;

export function generateId(): string {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  counter = (counter + 1) % 1000;
  const seq = counter.toString(36).padStart(2, '0');
  return `${time}${random}${seq}`;
}
