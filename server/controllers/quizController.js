import { Quiz, Question, Answer, UserAnswer, Enrollment, Lesson, Module, Course, Progress, User } from '../models/index.js';
import { validateQuiz, validateQuestion } from '../utils/validators.js';
import { Sequelize } from 'sequelize';

/**
 * @desc    Dapatkan detail quiz
 * @route   GET /api/quizzes/:id
 * @access  Private (Enrolled User, Instructor, Admin)
 */
export const getQuizById = async (req, res) => {
  try {
    const quizId = req.params.id;
    
    // Get quiz dengan pertanyaan dan jawaban
    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: Lesson,
          as: 'lesson',
          include: [
            {
              model: Module,
              as: 'module',
              include: [
                {
                  model: Course,
                  as: 'course',
                  attributes: ['id', 'title', 'instructor_id', 'status']
                }
              ]
            }
          ]
        },
        {
          model: Question,
          as: 'questions',
          order: [['order_number', 'ASC']],
          include: [
            {
              model: Answer,
              as: 'answers'
            }
          ]
        }
      ]
    });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz tidak ditemukan'
      });
    }
    
    const userId = req.user.id;
    const course = quiz.lesson.module.course;
    
    // Cek akses: jika kursus draft, hanya instructor atau admin yang bisa melihat
    if (course.status === 'draft') {
      if (course.instructor_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Kursus belum dipublish'
        });
      }
    } else {
      // Jika kursus published, cek apakah user sudah enroll (kecuali instructor atau admin)
      if (course.instructor_id !== userId && req.user.role !== 'admin') {
        const enrollment = await Enrollment.findOne({
          where: {
            user_id: userId,
            course_id: course.id
          }
        });
        
        if (!enrollment) {
          return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Anda belum terdaftar di kursus ini'
          });
        }
      }
    }
    
    // Jika user adalah student, sembunyikan jawaban yang benar
    if (req.user.role === 'student') {
      // Cek apakah user sudah mengerjakan quiz ini
      const enrollment = await Enrollment.findOne({
        where: {
          user_id: userId,
          course_id: course.id
        }
      });
      
      if (enrollment) {
        const userAnswers = await UserAnswer.findAll({
          where: {
            enrollment_id: enrollment.id,
            question_id: quiz.questions.map(q => q.id)
          }
        });
        
        if (userAnswers.length > 0) {
          // User sudah mengerjakan quiz, tambahkan jawaban user
          const userAnswerMap = new Map();
          for (const ua of userAnswers) {
            userAnswerMap.set(ua.question_id, ua);
          }
          
          for (const question of quiz.questions) {
            const userAnswer = userAnswerMap.get(question.id);
            
            if (userAnswer) {
              question.dataValues.userAnswer = {
                answer_id: userAnswer.answer_id,
                text_answer: userAnswer.text_answer,
                is_correct: userAnswer.is_correct,
                points_earned: userAnswer.points_earned
              };
              
              // Jika quiz sudah dikerjakan, tampilkan jawaban yang benar
              for (const answer of question.answers) {
                answer.dataValues.is_correct_visible = answer.is_correct;
              }
            }
          }
        } else {
          // User belum mengerjakan quiz, sembunyikan jawaban yang benar
          for (const question of quiz.questions) {
            for (const answer of question.answers) {
              delete answer.dataValues.is_correct;
            }
          }
        }
      }
    }
    
    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Get quiz by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update quiz
 * @route   PUT /api/quizzes/:id
 * @access  Private (Instructor yang membuat course, Admin)
 */
export const updateQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    
    // Validasi input
    const { error } = validateQuiz(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    const { title, passing_score, time_limit_minutes } = req.body;
    
    // Get quiz
    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: Lesson,
          as: 'lesson',
          include: [
            {
              model: Module,
              as: 'module',
              include: [
                {
                  model: Course,
                  as: 'course',
                  attributes: ['instructor_id']
                }
              ]
            }
          ]
        }
      ]
    });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz tidak ditemukan'
      });
    }
    
    // Cek kepemilikan
    const instructorId = quiz.lesson.module.course.instructor_id;
    if (instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda bukan instructor dari kursus ini'
      });
    }
    
    // Update quiz
    await quiz.update({
      title,
      passing_score,
      time_limit_minutes
    });
    
    res.json({
      success: true,
      message: 'Quiz berhasil diupdate',
      data: quiz
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Tambah pertanyaan ke quiz
 * @route   POST /api/quizzes/:id/questions
 * @access  Private (Instructor yang membuat course, Admin)
 */
export const addQuestion = async (req, res) => {
  try {
    const quizId = req.params.id;
    
    // Validasi input
    const { error } = validateQuestion(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    const {
      question_text,
      question_type,
      points,
      answers
    } = req.body;
    
    // Validasi tipe pertanyaan
    const validTypes = ['multiple_choice', 'true_false', 'essay'];
    if (!validTypes.includes(question_type)) {
      return res.status(400).json({
        success: false,
        message: `Tipe pertanyaan tidak valid. Tipe yang diizinkan: ${validTypes.join(', ')}`
      });
    }
    
    // Validasi jawaban
    if (question_type !== 'essay' && (!answers || answers.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Jawaban wajib diisi untuk tipe pertanyaan ini'
      });
    }
    
    if (question_type === 'multiple_choice' && answers.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Minimal 2 jawaban untuk pertanyaan pilihan ganda'
      });
    }
    
    if (question_type === 'true_false' && answers.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Harus ada 2 jawaban (Benar/Salah) untuk pertanyaan true/false'
      });
    }
    
    if (question_type !== 'essay') {
      // Cek apakah ada jawaban yang benar
      const correctAnswers = answers.filter(a => a.is_correct);
      if (correctAnswers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Minimal harus ada 1 jawaban yang benar'
        });
      }
    }
    
    // Get quiz
    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: Lesson,
          as: 'lesson',
          include: [
            {
              model: Module,
              as: 'module',
              include: [
                {
                  model: Course,
                  as: 'course',
                  attributes: ['instructor_id']
                }
              ]
            }
          ]
        }
      ]
    });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz tidak ditemukan'
      });
    }
    
    // Cek kepemilikan
    const instructorId = quiz.lesson.module.course.instructor_id;
    if (instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda bukan instructor dari kursus ini'
      });
    }
    
    // Dapatkan urutan terakhir pertanyaan dalam quiz
    const lastQuestion = await Question.findOne({
      where: { quiz_id: quizId },
      order: [['order_number', 'DESC']]
    });
    
    const orderNumber = lastQuestion ? lastQuestion.order_number + 1 : 1;
    
    // Buat pertanyaan baru
    const question = await Question.create({
      quiz_id: quizId,
      question_text,
      question_type,
      points: points || 1,
      order_number: orderNumber
    });
    
    // Buat jawaban jika bukan essay
    if (question_type !== 'essay' && answers && answers.length > 0) {
      for (const answer of answers) {
        await Answer.create({
          question_id: question.id,
          answer_text: answer.answer_text,
          is_correct: answer.is_correct || false
        });
      }
    }
    
    // Get question with answers
    const newQuestion = await Question.findByPk(question.id, {
      include: [
        {
          model: Answer,
          as: 'answers'
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Pertanyaan berhasil ditambahkan',
      data: newQuestion
    });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Kirim jawaban quiz
 * @route   POST /api/quizzes/:id/submit
 * @access  Private (Student yang enroll)
 */
export const submitQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const userId = req.user.id;
    const { answers } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Format jawaban tidak valid'
      });
    }
    
    // Get quiz dengan pertanyaan dan jawaban
    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: Lesson,
          as: 'lesson',
          include: [
            {
              model: Module,
              as: 'module',
              include: [
                {
                  model: Course,
                  as: 'course',
                  attributes: ['id', 'instructor_id']
                }
              ]
            }
          ]
        },
        {
          model: Question,
          as: 'questions',
          include: [
            {
              model: Answer,
              as: 'answers'
            }
          ]
        }
      ]
    });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz tidak ditemukan'
      });
    }
    
    const courseId = quiz.lesson.module.course.id;
    
    // Get enrollment
    const enrollment = await Enrollment.findOne({
      where: {
        user_id: userId,
        course_id: courseId
      }
    });
    
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda belum terdaftar di kursus ini'
      });
    }
    
    // Tambahkan log untuk memeriksa struktur enrollment
    console.log('Enrollment found:', JSON.stringify(enrollment, null, 2));
    
    // Gunakan ID pengganti untuk enrollment_id karena enrollment tidak memiliki id
    // Opsi 1: Gunakan userId sebagai nilai enrollment_id
    const enrollmentId = userId;
    
    // Cek apakah user sudah mengerjakan quiz ini
    const existingAnswers = await UserAnswer.findAll({
      where: {
        enrollment_id: enrollmentId,
        question_id: {
          [Sequelize.Op.in]: quiz.questions.map(q => q.id)
        }
      }
    });
    
    if (existingAnswers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah mengerjakan quiz ini'
      });
    }
    
    // Prosess jawaban
    let totalPoints = 0;
    let earnedPoints = 0;
    const userAnswers = [];
    
    // Buat map untuk lookup jawaban yang benar
    const correctAnswerMap = new Map();
    for (const question of quiz.questions) {
      totalPoints += question.points;
      
      if (question.question_type !== 'essay') {
        const correctAnswers = question.answers.filter(a => a.is_correct).map(a => a.id);
        correctAnswerMap.set(question.id, correctAnswers);
      }
    }
    
    // Proses jawaban user
    for (const answer of answers) {
      const questionId = answer.question_id;
      const question = quiz.questions.find(q => q.id === questionId);
      
      if (!question) {
        continue; // Skip jawaban untuk pertanyaan yang tidak ada
      }
      
      let isCorrect = false;
      let pointsEarned = 0;
      
      if (question.question_type === 'essay') {
        // Essay akan dinilai oleh instructor
        isCorrect = null;
        pointsEarned = null;
      } else {
        // Multiple choice atau true/false
        const correctAnswers = correctAnswerMap.get(questionId);
        
        if (answer.answer_id && correctAnswers.includes(answer.answer_id)) {
          isCorrect = true;
          pointsEarned = question.points;
          earnedPoints += question.points;
        }
      }
      
      // Simpan jawaban user dengan enrollment_id
      const userAnswer = await UserAnswer.create({
        enrollment_id: enrollmentId,
        question_id: questionId,
        answer_id: answer.answer_id,
        text_answer: answer.text_answer,
        is_correct: isCorrect,
        points_earned: pointsEarned
      });
      
      userAnswers.push(userAnswer);
    }
    
    // Hitung score
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const isPassed = score >= quiz.passing_score;
    
    // Update progress untuk lesson ini
    await Progress.update(
      {
        status: 'completed',
        last_accessed: new Date()
      },
      {
        where: {
          enrollment_id: enrollmentId,
          lesson_id: quiz.lesson_id
        }
      }
    );
    
    res.json({
      success: true,
      message: isPassed ? 'Quiz berhasil diselesaikan dan lulus' : 'Quiz berhasil diselesaikan tapi belum lulus',
      data: {
        totalPoints,
        earnedPoints,
        score,
        isPassed,
        passingScore: quiz.passing_score
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Nilai jawaban essay
 * @route   PUT /api/quizzes/:id/grade
 * @access  Private (Instructor yang membuat course, Admin)
 */
export const gradeEssay = async (req, res) => {
  try {
    const quizId = req.params.id;
    const { grades } = req.body;
    
    if (!grades || !Array.isArray(grades)) {
      return res.status(400).json({
        success: false,
        message: 'Format penilaian tidak valid'
      });
    }
    
    // Get quiz
    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: Lesson,
          as: 'lesson',
          include: [
            {
              model: Module,
              as: 'module',
              include: [
                {
                  model: Course,
                  as: 'course',
                  attributes: ['instructor_id']
                }
              ]
            }
          ]
        }
      ]
    });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz tidak ditemukan'
      });
    }
    
    // Cek kepemilikan
    const instructorId = quiz.lesson.module.course.instructor_id;
    if (instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda bukan instructor dari kursus ini'
      });
    }
    
    // Update penilaian
    for (const grade of grades) {
      const { user_answer_id, is_correct, points_earned } = grade;
      
      // Validasi
      if (!user_answer_id || points_earned === undefined) {
        continue; // Skip invalid grades
      }
      
      // Update user answer
      await UserAnswer.update(
        {
          is_correct,
          points_earned
        },
        {
          where: { id: user_answer_id }
        }
      );
    }
    
    res.json({
      success: true,
      message: 'Penilaian berhasil disimpan'
    });
  } catch (error) {
    console.error('Grade essay error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Dapatkan hasil quiz untuk semua user
 * @route   GET /api/quizzes/:id/results
 * @access  Private (Instructor yang membuat course, Admin)
 */
export const getQuizResults = async (req, res) => {
  try {
    const quizId = req.params.id;
    
    // Get quiz
    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: Lesson,
          as: 'lesson',
          include: [
            {
              model: Module,
              as: 'module',
              include: [
                {
                  model: Course,
                  as: 'course',
                  attributes: ['id', 'instructor_id']
                }
              ]
            }
          ]
        },
        {
          model: Question,
          as: 'questions',
          attributes: ['id', 'question_text', 'question_type', 'points']
        }
      ]
    });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz tidak ditemukan'
      });
    }
    
    // Cek kepemilikan
    const instructorId = quiz.lesson.module.course.instructor_id;
    if (instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda bukan instructor dari kursus ini'
      });
    }
    
    const courseId = quiz.lesson.module.course.id;
    
    // Get enrollments dari kursus
    const enrollments = await Enrollment.findAll({
      where: { course_id: courseId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'username']
        }
      ]
    });
    
    // Calculate total possible points
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    
    // Get results for each enrollment
    const results = [];
    
    for (const enrollment of enrollments) {
      // PERBAIKAN: Menggunakan user_id sebagai enrollment_id
      const enrollmentId = enrollment.user_id;
      
      // Get user answers
      const userAnswers = await UserAnswer.findAll({
        where: {
          enrollment_id: enrollmentId,
          question_id: quiz.questions.map(q => q.id)
        }
      });
      
      if (userAnswers.length === 0) {
        // User belum mengerjakan quiz
        results.push({
          user: enrollment.user,
          has_taken_quiz: false
        });
        continue;
      }
      
      // Calculate earned points
      let earnedPoints = 0;
      let needsGrading = false;
      
      for (const userAnswer of userAnswers) {
        if (userAnswer.is_correct === true) {
          earnedPoints += userAnswer.points_earned;
        } else if (userAnswer.is_correct === null) {
          needsGrading = true;
        }
      }
      
      // Calculate score
      const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      const isPassed = score >= quiz.passing_score;
      
      results.push({
        user: enrollment.user,
        has_taken_quiz: true,
        score,
        is_passed: isPassed,
        needs_grading: needsGrading,
        total_points: totalPoints,
        earned_points: earnedPoints,
        submission_date: userAnswers[0].createdAt
      });
    }
    
    res.json({
      success: true,
      data: {
        quiz_title: quiz.title,
        passing_score: quiz.passing_score,
        results
      }
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};