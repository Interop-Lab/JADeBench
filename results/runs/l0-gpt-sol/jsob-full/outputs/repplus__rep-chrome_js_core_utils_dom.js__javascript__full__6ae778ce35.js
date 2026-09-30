function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML;
}

function escapeCsvField(value) {
  if (value == null) {
    return '';
  }

  const stringValue = String(value);

  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function arrayToCSV(data, headers) {
  if (!data || data.length === 0) {
    return headers ? headers.join(',') : '';
  }

  const columns = headers || Object.keys(data[0]);
  const rows = [columns.map(escapeCsvField).join(',')];

  data.forEach((row) => {
    rows.push(
      columns
        .map((column) => escapeCsvField(row[column]))
        .join(',')
    );
  });

  return rows.join('\n');
}

function downloadCSV(data, filename, headers = null) {
  const csv = arrayToCSV(data, headers);
  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], {
    type: 'application/json;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function copyToClipboard(text, button) {
  const isHttp = window.location.protocol == 'http:';

  if (!isHttp) {
    try {
      await navigator.clipboard.writeText(text);

      if (button) {
        showCopySuccess(button);
      }

      return;
    } catch (error) {
      if (
        !error.message?.includes('Document is not focused') &&
        !error.message?.includes('permissions')
      ) {
        console.error('Clipboard API failed:', error);
      }
    }
  }

  try {
    const textarea = document.createElement('textarea');

    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '0';
    textarea.style.top = '0';
    textarea.style.fontSize = '16px';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    if (/ipad|iphone/i.test(navigator.userAgent)) {
      const range = document.createRange();
      range.selectNodeContents(textarea);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      textarea.setSelectionRange(0, 999999);
    }

    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (copied) {
      if (button) {
        showCopySuccess(button);
      }
    } else {
      throw new Error('Copy command failed');
    }
  } catch (error) {
    console.error('Fallback copy failed:', error);

    if (button) {
      const originalContent = button.innerHTML;

      button.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>';

      setTimeout(() => {
        if (button) {
          button.innerHTML = originalContent;
        }
      }, 1500);
    }
  }
}

function showCopySuccess(button) {
  if (!button) {
    return;
  }

  const originalContent = button.innerHTML;

  button.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>';

  setTimeout(() => {
    if (button) {
      button.innerHTML = originalContent;
    }
  }, 1500);
}

export {
  arrayToCSV,
  copyToClipboard,
  downloadCSV,
  downloadJSON,
  escapeHtml
};
