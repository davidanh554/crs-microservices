package vn.edu.crs.course_service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import vn.edu.crs.course_service.entity.Course;
import vn.edu.crs.course_service.repository.CourseRepository;

@SpringBootApplication
public class CourseServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CourseServiceApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(CourseRepository courseRepository) {
		return args -> {
			if (courseRepository.count() == 0) {
				Course c1 = new Course();
				c1.setTenMonHoc("Lap trinh Java co ban");
				c1.setSoTinChi(3);
				c1.setSoChoToiDa(40);
				c1.setSoChoConLai(40);
				courseRepository.save(c1);

				Course c2 = new Course();
				c2.setTenMonHoc("Co so du lieu");
				c2.setSoTinChi(4);
				c2.setSoChoToiDa(35);
				c2.setSoChoConLai(35);
				courseRepository.save(c2);
			}
		};
	}

}
