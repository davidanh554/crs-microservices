package vn.edu.crs.registrationservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.crs.registrationservice.entity.Registration;
import java.util.List;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    // Phương thức kiểm tra trùng môn học (đang bị thiếu khiến dòng 24 báo đỏ)
    boolean existsByStudentIdAndCourseIdAndTrangThai(Long studentId, Long courseId, String trangThai);

    // Phương thức lấy danh sách môn học của sinh viên
    List<Registration> findByStudentId(Long studentId);
}