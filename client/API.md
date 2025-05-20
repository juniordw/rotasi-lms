# Rotasi LMS API Documentation

This document provides comprehensive information about the Rotasi LMS (Learning Management System) API endpoints, including request/response structures and authentication requirements.

## Base Information

- **Base URL**: `/api`
- **Auth Header Format**: `Authorization: Bearer {token}`

## Authentication

Authentication uses JWT with:
- Access tokens expire in 15 minutes
- Refresh tokens expire in 30 days

### Auth APIs

#### Register a new user
- **URL**: `POST /api/auth/register`
- **Access**: Public
- **Rate Limit**: 3 requests per 60 minutes
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "full_name": "John Doe",
    "department": "Engineering"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Registrasi berhasil",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "student",
      "department": "Engineering"
    },
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "c7d89a23b5..."
  }
  ```

#### Login
- **URL**: `POST /api/auth/login`
- **Access**: Public
- **Rate Limit**: 5 requests per 15 minutes
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login berhasil",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "student",
      "department": "Engineering"
    },
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "c7d89a23b5..."
  }
  ```

#### Refresh Token
- **URL**: `POST /api/auth/refresh-token`
- **Access**: Public (with refresh token)
- **Request Body**:
  ```json
  {
    "refreshToken": "c7d89a23b5..."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOiJIUzI1..."
  }
  ```

#### Logout
- **URL**: `POST /api/auth/logout`
- **Access**: Private
- **Request Body**:
  ```json
  {
    "refreshToken": "c7d89a23b5..."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Berhasil logout"
  }
  ```

#### Get Current User
- **URL**: `GET /api/auth/me`
- **Access**: Private
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "student",
      "department": "Engineering",
      "avatar_url": "/uploads/avatars/avatar-123.jpg",
      "created_at": "2023-01-01T00:00:00.000Z"
    },
    "enrolledCourses": [...],
    "notifications": [...]
  }
  ```

#### Change Password
- **URL**: `PUT /api/auth/change-password`
- **Access**: Private
- **Request Body**:
  ```json
  {
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Password berhasil diubah, silakan login kembali"
  }
  ```

## Category APIs

#### Get All Categories
- **URL**: `GET /api/categories`
- **Access**: Public
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Web Development",
        "description": "Courses about web development",
        "parent_category_id": null
      },
      ...
    ]
  }
  ```

#### Get Category by ID
- **URL**: `GET /api/categories/:id`
- **Access**: Public
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Web Development",
      "description": "Courses about web development",
      "parent_category_id": null
    }
  }
  ```

#### Create Category
- **URL**: `POST /api/categories`
- **Access**: Private (Admin only)
- **Request Body**:
  ```json
  {
    "name": "Mobile Development",
    "description": "Courses about mobile app development",
    "parent_category_id": null
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Kategori berhasil dibuat",
    "data": {
      "id": 2,
      "name": "Mobile Development",
      "description": "Courses about mobile app development",
      "parent_category_id": null
    }
  }
  ```

#### Update Category
- **URL**: `PUT /api/categories/:id`
- **Access**: Private (Admin only)
- **Request Body**:
  ```json
  {
    "name": "Mobile App Development",
    "description": "Updated description"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Kategori berhasil diupdate",
    "data": {
      "id": 2,
      "name": "Mobile App Development",
      "description": "Updated description",
      "parent_category_id": null
    }
  }
  ```

#### Delete Category
- **URL**: `DELETE /api/categories/:id`
- **Access**: Private (Admin only)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Kategori berhasil dihapus"
  }
  ```

## Course APIs

#### Get Published Courses
- **URL**: `GET /api/courses`
- **Access**: Public
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Search term
  - `category`: Filter by category ID
  - `sortBy`: Field to sort by (default: created_at)
  - `sortOrder`: Sort direction (ASC or DESC, default: DESC)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "courses": [
        {
          "id": 1,
          "title": "Introduction to JavaScript",
          "description": "Learn JavaScript basics",
          "thumbnail_url": "/uploads/courses/thumbnails/js-course.jpg",
          "instructor": {
            "id": 2,
            "full_name": "Jane Smith",
            "avatar_url": "/uploads/avatars/jane.jpg"
          },
          "category": {
            "id": 1,
            "name": "Web Development"
          }
        },
        ...
      ],
      "pagination": {
        "totalCourses": 25,
        "totalPages": 3,
        "currentPage": 1,
        "limit": 10
      }
    }
  }
  ```

#### Get All Courses (including drafts)
- **URL**: `GET /api/courses/all`
- **Access**: Private (Admin, Instructor)
- **Query Parameters**: Same as above, plus:
  - `status`: Filter by status (draft, published, archived)
- **Response**: Similar to Get Published Courses

#### Get Instructor Courses
- **URL**: `GET /api/courses/my-courses`
- **Access**: Private (Instructor)
- **Query Parameters**: Similar to above
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "courses": [
        {
          "id": 1,
          "title": "Introduction to JavaScript",
          "description": "Learn JavaScript basics",
          "thumbnail_url": "/uploads/courses/thumbnails/js-course.jpg",
          "status": "published",
          "category": {
            "id": 1,
            "name": "Web Development"
          },
          "enrollmentCount": 45,
          "completionRate": 78
        },
        ...
      ],
      "pagination": {
        "totalCourses": 5,
        "totalPages": 1,
        "currentPage": 1,
        "limit": 10
      }
    }
  }
  ```

#### Get Enrolled Courses
- **URL**: `GET /api/courses/enrolled`
- **Access**: Private
- **Query Parameters**:
  - Standard pagination params
  - `status`: Filter by completion status (not_started, in_progress, completed)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "enrollments": [
        {
          "id": 1,
          "enrollment_date": "2023-02-01T00:00:00.000Z",
          "completion_status": "in_progress",
          "course": {
            "id": 1,
            "title": "Introduction to JavaScript",
            "thumbnail_url": "/uploads/courses/thumbnails/js-course.jpg",
            "instructor": {
              "id": 2,
              "full_name": "Jane Smith"
            },
            "category": {
              "id": 1,
              "name": "Web Development"
            }
          },
          "progress": {
            "totalLessons": 12,
            "completedLessons": 5,
            "progressPercentage": 42
          }
        },
        ...
      ],
      "pagination": {
        "totalEnrollments": 8,
        "totalPages": 1,
        "currentPage": 1,
        "limit": 10
      }
    }
  }
  ```

#### Get Course by ID
- **URL**: `GET /api/courses/:id`
- **Access**: Public for published courses, Private for draft
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "title": "Introduction to JavaScript",
      "description": "Learn JavaScript basics",
      "thumbnail_url": "/uploads/courses/thumbnails/js-course.jpg",
      "status": "published",
      "level": "beginner",
      "duration_hours": 10,
      "instructor": {
        "id": 2,
        "full_name": "Jane Smith",
        "avatar_url": "/uploads/avatars/jane.jpg"
      },
      "category": {
        "id": 1,
        "name": "Web Development"
      },
      "modules": [
        {
          "id": 1,
          "title": "Getting Started",
          "description": "Basic concepts",
          "order_number": 1,
          "lessons": [
            {
              "id": 1,
              "title": "Introduction to Variables",
              "content_type": "video",
              "duration_minutes": 15,
              "order_number": 1
            },
            ...
          ]
        },
        ...
      ],
      "enrollmentStatus": {
        "enrolled": true,
        "enrollmentId": 5,
        "status": "in_progress",
        "enrollmentDate": "2023-03-15T00:00:00.000Z",
        "completionDate": null,
        "score": null
      },
      "enrollmentCount": 45
    }
  }
  ```

#### Create Course
- **URL**: `POST /api/courses`
- **Access**: Private (Admin, Instructor)
- **Request Body**:
  ```json
  {
    "title": "React for Beginners",
    "description": "Learn React from scratch",
    "category_id": 1,
    "thumbnail_url": "/uploads/courses/thumbnails/react-course.jpg",
    "level": "beginner"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Kursus berhasil dibuat",
    "data": {
      "id": 3,
      "title": "React for Beginners",
      "description": "Learn React from scratch",
      "instructor_id": 2,
      "category_id": 1,
      "thumbnail_url": "/uploads/courses/thumbnails/react-course.jpg",
      "level": "beginner",
      "status": "draft"
    }
  }
  ```

#### Update Course
- **URL**: `PUT /api/courses/:id`
- **Access**: Private (Admin, Instructor who created the course)
- **Request Body**: Similar to Create Course
- **Response**:
  ```json
  {
    "success": true,
    "message": "Kursus berhasil diupdate",
    "data": {
      "id": 3,
      "title": "React for Beginners",
      "description": "Updated description",
      "instructor_id": 2,
      "category_id": 1,
      "thumbnail_url": "/uploads/courses/thumbnails/react-course.jpg",
      "level": "beginner",
      "status": "draft"
    }
  }
  ```

#### Delete Course
- **URL**: `DELETE /api/courses/:id`
- **Access**: Private (Admin only)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Kursus berhasil dihapus"
  }
  ```

#### Publish Course
- **URL**: `POST /api/courses/:id/publish`
- **Access**: Private (Admin, Instructor who created the course)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Kursus berhasil dipublish"
  }
  ```

#### Enroll in Course
- **URL**: `POST /api/courses/:id/enroll`
- **Access**: Private
- **Response**:
  ```json
  {
    "success": true,
    "message": "Berhasil mendaftar ke kursus",
    "data": {
      "id": 8,
      "user_id": 1,
      "course_id": 3,
      "enrollment_date": "2023-04-10T00:00:00.000Z",
      "completion_status": "not_started"
    }
  }
  ```

#### Get Course Modules
- **URL**: `GET /api/courses/:id/modules`
- **Access**: Private (Enrolled User, Instructor, Admin)
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "title": "Getting Started",
        "description": "Basic concepts",
        "order_number": 1,
        "lessons": [
          {
            "id": 1,
            "title": "Introduction to Variables",
            "content_type": "video",
            "duration_minutes": 15,
            "order_number": 1,
            "progress": {
              "status": "completed",
              "last_accessed": "2023-04-12T10:30:00.000Z",
              "time_spent_minutes": 18
            }
          },
          ...
        ]
      },
      ...
    ]
  }
  ```

#### Add Module to Course
- **URL**: `POST /api/courses/:id/modules`
- **Access**: Private (Admin, Instructor who created the course)
- **Request Body**:
  ```json
  {
    "title": "Advanced Concepts",
    "description": "Advanced JavaScript topics"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Modul berhasil ditambahkan",
    "data": {
      "id": 4,
      "course_id": 1,
      "title": "Advanced Concepts",
      "description": "Advanced JavaScript topics",
      "order_number": 3
    }
  }
  ```

#### Get Course Students
- **URL**: `GET /api/courses/:id/students`
- **Access**: Private (Admin, Instructor who created the course)
- **Query Parameters**: Standard pagination and search
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "enrollments": [
        {
          "id": 5,
          "enrollment_date": "2023-03-15T00:00:00.000Z",
          "completion_status": "in_progress",
          "user": {
            "id": 1,
            "full_name": "John Doe",
            "email": "john@example.com",
            "avatar_url": "/uploads/avatars/john.jpg",
            "department": "Engineering"
          },
          "progress": {
            "totalLessons": 12,
            "completedLessons": 5,
            "progressPercentage": 42
          }
        },
        ...
      ],
      "pagination": {
        "totalStudents": 45,
        "totalPages": 5,
        "currentPage": 1,
        "limit": 10
      }
    }
  }
  ```

## Module APIs

#### Get Module by ID
- **URL**: `GET /api/modules/:id`
- **Access**: Private (Enrolled User, Instructor, Admin)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "course_id": 1,
      "title": "Getting Started",
      "description": "Basic concepts",
      "order_number": 1,
      "course": {
        "id": 1,
        "title": "Introduction to JavaScript",
        "instructor_id": 2,
        "status": "published"
      },
      "lessons": [
        {
          "id": 1,
          "title": "Introduction to Variables",
          "content_type": "video",
          "duration_minutes": 15,
          "order_number": 1
        },
        ...
      ]
    }
  }
  ```

#### Update Module
- **URL**: `PUT /api/modules/:id`
- **Access**: Private (Instructor who created the course, Admin)
- **Request Body**:
  ```json
  {
    "title": "Updated Title",
    "description": "Updated description"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Modul berhasil diupdate",
    "data": {
      "id": 1,
      "title": "Updated Title",
      "description": "Updated description",
      "order_number": 1
    }
  }
  ```

#### Delete Module
- **URL**: `DELETE /api/modules/:id`
- **Access**: Private (Instructor who created the course, Admin)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Modul berhasil dihapus"
  }
  ```

#### Add Lesson to Module
- **URL**: `POST /api/modules/:id/lessons`
- **Access**: Private (Instructor who created the course, Admin)
- **Request Body**:
  ```json
  {
    "title": "JavaScript Arrays",
    "content_type": "video",
    "content_url": "https://example.com/video.mp4",
    "duration_minutes": 20,
    "is_required": true
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Materi pembelajaran berhasil ditambahkan",
    "data": {
      "id": 4,
      "module_id": 1,
      "title": "JavaScript Arrays",
      "content_type": "video",
      "content_url": "https://example.com/video.mp4",
      "duration_minutes": 20,
      "is_required": true,
      "order_number": 3
    }
  }
  ```

#### Reorder Module
- **URL**: `PUT /api/modules/:id/reorder`
- **Access**: Private (Instructor who created the course, Admin)
- **Request Body**:
  ```json
  {
    "new_order": 2
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Urutan modul berhasil diubah"
  }
  ```

#### Get Module Lessons
- **URL**: `GET /api/modules/:id/lessons`
- **Access**: Private (Enrolled User, Instructor, Admin)
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "title": "Introduction to Variables",
        "content_type": "video",
        "content_url": "https://example.com/video1.mp4",
        "duration_minutes": 15,
        "order_number": 1,
        "progress": {
          "status": "completed",
          "last_accessed": "2023-04-12T10:30:00.000Z",
          "time_spent_minutes": 18
        }
      },
      ...
    ]
  }
  ```

## Lesson APIs

#### Get Lesson by ID
- **URL**: `GET /api/lessons/:id`
- **Access**: Private (Enrolled User, Instructor, Admin)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "module_id": 1,
      "title": "Introduction to Variables",
      "content_type": "video",
      "content_url": "https://example.com/video1.mp4",
      "content_text": null,
      "duration_minutes": 15,
      "order_number": 1,
      "is_required": true,
      "module": {
        "id": 1,
        "title": "Getting Started",
        "course": {
          "id": 1,
          "title": "Introduction to JavaScript",
          "instructor_id": 2,
          "status": "published"
        }
      },
      "quiz": null,
      "progress": {
        "status": "in_progress",
        "last_accessed": "2023-04-15T14:20:00.000Z",
        "time_spent_minutes": 8
      }
    }
  }
  ```

#### Update Lesson
- **URL**: `PUT /api/lessons/:id`
- **Access**: Private (Instructor who created the course, Admin)
- **Request Body**:
  ```json
  {
    "title": "Updated Lesson Title",
    "content_type": "video",
    "content_url": "https://example.com/updated-video.mp4",
    "duration_minutes": 18,
    "is_required": true
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Materi pembelajaran berhasil diupdate",
    "data": {
      "id": 1,
      "title": "Updated Lesson Title",
      "content_type": "video",
      "content_url": "https://example.com/updated-video.mp4",
      "duration_minutes": 18,
      "is_required": true
    }
  }
  ```

#### Delete Lesson
- **URL**: `DELETE /api/lessons/:id`
- **Access**: Private (Instructor who created the course, Admin)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Materi pembelajaran berhasil dihapus"
  }
  ```

#### Reorder Lesson
- **URL**: `PUT /api/lessons/:id/reorder`
- **Access**: Private (Instructor who created the course, Admin)
- **Request Body**:
  ```json
  {
    "new_order": 2
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Urutan materi pembelajaran berhasil diubah"
  }
  ```

#### Complete Lesson
- **URL**: `PUT /api/lessons/:id/complete`
- **Access**: Private (Student who is enrolled)
- **Request Body**:
  ```json
  {
    "time_spent_minutes": 16
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Materi pembelajaran berhasil ditandai selesai",
    "data": {
      "progress": {
        "status": "completed",
        "last_accessed": "2023-04-15T15:30:00.000Z",
        "time_spent_minutes": 16
      },
      "completionStatus": "in_progress"
    }
  }
  ```

#### Upload Lesson Content
- **URL**: `POST /api/lessons/:id/content`
- **Access**: Private (Instructor who created the course, Admin)
- **Request Format**: multipart/form-data
- **Request Body**:
  - `lesson_content`: File (PDF, video, document, etc.)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Konten berhasil diupload",
    "data": {
      "content_url": "/uploads/lessons/video-abc123-1681547800000.mp4"
    }
  }
  ```

## Quiz APIs

#### Get Quiz by ID
- **URL**: `GET /api/quizzes/:id`
- **Access**: Private (Enrolled User, Instructor, Admin)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "lesson_id": 5,
      "title": "JavaScript Basics Quiz",
      "passing_score": 70,
      "time_limit_minutes": 30,
      "lesson": {
        "id": 5,
        "title": "JavaScript Basics",
        "module": {
          "id": 1,
          "title": "Getting Started",
          "course": {
            "id": 1,
            "title": "Introduction to JavaScript",
            "instructor_id": 2,
            "status": "published"
          }
        }
      },
      "questions": [
        {
          "id": 1,
          "question_text": "Which of the following is not a JavaScript data type?",
          "question_type": "multiple_choice",
          "points": 1,
          "order_number": 1,
          "answers": [
            {
              "id": 1,
              "answer_text": "String",
              "is_correct": false
            },
            {
              "id": 2,
              "answer_text": "Character",
              "is_correct": true
            },
            ...
          ]
        },
        ...
      ]
    }
  }
  ```

#### Update Quiz
- **URL**: `PUT /api/quizzes/:id`
- **Access**: Private (Instructor who created the course, Admin)
- **Request Body**:
  ```json
  {
    "title": "Updated Quiz Title",
    "passing_score": 75,
    "time_limit_minutes": 25
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Quiz berhasil diupdate",
    "data": {
      "id": 1,
      "title": "Updated Quiz Title",
      "passing_score": 75,
      "time_limit_minutes": 25
    }
  }
  ```

#### Add Question to Quiz
- **URL**: `POST /api/quizzes/:id/questions`
- **Access**: Private (Instructor who created the course, Admin)
- **Request Body**:
  ```json
  {
    "question_text": "What is the result of 2 + 2?",
    "question_type": "multiple_choice",
    "points": 1,
    "answers": [
      {
        "answer_text": "3",
        "is_correct": false
      },
      {
        "answer_text": "4",
        "is_correct": true
      },
      {
        "answer_text": "5",
        "is_correct": false
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Pertanyaan berhasil ditambahkan",
    "data": {
      "id": 5,
      "quiz_id": 1,
      "question_text": "What is the result of 2 + 2?",
      "question_type": "multiple_choice",
      "points": 1,
      "order_number": 5,
      "answers": [
        {
          "id": 13,
          "question_id": 5,
          "answer_text": "3",
          "is_correct": false
        },
        {
          "id": 14,
          "question_id": 5,
          "answer_text": "4",
          "is_correct": true
        },
        {
          "id": 15,
          "question_id": 5,
          "answer_text": "5",
          "is_correct": false
        }
      ]
    }
  }
  ```

#### Submit Quiz
- **URL**: `POST /api/quizzes/:id/submit`
- **Access**: Private (Student who is enrolled)
- **Request Body**:
  ```json
  {
    "answers": [
      {
        "question_id": 1,
        "answer_id": 2
      },
      {
        "question_id": 2,
        "answer_id": 5
      },
      {
        "question_id": 3,
        "text_answer": "This is my essay answer"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Quiz berhasil diselesaikan dan lulus",
    "data": {
      "totalPoints": 3,
      "earnedPoints": 2.5,
      "score": 83.33,
      "isPassed": true,
      "passingScore": 70
    }
  }
  ```

#### Grade Essay
- **URL**: `PUT /api/quizzes/:id/grade`
- **Access**: Private (Instructor who created the course, Admin)
- **Request Body**:
  ```json
  {
    "grades": [
      {
        "user_answer_id": 42,
        "is_correct": true,
        "points_earned": 1
      },
      {
        "user_answer_id": 43,
        "is_correct": false,
        "points_earned": 0
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Penilaian berhasil disimpan"
  }
  ```

#### Get Quiz Results
- **URL**: `GET /api/quizzes/:id/results`
- **Access**: Private (Instructor who created the course, Admin)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "quiz_title": "JavaScript Basics Quiz",
      "passing_score": 70,
      "results": [
        {
          "user": {
            "id": 1,
            "full_name": "John Doe",
            "email": "john@example.com",
            "username": "johndoe"
          },
          "has_taken_quiz": true,
          "score": 83.33,
          "is_passed": true,
          "needs_grading": false,
          "total_points": 3,
          "earned_points": 2.5,
          "submission_date": "2023-04-15T16:45:00.000Z"
        },
        ...
      ]
    }
  }
  ```

## Discussion APIs

#### Get Course Discussions
- **URL**: `GET /api/discussions/course/:courseId`
- **Access**: Private (Enrolled User, Instructor, Admin)
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "course_id": 1,
        "lesson_id": null,
        "user_id": 1,
        "title": "Question about Variables",
        "content": "Can someone explain hoisting?",
        "created_at": "2023-04-10T14:30:00.000Z",
        "user": {
          "id": 1,
          "full_name": "John Doe",
          "username": "johndoe",
          "avatar_url": "/uploads/avatars/john.jpg"
        },
        "comment_count": 3
      },
      ...
    ]
  }
  ```

#### Get Lesson Discussions
- **URL**: `GET /api/discussions/lesson/:lessonId`
- **Access**: Private (Enrolled User, Instructor, Admin)
- **Response**: Similar to Course Discussions

#### Get Discussion by ID
- **URL**: `GET /api/discussions/:id`
- **Access**: Private (Enrolled User, Instructor, Admin)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "discussion": {
        "id": 1,
        "course_id": 1,
        "lesson_id": null,
        "user_id": 1,
        "title": "Question about Variables",
        "content": "Can someone explain hoisting?",
        "created_at": "2023-04-10T14:30:00.000Z",
        "user": {
          "id": 1,
          "full_name": "John Doe",
          "username": "johndoe",
          "avatar_url": "/uploads/avatars/john.jpg",
          "role": "student"
        }
      },
      "comments": [
        {
          "id": 2,
          "parent_id": 1,
          "content": "Hoisting is when variable declarations are moved to the top...",
          "created_at": "2023-04-10T15:00:00.000Z",
          "user": {
            "id": 2,
            "full_name": "Jane Smith",
            "username": "janesmith",
            "avatar_url": "/uploads/avatars/jane.jpg",
            "role": "instructor"
          }
        },
        ...
      ]
    }
  }
  ```

#### Create Discussion
- **URL**: `POST /api/discussions`
- **Access**: Private (Enrolled User, Instructor, Admin)
- **Request Body**:
  ```json
  {
    "title": "Question about Arrays",
    "content": "How can I sort an array of objects?",
    "courseId": 1,
    "lessonId": 3
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Diskusi berhasil dibuat",
    "data": {
      "id": 5,
      "course_id": 1,
      "lesson_id": 3,
      "user_id": 1,
      "title": "Question about Arrays",
      "content": "How can I sort an array of objects?",
      "created_at": "2023-04-16T10:00:00.000Z",
      "user": {
        "id": 1,
        "full_name": "John Doe",
        "username": "johndoe",
        "avatar_url": "/uploads/avatars/john.jpg",
        "role": "student"
      }
    }
  }
  ```

#### Add Comment to Discussion
- **URL**: `POST /api/discussions/:id/comments`
- **Access**: Private (Enrolled User, Instructor, Admin)
- **Request Body**:
  ```json
  {
    "content": "You can use the sort() method with a custom compare function."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Komentar berhasil ditambahkan",
    "data": {
      "id": 10,
      "parent_id": 5,
      "content": "You can use the sort() method with a custom compare function.",
      "created_at": "2023-04-16T10:15:00.000Z",
      "user": {
        "id": 2,
        "full_name": "Jane Smith",
        "username": "janesmith",
        "avatar_url": "/uploads/avatars/jane.jpg",
        "role": "instructor"
      }
    }
  }
  ```

## Certificate APIs

#### Get User Certificates
- **URL**: `GET /api/certificates`
- **Access**: Private
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "user_id": 1,
        "course_id": 2,
        "issue_date": "2023-03-20T00:00:00.000Z",
        "expiration_date": null,
        "certificate_url": "/uploads/certificates/certificate_1_2_1679270400000.pdf",
        "course": {
          "id": 2,
          "title": "HTML and CSS Fundamentals",
          "thumbnail_url": "/uploads/courses/thumbnails/html-css.jpg",
          "instructor": {
            "id": 2,
            "full_name": "Jane Smith"
          }
        }
      },
      ...
    ]
  }
  ```

#### Get Certificate by ID
- **URL**: `GET /api/certificates/:id`
- **Access**: Private (Certificate owner, Instructor, Admin)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "user_id": 1,
      "course_id": 2,
      "issue_date": "2023-03-20T00:00:00.000Z",
      "expiration_date": null,
      "certificate_url": "/uploads/certificates/certificate_1_2_1679270400000.pdf",
      "user": {
        "id": 1,
        "full_name": "John Doe",
        "email": "john@example.com"
      },
      "course": {
        "id": 2,
        "title": "HTML and CSS Fundamentals",
        "instructor": {
          "id": 2,
          "full_name": "Jane Smith"
        }
      }
    }
  }
  ```

#### Generate Certificate
- **URL**: `POST /api/certificates/generate`
- **Access**: Private (Admin, Instructor)
- **Request Body**:
  ```json
  {
    "user_id": 1,
    "course_id": 3
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Sertifikat berhasil digenerate",
    "data": {
      "id": 3,
      "user_id": 1,
      "course_id": 3,
      "issue_date": "2023-04-16T00:00:00.000Z",
      "expiration_date": null,
      "certificate_url": "/uploads/certificates/certificate_1_3_1681603200000.pdf"
    }
  }
  ```

#### Download Certificate
- **URL**: `GET /api/certificates/:id/download`
- **Access**: Private (Certificate owner, Instructor, Admin)
- **Response**: PDF file download

#### Verify Certificate
- **URL**: `POST /api/certificates/verify`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "certificate_id": 1
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Sertifikat valid",
    "data": {
      "certificateId": 1,
      "userName": "John Doe",
      "courseTitle": "HTML and CSS Fundamentals",
      "issueDate": "2023-03-20T00:00:00.000Z",
      "expirationDate": null
    }
  }
  ```

## Notification APIs

#### Get User Notifications
- **URL**: `GET /api/notifications`
- **Access**: Private
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `is_read`: Filter by read status (true/false)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "notifications": [
        {
          "id": 1,
          "user_id": 1,
          "type": "enrollment",
          "message": "Anda telah berhasil mendaftar di kursus \"Introduction to JavaScript\"",
          "is_read": false,
          "created_at": "2023-04-10T12:30:00.000Z"
        },
        {
          "id": 2,
          "user_id": 1,
          "type": "course_completed",
          "message": "Selamat! Anda telah menyelesaikan kursus \"HTML and CSS Fundamentals\"",
          "is_read": true,
          "created_at": "2023-03-20T15:45:00.000Z"
        },
        ...
      ],
      "unreadCount": 3,
      "pagination": {
        "totalNotifications": 8,
        "totalPages": 1,
        "currentPage": 1,
        "limit": 10
      }
    }
  }
  ```

#### Mark Notification as Read
- **URL**: `PUT /api/notifications/:id/read`
- **Access**: Private
- **Response**:
  ```json
  {
    "success": true,
    "message": "Notifikasi berhasil ditandai sebagai telah dibaca",
    "data": {
      "id": 1,
      "is_read": true
    }
  }
  ```

#### Mark All Notifications as Read
- **URL**: `PUT /api/notifications/read-all`
- **Access**: Private
- **Response**:
  ```json
  {
    "success": true,
    "message": "Semua notifikasi berhasil ditandai sebagai telah dibaca"
  }
  ```

#### Delete Notification
- **URL**: `DELETE /api/notifications/:id`
- **Access**: Private
- **Response**:
  ```json
  {
    "success": true,
    "message": "Notifikasi berhasil dihapus"
  }
  ```

#### Get Unread Notification Count
- **URL**: `GET /api/notifications/unread-count`
- **Access**: Private
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "unreadCount": 3
    }
  }
  ```

## User APIs

#### Get All Users
- **URL**: `GET /api/users`
- **Access**: Private (Admin only)
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Search term
  - `role`: Filter by role (admin, instructor, student)
  - `department`: Filter by department
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "users": [
        {
          "id": 1,
          "username": "johndoe",
          "email": "john@example.com",
          "full_name": "John Doe",
          "role": "student",
          "department": "Engineering",
          "avatar_url": "/uploads/avatars/john.jpg",
          "created_at": "2023-01-01T00:00:00.000Z"
        },
        ...
      ],
      "pagination": {
        "totalUsers": 25,
        "totalPages": 3,
        "currentPage": 1,
        "limit": 10
      }
    }
  }
  ```

#### Get User Dashboard Stats
- **URL**: `GET /api/users/stats/dashboard`
- **Access**: Private
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      // For students:
      "courseStats": {
        "totalEnrollments": 8,
        "inProgressCourses": 5,
        "completedCourses": 3,
        "completionRate": 38
      },
      "certificateStats": {
        "totalCertificates": 3
      },
      "studyStats": {
        "totalStudyTimeMinutes": 480,
        "totalStudyTimeHours": 8
      },
      "recentActivities": [...]

      // For instructors:
      "courseStats": {
        "totalCourses": 5,
        "publishedCourses": 4,
        "draftCourses": 1,
        "publishRate": 80
      },
      "studentStats": {
        "totalStudents": 120
      },
      "popularCourses": [...]

      // For admins:
      "userStats": {
        "totalUsers": 150,
        "roleCount": {
          "admin": 3,
          "instructor": 12,
          "student": 135
        }
      },
      "courseStats": {
        "totalCourses": 25,
        "statusCount": {
          "draft": 5,
          "published": 18,
          "archived": 2
        }
      },
      "enrollmentStats": {
        "totalEnrollments": 350,
        "statusCount": {
          "not_started": 80,
          "in_progress": 185,
          "completed": 85
        }
      }
    }
  }
  ```

#### Update User Profile
- **URL**: `PUT /api/users/profile`
- **Access**: Private
- **Request Body**:
  ```json
  {
    "full_name": "John Doe Smith",
    "email": "johnsmith@example.com",
    "username": "johnsmith",
    "department": "Software Engineering",
    "avatar_url": "/uploads/avatars/john-new.jpg"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Profil berhasil diupdate",
    "data": {
      "id": 1,
      "username": "johnsmith",
      "email": "johnsmith@example.com",
      "full_name": "John Doe Smith",
      "role": "student",
      "department": "Software Engineering",
      "avatar_url": "/uploads/avatars/john-new.jpg"
    }
  }
  ```

#### Upload Profile Avatar
- **URL**: `POST /api/users/profile/avatar`
- **Access**: Private
- **Request Format**: multipart/form-data
- **Request Body**:
  - `avatar`: Image file (JPEG, PNG, WebP)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Avatar berhasil diupload",
    "data": {
      "avatar_url": "/uploads/avatars/avatar-abc123-1681656000000.jpg"
    }
  }
  ```

#### Get User by ID
- **URL**: `GET /api/users/:id`
- **Access**: Private (Admin or same user)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "student",
      "department": "Engineering",
      "avatar_url": "/uploads/avatars/john.jpg",
      "created_at": "2023-01-01T00:00:00.000Z",
      "enrollments": [...],
      "certificates": [...]
    }
  }
  ```

#### Update User
- **URL**: `PUT /api/users/:id`
- **Access**: Private (Admin or same user)
- **Request Body**: Similar to Update Profile
- **Response**: Similar to Update Profile

#### Delete User
- **URL**: `DELETE /api/users/:id`
- **Access**: Private (Admin only)
- **Response**:
  ```json
  {
    "success": true,
    "message": "User berhasil dihapus"
  }
  ```

#### Change User Role
- **URL**: `POST /api/users/:id/change-role`
- **Access**: Private (Admin only)
- **Request Body**:
  ```json
  {
    "role": "instructor"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Role user berhasil diubah menjadi instructor"
  }
  ```

## Error Responses

All API endpoints may return these common error responses:

#### Validation Error (400)
```json
{
  "success": false,
  "message": "Email atau password salah"
}
```

#### Authentication Error (401)
```json
{
  "success": false,
  "message": "Token kedaluwarsa. Silakan login kembali"
}
```

#### Authorization Error (403)
```json
{
  "success": false,
  "message": "Akses ditolak. Anda tidak memiliki izin yang cukup"
}
```

#### Not Found Error (404)
```json
{
  "success": false,
  "message": "Kursus tidak ditemukan"
}
```

#### Server Error (500)
```json
{
  "success": false,
  "message": "Server error"
}
```

## File Upload Information

For file uploads, use the following endpoints with multipart/form-data:

1. **Profile Avatar**:
   - URL: `POST /api/users/profile/avatar`
   - Field name: `avatar`
   - Allowed formats: JPEG, PNG, WebP
   - Max size: 10MB

2. **Course Thumbnail**:
   - URL: `POST /api/courses/:id` (include in course update)
   - Field name: `course_thumbnail`
   - Allowed formats: JPEG, PNG, WebP
   - Max size: 10MB

3. **Lesson Content**:
   - URL: `POST /api/lessons/:id/content`
   - Field name: `lesson_content`
   - Allowed formats: JPEG, PNG, PDF, MP4, PPTX, DOCX
   - Max size: 10MB

This documentation should provide the frontend team with all the necessary information to properly integrate with the Rotasi LMS backend.