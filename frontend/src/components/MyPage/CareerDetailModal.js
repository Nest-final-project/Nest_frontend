import React from 'react';
import './CareerHistory.css';

const CareerDetailModal = ({ detail, onClose, onEdit, onDelete, onEditCertificates }) => {
  if (!detail) return null;
  return (
    <div className="career-detail-modal-backdrop" onClick={onClose}>
      <div className="career-detail-modal" onClick={e => e.stopPropagation()}>
        <h2>{detail.company}</h2>
        <p><b>기간:</b> {detail.startAt?.slice(0,10)} ~ {detail.endAt ? detail.endAt.slice(0,10) : '재직중'}</p>
        <p><b>상태:</b> {detail.careerStatus}</p>
        {detail.department && <p><b>부서:</b> {detail.department}</p>}
        {detail.description && <p><b>설명:</b> {detail.description}</p>}
        {detail.skills && detail.skills.length > 0 && (
          <div><b>기술:</b> {detail.skills.join(', ')}</div>
        )}
        {detail.certificates && detail.certificates.length > 0 && (
          <div>
            <b>자격증:</b>
            <ul>
              {detail.certificates.map(cert => (
                <li key={cert.id}>{cert.fileUrl}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="modal-actions">
            <button className="modal-edit-cert-btn" onClick={onEditCertificates}>자격증 수정</button>
            <button className="modal-edit-btn" onClick={onEdit}>수정</button>
            <button className="modal-delete-btn" onClick={onDelete}>삭제</button>
            <button className="modal-close-btn" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default CareerDetailModal; 