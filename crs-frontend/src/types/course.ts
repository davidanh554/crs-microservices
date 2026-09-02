export interface Course {
  id: number;
  tenMonHoc: string;
  soTinChi: number;
  soChoToiDa: number;
  soChoConLai: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
export interface CourseFormValues {
  tenMonHoc: string;
  soTinChi: string; // dùng string trong form để dễ kiểm soát input rỗng, sẽ parseInt/Number khi gửi đi
  soChoToiDa: string;
}

export const emptyCourseForm: CourseFormValues = {
  tenMonHoc: '',
  soTinChi: '',
  soChoToiDa: '',
};