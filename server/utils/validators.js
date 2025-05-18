import Joi from 'joi';

// Validasi registrasi
export const validateRegistration = (data) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required()
      .messages({
        'string.base': 'Username harus berupa teks',
        'string.empty': 'Username tidak boleh kosong',
        'string.min': 'Username minimal 3 karakter',
        'string.max': 'Username maksimal 30 karakter',
        'any.required': 'Username wajib diisi'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Format email tidak valid',
        'string.empty': 'Email tidak boleh kosong',
        'any.required': 'Email wajib diisi'
      }),
    password: Joi.string().min(6).required()
      .messages({
        'string.base': 'Password harus berupa teks',
        'string.empty': 'Password tidak boleh kosong',
        'string.min': 'Password minimal 6 karakter',
        'any.required': 'Password wajib diisi'
      }),
    full_name: Joi.string().min(2).max(100).required()
      .messages({
        'string.base': 'Nama lengkap harus berupa teks',
        'string.empty': 'Nama lengkap tidak boleh kosong',
        'string.min': 'Nama lengkap minimal 2 karakter',
        'string.max': 'Nama lengkap maksimal 100 karakter',
        'any.required': 'Nama lengkap wajib diisi'
      }),
    department: Joi.string().required()
      .messages({
        'string.base': 'Departemen harus berupa teks',
        'string.empty': 'Departemen tidak boleh kosong',
        'any.required': 'Departemen wajib diisi'
      })
  });

  return schema.validate(data);
};

// Validasi login
export const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Format email tidak valid',
        'string.empty': 'Email tidak boleh kosong',
        'any.required': 'Email wajib diisi'
      }),
    password: Joi.string().required()
      .messages({
        'string.base': 'Password harus berupa teks',
        'string.empty': 'Password tidak boleh kosong',
        'any.required': 'Password wajib diisi'
      })
  });

  return schema.validate(data);
};

// Validasi user update
export const validateUserUpdate = (data) => {
  const schema = Joi.object({
    full_name: Joi.string().min(2).max(100)
      .messages({
        'string.base': 'Nama lengkap harus berupa teks',
        'string.min': 'Nama lengkap minimal 2 karakter',
        'string.max': 'Nama lengkap maksimal 100 karakter'
      }),
    email: Joi.string().email()
      .messages({
        'string.email': 'Format email tidak valid'
      }),
    username: Joi.string().alphanum().min(3).max(30)
      .messages({
        'string.base': 'Username harus berupa teks',
        'string.alphanum': 'Username hanya boleh berisi huruf dan angka',
        'string.min': 'Username minimal 3 karakter',
        'string.max': 'Username maksimal 30 karakter'
      }),
    department: Joi.string()
      .messages({
        'string.base': 'Departemen harus berupa teks'
      }),
    role: Joi.string().valid('admin', 'instructor', 'student')
      .messages({
        'string.base': 'Role harus berupa teks',
        'any.only': 'Role tidak valid'
      }),
    avatar_url: Joi.string().allow(null, '')
      .messages({
        'string.base': 'Avatar URL harus berupa teks'
      })
  });

  return schema.validate(data);
};

// Validasi course
export const validateCourse = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(100).required()
      .messages({
        'string.base': 'Judul kursus harus berupa teks',
        'string.empty': 'Judul kursus tidak boleh kosong',
        'string.min': 'Judul kursus minimal 5 karakter',
        'string.max': 'Judul kursus maksimal 100 karakter',
        'any.required': 'Judul kursus wajib diisi'
      }),
    description: Joi.string().min(10).required()
      .messages({
        'string.base': 'Deskripsi kursus harus berupa teks',
        'string.empty': 'Deskripsi kursus tidak boleh kosong',
        'string.min': 'Deskripsi kursus minimal 10 karakter',
        'any.required': 'Deskripsi kursus wajib diisi'
      }),
    category_id: Joi.number().required()
      .messages({
        'number.base': 'Kategori kursus harus berupa angka',
        'any.required': 'Kategori kursus wajib diisi'
      }),
    thumbnail_url: Joi.string().allow(null, '')
      .messages({
        'string.base': 'Thumbnail URL harus berupa teks'
      }),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced').allow(null, '')
      .messages({
        'string.base': 'Level kursus harus berupa teks',
        'any.only': 'Level kursus tidak valid'
      }),
    duration_hours: Joi.number().allow(null)
      .messages({
        'number.base': 'Durasi kursus harus berupa angka'
      })
  });

  return schema.validate(data);
};

// Validasi lesson
export const validateLesson = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(100).required()
      .messages({
        'string.base': 'Judul materi harus berupa teks',
        'string.empty': 'Judul materi tidak boleh kosong',
        'string.min': 'Judul materi minimal 3 karakter',
        'string.max': 'Judul materi maksimal 100 karakter',
        'any.required': 'Judul materi wajib diisi'
      }),
    content_type: Joi.string().valid('video', 'document', 'quiz', 'article', 'presentation', 'link').required()
      .messages({
        'string.base': 'Tipe konten harus berupa teks',
        'string.empty': 'Tipe konten tidak boleh kosong',
        'any.only': 'Tipe konten tidak valid',
        'any.required': 'Tipe konten wajib diisi'
      }),
    content_url: Joi.string().allow(null, '')
      .messages({
        'string.base': 'URL konten harus berupa teks'
      }),
    content_text: Joi.string().allow(null, '')
      .messages({
        'string.base': 'Teks konten harus berupa teks'
      }),
    duration_minutes: Joi.number().allow(null)
      .messages({
        'number.base': 'Durasi materi harus berupa angka'
      }),
    is_required: Joi.boolean().allow(null)
      .messages({
        'boolean.base': 'Status wajib harus berupa boolean'
      })
  });

  return schema.validate(data);
};

// Validasi quiz
export const validateQuiz = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(100).required()
      .messages({
        'string.base': 'Judul quiz harus berupa teks',
        'string.empty': 'Judul quiz tidak boleh kosong',
        'string.min': 'Judul quiz minimal 3 karakter',
        'string.max': 'Judul quiz maksimal 100 karakter',
        'any.required': 'Judul quiz wajib diisi'
      }),
    passing_score: Joi.number().min(0).max(100).required()
      .messages({
        'number.base': 'Passing score harus berupa angka',
        'number.min': 'Passing score minimal 0',
        'number.max': 'Passing score maksimal 100',
        'any.required': 'Passing score wajib diisi'
      }),
    time_limit_minutes: Joi.number().min(1).required()
      .messages({
        'number.base': 'Batas waktu harus berupa angka',
        'number.min': 'Batas waktu minimal 1 menit',
        'any.required': 'Batas waktu wajib diisi'
      })
  });

  return schema.validate(data);
};

// Validasi question
export const validateQuestion = (data) => {
  const schema = Joi.object({
    question_text: Joi.string().min(3).required()
      .messages({
        'string.base': 'Teks pertanyaan harus berupa teks',
        'string.empty': 'Teks pertanyaan tidak boleh kosong',
        'string.min': 'Teks pertanyaan minimal 3 karakter',
        'any.required': 'Teks pertanyaan wajib diisi'
      }),
    question_type: Joi.string().valid('multiple_choice', 'true_false', 'essay').required()
      .messages({
        'string.base': 'Tipe pertanyaan harus berupa teks',
        'string.empty': 'Tipe pertanyaan tidak boleh kosong',
        'any.only': 'Tipe pertanyaan tidak valid',
        'any.required': 'Tipe pertanyaan wajib diisi'
      }),
    points: Joi.number().min(1).default(1)
      .messages({
        'number.base': 'Poin harus berupa angka',
        'number.min': 'Poin minimal 1'
      }),
    answers: Joi.array().items(
      Joi.object({
        answer_text: Joi.string().required()
          .messages({
            'string.base': 'Teks jawaban harus berupa teks',
            'string.empty': 'Teks jawaban tidak boleh kosong',
            'any.required': 'Teks jawaban wajib diisi'
          }),
        is_correct: Joi.boolean().default(false)
          .messages({
            'boolean.base': 'Status jawaban benar harus berupa boolean'
          })
      })
    )
  });

  return schema.validate(data);
};

// Validasi discussion
export const validateDiscussion = (data) => {
    const schema = Joi.object({
      course_id: Joi.number().required()
        .messages({
          'number.base': 'ID kursus harus berupa angka',
          'any.required': 'ID kursus wajib diisi'
        }),
      lesson_id: Joi.number().allow(null)
        .messages({
          'number.base': 'ID materi harus berupa angka'
        }),
      title: Joi.string().min(3).max(100).required()
        .messages({
          'string.base': 'Judul diskusi harus berupa teks',
          'string.empty': 'Judul diskusi tidak boleh kosong',
          'string.min': 'Judul diskusi minimal 3 karakter',
          'string.max': 'Judul diskusi maksimal 100 karakter',
          'any.required': 'Judul diskusi wajib diisi'
        }),
      content: Joi.string().min(10).required()
        .messages({
          'string.base': 'Konten diskusi harus berupa teks',
          'string.empty': 'Konten diskusi tidak boleh kosong',
          'string.min': 'Konten diskusi minimal 10 karakter',
          'any.required': 'Konten diskusi wajib diisi'
        })
    });
  
    return schema.validate(data);
  };
  
  // Validasi comment
  export const validateComment = (data) => {
    const schema = Joi.object({
      content: Joi.string().min(1).required()
        .messages({
          'string.base': 'Konten komentar harus berupa teks',
          'string.empty': 'Konten komentar tidak boleh kosong',
          'string.min': 'Konten komentar minimal 1 karakter',
          'any.required': 'Konten komentar wajib diisi'
        })
    });
  
    return schema.validate(data);
  };
  
  // Validasi category
  export const validateCategory = (data) => {
    const schema = Joi.object({
      name: Joi.string().min(2).max(50).required()
        .messages({
          'string.base': 'Nama kategori harus berupa teks',
          'string.empty': 'Nama kategori tidak boleh kosong',
          'string.min': 'Nama kategori minimal 2 karakter',
          'string.max': 'Nama kategori maksimal 50 karakter',
          'any.required': 'Nama kategori wajib diisi'
        }),
      description: Joi.string().allow(null, '')
        .messages({
          'string.base': 'Deskripsi kategori harus berupa teks'
        }),
      parent_category_id: Joi.number().allow(null)
        .messages({
          'number.base': 'ID kategori induk harus berupa angka'
        })
    });
  
    return schema.validate(data);
  };