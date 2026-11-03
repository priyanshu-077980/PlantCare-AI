/**
 * Exports prediction history to CSV or JSON format
 */

export function exportHistoryToJSON(history) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `plantcare_ai_history_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportHistoryToCSV(history) {
  if (!history || !history.length) return;

  const headers = ["ID", "Timestamp", "Plant", "Disease Condition", "Confidence (%)", "Status", "Raw Class"];
  const rows = history.map(item => [
    item.id,
    item.timestamp,
    `"${item.plant || ''}"`,
    `"${item.condition || ''}"`,
    item.confidence,
    item.isHealthy ? "Healthy" : "Diseased",
    `"${item.predicted_class || ''}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n');

  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", encodeURI(csvContent));
  downloadAnchor.setAttribute("download", `plantcare_ai_history_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

