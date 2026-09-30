const DownloadModal = ({ isOpen, onClose, onDownload }) => {
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Download</h3>
        <p className="py-4">Are you sure you want to download this file?</p>
        <div className="modal-action">
          <button className="btn" onClick={onClose} disabled={isDownloading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? 'Downloading...' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
};

module.exports = { DownloadModal };
