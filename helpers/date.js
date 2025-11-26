export function toLocalDayRange(dateStr) {
  const date = new Date(dateStr); // "YYYY-MM-DD"

  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0
  );

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export function todayLocalRange() {
  const now = new Date();

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}
