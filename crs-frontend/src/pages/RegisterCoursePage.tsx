// path: crs-frontend/src/pages/RegisterCoursePage.tsx
// purpose: trang Dang ky hoc phan hoan chinh - thay the khung trang tam cua Buoi 8
import { useState, useCallback } from 'react';
import axios from 'axios';
import { useCourses } from '../api/useCourses';
import { registerCourse } from '../api/registrationApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import SearchBox from '../components/SearchBox';
import CourseList from '../components/CourseList';
import Pagination from '../components/Pagination';
import Toast from '../components/Toast';
import type { Course } from '../types/course';

export default function RegisterCoursePage() {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [registeringId, setRegisteringId] = useState<number | null>(null);

  const { user } = useAuth();
  const { toast, showToast, clearToast } = useToast();
  const { courses, totalPages, state, errorMessage, refetch } = useCourses(keyword, page);

const handleSearch = useCallback((newKeyword: string) => {
    setKeyword((prevKeyword) => {
      // Chỉ reset về trang 0 nếu từ khóa tìm kiếm thực sự khác từ khóa cũ
      if (prevKeyword !== newKeyword) {
        setPage(0);
      }
      return newKeyword;
    });
  }, []);

  const handleRegister = async (course: Course) => {
    if (!user) return;
    setRegisteringId(course.id);
    try {
      await registerCourse({ studentId: user.id, courseId: course.id });
      showToast(`Đăng ký thành công môn "${course.tenMonHoc}"`, 'success');
      refetch(); // Tải lại danh sách để cập nhật số chỗ còn lại mới nhất
    } catch (err) {
      // Đọc trực tiếp trường message trả về qua Gateway
      let message = 'Đăng ký không thành công, vui lòng thử lại.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      showToast(message, 'error');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <h2>Đăng ký học phần</h2>
      <SearchBox onSearch={handleSearch} />
      <CourseList
        courses={courses}
        state={state}
        errorMessage={errorMessage}
        onRetry={refetch}
        onRegister={handleRegister}
        registeringId={registeringId}
      />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  );
}