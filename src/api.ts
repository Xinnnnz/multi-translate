export const API_BASE =
  typeof window !== 'undefined' && window.location.hostname.includes('github.io')
    ? 'https://ais-dev-blakmiz2hf5vs6d3mn6zeg-852929442322.europe-west2.run.app'
    : '';

export async function safeFetchJson<T>(url: string, options: RequestInit): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  
  const response = await fetch(fullUrl, options);
  const contentType = response.headers.get('content-type') || '';
  
  let parsedData: any = null;
  let rawText = '';

  if (contentType.includes('application/json')) {
    parsedData = await response.json();
  } else {
    rawText = await response.text();
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      if (rawText.toLowerCase().includes('<!doctype') || rawText.toLowerCase().includes('<html')) {
        throw new Error(
          'The translation service returned an HTML status page. The backend server might be resuming. Please click Retry.'
        );
      }
      throw new Error(rawText || `Server request failed with status ${response.status}`);
    }
  }

  if (!response.ok) {
    throw new Error(parsedData?.error || `Request failed (${response.status})`);
  }

  return parsedData as T;
}
