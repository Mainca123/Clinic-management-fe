const formatDate = (value) => {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
};

const formatTime = (value) => value ? String(value).slice(0, 5) : 'Chưa cập nhật';

const statusLabels = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Đã khám',
  CANCELLED: 'Đã hủy'
};

const urgencyLabels = {
  LOW: 'Theo dõi',
  MEDIUM: 'Nên khám sớm',
  HIGH: 'Cần ưu tiên',
  UNKNOWN: 'Chưa xác định'
};

const AppointmentCard = ({ appointment, onCommand, onViewAppointment }) => (
  <div className="ai-item-card">
    <div className="ai-item-heading">
      <strong>Lịch hẹn #{appointment.id}</strong>
      {appointment.status && (
        <span className={`ai-status ${String(appointment.status).toLowerCase()}`}>
          {statusLabels[appointment.status] || appointment.status}
        </span>
      )}
    </div>
    <div className="ai-detail-grid">
      <span>Bác sĩ</span><strong>{appointment.doctorName || 'Chưa cập nhật'}</strong>
      <span>Thời gian</span><strong>{formatDate(appointment.appointmentDate)} · {formatTime(appointment.startTime)}</strong>
      {appointment.symptoms && <><span>Lý do khám</span><strong>{appointment.symptoms}</strong></>}
    </div>
    <div className="ai-inline-actions">
      {onViewAppointment && (
        <button type="button" onClick={() => onViewAppointment(appointment.id)}>Xem chi tiết</button>
      )}
      {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
        <button type="button" className="danger" onClick={() => onCommand(`Hủy lịch hẹn mã ${appointment.id}`)}>
          Yêu cầu hủy
        </button>
      )}
    </div>
  </div>
);

const DoctorSuggestions = ({ payload, metadata, onSelectDoctor }) => (
  <div className="ai-payload-card doctor-recommendation">
    <div className="ai-payload-title-row">
      <div>
        <span className="ai-payload-eyebrow">Chuyên khoa phù hợp</span>
        <h4>{payload.department || 'Khoa đề xuất'}</h4>
      </div>
      <span className={`severity-badge ${String(payload.urgency || metadata?.urgency || 'unknown').toLowerCase()}`}>
        {urgencyLabels[payload.urgency || metadata?.urgency] || 'Chưa xác định'}
      </span>
    </div>
    {payload.advice && <p className="ai-payload-note">{payload.advice}</p>}
    {Array.isArray(payload.doctors) && payload.doctors.length > 0 ? (
      <div className="doctor-list">
        {payload.doctors.map((doctor) => (
          <div key={doctor.id} className="doctor-card">
            <div className="doctor-card-left">
              <div className="doctor-name">BS. {doctor.fullName}</div>
              <div className="doctor-meta">
                {doctor.specialization || 'Chuyên khoa đang cập nhật'}
                {doctor.experienceYears != null ? ` · ${doctor.experienceYears} năm kinh nghiệm` : ''}
              </div>
              <div className="doctor-dept">{doctor.departmentName || payload.department}</div>
            </div>
            <button type="button" className="doctor-contact" onClick={() => onSelectDoctor(doctor, payload)}>
              Chọn bác sĩ
            </button>
          </div>
        ))}
      </div>
    ) : <p className="ai-empty-text">Hiện chưa có bác sĩ phù hợp trong danh sách.</p>}
  </div>
);

const AvailabilityCard = ({ payload, onCommand }) => (
  <div className="ai-payload-card">
    <span className="ai-payload-eyebrow">Các giờ đã được đặt</span>
    <h4>{payload.doctorName || 'Bác sĩ'} · {formatDate(payload.date)}</h4>
    {Array.isArray(payload.bookedTimes) && payload.bookedTimes.length > 0 ? (
      <div className="ai-time-list">
        {payload.bookedTimes.map((time) => <span key={time}>{formatTime(time)}</span>)}
      </div>
    ) : <p className="ai-empty-text">Chưa có ca nào được đặt trong ngày này.</p>}
    {payload.note && <p className="ai-payload-note">{payload.note}</p>}
    {payload.doctorId && (
      <button type="button" className="ai-primary-action" onClick={() => onCommand(`Tôi muốn đặt lịch với bác sĩ mã ${payload.doctorId} ngày ${payload.date}`)}>
        Đặt lịch ngày này
      </button>
    )}
  </div>
);

const AppointmentPayload = ({ payload, metadata, onCommand, onViewAppointment }) => {
  const appointments = Array.isArray(payload.appointments)
    ? payload.appointments
    : payload.appointment ? [payload.appointment] : [];
  const needsConfirmation = metadata?.requiresConfirmation || payload.requiresConfirmation;

  return (
    <div className="ai-payload-card">
      <span className="ai-payload-eyebrow">Quản lý lịch hẹn</span>
      {appointments.length > 0 ? (
        <div className="ai-item-list">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCommand={onCommand}
              onViewAppointment={onViewAppointment}
            />
          ))}
        </div>
      ) : <p className="ai-empty-text">Không có lịch hẹn để hiển thị.</p>}
      {needsConfirmation && (
        <div className="ai-confirm-box">
          <div>
            <strong>Cần bạn xác nhận</strong>
            {payload.confirmationExpiresAt && <small>Hiệu lực đến {new Date(payload.confirmationExpiresAt).toLocaleTimeString('vi-VN')}</small>}
          </div>
          <div className="ai-inline-actions">
            <button type="button" className="confirm" onClick={() => onCommand('xác nhận')}>Xác nhận</button>
            <button type="button" onClick={() => onCommand('không xác nhận')}>Từ chối</button>
          </div>
        </div>
      )}
    </div>
  );
};

const MedicalRecords = ({ payload, onViewMedicalRecord }) => (
  <div className="ai-payload-card">
    <span className="ai-payload-eyebrow">Hồ sơ sức khỏe</span>
    {payload.summary && <p className="ai-payload-note">{payload.summary}</p>}
    {payload.reexaminationDate && (
      <div className="ai-reexam">Lịch tái khám: <strong>{formatDate(payload.reexaminationDate)}</strong></div>
    )}
    {Array.isArray(payload.records) && payload.records.length > 0 ? (
      <div className="ai-item-list">
        {payload.records.map((record) => (
          <div key={record.id} className="ai-item-card">
            <div className="ai-item-heading"><strong>Bệnh án #{record.id}</strong><span>{formatDate(record.createdAt)}</span></div>
            <p><strong>Chẩn đoán:</strong> {record.diagnosis || 'Chưa cập nhật'}</p>
            <p><strong>Điều trị:</strong> {record.treatmentPlan || 'Chưa cập nhật'}</p>
            {onViewMedicalRecord && (
              <button type="button" className="ai-link-action" onClick={() => onViewMedicalRecord(record.id)}>Xem bệnh án</button>
            )}
          </div>
        ))}
      </div>
    ) : !payload.summary && <p className="ai-empty-text">Chưa có bệnh án để hiển thị.</p>}
  </div>
);

const Medicines = ({ payload }) => (
  <div className="ai-payload-card">
    <span className="ai-payload-eyebrow">Đơn thuốc bệnh án #{payload.medicalRecordId}</span>
    {payload.explanation && <p className="ai-payload-note">{payload.explanation}</p>}
    {Array.isArray(payload.medicines) && payload.medicines.length > 0 ? (
      <div className="ai-item-list">
        {payload.medicines.map((medicine) => (
          <div key={medicine.id || `${medicine.medicineId}-${medicine.medicineName}`} className="ai-item-card medicine">
            <strong>{medicine.medicineName}</strong>
            <span>{medicine.quantity} {medicine.unit || ''} · {medicine.dosage || 'Chưa có hướng dẫn dùng'}</span>
          </div>
        ))}
      </div>
    ) : <p className="ai-empty-text">Bệnh án này chưa có đơn thuốc.</p>}
    {payload.warning && <div className="ai-warning">Lưu ý: {payload.warning}</div>}
  </div>
);

const AiResponseContent = ({ message, onCommand, onSelectDoctor, onViewAppointment, onViewMedicalRecord }) => {
  const { text, payload, tool, metadata, success } = message;
  const isDoctor = tool === 'FIND_DOCTOR' || Array.isArray(payload?.doctors);
  const isAvailability = tool === 'CHECK_AVAILABILITY' || Array.isArray(payload?.bookedTimes);
  const isAppointment = Boolean(payload && (
    payload.appointment || Array.isArray(payload.appointments) || payload.requiresConfirmation !== undefined
  ));
  const isMedicalRecord = Boolean(payload && (Array.isArray(payload.records) || payload.summary || payload.reexaminationDate));
  const isMedicine = Boolean(payload && Array.isArray(payload.medicines));

  return (
    <div className="ai-response-stack">
      <div className={`ai-chat-bubble ${success === false ? 'error' : ''}`}>{text}</div>
      {isDoctor && <DoctorSuggestions payload={payload} metadata={metadata} onSelectDoctor={onSelectDoctor} />}
      {!isDoctor && isAvailability && <AvailabilityCard payload={payload} onCommand={onCommand} />}
      {!isDoctor && !isAvailability && isAppointment && (
        <AppointmentPayload payload={payload} metadata={metadata} onCommand={onCommand} onViewAppointment={onViewAppointment} />
      )}
      {!isDoctor && !isAvailability && !isAppointment && isMedicine && <Medicines payload={payload} />}
      {!isDoctor && !isAvailability && !isAppointment && !isMedicine && isMedicalRecord && (
        <MedicalRecords payload={payload} onViewMedicalRecord={onViewMedicalRecord} />
      )}
    </div>
  );
};

export default AiResponseContent;
