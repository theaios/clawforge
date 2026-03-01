export function formatOpError(error, fallback = 'OpenClaw request failed') {
  if (!error) return fallback;
  const parts = [error.debugCode || 'UNKNOWN'];
  if (error.status) parts.push(`HTTP ${error.status}`);
  if (error.requestId) parts.push(`requestId ${error.requestId}`);
  return `${error.userMessage || fallback} (${parts.join(' · ')})`;
}

export function formatOpSuccess(actionLabel, resp) {
  const requestId = resp?.data?.requestId || resp?.meta?.requestId || null;
  const source = resp?.meta?.source || null;
  const fallbackReason = resp?.meta?.fallbackReason || null;
  const details = [
    requestId ? `requestId ${requestId}` : null,
    source && source !== 'live' ? source : null,
    fallbackReason ? `live failed ${fallbackReason}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  return details ? `${actionLabel} · ${details}` : actionLabel;
}

export function describeConnection(store) {
  const conn = store?.ui?.openclaw || {};
  const lastError = store?.ui?.lastError || null;
  const lastSuccess = store?.ui?.lastSuccess || null;
  return {
    connected: !!conn.connected,
    requestId: conn.lastRequestId || lastSuccess?.requestId || lastError?.requestId || null,
    lastError,
    lastSuccess,
  };
}
