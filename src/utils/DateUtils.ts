export const parseDate = (input: string): Date => {
  try {
    const [datePart, timePart] = input.split(',').map(part => part.trim());
    const [month, day, year] = datePart.split('/').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
  } catch {
    return new Date(0);
  }
};

export const formatOnlyDate = (input: string): string => {
  try {
    const [datePart] = input.split(',');
    const [day, month, year] = datePart.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return `${String(date.getDate()).padStart(2, '0')} ${date.toLocaleString('en-US', {
      month: 'long',
    })} ${date.getFullYear()}`;
  } catch {
    return 'Invalid Date';
  }
};

export const formatOnlyTime = (input: string): string => {
  try {
    const date = parseDate(input);
    return date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return 'Invalid Time';
  }
};

export const getTimestamp = (): string => new Date().toLocaleString('en-IN');