import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  WhatsappShareButton,
  TwitterShareButton,
  EmailShareButton,
  WhatsappIcon,
  TwitterIcon,
  EmailIcon
} from 'react-share';
import { FaTimes, FaCopy, FaCheck, FaDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ShareModal = ({ isOpen, onClose, roomId, roomName }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/room/${roomId}`;
  const shareTitle = `Join my study room: ${roomName}`;
  const shareMessage = `Hey! Join me in "${roomName}" on EduCircle. Let's study together! ${shareUrl}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `${roomName}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success('QR code downloaded!');
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fadeIn" onClick={onClose}>
      <div className="modal animate-slideUp" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Share "{roomName}"</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {/* QR Code */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
            <div style={{ 
              display: 'inline-block', 
              padding: 'var(--spacing-lg)', 
              background: 'white',
              borderRadius: 'var(--radius-md)'
            }}>
              <QRCodeSVG 
                id="qr-code-svg"
                value={shareUrl} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-muted" style={{ marginTop: 'var(--spacing-sm)' }}>
              Scan to join the room
            </p>
          </div>

          {/* Share Link */}
          <div className="input-group">
            <label className="input-label">Room Link</label>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <input
                type="text"
                className="input"
                value={shareUrl}
                readOnly
                style={{ flex: 1 }}
              />
              <button
                onClick={copyToClipboard}
                className="btn btn-primary"
                style={{ minWidth: '100px' }}
              >
                {copied ? (
                  <>
                    <FaCheck /> Copied
                  </>
                ) : (
                  <>
                    <FaCopy /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Download QR */}
          <button
            onClick={downloadQRCode}
            className="btn btn-secondary"
            style={{ width: '100%', marginBottom: 'var(--spacing-lg)' }}
          >
            <FaDownload />
            Download QR Code
          </button>

          {/* Social Sharing */}
          <div>
            <label className="input-label">Share via</label>
            <div style={{ 
              display: 'flex', 
              gap: 'var(--spacing-md)', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <WhatsappShareButton url={shareUrl} title={shareMessage}>
                <div style={{ textAlign: 'center' }}>
                  <WhatsappIcon size={48} round />
                  <p className="text-sm" style={{ marginTop: '0.25rem' }}>WhatsApp</p>
                </div>
              </WhatsappShareButton>

              <TwitterShareButton url={shareUrl} title={shareTitle}>
                <div style={{ textAlign: 'center' }}>
                  <TwitterIcon size={48} round />
                  <p className="text-sm" style={{ marginTop: '0.25rem' }}>Twitter</p>
                </div>
              </TwitterShareButton>

              <EmailShareButton 
                url={shareUrl} 
                subject={shareTitle}
                body={shareMessage}
              >
                <div style={{ textAlign: 'center' }}>
                  <EmailIcon size={48} round />
                  <p className="text-sm" style={{ marginTop: '0.25rem' }}>Email</p>
                </div>
              </EmailShareButton>
            </div>
          </div>

          {/* Embed Code (Optional) */}
          <div className="input-group" style={{ marginTop: 'var(--spacing-lg)' }}>
            <label className="input-label">Embed Code (for websites)</label>
            <textarea
              className="input"
              value={`<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`}
              readOnly
              rows={3}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-ghost">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
