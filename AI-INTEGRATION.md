# Tích hợp Trợ lý AI với backend

Frontend gọi `POST /api/v1/ai/chat`. Axios tự gắn JWT từ khóa `token` trong `localStorage`.

## Quản lý conversationId

- Tin nhắn đầu tiên gửi `conversationId: null`.
- Frontend lấy ID thật từ `response.metadata.conversationId`.
- Các tin nhắn sau, kể cả `xác nhận` hoặc `không xác nhận`, phải gửi lại đúng ID này.
- Nội dung y tế và lịch sử chat chỉ nằm trong state của trang, không lưu vào `localStorage`.
- Nút **Cuộc trò chuyện mới** tạo một ID riêng để không dùng nhầm thao tác đang chờ của phiên cũ.

Ví dụ request đầu tiên:

```json
{
  "message": "Tôi bị đau bụng",
  "conversationId": null
}
```

Request tiếp theo:

```json
{
  "message": "xác nhận",
  "conversationId": "ID_NHAN_TU_METADATA"
}
```

## Các response được hiển thị

- `FIND_DOCTOR`: chuyên khoa, mức độ ưu tiên, danh sách bác sĩ và nút mở form đặt lịch.
- `CHECK_AVAILABILITY`: các khung giờ đã được đặt.
- `VIEW_APPOINTMENTS`, `BOOK_APPOINTMENT`, `CANCEL_APPOINTMENT`, `RESCHEDULE_APPOINTMENT`: thẻ lịch hẹn và luồng xác nhận.
- `VIEW_MEDICAL_RECORD`, `EXPLAIN_MEDICAL_RECORD`, `CHECK_REEXAMINATION`, `SUMMARIZE_PATIENT_HISTORY`: bệnh án và lịch tái khám.
- `VIEW_PRESCRIPTION`: danh sách thuốc, cách dùng và cảnh báo.
- Các intent trò chuyện/hỗ trợ khác: hiển thị nội dung trong bong bóng chat.

## Cấu hình URL backend

Sao chép `.env.example` thành `.env` nếu backend không chạy tại địa chỉ mặc định.
