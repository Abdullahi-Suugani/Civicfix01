export const STATUSES = [
  { value: "PENDING", label: "Pending", color: "#D64545", dot: "#D64545" },
  { value: "UNDER_REVIEW", label: "Under Review", color: "#E8A33D", dot: "#E8A33D" },
  { value: "IN_PROGRESS", label: "In Progress", color: "#2F6690", dot: "#2F6690" },
  { value: "RESOLVED", label: "Resolved", color: "#2F9E44", dot: "#2F9E44" },
  { value: "REJECTED", label: "Rejected", color: "#6B7686", dot: "#6B7686" },
];

// Map colors follow the brief exactly: red/yellow/green/gray.
export const MAP_MARKER_COLORS = {
  PENDING: "#D64545",
  UNDER_REVIEW: "#E8A33D",
  IN_PROGRESS: "#E8A33D",
  RESOLVED: "#2F9E44",
  REJECTED: "#8A8F98",
};

export const PRIORITIES = [
  { value: "LOW", label: "Low", color: "#6B7686" },
  { value: "MEDIUM", label: "Medium", color: "#2F6690" },
  { value: "HIGH", label: "High", color: "#E8A33D" },
  { value: "CRITICAL", label: "Critical", color: "#D64545" },
];

export function statusMeta(status) {
  return STATUSES.find((s) => s.value === status) || STATUSES[0];
}

export function priorityMeta(priority) {
  return PRIORITIES.find((p) => p.value === priority) || PRIORITIES[1];
}
