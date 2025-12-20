import mongoose from "mongoose";
import {Course , Lesson} from '../models/course.js'

export const createLesson = async (req, res) => {
  try {
    const { title, description, contents, order, courseId } = req.body;

    if (!title || !contents || contents.length === 0 || !order) {
      return res.status(400).json({
        success: false,
        message: "Title, contents, and order are required"
      });
    }

    // Optional: link lesson to a course
    if (courseId && !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const lesson = await Lesson.create({
      title: String(title).trim(),
      description,
      contents,
      order,
      createdBy: req.user._id
    });

    // Optional: add lesson to course lessons array
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ success: false, message: "Course not found" });

      course.lessons.push(lesson._id);
      await course.save();
    }

    res.status(201).json({ success: true, message: "Lesson created", lesson });

  } catch (error) {
    console.error("CREATE LESSON ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// update and edit course

export const updateLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { title, description, contents, order } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ success: false, message: "Invalid course or lesson ID" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const lesson = course.lessons.id(lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });

    if (title) lesson.title = title.trim();
    if (description !== undefined) lesson.description = description;
    if (contents !== undefined) lesson.contents = contents;
    if (order !== undefined) lesson.order = order;

    await course.save();

    res.json({ success: true, message: "Lesson updated", lesson });

  } catch (error) {
    console.error("UPDATE LESSON IN COURSE ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// delete lesson from course

export const deleteLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ success: false, message: "Invalid course or lesson ID" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const lesson = course.lessons.id(lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });

    // Remove lesson from the course
    lesson.remove();
    await course.save();

    res.json({ success: true, message: "Lesson deleted successfully" });

  } catch (error) {
    console.error("DELETE LESSON IN COURSE ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// get all lessons of a course

export const getLessons = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId).select("title lessons");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Sort lessons by order
    const lessons = course.lessons.sort((a, b) => a.order - b.order);

    res.status(200).json({
      success: true,
      courseTitle: course.title,
      count: lessons.length,
      lessons
    });

  } catch (error) {
    console.error("GET LESSONS BY COURSE ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch lessons" });
  }
};

/* ---------- GET SINGLE LESSON OF A COURSE ---------- */
export const getLessonByCourse = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ success: false, message: "Invalid course or lesson ID" });
    }

    const course = await Course.findById(courseId).select("title lessons");

    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const lesson = course.lessons.id(lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });

    res.status(200).json({ success: true, courseTitle: course.title, lesson });

  } catch (error) {
    console.error("GET LESSON BY COURSE ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
