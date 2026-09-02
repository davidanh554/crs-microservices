// path: crs-frontend/src/components/CourseList.tsx
// purpose: bo sung prop onRegister (tuy chon) - trang Dang ky hoc phan se dung prop nay,
// cac trang khac (CoursesPage, AdminCoursesPage) khong truyen vao nen khong bi anh huong
import type { Course } from '../types/course';
import type { LoadState } from '../api/useCourses';

interface CourseListProps {
  courses: Course[];
  state: LoadState;
  errorMessage: string;
  onRetry: () => void;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onRegister?: (course: Course) => void;
  registeringId?: number | null; // id mon dang trong qua trinh goi API dang ky, de disable rieng nut do
}

export default function CourseList({
  courses,
  state,
  errorMessage,
  onRetry,
  onEdit,
  onDelete,
  onRegister,
  registeringId,
}: CourseListProps) {
  if (state === 'loading') {
    return <p>Đang tải danh sách môn học...</p>;
  }

  if (state === 'error') {
    return (
      <div>
        <p style={{ color: 'red' }}>{errorMessage}</p>
        <button onClick={onRetry}>Thử lại</button>
      </div>
    );
  }

  if (state === 'empty') {
    return <p>Không tìm thấy môn học nào phù hợp.</p>;
  }

  const showActions = !!onEdit || !!onDelete || !!onRegister;

  return (
    <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
      <thead>
        <tr>
          <th>Tên môn học</th>
          <th>Số tín chỉ</th>
          <th>Số chỗ còn lại</th>
          {showActions && <th>Thao tác</th>}
        </tr>
      </thead>
      <tbody>
        {courses.map((course) => (
          <tr key={course.id}>
            <td>{course.tenMonHoc}</td>
            <td>{course.soTinChi}</td>
            <td>
              {course.soChoConLai} / {course.soChoToiDa}
            </td>
            {showActions && (
              <td>
                {onEdit && (
                  <button onClick={() => onEdit(course)}>Sửa</button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(course)}
                    style={{ marginLeft: 8, color: '#b91c1c' }}
                  >
                    Xóa
                  </button>
                )}
                {onRegister && (
                  <button
                    onClick={() => onRegister(course)}
                    disabled={course.soChoConLai === 0 || registeringId === course.id}
                    style={{ marginLeft: 8 }}
                  >
                    {registeringId === course.id
                      ? 'Đang đăng ký...'
                      : course.soChoConLai === 0
                      ? 'Hết chỗ'
                      : 'Đăng ký'}
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}