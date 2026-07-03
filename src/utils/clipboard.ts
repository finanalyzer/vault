export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  } catch {
    return false;
  }
}

export async function copyToClipboardWithTimeout(text: string, timeout: number = 1000): Promise<boolean> {
  const success = await copyToClipboard(text);
  if (success && timeout > 0) {
    await new Promise(resolve => setTimeout(resolve, timeout));
  }
  return success;
}